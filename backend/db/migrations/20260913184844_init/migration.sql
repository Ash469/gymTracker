-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "fitness_level" TEXT,
    "primary_goal" TEXT,
    "workout_frequency" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "muscle_group" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration" INTEGER,
    "overall_score" DOUBLE PRECISION,
    "status" "WorkoutStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sets" (
    "id" TEXT NOT NULL,
    "set_number" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "average_score" DOUBLE PRECISION,
    "best_score" DOUBLE PRECISION,
    "worst_score" DOUBLE PRECISION,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workout_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,

    CONSTRAINT "workout_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_feedback" (
    "id" TEXT NOT NULL,
    "error_type" TEXT NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "occurrence_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "set_id" TEXT NOT NULL,

    CONSTRAINT "form_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_coaching" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" JSONB,
    "areas_to_improve" JSONB,
    "recommendations" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "workout_id" TEXT NOT NULL,

    CONSTRAINT "ai_coaching_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");

-- CreateIndex
CREATE INDEX "workouts_user_id_idx" ON "workouts"("user_id");

-- CreateIndex
CREATE INDEX "workouts_status_idx" ON "workouts"("status");

-- CreateIndex
CREATE INDEX "workout_sets_workout_id_idx" ON "workout_sets"("workout_id");

-- CreateIndex
CREATE INDEX "workout_sets_exercise_id_idx" ON "workout_sets"("exercise_id");

-- CreateIndex
CREATE INDEX "form_feedback_set_id_idx" ON "form_feedback"("set_id");

-- CreateIndex
CREATE INDEX "form_feedback_error_type_idx" ON "form_feedback"("error_type");

-- CreateIndex
CREATE INDEX "ai_coaching_user_id_idx" ON "ai_coaching"("user_id");

-- CreateIndex
CREATE INDEX "ai_coaching_workout_id_idx" ON "ai_coaching"("workout_id");

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_feedback" ADD CONSTRAINT "form_feedback_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "workout_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_coaching" ADD CONSTRAINT "ai_coaching_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_coaching" ADD CONSTRAINT "ai_coaching_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
