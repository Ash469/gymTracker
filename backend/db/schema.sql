-- ─────────────────────────────────────────────────────────
-- FormFit — PostgreSQL Database Schema (camelCase column names)
-- ─────────────────────────────────────────────────────────

-- Optional: Drop existing tables if re-creating schema
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
  "fitnessLevel" VARCHAR(50),
  "primaryGoal" VARCHAR(100),
  "workoutFrequency" VARCHAR(50),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Exercises Table ───────────────────────────────────────
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  "muscleGroup" VARCHAR(100) NOT NULL,
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
  duration INT, -- total seconds
  "overallScore" DOUBLE PRECISION,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workouts_user_id ON workouts("userId");
CREATE INDEX idx_workouts_status ON workouts(status);

-- ── Workout Sets Table ────────────────────────────────────
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workoutId" UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  "exerciseId" UUID NOT NULL REFERENCES exercises(id),
  "setNumber" INT NOT NULL,
  reps INT NOT NULL DEFAULT 0,
  "averageScore" DOUBLE PRECISION,
  "bestScore" DOUBLE PRECISION,
  "worstScore" DOUBLE PRECISION,
  duration INT, -- seconds
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_sets_workout_id ON workout_sets("workoutId");
CREATE INDEX idx_workout_sets_exercise_id ON workout_sets("exerciseId");

-- ── Form Feedback Table ───────────────────────────────────
CREATE TABLE form_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "setId" UUID NOT NULL REFERENCES workout_sets(id) ON DELETE CASCADE,
  "errorType" VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  "occurrenceCount" INT NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_form_feedback_set_id ON form_feedback("setId");
CREATE INDEX idx_form_feedback_error_type ON form_feedback("errorType");

-- ── AI Coaching Table ─────────────────────────────────────
CREATE TABLE ai_coaching (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "workoutId" UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  strengths JSONB,
  "areasToImprove" JSONB,
  recommendations JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_coaching_user_id ON ai_coaching("userId");
CREATE INDEX idx_ai_coaching_workout_id ON ai_coaching("workoutId");
