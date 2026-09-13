# FormFit — Technical Requirements & Design Document

**Project:** FormFit  
**Document:** Technical Requirements & Design Document (TRD)  
**Version:** 1.0  
**Status:** MVP Technical Baseline  
**Target:** First Commit — Bharat Builds Tour  
**Frontend:** React  
**ML Service:** Python + OpenCV + MediaPipe  
**Backend:** Node.js + Express  
**Database:** PostgreSQL  
**AI:** Amazon Bedrock  
**Deployment:** AWS

---

# 1. Technical Objective

FormFit consists of a browser-based frontend, a real-time computer-vision service, an application backend, a relational database, and a generative-AI coaching layer.

The system must support:

1. Real-time exercise analysis.
2. Low-latency form feedback.
3. Rep counting.
4. Form scoring.
5. Workout persistence.
6. User authentication.
7. Workout history and progress.
8. AI-generated post-workout coaching.
9. Production deployment on AWS.

The architecture must remain simple enough to implement and stabilize within the four-day competition period.

---

# 2. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │      React Web       │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 │                                     │
             REST API                              WebSocket
                 │                                     │
                 ▼                                     ▼
       ┌───────────────────┐                 ┌───────────────────┐
       │ Node.js Backend   │                 │ Python ML Service │
       │                   │                 │                   │
       │ Auth              │                 │ OpenCV            │
       │ Users             │                 │ MediaPipe         │
       │ Workouts          │                 │ Pose Analysis     │
       │ History           │                 │ Rep Detection     │
       │ Progress          │                 │ Form Analysis     │
       │ AI Coaching       │                 │ Form Scoring      │
       └─────────┬─────────┘                 └───────────────────┘
                 │
          PostgreSQL
                 │
                 ▼
       ┌───────────────────┐
       │   FormFit Data    │
       └───────────────────┘

                 Node.js
                    │
                    ▼
            Amazon Bedrock
                    │
                    ▼
             AI Coach Output
```

---

# 3. Architecture Principles

## 3.1 Separation of Responsibilities

Each service should have one primary responsibility.

### React

Presentation and user interaction.

### Python

Real-time movement intelligence.

### Node.js

Application/business logic.

### PostgreSQL

Persistent data storage.

### Bedrock

Natural-language coaching and interpretation.

---

# 4. Service Architecture

The MVP contains four application components.

```text
1. Frontend
2. ML Service
3. Application Backend
4. Database
```

Amazon Bedrock is consumed by the Application Backend rather than being implemented as an independent application service.

---

# 5. Frontend Service

## Technology

React.

The existing frontend stack should be retained wherever possible.

## Responsibilities

- Authentication UI
- Dashboard
- Exercise selection
- Camera access
- Workout controls
- ML WebSocket communication
- Real-time form visualization
- Rep counter
- Form score
- Feedback display
- Workout summary
- Workout history
- Progress charts
- AI coaching display

---

# 6. Browser Camera Architecture

The browser is responsible for accessing the user's camera.

Conceptually:

```text
Browser
   │
   ▼
getUserMedia()
   │
   ▼
Video stream
   │
   ├──────────────► UI preview
   │
   └──────────────► ML processing pipeline
```

The browser should not require the Python service to directly access the user's webcam.

This is essential for a deployed web application.

---

# 7. ML Service

## Technology

Python.

Existing technologies:

- OpenCV
- MediaPipe
- Existing FormFit/gymTracker exercise modules
- Existing state machines
- Existing vector/angle calculations
- Existing form rules

## Responsibility

The ML service is the **real-time movement analysis engine**.

It is responsible for:

```text
Camera frames
      ↓
Pose detection
      ↓
Landmarks
      ↓
Feature extraction
      ↓
Exercise analysis
      ↓
Rep state
      ↓
Form errors
      ↓
Form score
      ↓
