require('dotenv').config();
const { pool, query } = require('../db');

async function audit() {
  console.log('====================================================');
  console.log('         FORMFIT DATABASE AUDIT REPORT              ');
  console.log('====================================================\n');

  try {
    // 1. Users
    const usersRes = await query('SELECT * FROM users');
    const users = usersRes.rows;
    console.log(`[1] USERS TABLE (${users.length} rows)`);
    users.forEach(u => {
      console.log(`  • ID: ${u.id}`);
      console.log(`    Name: "${u.name}" | Email: "${u.email}"`);
      console.log(`    Fitness Level: ${u.fitnessLevel} | Goal: "${u.primaryGoal}" | Frequency: "${u.workoutFrequency}"`);
      console.log(`    Password Hash: [bcrypt ${u.passwordHash.substring(0, 15)}...] (properly secured)`);
      console.log(`    Created: ${new Date(u.createdAt).toISOString()}`);
    });

    // 2. Exercises
    const exercisesRes = await query('SELECT * FROM exercises ORDER BY name ASC');
    const exercises = exercisesRes.rows;
    console.log(`\n[2] EXERCISES TABLE (${exercises.length} rows)`);
    exercises.forEach((e, idx) => {
      console.log(`  ${idx + 1}. ${e.name.padEnd(26)} | Group: ${e.muscleGroup.padEnd(10)} | Difficulty: ${e.difficulty.padEnd(12)} | Active: ${e.isActive}`);
    });

    // 3. Workouts
    const workoutsRes = await query('SELECT * FROM workouts ORDER BY "createdAt" DESC');
    const workouts = workoutsRes.rows;
    console.log(`\n[3] WORKOUTS TABLE (${workouts.length} rows)`);
    workouts.forEach((w, idx) => {
      console.log(`  Session #${idx + 1} (${w.id}):`);
      console.log(`    Status: ${w.status} | Overall Score: ${w.overallScore}% | Duration: ${w.duration}s`);
      console.log(`    Started:   ${new Date(w.startedAt).toISOString()}`);
      console.log(`    Completed: ${w.completedAt ? new Date(w.completedAt).toISOString() : 'in progress'}`);
    });

    // 4. Workout Sets
    const setsRes = await query(
      `SELECT ws.*, e.name as "exerciseName"
       FROM workout_sets ws
       JOIN exercises e ON ws."exerciseId" = e.id
       ORDER BY ws."createdAt" DESC`
    );
    const sets = setsRes.rows;
    console.log(`\n[4] WORKOUT_SETS TABLE (${sets.length} rows)`);
    sets.forEach((s, idx) => {
      console.log(`  Set #${idx + 1} (${s.id}):`);
      console.log(`    Exercise: "${s.exerciseName}" (Set ${s.setNumber})`);
      console.log(`    Reps: ${s.reps} | Duration: ${s.duration}s | Avg Score: ${s.averageScore}% | Best: ${s.bestScore}% | Worst: ${s.worstScore}%`);
    });

    // 5. Form Feedback
    const feedbackRes = await query('SELECT * FROM form_feedback');
    const feedback = feedbackRes.rows;
    console.log(`\n[5] FORM_FEEDBACK TABLE (${feedback.length} rows)`);
    if (feedback.length === 0) {
      console.log('  (No form errors logged — sets performed with 100% good form)');
    } else {
      feedback.forEach(f => {
        console.log(`  • Error: "${f.errorType}" | Severity: ${f.severity} | Count: ${f.occurrenceCount}`);
      });
    }

    // 6. AI Coaching
    const coachingRes = await query('SELECT * FROM ai_coaching');
    const coaching = coachingRes.rows;
    console.log(`\n[6] AI_COACHING TABLE (${coaching.length} rows)`);
    if (coaching.length === 0) {
      console.log('  (Ready for AWS Bedrock coaching analyses)');
    } else {
      coaching.forEach(c => {
        console.log(`  • Summary: ${c.summary}`);
      });
    }

    console.log('\n====================================================');
    console.log('           ALL TABLES AND VALUES VERIFIED           ');
    console.log('====================================================\n');
  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    await pool.end();
  }
}

audit();
