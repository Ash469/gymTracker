# FormFit — Technical Requirements & Design Document (TRD)

**Project:** FormFit  
**Document:** Technical Requirements & Design Document (TRD)  
**Version:** 2.0 (`prodArc` Architecture)  
**Status:** Technical Architecture Baseline  
**Frontend:** React (Vite) + `@mediapipe/tasks-vision` (WebAssembly)  
**Backend API:** Node.js + Express  
**Database:** PostgreSQL (Prisma ORM)  
**AI Coaching:** Amazon Bedrock (Claude / Titan)  
**Deployment:** Vercel (Frontend) + Render (Node Backend) + PostgreSQL Cloud  

---

# 1. Technical Objective

FormFit is built on a **pure Client-Side Edge ML architecture**:
1. Computer vision pose estimation and exercise state machines run **100% inside the browser via WebAssembly (WASM)**.
2. Raw camera frames are processed locally in RAM at **60 FPS** and never sent over the network.
3. Workout telemetry (reps, form accuracy, warnings) is sent via lightweight REST HTTP requests to a **Node.js Express Backend**.
4. Workout history is stored in **PostgreSQL** via **Prisma ORM**.
5. Post-workout AI coaching insights are generated asynchronously using **Amazon Bedrock**.

---

# 2. System Architecture Diagram (`prodArc`)

```text
                               ┌────────────────────────────────────────────────────────┐
                               │                    USER DEVICE / BROWSER               │
                               │                                                        │
                               │  HTML5 Camera Stream ──► getUserMedia()               │
                               │  @mediapipe/tasks-vision WASM (PoseLandmarker)        │
                               │  Local Geometry & Exercise State Machines (60 FPS)     │
                               │  Instant In-Camera HUD & Telemetry Sidebar             │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                                                           │ HTTP REST API (JSON Telemetry)
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │                  NODE.JS EXPRESS BACKEND               │
                               │                                                        │
                               │  /api/auth ──► JWT Register / Login                    │
                               │  /api/exercises ──► Exercise Catalog                   │
                               │  /api/workouts ──► Workout Set History                 │
                               │  /api/ai/coaching ──► Bedrock AI Coach                 │
                               └───────────────┬────────────────────────┬───────────────┘
                                               │                        │
                                               ▼                        ▼
                                     ┌──────────────────┐    ┌──────────────────┐
                                     │    PostgreSQL    │    │  Amazon Bedrock  │
                                     │   (Prisma ORM)   │    │  (AI Coach API)  │
                                     └──────────────────┘    └──────────────────┘
```

---

# 3. Client-Side ML Engine (`frontend/src/services/pose/`)

## 3.1 MediaPipe Tasks Vision (WebAssembly)
- **Library**: `@mediapipe/tasks-vision`
- **Model Asset**: `pose_landmarker_lite.task` (6.2 MB)
- **Execution Mode**: `VIDEO` mode powered by `requestAnimationFrame`.
- **Output**: 33 3D normalized body landmarks (`x`, `y`, `z`, `visibility`) per frame.

## 3.2 Key Body Landmarks Matrix

| Landmark ID | Body Joint Name | Exercise Usage |
|---|---|---|
| `11`, `12` | Left / Right Shoulder | Overhead Press, Lateral Raise, Bench Press |
| `13`, `14` | Left / Right Elbow | Bicep Curl, Overhead Press, Tricep Extension |
| `15`, `16` | Left / Right Wrist | Bicep Curl, Overhead Press, Bench Press |
| `23`, `24` | Left / Right Hip | Squat, Russian Twist, Row |
| `25`, `26` | Left / Right Knee | Squat depth & knee valgus detection |
| `27`, `28` | Left / Right Ankle | Squat depth alignment |

---

# 4. In-Browser Exercise State Machine & Angle Math

Joint angles are calculated in 2D space using 3 points ($A, B, C$) where $B$ is the vertex joint:

$$\theta = \arccos\left( \frac{\vec{BA} \cdot \vec{BC}}{\|\vec{BA}\| \|\vec{BC}\|} \right) \times \frac{180}{\pi}$$

### 4.1 Supported Exercise State Machines

#### 1. Shoulder Press (`shoulder_press.js`)
* **Key Joint**: Shoulder-Elbow-Wrist angle ($\theta$).
* **State Thresholds**:
  * `LOCKOUT` ($\theta \ge 140^\circ$): Arms fully extended overhead.
  * `DESCENDING` ($105^\circ < \theta < 140^\circ$): Lowering weights.
  * `BOTTOM` ($\theta \le 105^\circ$): Elbows at shoulder height.
  * `ASCENDING` ($105^\circ < \theta < 140^\circ$): Pressing overhead.
* **Form Warnings**:
  * Asymmetric press (Left vs Right elbow angle difference $> 15^\circ$).
  * Excessive back arch (Hip-Shoulder-Elbow lean $> 20^\circ$).

#### 2. Bicep Curl (`bicep_curl.js`)
* **Key Joint**: Shoulder-Elbow-Wrist angle ($\theta$).
* **State Thresholds**:
  * `EXTENDED` ($\theta \ge 135^\circ$): Arms fully lowered.
  * `CURLED` ($\theta \le 70^\circ$): Peak contraction.
* **Form Warnings**:
  * Torso swing (Shoulder displacement $> 0.08$ normalized units).
  * Incomplete extension ($\theta > 120^\circ$ required at bottom).

#### 3. Squat (`squat.js`)
* **Key Joint**: Hip-Knee-Ankle angle ($\theta$).
* **State Thresholds**:
  * `STANDING` ($\theta \ge 155^\circ$): Standing lockout.
  * `BOTTOM_SQUAT` ($\theta \le 125^\circ$): Parallel/deep squat position.