Real-time feedback
```

---

# 8. ML Service Must Remain Stateless at Application Level

The ML service should not own:

- Users
- Passwords
- User profiles
- Workout history
- PostgreSQL connections
- AI coaching
- Authentication

A running ML session may maintain temporary state such as:

```text
current exercise
current rep
current phase
current form metrics
```

but that state belongs only to the active analysis session.

---

# 9. ML Communication Protocol

Real-time communication should use a persistent connection rather than HTTP requests for every frame.

Recommended protocol:

**WebSocket**

Architecture:

```text
React
  │
  │ WebSocket
  │
  ▼
Python ML Service
```

---

# 10. ML WebSocket Session

When a workout exercise starts:

```text
React
  │
  │ CONNECT
  ▼
Python
```

React sends session metadata:

```json
{
  "type": "start_session",
  "exercise": "squat",
  "workoutId": "uuid",
  "setId": "uuid"
}
```

The Python service initializes the exercise analyzer.

---

# 11. Frame Processing

The frontend provides frames to the ML pipeline.

Conceptually:

```text
Frame
  ↓
Pose Detection
  ↓
Landmarks
  ↓
Exercise Features
  ↓
Form Analysis
  ↓
Result
```

The ML service should avoid returning unnecessarily large payloads.

---

# 12. ML Result Payload

A typical real-time result:

```json
{
  "type": "analysis",
  "exercise": "squat",
  "rep": 7,
  "phase": "descending",
  "score": 89,
  "feedback": [
    {
      "type": "warning",
      "message": "Keep your knees aligned"
    }
  ],
  "landmarks": []
}
```

The frontend uses this to update the UI.

---

# 13. Landmark Transmission

Landmarks should only be returned to the frontend if they are required for visualization.

The frontend may render the skeleton locally.

The backend/database should not receive raw landmark data for every frame in the MVP.

---

# 14. Form Feedback Strategy

The ML service should distinguish between:

### Frame-level feedback

Temporary state used to render the current movement.

### Rep-level feedback

Information that persists for the completed repetition.

### Set-level feedback

Aggregated information after a set.

Example:

```text
Frame
 ↓
Knee alignment issue
 ↓
Several frames confirm issue
 ↓
Rep completed
 ↓
Rep marked with knee-valgus error
 ↓
Set summary aggregates the error
```

This prevents noisy feedback.

---

# 15. Rep State Machine

Each supported exercise should maintain an exercise-specific state machine.

Generic example:

```text
IDLE
 ↓
START
 ↓
DESCENDING
 ↓
BOTTOM
 ↓
ASCENDING
 ↓
REP_COMPLETE
 ↓
IDLE
```

The actual states and thresholds are exercise-specific.

The existing state-machine implementation should be retained.

---

# 16. Form Scoring

Form scoring should be calculated inside the ML service.

The output should be a normalized score:

```text
0–100
```

The ML service should expose the final score rather than exposing all internal calculation logic to the frontend.

Example:

```json
{
  "rep": 8,
  "score": 92
}
```

---

# 17. Workout Result Aggregation

At the end of a set, the frontend receives or constructs an aggregated result.

Example:

```json
{
  "exercise": "squat",
  "reps": 12,
  "averageScore": 87,
  "bestScore": 94,
  "worstScore": 71,
  "errors": {
    "knee_valgus": 3,
    "insufficient_depth": 2,
    "torso_lean": 1
  }
}
```

This is the primary data sent to the Node.js backend.

---

# 18. Why the Frontend Sends Results to Node

The Python ML service should not directly write application data to PostgreSQL.

Instead:

```text
Python
  ↓
ML result
  ↓
React
  ↓
Node.js API
  ↓
