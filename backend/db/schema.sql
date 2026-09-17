-- ─────────────────────────────────────────────────────────
-- FormFit — PostgreSQL Database Schema (camelCase column names)
-- Aligned with PRD 2.0 & TRD 2.0 (prodArc Architecture)
-- Supports AWS Bedrock Mode A (Proactive Growth Coach / Planner) 
-- & Mode B (Instant Biomechanical Set Breakdown)
-- ─────────────────────────────────────────────────────────

DROP TABLE IF EXISTS ai_workout_plans CASCADE;
DROP TABLE IF EXISTS ai_coaching CASCADE;
DROP TABLE IF EXISTS form_feedback CASCADE;
DROP TABLE IF EXISTS workout_sets CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users Table ───────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" VARCHAR(255) NOT NULL,
  "fitnessLevel" VARCHAR(50) DEFAULT 'BEGINNER', -- BEGINNER, INTERMEDIATE, ADVANCED
  "primaryGoal" VARCHAR(100) DEFAULT 'HYPERTROPHY', -- HYPERTROPHY, STRENGTH, FORM_CORRECTION, INJURY_PREVENTION
  "workoutFrequency" VARCHAR(50),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Exercises Table ───────────────────────────────────────
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'shoulder_press', 'bicep_curl', 'squat'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "muscleGroup" VARCHAR(100) NOT NULL, -- e.g. 'Shoulders', 'Biceps', 'Quadriceps'
  "targetJoint" VARCHAR(100), -- e.g. 'Shoulder-Elbow-Wrist', 'Hip-Knee-Ankle'
  "idealAngleRange" JSONB, -- e.g. {"lockoutMin": 140, "bottomMax": 105}
  difficulty VARCHAR(50) NOT NULL DEFAULT 'BEGINNER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Workouts Table ────────────────────────────────────────
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "startedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMPTZ,
  duration INT DEFAULT 0, -- total seconds
  "totalCalories" INT DEFAULT 0, -- total calories burned across all sets
  "overallScore" DOUBLE PRECISION, -- average of all sets (0-100)
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, ABANDONED
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workouts_user_id ON workouts("userId");
CREATE INDEX idx_workouts_status ON workouts(status);

-- ── Workout Sets Table ────────────────────────────────────
-- Primary telemetry storage box for set analytics & AWS Bedrock context
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workoutId" UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  "exerciseId" UUID NOT NULL REFERENCES exercises(id),
  "setNumber" INT NOT NULL,
  reps INT NOT NULL DEFAULT 0,
  weight DOUBLE PRECISION DEFAULT 0.0, -- kg load lifted
  "caloriesBurned" INT DEFAULT 0, -- calories burned in this set
  "averageScore" DOUBLE PRECISION, -- set form accuracy (0-100)
  "bestScore" DOUBLE PRECISION, -- best single rep score
  "worstScore" DOUBLE PRECISION, -- worst single rep score
  duration INT DEFAULT 0, -- set duration in seconds
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_sets_workout_id ON workout_sets("workoutId");
CREATE INDEX idx_workout_sets_exercise_id ON workout_sets("exerciseId");

-- ── Form Feedback / Granular Joint Telemetry Table ────────
-- Stores exact joint angle mistakes & injury risk data per set/rep
CREATE TABLE form_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "setId" UUID NOT NULL REFERENCES workout_sets(id) ON DELETE CASCADE,
  "repNumber" INT, -- rep number where mistake occurred (e.g. rep 3)
  "jointName" VARCHAR(100), -- e.g. 'RIGHT_ELBOW', 'LEFT_KNEE', 'LUMBAR_SPINE'
  "errorType" VARCHAR(100) NOT NULL, -- e.g. 'ELBOW_TOO_HIGH', 'KNEE_VALGUS', 'INSUFFICIENT_DEPTH'
  "measuredAngle" DOUBLE PRECISION, -- exact angle measured by WASM (e.g. 118.5 deg)
  "expectedRange" VARCHAR(100), -- expected safe range (e.g. '75°-90°')
  severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
  "injuryRisk" VARCHAR(50) DEFAULT 'LOW', -- NONE, LOW, MEDIUM, HIGH
  "occurrenceCount" INT NOT NULL DEFAULT 1,
  "feedbackMessage" TEXT, -- e.g. 'Right elbow flared 22° too high on press phase'
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_form_feedback_set_id ON form_feedback("setId");
CREATE INDEX idx_form_feedback_error_type ON form_feedback("errorType");
CREATE INDEX idx_form_feedback_joint_name ON form_feedback("jointName");

-- ── AI Workout Plans Table ────────────────────────────────
-- Stores AWS Bedrock generated daily & weekly workout plans (Mode A)
CREATE TABLE ai_workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "planType" VARCHAR(50) NOT NULL DEFAULT 'DAILY', -- DAILY, WEEKLY, RECOVERY
  title VARCHAR(255) NOT NULL,
  "aiReasoning" TEXT NOT NULL, -- Proactive guidance & progress explanation
  exercises JSONB NOT NULL, -- Array of recommended exercises, sets, reps & weight
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_workout_plans_user_id ON ai_workout_plans("userId");

-- ── AI Coaching Table ─────────────────────────────────────
-- Stores Amazon Bedrock outputs for both Mode A (Growth Coach) & Mode B (Set Breakdown)
CREATE TABLE ai_coaching (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "workoutId" UUID REFERENCES workouts(id) ON DELETE CASCADE,
  "setId" UUID REFERENCES workout_sets(id) ON DELETE CASCADE, -- Set-level coaching if Mode B
  "coachingType" VARCHAR(50) NOT NULL DEFAULT 'POST_WORKOUT_SUMMARY', -- SET_BREAKDOWN, POST_WORKOUT_SUMMARY, GROWTH_ANALYSIS, WORKOUT_PLAN
  "userPrompt" TEXT, -- Custom query from user if typed
  "promptInput" JSONB, -- Rich telemetry payload sent to AWS Bedrock
  summary TEXT NOT NULL,
  strengths JSONB,
  "areasToImprove" JSONB,
  recommendations JSONB,
  "injuryRiskAssessment" JSONB, -- Key joint injury warnings (e.g. Shoulder impingement)
  "modelId" VARCHAR(100) DEFAULT 'anthropic.claude-3-haiku-20240307-v1:0',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_coaching_user_id ON ai_coaching("userId");
CREATE INDEX idx_ai_coaching_workout_id ON ai_coaching("workoutId");
CREATE INDEX idx_ai_coaching_set_id ON ai_coaching("setId");