* **Form Warnings**:
  * Insufficient depth ($\theta > 125^\circ$ at bottom).
  * Knee valgus (Knees caving inwards relative to ankles).

#### 4. Tricep Extension (`tricep_extension.js`)
* **Key Joint**: Shoulder-Elbow-Wrist overhead angle ($\theta$).
* **State Thresholds**: `EXTENDED` ($\theta \ge 140^\circ$), `FLEXED` ($\theta \le 80^\circ$).

#### 5. Lateral Raise (`lateral_raise.js`)
* **Key Joint**: Hip-Shoulder-Elbow angle ($\theta$).
* **State Thresholds**: `LOWERED` ($\theta \le 30^\circ$), `RAISED` ($\theta \ge 80^\circ$).

#### 6. Dumbbell Bench Press (`dumbbell_bench_press.js`)
* **Key Joint**: Shoulder-Elbow-Wrist angle ($\theta$).
* **State Thresholds**: `LOCKOUT` ($\theta \ge 140^\circ$), `BOTTOM` ($\theta \le 80^\circ$).

#### 7. Single-Arm Dumbbell Row (`single_arm_dumbbell_row.js`)
* **Key Joint**: Shoulder-Elbow-Wrist angle ($\theta$).
* **State Thresholds**: `EXTENDED` ($\theta \ge 135^\circ$), `PULLED` ($\theta \le 75^\circ$).

#### 8. Russian Twist (`russian_twist.js`)
* **Key Joint**: Shoulder-Hip torso rotation angle ($\theta$).
* **State Thresholds**: Alternating Left/Right rotational peaks.

---

# 5. Node.js Express Backend Specification (`backend/`)

The backend is built with **Node.js, Express.js, and Prisma ORM**.

## 5.1 REST API Routes

### Authentication Routes
* `POST /api/auth/register` — Create user account (bcrypt password hash).
* `POST /api/auth/login` — Authenticate user and return JWT bearer token.
* `GET /api/auth/me` — Fetch authenticated profile.

### Exercise Catalog Routes
* `GET /api/exercises` — List supported exercises & target muscle groups.
* `GET /api/exercises/:id` — Fetch details & video demo guide for an exercise.

### Workout History & Telemetry Routes
* `POST /api/workouts/sets` — Save completed workout set telemetry:
  ```json
  {
    "exerciseId": "shoulder_press",
    "reps": 12,
    "avgScore": 88.5,
    "bestScore": 95.0,
    "durationSeconds": 45,
    "warnings": ["Elbow flared on rep 8", "Asymmetric press on rep 11"]
  }
  ```
* `GET /api/workouts/history` — List past workouts grouped by date.
* `GET /api/workouts/analytics` — Fetch form score progress trends over time.

### AI Coaching Route
* `POST /api/ai/coaching` — Trigger Amazon Bedrock AI form analysis based on user's recent workout history.

---

# 6. Database Schema (Prisma PostgreSQL)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id              String           @id @default(uuid())
  email           String           @unique
  name            String
  passwordHash    String
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  workoutSessions WorkoutSession[]
  aiCoachingLogs  AICoachingLog[]
}

model Exercise {
  id          String       @id
  name        String
  category    String
  description String
  targetJoint String
  workoutSets WorkoutSet[]
}

model WorkoutSession {
  id              String       @id @default(uuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id])
  startedAt       DateTime     @default(now())
  completedAt     DateTime?
  totalReps       Int          @default(0)
  overallAvgScore Float        @default(0.0)
  sets            WorkoutSet[]
}

model WorkoutSet {
  id              String         @id @default(uuid())
  sessionId       String
  session         WorkoutSession @relation(fields: [sessionId], references: [id])
  exerciseId      String
  exercise        Exercise       @relation(fields: [exerciseId], references: [id])
  reps            Int
  avgScore        Float
  bestScore       Float
  durationSeconds Int
  warnings        String[]       // Array of warning strings
  createdAt       DateTime       @default(now())
}

model AICoachingLog {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  promptInput String
  aiResponse  String
  createdAt   DateTime @default(now())
}
```

---

# 7. Amazon Bedrock AI Coaching Specification

When a user clicks **"Get AI Coaching"** on their dashboard, the backend constructs a structured telemetry prompt for Amazon Bedrock:

### System Prompt Payload
```json
{
  "modelId": "anthropic.claude-3-haiku-20240307-v1:0",
  "contentType": "application/json",
  "accept": "application/json",
  "body": {
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 500,
    "messages": [
      {
        "role": "user",
        "content": "You are FormFit's elite AI Strength & Form Coach. Analyze the user's workout history and provide 3 short, actionable, encouraging feedback points:\n\nUser History:\n- Exercise: Shoulder Press (3 sets, Avg Score: 84%)\n- Exercise: Squats (2 sets, Avg Score: 92%)\n- Recurring Warnings: ['Elbow flared on rep 8', 'Knee valgus on deep squat']"
      }
    ]
  }
}
```

---

# 8. Deployment Specifications

| Service | Hosting Platform | Config File |
|---|---|---|
| **React Frontend** | Vercel | `frontend/vercel.json` |
| **Node.js Express Backend** | Render / Railway | `backend/Dockerfile` or Render Node service |
| **PostgreSQL Database** | Supabase / AWS RDS / Neon | Cloud PostgreSQL URL |
| **AI Layer** | AWS Bedrock | IAM Access Key + Secret Key |