PostgreSQL
```

This maintains a clean service boundary.

---

# 19. Application Backend

## Technology

Node.js + Express.

## Responsibilities

The backend is the central application/business layer.

It manages:

- Authentication
- Authorization
- Users
- Exercises
- Workout sessions
- Sets
- Form results
- Form errors
- Progress
- AI coaching
- Database access

---

# 20. Backend API Architecture

All application APIs should use a versioned prefix.

Example:

```text
/api/v1
```

Authentication:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

---

# 21. User APIs

```text
GET    /api/v1/users/me
PATCH  /api/v1/users/me
```

The user ID should be derived from the authenticated session/token rather than trusted from arbitrary client input.

---

# 22. Exercise APIs

```text
GET /api/v1/exercises
GET /api/v1/exercises/:exerciseId
```

Exercise configuration required by the frontend can be exposed through these endpoints.

The Python ML service retains the actual analysis logic.

---

# 23. Workout APIs

Start workout:

```text
POST /api/v1/workouts
```

Get workout:

```text
GET /api/v1/workouts/:workoutId
```

Complete workout:

```text
PATCH /api/v1/workouts/:workoutId/complete
```

Workout history:

```text
GET /api/v1/workouts
```

---

# 24. Set APIs

Create/save set:

```text
POST /api/v1/workouts/:workoutId/sets
```

Get set:

```text
GET /api/v1/sets/:setId
```

The payload contains aggregated ML output rather than raw frame data.

---

# 25. Progress APIs

```text
GET /api/v1/progress
GET /api/v1/progress/:exerciseId
```

These APIs should return data required for charts and performance summaries.

---

# 26. AI Coaching API

The frontend should not directly communicate with Amazon Bedrock.

Instead:

```text
React
  ↓
Node.js
  ↓
Bedrock
```

Example endpoint:

```text
POST /api/v1/coaching/analyze
```

The backend collects relevant workout data and constructs the AI input.

---

# 27. AI Coaching Data

The backend should provide structured information such as:

```json
{
  "currentWorkout": {
    "overallScore": 87,
    "exercises": [
      {
        "name": "squat",
        "reps": 12,
        "score": 87,
        "errors": {
          "knee_valgus": 3,
          "insufficient_depth": 2
        }
      }
    ]
  },
  "historicalContext": {
    "previousAverage": 79,
    "trend": "improving"
  }
}
```

Bedrock should interpret this information.

---

# 28. AI Output

The AI response should be structured rather than arbitrary text.

Preferred format:

```json
{
  "summary": "...",
  "strengths": [
    "..."
  ],
  "areasToImprove": [
    "..."
  ],
  "recommendations": [
    "..."
  ]
}
```

This allows the React UI to render coaching consistently.

---

# 29. AI Safety Boundary

The AI coach must not:

- Diagnose injuries.
- Diagnose medical conditions.
- Claim medical expertise.
- Invent measurements.
- Claim to have analyzed video if it only received workout statistics.

The AI should be explicitly instructed to use only supplied measurements and detected form issues.

---

# 30. Database Architecture

## Database

PostgreSQL.

For AWS deployment:

**Amazon RDS for PostgreSQL**

The Node.js backend is the only application service that should directly access the database.

```text
React
  X
PostgreSQL

Python
  X
PostgreSQL

Node.js
  ✓
PostgreSQL
```

---

# 31. Database Entity Model

Initial entities:

```text
User
 │
 └── Workout
       │
       └── WorkoutSet
              │
              ├── Exercise
              │
              └── FormFeedback

User
 │
 └── AICoaching
```

---

# 32. User Entity

Conceptual fields:

```text
users
-----
id
name
email
password_hash
fitness_level
created_at
updated_at
```

The exact authentication strategy will be finalized during implementation design.

---

# 33. Exercise Entity

```text
exercises
---------
id
name
description
muscle_group
difficulty
is_active
created_at
```

---

# 34. Workout Entity

```text
workouts
--------
id
user_id
started_at
completed_at
duration
overall_score
status
created_at
```

Status:

```text
ACTIVE
COMPLETED
ABANDONED
```

---

# 35. Workout Set Entity

```text
workout_sets
------------
id
workout_id
exercise_id
set_number
reps
average_score
best_score
worst_score
duration
created_at
```

---

# 36. Form Feedback Entity

```text
form_feedback
-------------
id
set_id
error_type
severity
occurrence_count
created_at
```

Examples:

```text
knee_valgus
insufficient_depth
torso_lean
elbow_flare
body_swing
```

---

# 37. AI Coaching Entity

```text
ai_coaching
-----------
id
user_id
workout_id
summary
strengths
areas_to_improve
recommendations
created_at
```

JSON/JSONB may be used for structured AI response fields.

---

# 38. Database Relationships

```text
users
  │
  │ 1:N
  ▼
