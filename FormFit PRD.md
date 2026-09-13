# FormFit — Product Requirements Document (PRD)

**Product:** FormFit  
**Version:** 1.0  
**Status:** MVP Definition  
**Target:** First Commit — Bharat Builds Tour  
**Primary Platform:** Web  
**Primary Users:** Beginner and intermediate gym-goers  
**Core Technology:** React + Python/OpenCV/MediaPipe + Node.js + PostgreSQL + AWS + Amazon Bedrock

---

# 1. Product Overview

## 1.1 Product Vision

FormFit is an AI-powered fitness platform that uses computer vision to analyze a user's exercise form in real time and provide immediate corrective feedback, similar to having a personal trainer observing every repetition.

The product aims to make **proper exercise technique accessible without requiring a personal trainer**, while allowing users to track their form quality and improvement over time.

### Vision

> **Make expert-quality exercise form guidance accessible to anyone with a camera.**

---

# 2. Problem Statement

A beginner entering a gym often knows **what exercise to perform**, but does not necessarily know **how to perform it correctly**.

Common problems include:

- Incorrect posture
- Incorrect joint positioning
- Insufficient or excessive range of motion
- Incorrect movement patterns
- Compensatory body movements
- Incorrect exercise technique
- Difficulty knowing whether a repetition was performed correctly
- Dependence on trainers or experienced gym members for feedback
- Lack of objective measurement of form improvement

A user may perform dozens of repetitions incorrectly without realizing it.

Traditional solutions are limited:

### Personal trainer

Provides high-quality feedback but can be expensive and is not continuously available.

### Online videos

Teach the expected movement but cannot analyze whether the individual is actually performing it correctly.

### Fitness tracking apps

Usually track:

- weight
- reps
- sets
- duration

but generally do not deeply analyze **movement quality**.

FormFit addresses the gap between these approaches.

---

# 3. Product Objective

FormFit should allow a user to:

1. Select an exercise.
2. Position themselves in front of a camera.
3. Perform the exercise.
4. Have their movement analyzed in real time.
5. Receive immediate form feedback.
6. Automatically count repetitions.
7. Receive a form score.
8. Complete and save the workout.
9. Review historical performance.
10. Receive AI-generated coaching based on their workout data.

---

# 4. Product Principles

FormFit will follow five core principles.

## 4.1 Real-time first

Form feedback must be generated quickly enough to be useful during an exercise.

The system should not depend on a round trip to a cloud server for every camera frame.

---

## 4.2 Privacy by design

Continuous camera footage should not need to be uploaded to the cloud.

The computer-vision analysis should primarily happen locally/on the user's device.

Only meaningful workout telemetry should be persisted to the backend.

---

## 4.3 Explainable feedback

The system should not simply say:

> "Bad form."

It should identify the detected issue.

Examples:

- "Keep your knees aligned with your feet."
- "Go slightly deeper."
- "Keep your torso more upright."
- "Avoid swinging your upper body."
- "Maintain a neutral back."

---

## 4.4 Measurable improvement

FormFit should allow users to see whether their form is improving over multiple workouts.

Example:

```text
Workout 1     68
Workout 2     73
Workout 3     79
Workout 4     86
```

---

## 4.5 AI should augment computer vision, not replace it

The computer-vision engine is responsible for **observing and measuring movement**.

The generative AI layer is responsible for **interpreting workout statistics and providing personalized coaching**.

The LLM should not be responsible for determining whether a user's knee angle is correct.

---

# 5. Target Users

## Primary Persona — Beginner Gym User

### Profile

A person who has recently started going to the gym and has limited knowledge of exercise technique.

### Goals

- Learn correct exercise form.
- Avoid common mistakes.
- Become independent from a trainer.
- Track improvement.
- Understand weaknesses.

### Pain Points

- "Am I doing this correctly?"
- "How deep should I go?"
- "Why does my form feel different from the demonstration?"
- "Nobody is available to check every rep."
- "I don't know whether my form is improving."

---

## Secondary Persona — Intermediate Gym User

An experienced user who already knows basic exercises but wants objective feedback.

