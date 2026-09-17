# FormFit — Product Requirements Document (PRD)

**Product:** FormFit  
**Version:** 2.0 (`prodArc` Architecture)  
**Status:** In Development — Client-Side Edge ML Architecture  
**Target:** Production Baseline  
**Primary Platform:** Web (Desktop & Mobile Browser)  
**Primary Users:** Beginner and intermediate gym-goers  
**Core Technology:** React + `@mediapipe/tasks-vision` (WebAssembly)  

---

# 1. Product Overview

## 1.1 Product Vision

FormFit is an AI-powered fitness platform that uses in-browser computer vision to analyze a user's exercise form in real time and provide immediate corrective feedback, similar to having a personal trainer observing every repetition.

The product aims to make **proper exercise technique accessible without requiring a personal trainer or cloud GPU servers**, while allowing users to track their form quality and improvement over time.

### Vision

> **Make expert-quality exercise form guidance accessible to anyone with a camera — completely private, instantaneous, and zero-latency.**

---

# 2. Problem Statement

A beginner entering a gym often knows **what exercise to perform**, but does not necessarily know **how to perform it correctly**.

Common problems include:
- Incorrect posture and joint positioning
- Insufficient or excessive range of motion
- Incorrect movement patterns & compensatory body movements
- Difficulty knowing whether a repetition was performed correctly
- Dependence on expensive trainers
- Lack of objective measurement of form improvement

Traditional solutions are limited:
- **Personal Trainer**: Expensive and not continuously available.
- **Online Videos**: Passive teaching, cannot evaluate actual user execution.
- **Fitness Tracking Apps**: Only track raw weight/reps, ignoring **movement quality**.

FormFit addresses the gap with **real-time 60 FPS client-side pose tracking** and **AI-driven workout coaching**.

---

# 3. Product Objectives & Core Principles

FormFit allows a user to:
1. Select an exercise from a curated catalog.
2. Position themselves in front of their device's camera.
3. Perform the exercise with **instant 60 FPS in-camera HUD feedback**.
4. Benefit from automatic repetition counting & form scoring.
5. Save completed workout sets to their personal history.
6. Receive personalized post-workout AI coaching from **Amazon Bedrock**.

## 3.1 Core Principles

### 1. Client-Side Edge ML First (Zero Network Latency)
All computer vision landmark extraction, biomechanical angle math, and rep state machine evaluations run **directly inside the user's browser via WebAssembly (WASM)**. No video frames are transmitted over the network, ensuring **60 FPS performance with 0ms latency**.

### 2. Privacy by Design
Continuous camera footage never leaves the user's local device. Raw video streams are processed in RAM by `@mediapipe/tasks-vision` and immediately discarded. Only structured telemetry (reps, scores, warnings) is sent to the database.

### 3. Explainable & Actionable Feedback
Instead of generic "Bad Form" alerts, FormFit provides precise, actionable guidance directly on top of the camera view:
- *"Push overhead — lock out arms"*
- *"Keep back neutral"*
- *"Lower hips lower to reach full depth"*

### 4. Measurable Form Improvement
FormFit calculates a normalized **Form Score (0–100)** for every repetition and workout set, allowing users to track form consistency over time.

### 5. AI Augments Biomechanics (Bedrock Coaching)
The in-browser WASM engine observes and measures geometry. The **Amazon Bedrock LLM** interprets structured workout history to deliver personalized weekly training insights.

---

# 4. User Journey

```text
Open FormFit Web App
         ↓
  Login / Register (Node.js API)
         ↓
  User Dashboard
         ↓
  Select Exercise (e.g. Shoulder Press, Squat, Bicep Curl)
         ↓
  Camera Setup & Position Alignment
         ↓
  Client-Side MediaPipe WASM Pose Tracking (60 FPS)
         ↓
  In-Camera HUD Cues + Live Form Warnings + Auto Rep Counting
         ↓
  Set Completed ──► Saved to PostgreSQL DB
         ↓
  Workout Summary Dashboard
         ↓
  Amazon Bedrock AI Coaching Insights
```

---

# 5. System Architecture — `prodArc` View

FormFit operates as a clean, decoupled 3-tier web application:

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                        REACT FRONTEND (Vercel)                         │
 │                                                                        │
 │  1. Browser getUserMedia Camera Stream                                 │
 │  2. @mediapipe/tasks-vision (WASM) ──► 33 Pose Landmarks (60 FPS)      │
 │  3. Local JS Geometry Engine ──► Rep State Machine & HUD Alerts        │
 │  4. UI Telemetry, Form Gauges & Responsive Views                       │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     │ REST API (JSON Telemetry)
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                    NODE.JS EXPRESS BACKEND (Render)                    │
 │                                                                        │
 │  1. Auth & JWT Token Management                                        │
 │  2. Workout Persistence & History Queries                              │
 │  3. PostgreSQL Database (Prisma ORM)                                   │
 │  4. Amazon Bedrock AI Integration (/api/ai/coaching)                   │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      AMAZON BEDROCK AI COACH                           │
 │                                                                        │
 │  Generates personalized progress insights & training tips              │
 └────────────────────────────────────────────────────────────────────────┘
```

---

# 6. Component Responsibilities

## 6.1 React Frontend (`frontend/`)
- User Registration, Login, & Dashboard views.
- Camera access via HTML5 `getUserMedia`.
- `@mediapipe/tasks-vision` initialization and 60 FPS frame detection.
- JavaScript exercise state machines (`shoulderPress.js`, `bicepCurl.js`, `squat.js`, etc.).
- In-camera HUD visual guidance, angle gauges, and posture alert popups.
- Post-workout set summary dashboards.

## 6.2 Application Backend (`backend/`)
- Express.js REST API layer.
- User authentication & bcrypt password hashing.
- CRUD operations for workouts, sets, and exercises.
- Integration with Prisma ORM and PostgreSQL database.
- Integration with AWS SDK / Amazon Bedrock for AI Coaching.

## 6.3 Database (PostgreSQL)
- Stores `User`, `WorkoutSession`, `WorkoutSet`, `Exercise`, and `AICoachingLog` entities.
- Stores historical form scores and error frequencies for long-term analytics.

## 6.4 AI Layer (Amazon Bedrock)
- Interprets JSON telemetry history (e.g. 5 workouts, 25 sets, recurring warnings).
- Returns structured natural-language coaching, strength advice, and technique corrections.

---

# 7. Functional Requirements

| ID | Feature | Description | Status |
|---|---|---|---|
| **FR-01** | User Auth | Register, Login, JWT session management | Backend Node.js |
| **FR-02** | Exercise Catalog | Support for Shoulder Press, Bicep Curl, Squat, Tricep Extension, Lateral Raise, Bench Press, Single-Arm Row, Russian Twist | Frontend JS |
| **FR-03** | In-Browser Tracking | `@mediapipe/tasks-vision` Wasm pose detection @ 60 FPS | Frontend JS |
| **FR-04** | Rep State Machine | Auto-detection of exercise phases (LOCKOUT, DESCENDING, PEAK, ASCENDING) | Frontend JS |
| **FR-05** | Real-Time HUD | In-camera overlay alerts & directional cues (`PRESS OVERHEAD`, `LOWER TO SHOULDERS`) | Frontend JS |
| **FR-06** | Form Score | Calculated 0–100 quality score per rep & set | Frontend JS |
| **FR-07** | Workout Storage | Persist set summaries to PostgreSQL DB via Express REST API | Backend Node.js |
| **FR-08** | AI Coaching | Post-workout recommendations generated via Amazon Bedrock | AWS Bedrock |