workouts
  │
  │ 1:N
  ▼
workout_sets
  │
  ├───────────────┐
  │               │
  │ N:1           │ 1:N
  ▼               ▼
exercises     form_feedback


users
  │
  │ 1:N
  ▼
ai_coaching
```

---

# 39. Authentication

Authentication should be handled by the Node.js backend.

The backend will:

1. Validate credentials.
2. Hash/verify passwords.
3. Generate an authenticated session/token.
4. Protect private API endpoints.

The frontend stores only the required authentication state.

Database credentials must never be exposed to React.

---

# 40. Request Authorization

Every protected request should identify the authenticated user.

For example:

```text
GET /api/v1/workouts/123
```

The backend must verify:

```text
workout.user_id == authenticated_user.id
```

before returning the data.

---

# 41. Workout Lifecycle

The application lifecycle is:

```text
START
  ↓
Create Workout
  ↓
ACTIVE
  ↓
Start Exercise
  ↓
ML Session
  ↓
Complete Set
  ↓
Save Set
  ↓
Next Exercise
  ↓
Complete Workout
  ↓
COMPLETED
```

---

# 42. Detailed End-to-End Flow

## Step 1 — Login

```text
React
  ↓
POST /auth/login
  ↓
Node
  ↓
PostgreSQL
  ↓
Authentication result
  ↓
React
```

---

## Step 2 — Start Workout

```text
React
  ↓
POST /workouts
  ↓
Node
  ↓
PostgreSQL
  ↓
workout_id
  ↓
React
```

---

## Step 3 — Start Exercise

React establishes:

```text
WebSocket
```

with Python.

```text
React
  ↓
WebSocket
  ↓
Python
```

The session includes:

```text
workout_id
set_id
exercise
```

---

# 43. Step 4 — Real-Time Analysis

```text
Camera
  ↓
React
  ↓
WebSocket
  ↓
Python
  ↓
OpenCV
  ↓
MediaPipe
  ↓
Form analysis
  ↓
Result
  ↓
React
```

The UI updates continuously.

---

# 44. Step 5 — Set Completion

Python determines that the set has completed.

It produces:

```text
12 reps
Average score = 87
Errors:
  knee valgus = 3
  depth = 2
```

React submits the aggregated result:

```text
POST /workouts/:id/sets
```

Node persists it.

---

# 45. Step 6 — Complete Workout

React sends:

```text
PATCH /workouts/:id/complete
```

Node calculates/persists the final workout information.

---

# 46. Step 7 — AI Coaching

React requests:

```text
POST /coaching/analyze
```

Node:

```text
Retrieve current workout
        ↓
Retrieve historical performance
        ↓
Build structured AI prompt
        ↓
Amazon Bedrock
        ↓
Validate response
        ↓
Store coaching
        ↓
Return to React
```

---

# 47. Step 8 — Dashboard

React requests:

```text
GET /progress
GET /workouts
```

Node queries PostgreSQL.

The frontend renders:

- Form score
- Workout history
- Exercise progress
- Common errors
- AI coaching

---

# 48. Cloud Architecture

The production deployment should separate the application components logically.

Initial target:

```text
                         Internet
                            │
                            ▼
                     React Frontend
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
       Node.js Backend                Python ML
             │
        ┌────┴─────┐
        ▼          ▼
      RDS       Bedrock
   PostgreSQL
```

---

# 49. AWS Deployment Philosophy

The MVP should favor services the team already understands.

The architecture should not introduce additional AWS services simply for demonstration.

The initial AWS layer should focus on:

- Compute
- Database
- AI

rather than attempting a full serverless microservice architecture.

---

# 50. Recommended Initial AWS Components

## Frontend

Deploy the React application using an appropriate static/web hosting solution.

## Backend

Deploy Node.js on AWS compute infrastructure.

## ML Service

Deploy Python ML service on compute infrastructure capable of running OpenCV and MediaPipe.

## Database

Amazon RDS for PostgreSQL.

## AI

Amazon Bedrock.

The exact compute services will be selected after evaluating the ML deployment requirements.

---

# 51. Important ML Deployment Constraint

The Python ML service requires:

- Python runtime
- OpenCV
- MediaPipe
- CPU resources
- Persistent WebSocket connections
- Real-time processing

Therefore, it should not automatically be treated like a conventional stateless REST Lambda function.

A persistent compute environment is more appropriate for the MVP.

---

# 52. Real-Time Network Architecture

Production communication:

```text
Browser
   │
   │ HTTPS
   ▼