### Goals

- Improve technique.
- Identify recurring mistakes.
- Track form consistency.
- Improve movement quality.

---

# 6. Core User Journey

The primary product flow is:

```text
Open FormFit
      ↓
Login / Register
      ↓
Dashboard
      ↓
Start Workout
      ↓
Select Exercise
      ↓
Camera / Position Setup
      ↓
Pose Detection
      ↓
Exercise Detection
      ↓
Real-time Form Analysis
      ↓
Rep Counting
      ↓
Form Feedback
      ↓
Set Complete
      ↓
Workout Summary
      ↓
Save Workout
      ↓
Progress Tracking
      ↓
AI Coaching
```

---

# 7. Functional Requirements

## FR-01 — User Registration

Users must be able to create a FormFit account.

Required information:

- Name
- Email
- Password

Optional profile information may include:

- Fitness level
- Primary goal
- Preferred workout frequency

### Acceptance Criteria

- User can successfully register.
- Duplicate email addresses are rejected.
- Passwords are not stored in plaintext.
- User receives an authenticated session after registration.

---

# 8. FR-02 — User Authentication

Users must be able to:

- Login
- Logout
- Maintain an authenticated session

Protected resources must only be accessible to the authenticated user.

---

# 9. FR-03 — Exercise Selection

The user must be able to select an exercise before beginning analysis.

The MVP should support a limited number of reliable exercises rather than attempting to support every gym exercise.

### Initial MVP target

Approximately **3–5 highly reliable exercises**, selected from the existing FormFit/gymTracker computer-vision modules.

Additional exercises can be added after the core experience is stable.

---

# 10. FR-04 — Camera Setup

Before exercise analysis begins, FormFit should ensure that the user is positioned appropriately.

The interface should communicate:

- Required camera orientation
- Required distance
- Whether the full body is visible
- Whether important landmarks are detected
- Whether landmark confidence is sufficient

Example:

```text
✓ Full body detected
✓ Good lighting
✓ Camera position suitable

Ready to start
```

If the system cannot reliably detect the required landmarks:

```text
⚠ Move further away
⚠ Make sure your full body is visible
```

---

# 11. FR-05 — Real-Time Pose Detection

The ML service must process the user's camera stream using the existing computer-vision pipeline.

The pipeline will use:

- OpenCV
- MediaPipe
- Landmark extraction
- Vector/angle calculations
- Exercise-specific analysis

The system should extract relevant body landmarks and derive biomechanical features required by each exercise.

---

# 12. FR-06 — Exercise Recognition / State Detection

The system should determine the current phase of an exercise.

For example:

```text
IDLE
 ↓
DESCENDING
 ↓
BOTTOM
 ↓
ASCENDING
 ↓
COMPLETED
```

This allows FormFit to distinguish an actual repetition from arbitrary body movement.

---

# 13. FR-07 — Rep Counting

FormFit should automatically count completed repetitions.

Example:

```text
Squat

REP
07
```

A repetition should only be counted after the movement passes the exercise's defined state transition criteria.

Partial or invalid movements should not automatically count as completed repetitions.

---

# 14. FR-08 — Form Analysis

For every supported exercise, FormFit should analyze exercise-specific form characteristics.

Possible metrics include:

- Joint angles
- Relative landmark positions
- Range of motion
- Body alignment
- Movement symmetry
- Movement phase
- Movement consistency
- Exercise-specific posture metrics

---

# 15. FR-09 — Form Error Detection

FormFit should detect predefined form issues supported by the underlying exercise model.

Examples:

### Squat

- Insufficient depth
- Knee alignment issues
- Excessive torso lean

### Bicep Curl

- Excessive torso swing
- Incorrect elbow position
- Incomplete range of motion

### Push-up

- Incorrect body alignment
- Insufficient depth
- Incorrect elbow positioning

The exact supported errors will depend on the reliability of the existing ML/CV modules.

---

# 16. FR-10 — Real-Time Feedback

Feedback should be shown during exercise execution.

Example:

```text
REP 8

FORM SCORE
91

✓ Good depth
✓ Good alignment
⚠ Keep your torso upright
```

