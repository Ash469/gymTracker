# FormFit — AI Exercise Form Tracker & Real-Time Pose Engine 🏋️‍♂️

An edge-first, AI-powered exercise form analysis platform that tracks body posture in real-time, counts repetitions via biomechanical state machines, provides live posture correction guardrails, and renders interactive analytics summaries.

Powered by a **React Frontend** communicating via **WebSockets** with a **Python OpenCV & MediaPipe ML Service**.

---

## 🏗️ Core Architecture & Data Flow

```text
                               ┌───────────────┐
                               │  User Browser │
                               │               │
                               │    React      │
                               │ getUserMedia()│
                               └───────┬───────┘
                                       │
                     ┌─────────────────┴──────────────────┐
                     │                                    │
                   HTTPS                                WSS
                     │                                    │
                     ▼                                    ▼
              ┌───────────────┐                  ┌────────────────┐
              │ Node.js       │                  │ Python ML      │
              │ Backend       │                  │ WebSocket      │
              │ (App Logic)   │                  │ (MediaPipe/CV) │
              └───────┬───────┘                  └────────────────┘
                      │
              ┌───────┴─────────┐
              │                 │
              ▼                 ▼
       ┌──────────────┐   ┌───────────────┐
       │ RDS          │   │ Amazon        │
       │ PostgreSQL   │   │ Bedrock AI    │
       └──────────────┘   └───────────────┘
```

---

## 📁 Repository Structure

```text
gym-form-tracker-main/
├── frontend/                     # React 18 Web Application (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/           # UI Components (Navbar, PostureAlert, AngleGauge)
│   │   ├── hooks/                # Custom React Hooks (usePoseTracker.js)
│   │   ├── pages/                # App Views (SelectionPage, TutorialPage, TrackerPage, SummaryPage)
│   │   └── services/             # WebSocket Client (websocket.js) & REST API (api.js)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vercel.json
│
├── ml-service/                   # Python AI Computer Vision Engine & WebSocket Server
│   ├── src/
│   │   ├── pose_detector.py      # MediaPipe Landmarker Wrapper & Normalized Scaling
│   │   ├── tracker.py            # Pose State Processor
│   │   ├── utils.py              # Joint Angle Vector Math
│   │   └── exercises/            # Biomechanical Exercise Models (Squat, ShoulderPress, etc.)
│   ├── server.py                 # Async WebSocket + REST API Engine Server (Port 8000)
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml            # Multi-container orchestration
├── render.yaml                   # Render Blueprint config
└── README.md
```

---

## ⚡ How to Run Locally

### 1. Install Dependencies
```bash
# Python dependencies
pip install -r ml-service/requirements.txt

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Start Python ML WebSocket Service (Port 8000)
In your terminal:
```bash
python ml-service/server.py
```
*(Runs the Python MediaPipe Pose WebSocket Engine at `ws://localhost:8000`)*

### 3. Start React Frontend Application (Port 5173)
In a second terminal:
```bash
cd frontend
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🚀 Deployment Guide

### Deploying Python ML Service (Render / Railway / AWS)
- **Container Deployment**: Build and run using `ml-service/Dockerfile`.
- **Environment Variables**:
  - `HOST`: `0.0.0.0`
  - `PORT`: `8000`
- **WS Endpoint**: `wss://<your-ml-service-domain>/ws`

### Deploying React Frontend (Vercel / Netlify / Cloudflare Pages)
- **Root Directory**: `./frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_WS_URL`: `wss://<your-ml-service-domain>`

### Docker Compose (One-Command Launch)
```bash
docker-compose up --build
```

---

## 🛡️ Exercise Suite & Guardrails

| Exercise | Critical Joint Tracked | Target Safe Range | Injury Risk Guardrail Warning |
| :--- | :--- | :--- | :--- |
| **Squat** | Hip - Knee - Ankle | `70° – 95°` | **Knee Valgus Collapse**: `knee_dist / ankle_dist < 0.75` |
| **Bicep Curl** | Shoulder - Elbow - Wrist | `20° – 160°` | **Torso Swinging**: Arm-body angle deviation `>35°` |
| **Dumbbell Bench Press** | Shoulder - Elbow - Wrist | `45° – 90°` | **Rotator Cuff Strain**: Elbow flare angle `>80°` |
| **Dumbbell Shoulder Press** | Shoulder - Elbow - Wrist | `170° – 180°` | **Lumbar Hyperextension**: Body spine angle `<155°` |
| **Overhead Tricep Extension**| Shoulder - Elbow - Wrist | `<85°` to `>155°`| **Elbow Flaring**: Upper arm drift angle `<140°` |
| **Single-Arm Dumbbell Row** | Shoulder - Elbow - Wrist | `70° – 95°` | **Torso Twisting**: Shoulder height tilt `>80px` |
| **Dumbbell Russian Twist** | Torso Incline | Left-Right side | **Spine Collapse**: Torso incline angle `<25°` |
| **Dumbbell Lateral Raise** | Shoulder Abduction | `80° – 100°` | **Shoulder Impingement**: Arms raised `>105°` |