Frontend

Browser
   │
   │ WSS
   ▼
Python ML Service
```

WebSocket connections should use secure TLS:

```text
ws://
```

for local development and:

```text
wss://
```

for production.

---

# 53. Backend ↔ Database

Only the Node.js backend should connect to RDS.

```text
Node.js
   │
   │ PostgreSQL connection
   ▼
RDS PostgreSQL
```

The database should not be publicly exposed if avoidable.

---

# 54. Backend ↔ Bedrock

```text
Node.js
   │
   │ AWS SDK
   ▼
Amazon Bedrock
```

AWS credentials must remain server-side.

The browser should never receive AWS credentials.

---

# 55. Error Handling

The system must handle failure independently for each layer.

## ML unavailable

Frontend:

```text
Unable to connect to FormFit analysis.
Please retry.
```

## Backend unavailable

Frontend:

```text
Unable to save workout.
Your current session can continue locally.
```

The exact offline recovery strategy may be simplified for the MVP.

## Database unavailable

Backend returns:

```text
503 Service Unavailable
```

## Bedrock unavailable

Workout must still be considered successful.

AI coaching is an enhancement and should not prevent workout completion.

---

# 56. Critical Product Reliability Rule

### AI coaching must never become a dependency for workout completion.

This:

```text
Workout
 ↓
Database
 ↓
Bedrock
 ↓
Success
```

should NOT be the required sequence.

Instead:

```text
Workout
 ↓
Save workout
 ↓
Success

Optional:
 ↓
Bedrock
 ↓
AI coaching
```

If Bedrock fails, the workout remains saved.

---

# 57. ML Reliability Rule

If the ML system cannot confidently detect the required body landmarks:

```text
Do not generate a form judgment.
```

Instead:

```text
Please adjust your position.
```

This is preferable to incorrect feedback.

---

# 58. Performance Requirements

Target characteristics:

### Real-time ML

The feedback should feel immediate.

### Backend APIs

Normal CRUD operations should respond quickly under normal competition load.

### Database

Queries should be indexed around common access patterns:

```text
user_id
workout_id
exercise_id
created_at
```

---

# 59. Data Storage Strategy

The MVP should store:

### Store

- User information
- Workout information
- Set information
- Form scores
- Detected form errors
- Aggregated metrics
- AI coaching

### Do not store by default

- Continuous raw camera footage
- Every video frame
- Every MediaPipe landmark frame

This keeps the system lightweight and privacy-conscious.

---

# 60. Repository Structure

Recommended high-level organization:

```text
FormFit/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── hooks/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── db/
│   │   └── utils/
│   └── package.json
│
├── ml-service/
│   ├── pose/
│   ├── exercises/
│   ├── analyzers/
│   ├── websocket/
│   ├── utils/
│   └── requirements.txt
│
└── README.md
```

The exact structure can be adapted to the existing `gymTracker` repository.

---

# 61. Backend Layer Structure

```text
backend/
│
├── routes/
│       auth.routes.js
│       workout.routes.js
│       exercise.routes.js
│       progress.routes.js
│       coaching.routes.js
│
├── controllers/
│
├── services/
│       auth.service.js
│       workout.service.js
│       progress.service.js
│       coaching.service.js
│       bedrock.service.js
│
├── middleware/
│       auth.middleware.js
│       error.middleware.js
│
├── db/
│       connection.js
│       migrations/
│
└── app.js
```

Controllers should remain thin.

Business logic belongs in services.

---

# 62. ML Service Structure

```text
ml-service/
│
├── pose/
│   └── pose_detector.py
│
├── exercises/
│   ├── squat.py
│   ├── pushup.py
│   ├── curl.py
│   └── ...
│
├── analyzers/
│   ├── form_analyzer.py
│   ├── rep_counter.py
│   └── scoring.py
│
├── websocket/
│   └── server.py
│
└── main.py
```

The existing exercise-specific implementations should remain modular.

---

# 63. Environment Configuration

Environment variables should be used for:

```text
DATABASE_URL
JWT_SECRET
BEDROCK_REGION
BEDROCK_MODEL_ID
ML_SERVICE_URL
FRONTEND_URL
```

Secrets must not be committed to Git.

---

# 64. API Security

The backend must implement:

- Input validation
- Authentication
- Authorization
- Rate limiting where appropriate
- CORS configuration
- Secure password hashing
- Secure headers
- Environment-based secrets

For the competition MVP, security should be sufficient for a production demonstration without building a complete enterprise identity platform.

---

# 65. CORS

Expected production configuration:

```text
Frontend domain
        ↓