Feedback should:

- Be concise.
- Be actionable.
- Avoid overwhelming the user.
- Avoid repeatedly displaying the same warning every frame.

The system should prioritize the most important detected issue.

---

# 17. FR-11 — Form Score

Each repetition and/or set should receive a form score.

Target scale:

```text
0 ─────────────── 100
Poor              Excellent
```

The scoring system should combine relevant exercise-specific metrics.

Example:

```text
Squat

Depth              90
Knee alignment     82
Torso stability     94
Movement control    88

Overall             88
```

The exact weighting will be defined during technical design.

---

# 18. FR-12 — Set Summary

After completing a set, the user should receive a summary.

Example:

```text
SET COMPLETE

Exercise       Squat
Reps           12
Avg. Score     87

Common Issues
─────────────
Knee alignment       3
Insufficient depth   2
Torso lean           1

Best Rep             94
Lowest Rep           71
```

---

# 19. FR-13 — Workout Session

A workout may contain multiple exercises and sets.

Example:

```text
Workout #24

Squat
  Set 1 — 12 reps — 87
  Set 2 — 10 reps — 90

Push-up
  Set 1 — 15 reps — 93

Bicep Curl
  Set 1 — 12 reps — 84
```

The completed workout should be saved to the user's account.

---

# 20. FR-14 — Workout History

Users should be able to view previous workouts.

Example:

```text
September 18

Squat       87
Push-up     92
Curl        84

Overall     88
```

Users should be able to select a previous workout to view more detail.

---

# 21. FR-15 — Progress Tracking

FormFit should visualize improvement over time.

Possible metrics:

- Average form score
- Exercise-specific form score
- Repetition consistency
- Error frequency
- Number of workouts
- Best form score

Example:

```text
Squat Form Progress

90 ┤                         ●
85 ┤                    ●
80 ┤               ●
75 ┤          ●
70 ┤     ●
   └──────────────────────────
     W1   W2   W3   W4   W5
```

---

# 22. FR-16 — AI Coaching

After a workout, FormFit should provide AI-generated coaching based on structured workout data.

Input to the AI system may include:

```text
Current workout
Previous workouts
Average form score
Exercise scores
Detected recurring errors
Improvement trends
```

Example output:

> Your squat form improved compared with your previous session. Your most frequent issue was knee alignment. Focus on keeping your knees tracking over your feet during the descent. Your push-up form was consistently strong.

The AI should focus on:

- Progress
- Weaknesses
- Recurring form problems
- Improvements
- Actionable recommendations

---

# 23. FR-17 — AI Coaching Constraints

The AI coach must not:

- Diagnose injuries.
- Claim medical expertise.
- Invent measurements that were not produced by the CV system.
- Override objective form measurements.
- Present uncertain conclusions as facts.

The AI should only interpret the structured information provided to it.

---

# 24. FR-18 — User Profile

The user dashboard should eventually provide:

```text
Name
Fitness level
Workout count
Average form score
Most improved exercise
Most common form issue
```

For the MVP, only essential profile functionality should be implemented.

---

# 25. System Architecture — Product-Level View

The product will consist of three primary application components.

```text
                    ┌─────────────────┐
                    │ React Frontend  │
                    └───────┬─────────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
          REST API                    Real-time ML
             │                             │
             ▼                             ▼
     ┌───────────────┐             ┌────────────────┐
     │ Node.js       │             │ Python ML      │
     │ Backend       │             │ Service        │
     └───────┬───────┘             └────────────────┘
             │
             ▼
     ┌───────────────┐
     │ PostgreSQL    │
     └───────────────┘
             │
             ▼
        AI Coaching
        Amazon Bedrock
```

---

# 26. Component Responsibilities

## Frontend — React

Responsible for:

- User interface
- Authentication screens
- Exercise selection
- Camera interface
- ML result visualization
- Rep counter
- Form score
- Feedback
- Workout summary
- Dashboard
- Progress visualization

The frontend should not contain database credentials or directly access PostgreSQL.

---

