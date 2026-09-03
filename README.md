# Smart Gym Form Tracker 🏋️‍♂️

An AI-powered computer vision pipeline that tracks human biomechanics and weightlifting form in real-time. 

Built with **OpenCV** and **MediaPipe**, this system actively monitors user form, validates strict range-of-motion (ROM) mechanics using trigonometric vector math, and automatically logs repetitions without requiring any manual input.

## 🚀 Core Features

* **Biomechanical Pose Estimation:** Utilizes MediaPipe's BlazePose model to extract 33 distinct 3D anatomical landmarks from a live video feed at high framerates.
* **Hands-Free Auto-Activation:** Implements a 2-second static positional hold sequence to initialize tracking, mirroring the behavior of commercial fitness AI platforms and preventing false-positive rep counting.
* **Strict ROM State Machine:** Uses dynamic joint angle calculations (Shoulder-Elbow-Wrist) to power a state machine that enforces a strict 90° extension before a rep is validated.
* **Live Form Correction:** Renders a dynamic Heads-Up Display (HUD) offering real-time, color-coded visual feedback to prevent over-extension and injury.

## 🛠️ Tech Stack
* **Language:** Python 3.11+
* **Computer Vision:** OpenCV (`cv2`)
* **Machine Learning / AI:** Google MediaPipe Pose 
* **Data Mathematics:** NumPy

## 📁 System Architecture
```text
gym-form-tracker/
├── assets/                     # Demo GIFs and screenshots
├── src/                        
│   ├── pose_detector.py        # MediaPipe landmark extraction wrapper
│   ├── utils.py                # Trigonometry and joint angle vector math
│   └── tracker.py              # Rep counting state machine & form validation
├── main.py                     # Execution pipeline and OpenCV HUD rendering
├── requirements.txt            # Python dependencies
└── README.md