Backend API
```

Only the known frontend origin should be allowed in production.

---

# 66. Observability

At minimum, logs should allow the team to determine:

```text
Request
 ↓
Endpoint
 ↓
Status
 ↓
Latency
 ↓
Error
```

For ML:

```text
WebSocket session
 ↓
Exercise
 ↓
Connection status
 ↓
Processing errors
```

The MVP does not require a full observability stack.

---

# 67. Deployment Environments

At minimum:

```text
Local
Production
```

Local:

```text
React
localhost
Node
localhost
Python
localhost
PostgreSQL
local
```

Production:

```text
React
AWS
Node
AWS
Python
AWS
PostgreSQL
RDS
Bedrock
AWS
```

---

# 68. Local Development Architecture

```text
                  Local Machine

        ┌─────────────────────────┐
        │ React                   │
        │ localhost:3000          │
        └───────┬─────────────────┘
                │
       ┌────────┴─────────┐
       │                  │
       ▼                  ▼
Node :5000          Python ML :8000
       │                  │
       ▼                  │
PostgreSQL               │
                         │
                  OpenCV + MediaPipe
```

This allows the complete system to be tested before deployment.

---

# 69. Production Architecture

```text
                         User Browser
                              │
                              ▼
                       React Frontend
                              │
                ┌─────────────┴─────────────┐
                │                           │
              HTTPS                       WSS
                │                           │
                ▼                           ▼
         Node.js Backend             Python ML Service
                │
           ┌────┴─────┐
           │          │
           ▼          ▼
       RDS Postgres  Bedrock
```

---

# 70. Technical Tradeoff: Why Node Does Not Sit Between React and Python

A tempting architecture is:

```text
React
 ↓
Node
 ↓
Python
```

for every ML interaction.

This should not be used for the real-time frame pipeline.

It introduces:

- Additional network hop
- Additional latency
- More backend load
- More complexity
- More difficult WebSocket management

Instead:

```text
React ───────────────► Python
      real-time

React ───────────────► Node
      application data
```

Node remains the authoritative application layer.

---

# 71. Technical Tradeoff: Why Python Does Not Write to PostgreSQL

The alternative is:

```text
Python ML
 ↓
PostgreSQL
```

This couples ML logic with application persistence.

It creates:

- Database credentials inside ML service
- Tight coupling
- Duplicate business logic
- More complicated authorization
- Harder future service replacement

Therefore:

```text
Python
 ↓
React
 ↓
Node
 ↓
PostgreSQL
```

is preferred for the MVP.

---

# 72. Technical Tradeoff: Why PostgreSQL Instead of DynamoDB

FormFit's data is strongly relational:

```text
User
 ↓
Workout
 ↓
Set
 ↓
Exercise
 ↓
Form errors
```

The application also requires aggregation queries for:

- workout history
- progress
- exercise averages
- error frequency
- trends

PostgreSQL provides a natural model for this workload.

Amazon RDS for PostgreSQL also allows the application to use a familiar relational database while still deploying the persistence layer on AWS.

---

# 73. Technical Tradeoff: Why Local ML Instead of Cloud Frame Inference

Real-time form correction is latency-sensitive.

Sending:

```text
Frame
 ↓