# 27. ML Service — Python

Responsible for:

- OpenCV
- MediaPipe
- Pose estimation
- Landmark processing
- Exercise-specific calculations
- State machines
- Rep counting
- Form evaluation
- Error detection
- Form scoring
- Real-time feedback generation

The ML service should remain independent of user-management and database logic.

---

# 28. Application Backend — Node.js

Responsible for:

- Authentication
- Authorization
- User management
- Workout sessions
- Exercise metadata
- Persisting workout results
- Retrieving workout history
- Progress calculations
- AI coaching requests
- Communication with PostgreSQL
- Communication with Amazon Bedrock

Node.js acts as the **application/business layer**.

---

# 29. Database — PostgreSQL

PostgreSQL will persist:

- Users
- Exercises
- Workouts
- Sets
- Form results
- Form errors
- AI coaching results

The database should store meaningful workout telemetry rather than raw camera frames.

---

# 30. Real-Time ML Communication

The ML pipeline should prioritize low-latency communication.

Conceptually:

```text
Browser Camera
      ↓
React
      ↓
Real-time connection
      ↓
Python ML Service
      ↓
Pose / Form Analysis
      ↓
Real-time result
      ↓
React UI
```

The exact protocol, frame rate, payload format and deployment architecture will be defined in the TRD.

---

# 31. Data Flow After a Workout

```text
User performs exercise
        ↓
Python ML analyzes movement
        ↓
Rep / score / errors generated
        ↓
React receives real-time feedback
        ↓
Set completed
        ↓
Workout summary generated
        ↓
React sends structured workout result
        ↓
Node.js Backend
        ↓
PostgreSQL
        ↓
Historical workout data
        ↓
AI Coaching request
        ↓
Amazon Bedrock
        ↓
Personalized coaching
        ↓
PostgreSQL
        ↓
React Dashboard
```

---

# 32. AWS Role

AWS should be used because it solves actual product requirements.

AWS should not be inserted into the real-time camera inference path merely to satisfy the competition requirement.

The initial cloud architecture should provide:

### Cloud backend

Reliable deployment of the application backend.

### Persistent database

Managed PostgreSQL infrastructure for user and workout data.

### AI coaching

Amazon Bedrock for personalized post-workout coaching.

### Scalability

Infrastructure that can support multiple users without requiring the developer to manually manage every component.

---

# 33. Privacy Architecture

FormFit should follow an edge-first architecture.

```text
Camera
   ↓
Local / Edge Processing
   ↓
OpenCV + MediaPipe
   ↓
Landmarks / Form Metrics
   ↓
Camera frame discarded
   ↓
Workout telemetry sent to backend
```

The cloud should not receive a continuous stream of raw workout video in the MVP.

This reduces:

- Privacy risk
- Bandwidth
- Cloud cost
- Latency

---

# 34. Non-Functional Requirements

## NFR-01 — Real-Time Responsiveness

Form feedback should feel immediate during exercise.

The ML pipeline should target low-latency local inference.

---

## NFR-02 — Reliability

The system should avoid producing feedback when required landmarks cannot be detected reliably.

Example:

```text
Unable to detect left knee.

Please adjust your position.
```

is preferable to an incorrect form warning.

---

## NFR-03 — Availability

The deployed application should remain accessible during the competition demonstration and judging period.

---

## NFR-04 — Security

The system must:

- Hash passwords.
- Authenticate protected API requests.
- Authorize access to user-specific workouts.
- Keep database credentials server-side.
- Never expose database credentials to React.

---

## NFR-05 — Privacy

Raw camera footage should not be unnecessarily persisted.

---

## NFR-06 — Scalability

The backend architecture should allow multiple users to use FormFit without requiring major architectural changes.

The MVP does not require internet-scale infrastructure.

---

# 35. MVP Scope — First Commit

The MVP should contain only the features necessary to demonstrate the complete product loop.

## Must Have

### Computer Vision

- Pose detection
- 3–5 reliable exercises
- Rep counting
- Form analysis
- Form errors
- Form score
- Real-time feedback

### Product

