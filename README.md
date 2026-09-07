# FormTracker - AI Gym Web Application & Vision Engine 🏋️‍♂️

A professional, high-precision biomechanical computer vision platform that tracks exercise posture in real-time, counts valid repetitions via joint-angle state machines, provides immediate injury-risk guardrail alerts, and guides users through workouts via a modern **React Application** powered by a **Python AI Pose Engine**.

---

## 🛡️ Injury Guardrails & Form Matrix

| Exercise | Critical Joint Tracked | Target Safe Range | Injury Risk Trigger & Bad Form Warning |
| :--- | :--- | :--- | :--- |
| **Squat** | Hip - Knee - Ankle | `70° – 95°` *(Parallel bottom depth)* | **Knee Valgus Collapse**: `knee_dist / ankle_dist < 0.75` → `"WARNING: Knee collapse inward (Valgus)! Drive knees outward"` |
| **Bicep Curl** | Shoulder - Elbow - Wrist | `20° – 160°` | **Torso Swinging**: Arm-body angle deviation `>35°` → `"WARNING: Torso swinging / momentum usage! Keep elbows stationary"` |
| **Dumbbell Bench Press** | Shoulder - Elbow - Wrist | `45° – 90°` | **Rotator Cuff Strain**: Elbow flare angle `>80°` relative to torso → `"WARNING: Excessive elbow flare (>80°)! Tuck elbows to 45-60°"` |
| **Dumbbell Shoulder Press** | Shoulder - Elbow - Wrist / Spine | `170° – 180°` *(Overhead lockout)* | **Lumbar Hyperextension**: Body spine angle `<155°` during overhead push → `"WARNING: Lower back lumbar hyperextension! Engage core & keep spine neutral"` |
| **Overhead Tricep Extension** | Shoulder - Elbow - Wrist | `<85°` to `>155°` | **Elbow Flaring**: Upper arm drift angle `<140°` → `"WARNING: Elbows flaring / upper arm moving! Keep upper arms stationary near head"` |
| **Single-Arm Dumbbell Row** | Shoulder - Elbow - Wrist | `70° – 95°` *(Hip row pull)* | **Excessive Torso Twisting**: Shoulder height tilt `>80px` → `"WARNING: Excessive torso twisting! Keep back flat & pull toward hip"` |
| **Dumbbell Russian Twist** | Shoulder Rotational Yaw / Torso | Left-Right side transitions | **Spine Collapse**: Torso incline angle `<25°` → `"WARNING: Spine collapse / rounding lower back! Maintain 45° incline"` |
| **Dumbbell Lateral Raise** | Shoulder Abduction | `80° – 100°` *(T-Shape)* | **Shoulder Impingement**: Raising arms `>105°` → `"WARNING: Raising arms above shoulder plane (>100°)! Keep in T-shape at shoulder height"` |
| **Dumbbell Calf Raise** | Ankle Plantarflexion | `85° – 110°` to `>130°` | **Knee Flexion**: Knee bend angle `<150°` → `"WARNING: Knees bending! Keep legs straight throughout calf raise"` |

---

## 🏋️‍♂️ Supported Exercises Suite (9 Models)

### 1. Bicep Curl
- **Target Muscles:** Biceps Brachii, Brachialis, Brachioradialis (Forearm)
- **Target Range:** 20° – 160°
- **Primary Guardrail:** Torso swinging / momentum usage prevention

### 2. Shoulder Press (Seated Dumbbell)
- **Target Muscles:** Deltoids (Anterior & Medial heads), Triceps, Trapezius
- **Target Range:** 170° – 180° overhead extension
- **Primary Guardrail:** Lower back lumbar hyperextension prevention

### 3. Tricep Extension (Overhead Dumbbell)
- **Target Muscles:** Triceps Brachii (Long, Lateral & Medial heads)
- **Target Range:** <85° flexed stretch to >155° lockout
- **Primary Guardrail:** Upper arm flaring & head proximity control

### 4. Dumbbell Bench Press (Flat)
- **Target Muscles:** Pectoralis Major (Chest), Anterior Deltoids, Triceps
- **Target Range:** 45° – 90° bottom chest level rack
- **Primary Guardrail:** Rotator cuff elbow flare protection (45°-60° angle)

### 5. Single-Arm Dumbbell Row (Bench Supported)
- **Target Muscles:** Latissimus Dorsi (Lats), Rhomboids, Trapezius, Rear Deltoids, Biceps
- **Target Range:** 70° – 95° hip pull
- **Primary Guardrail:** Torso rotation & shrugging prevention