Internet
 ↓
AWS
 ↓
Model
 ↓
Internet
 ↓
Browser
```

for every frame introduces unnecessary latency and bandwidth usage.

Instead:

```text
Camera
 ↓
Local processing
 ↓
OpenCV + MediaPipe
 ↓
Immediate feedback
```

Only aggregated workout information needs to travel to the application backend.

---

# 74. Core Data Flow Summary

```text
              REAL-TIME PATH

Camera
  ↓
React
  ↓
WebSocket
  ↓
Python
  ↓
OpenCV / MediaPipe
  ↓
Form Engine
  ↓
Feedback
  ↓
React
```

And:

```text
             PERSISTENCE PATH

Workout Result
      ↓
React
      ↓
Node.js
      ↓
PostgreSQL
```

And:

```text
                AI PATH

Workout + History
       ↓
Node.js
       ↓
Bedrock
       ↓
AI Coaching
       ↓
PostgreSQL
       ↓
React
```

These three paths are the core architecture of FormFit.

---

# 75. MVP Technical Definition

The MVP technical system is complete when:

```text
React
  ↓
Camera
  ↓
Python ML
  ↓
Real-time form analysis
  ↓
Node.js
  ↓
PostgreSQL
  ↓
Workout history
  ↓
Bedrock
  ↓
AI coaching
```

works end-to-end in production.

---

# 76. Implementation Priority

## Priority 1 — Existing ML

Make sure the existing exercise analysis works reliably.

## Priority 2 — React ↔ Python

Convert the local ML workflow into a browser-compatible real-time workflow.

## Priority 3 — Node.js

Build authentication and workout APIs.

## Priority 4 — PostgreSQL

Implement persistence.

## Priority 5 — Dashboard

Display historical data.

## Priority 6 — AWS deployment

Deploy the working system.

## Priority 7 — Bedrock

Add AI coaching.

## Priority 8 — Polish

Improve UX, reliability and competition demo.

---

# 77. Explicit Technical Scope Exclusions

The MVP will NOT implement:

- SageMaker
- S3 ML pipelines
- IoT Core
- Greengrass
- Kubernetes
- Microservice orchestration
- Event-driven distributed architecture
- Cloud-based frame inference
- Video storage
- Custom ML training pipeline
- Complex model-serving infrastructure

These may be considered in future versions.

---

# 78. Final Technical Architecture

The final MVP architecture is:

```text
                              ┌───────────────┐
                              │    Browser    │
                              │               │
                              │    React      │
                              │    Camera     │
                              └───────┬───────┘
                                      │
                    ┌─────────────────┴──────────────────┐
                    │                                    │
                  HTTPS                                WSS
                    │                                    │
                    ▼                                    ▼
             ┌───────────────┐                  ┌────────────────┐
             │ Node.js       │                  │ Python ML      │
             │ Backend       │                  │ Service        │
             │               │                  │                │
             │ Auth          │                  │ OpenCV         │
             │ Users         │                  │ MediaPipe      │
             │ Workouts      │                  │ Pose           │
             │ Progress      │                  │ Rep Detection  │
             │ AI Coaching   │                  │ Form Analysis  │
             └───────┬───────┘                  └────────────────┘
                     │
             ┌───────┴─────────┐
             │                 │
             ▼                 ▼
      ┌──────────────┐   ┌───────────────┐
      │ RDS          │   │ Amazon        │
      │ PostgreSQL   │   │ Bedrock       │
      └──────────────┘   └───────────────┘
                               │
                               ▼
                         AI Coach Output
```

This architecture deliberately keeps the **real-time path short**, the **application layer authoritative**, the **database relational**, and **AWS meaningful rather than decorative**.

The next technical document after this should be the **Database Design + API Specification**. That should define the exact PostgreSQL tables, relationships, indexes, request/response JSON, WebSocket messages, and workout lifecycle. Once those are frozen, implementation becomes mostly mechanical.