- Landing page
- Registration/login
- Exercise selection
- Workout interface
- Workout summary
- Dashboard
- Workout history
- Basic progress visualization

### Backend

- Node.js API
- Authentication
- Workout APIs
- PostgreSQL
- Persistent user data
- Persistent workout data

### AI

- Amazon Bedrock integration
- Post-workout AI analysis
- Personalized recommendations

### Deployment

- Production frontend
- Production backend
- Production database
- Production ML service
- HTTPS
- Working end-to-end system

---

# 36. Explicitly Out of MVP Scope

The following should NOT be implemented during the four-day build unless the core product is already complete:

- Custom model training pipeline
- SageMaker training
- S3 ML data lake
- AWS IoT
- AWS Greengrass
- Wearable integration
- Mobile application
- Social features
- Trainer marketplace
- Nutrition tracking
- Diet recommendations
- Medical diagnosis
- Injury diagnosis
- 50+ exercises
- Live human trainer integration
- Advanced recommendation engine
- Automatic workout generation
- Hardware integration

These are future possibilities, not MVP requirements.

---

# 37. Stretch Features

Only after the MVP is stable:

### Stretch 1 — Personalized Baseline

Track a user's normal movement characteristics.

```text
User movement baseline
        ↓
Current movement
        ↓
Deviation
        ↓
Personalized feedback
```

### Stretch 2 — Exercise Comparison

Compare current performance against previous sessions.

### Stretch 3 — Better AI Coach

Generate weekly coaching summaries.

### Stretch 4 — More Exercises

Add additional exercise modules from the existing CV framework.

---

# 38. Future Product Vision

The long-term FormFit architecture can evolve into a personalized digital trainer.

```text
                  FORMFiT
                     │
          ┌──────────┴──────────┐
          │                     │
     Movement AI          User Intelligence
          │                     │
     Form Analysis         Workout History
     Rep Detection         Progress
     Technique             Preferences
          │                     │
          └──────────┬──────────┘
                     │
                AI COACH
                     │
          ┌──────────┼──────────┐
          │          │          │
        Form      Training   Progress
        Coach       Plan      Analysis
```

Future versions could include:

- Personalized exercise recommendations
- Adaptive training plans
- More sophisticated movement models
- Individual movement baselines
- Multi-angle analysis
- Mobile application
- Wearable integration
- Gym equipment integration
- Cloud-based model improvement
- Advanced ML models trained from anonymized movement telemetry

---

# 39. Success Metrics

The MVP should be evaluated using both product and technical metrics.

## Product Metrics

### Form Detection Accuracy

Percentage of tested repetitions where the system correctly identifies form status.

### Rep Counting Accuracy

Percentage of correctly counted repetitions.

### Feedback Relevance

Whether detected feedback corresponds to an actual form issue.

### User Completion

Percentage of users who successfully complete:

```text
Start workout
      ↓
Exercise
      ↓
Complete set
      ↓
View summary
```

### Coaching Usefulness

Whether AI coaching correctly summarizes the user's measured performance and provides actionable recommendations.

---

# 40. Technical Success Criteria

The MVP is considered successful if:

1. A user can create an account.
2. A user can log in.
3. A user can start a workout.
4. The browser can access the camera.
5. The ML service can analyze the exercise.
6. Repetitions are detected.
7. Form issues are detected.
8. Feedback appears during exercise.
9. A form score is generated.
10. Workout results are saved.
11. Historical results can be retrieved.
12. Progress can be visualized.
13. Bedrock can generate coaching from actual workout data.
14. The entire application can be accessed through a deployed URL.

---

# 41. Key Product Risks

## Risk 1 — Incorrect Form Feedback

This is the most important product risk.

Incorrect feedback can destroy user trust.

### Mitigation

- Limit initial exercises.
- Use conservative thresholds.
- Require sufficient landmark confidence.
- Provide feedback only when confidence is adequate.
- Clearly distinguish "unable to detect" from "bad form."

---

## Risk 2 — Camera Position

Different camera angles can produce different landmark geometry.

### Mitigation

Define a supported camera position for each exercise and provide setup instructions.