### 6. Squat (Barbell / Dumbbell)
- **Target Muscles:** Quadriceps, Hamstrings, Glutes, Adductors, Core
- **Target Range:** 70° – 95° parallel depth
- **Primary Guardrail:** Knee valgus collapse (inward knee buckling) detection

### 7. Dumbbell Russian Twist
- **Target Muscles:** Obliques (Internal & External), Rectus Abdominis, Transverse Abdominis, Hip Flexors
- **Target Range:** Alternating left-right side rotation
- **Primary Guardrail:** Lower back rounding & spine collapse prevention

### 8. Lateral Raise (Dumbbell)
- **Target Muscles:** Deltoids (Medial head), Trapezius
- **Target Range:** 80° – 100° T-shape shoulder plane
- **Primary Guardrail:** Shoulder joint impingement protection (>105° raise limit)

### 9. Calf Raise (Dumbbell)
- **Target Muscles:** Gastrocnemius, Soleus (Calf muscles)
- **Target Range:** 85° – 110° stretch to >130° toe extension
- **Primary Guardrail:** Knee bending prevention (forcing straight leg execution)

---

## 🏗️ Architecture & Project Structure

```text
gym-form-tracker-main/
├── app.py                      # Headless Flask REST & Video Stream Server (Port 5000)
├── main.py                     # Standalone OpenCV Desktop Video Tracker CLI
├── requirements.txt            # Python dependencies (mediapipe, opencv-python, flask, numpy)
├── src/
│   ├── pose_detector.py        # MediaPipe Pose Landmarker Wrapper & Vector Math Engine
│   ├── tracker.py              # Telemetry & Rep State Processor
│   ├── utils.py                # 2D Joint Vector Angle Calculator
│   └── exercises/
│       ├── base_exercise.py    # Abstract Exercise Base Class & Form Scoring Engine
│       ├── registry.py         # Global Exercise Registry Singleton
│       ├── bicep_curl.py       # Bicep Curl Pose State Machine & Guardrails
│       ├── calf_raise.py       # Calf Raise Pose State Machine & Guardrails
│       ├── dumbbell_bench_press.py
│       ├── lateral_raise.py
│       ├── russian_twist.py
│       ├── shoulder_press.py
│       ├── single_arm_dumbbell_row.py
│       ├── squat.py
│       └── tricep_extension.py
└── frontend/
    ├── vite.config.js          # Vite server config with API proxy to Python backend
    ├── tailwind.config.js      # Tailwind CSS styling tokens & design system
    ├── index.html              # HTML5 Web App Entry
    ├── assets/                 # High-Resolution Exercise Demonstration Images
    └── src/
        ├── App.jsx             # Main Application State & Client Router
        ├── main.jsx            # React 18 Mounting Root
        ├── index.css           # Global CSS & Tailwind Directives
        ├── services/
        │   └── api.js          # REST Client API for Python Telemetry Endpoints
        ├── components/
        │   ├── Navbar.jsx      # Sticky Full-Bleed Glassmorphism Header
        │   ├── ExerciseCard.jsx# Interactive Exercise Dashboard Card
        │   ├── ExerciseDemoVisual.jsx # Movement Guide Reference Visual
        │   ├── AngleGauge.jsx  # Real-Time Joint Angle Telemetry Gauge
        │   ├── PostureAlert.jsx# Live Form Warning Banner
        │   └── StopConfirmModal.jsx
        ├── exercises/          # Modular Exercise Data Files
        │   ├── bicep_curl.js
        │   ├── calf_raise.js
        │   ├── dumbbell_bench_press.js
        │   ├── lateral_raise.js
        │   ├── russian_twist.js
        │   ├── shoulder_press.js
        │   ├── single_arm_dumbbell_row.js
        │   ├── squat.js
        │   └── tricep_extension.js
        └── pages/
            ├── SelectionPage.jsx # Exercise Catalog & Category Filter Dashboard
            ├── TutorialPage.jsx  # Exercise Guide & Instructions
            ├── TrackerPage.jsx   # Live Pose Tracking Workspace
            └── SummaryPage.jsx   # Workout Analytics & Form Score Summary
```

---

## ⚡ How to Run

### 1. Start the Python AI Engine Backend
In your primary terminal:

```bash
python app.py
```
*(Runs the MediaPipe Pose tracking engine & API server at `http://127.0.0.1:5000`)*

### 2. Start the React Frontend Application
In a second terminal inside `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser to launch the **FormTracker React Application**!