---

## Risk 3 — Occlusion

Body parts may be hidden by:

- equipment
- clothing
- other people
- poor positioning

### Mitigation

Use landmark visibility/confidence and ask the user to reposition when necessary.

---

## Risk 4 — Real-Time Latency

Cloud-based frame-by-frame processing would introduce unnecessary latency.

### Mitigation

Keep the CV inference path local/edge-oriented.

---

## Risk 5 — Scope Explosion

Supporting too many exercises can make the product unreliable.

### Mitigation

Prioritize a small number of high-quality exercises.

---

# 42. Product Differentiation

FormFit is differentiated by combining four layers:

```text
             FORMFiT

      ┌───────────────────┐
      │ Real-time CV      │
      │ movement analysis │
      └─────────┬─────────┘
                ↓
      ┌───────────────────┐
      │ Form correction   │
      │ during exercise   │
      └─────────┬─────────┘
                ↓
      ┌───────────────────┐
      │ Persistent workout│
      │ intelligence      │
      └─────────┬─────────┘
                ↓
      ┌───────────────────┐
      │ Personalized      │
      │ AI coaching       │
      └───────────────────┘
```

Most basic fitness trackers stop at:

> **"You completed 12 reps."**

FormFit aims to answer:

> **"You completed 12 reps, 9 were well-formed, your recurring issue was knee alignment, and your form has improved 14% over your previous sessions."**

---

# 43. Competition Positioning

For the First Commit submission, FormFit should be positioned as an **edge-first AI fitness platform** rather than simply an exercise tracker.

### Core statement

> **FormFit uses real-time computer vision to analyze exercise technique, provide immediate corrective feedback, track form progression, and generate personalized AI coaching — without requiring users to continuously upload their camera feed.**

### Technical story

```text
EDGE
OpenCV + MediaPipe
       ↓
Real-time movement intelligence

CLOUD
Node.js + PostgreSQL
       ↓
Persistent user/workout intelligence

GENERATIVE AI
Amazon Bedrock
       ↓
Personalized coaching
```

---

# 44. MVP Definition in One Sentence

> **FormFit enables gym users to perform supported exercises in front of their camera, receive real-time computer-vision-based form correction and scoring, save their workout history, and receive personalized AI coaching based on their measured performance.**

---

# 45. Product Boundary

For the first competition release:

### FormFit IS

**A real-time exercise form analysis and fitness tracking platform with AI coaching.**

### FormFit IS NOT

**A medical system, injury diagnosis system, professional replacement for medical advice, or full autonomous personal trainer.**

The distinction is important both technically and from a product-safety perspective.

---

# 46. Recommended Development Order

The implementation should follow this dependency order:

```text
PHASE 1
Existing ML Engine
        ↓
Stable exercise analysis

PHASE 2
React ↔ Python
        ↓
Real-time web integration

PHASE 3
Node.js Backend
        ↓
REST APIs

PHASE 4
PostgreSQL
        ↓
Users + Workouts + Results

PHASE 5
Frontend Dashboard
        ↓
History + Progress

PHASE 6
AWS Deployment
        ↓
Production environment

PHASE 7
Amazon Bedrock
        ↓
AI Coaching

PHASE 8
Polish
        ↓
Demo + UI + reliability
```

The dependency is intentional.

**Do not start with Bedrock.**

The core product must work without it.

---

# 47. Definition of Done

The First Commit MVP is complete when a new user can:

```text
1. Open FormFit
        ↓
2. Create an account
        ↓
3. Select Squat
        ↓
4. Position themselves
        ↓
5. Start camera
        ↓
6. Perform 10+ repetitions
        ↓
7. See real-time form feedback
        ↓
8. Receive accurate rep count
        ↓
9. Receive form score
        ↓
10. Complete workout
        ↓
11. See workout summary
        ↓
12. Save workout
        ↓
13. Refresh browser
        ↓
14. Still see workout history
        ↓
15. Ask FormFit for coaching
        ↓
16. Receive personalized analysis
```

This complete loop is the **minimum successful FormFit product** for the competition.