require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, query } = require('./index');

/**
 * Seed the exercises table and default demo user.
 */
async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Seed Demo User
    const demoEmail = 'demo@formfit.com';
    const userRes = await query('SELECT id FROM users WHERE email = $1', [demoEmail]);

    if (userRes.rows.length === 0) {
      const passwordHash = await bcrypt.hash('Demo1234!', 10);
      await query(
        `INSERT INTO users (email, name, "passwordHash", "fitnessLevel", "primaryGoal", "workoutFrequency")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [demoEmail, 'Demo Athlete', passwordHash, 'INTERMEDIATE', 'improve form', '4x/week']
      );
      console.log('  ✓ Demo user created (demo@formfit.com)');
    } else {
      console.log('  ✓ Demo user already exists');
    }

    const exercises = [
      {
        slug: 'bicep_curl',
        name: 'Bicep Curl',
        description: 'Isolate and strengthen the biceps with controlled curling motion. Keep elbows pinned to your sides and avoid swinging.',
        muscleGroup: 'Arms',
        targetJoint: 'Shoulder-Elbow-Wrist',
        difficulty: 'BEGINNER',
      },
      {
        slug: 'shoulder_press',
        name: 'Shoulder Press',
        description: 'Overhead pressing movement targeting the deltoids. Maintain a neutral spine and press directly overhead.',
        muscleGroup: 'Shoulders',
        targetJoint: 'Shoulder-Elbow-Wrist',
        difficulty: 'INTERMEDIATE',
      },
      {
        slug: 'tricep_extension',
        name: 'Tricep Extension',
        description: 'Overhead or behind-the-head extension isolating the triceps. Keep upper arms stationary throughout the movement.',
        muscleGroup: 'Arms',
        targetJoint: 'Shoulder-Elbow-Wrist',
        difficulty: 'BEGINNER',
      },
      {
        slug: 'lateral_raise',
        name: 'Lateral Raise',
        description: 'Side raise movement targeting the lateral deltoids. Raise arms to shoulder height with a slight bend in the elbows.',
        muscleGroup: 'Shoulders',
        targetJoint: 'Hip-Shoulder-Elbow',
        difficulty: 'BEGINNER',
      },
      {
        slug: 'squat',
        name: 'Squat',
        description: 'Fundamental lower body compound movement. Focus on depth, knee alignment, and maintaining an upright torso.',
        muscleGroup: 'Legs',
        targetJoint: 'Hip-Knee-Ankle',
        difficulty: 'INTERMEDIATE',
      },
      {
        slug: 'dumbbell_bench_press',
        name: 'Dumbbell Bench Press',
        description: 'Chest pressing movement with dumbbells. Keep shoulder blades retracted and control the descent.',
        muscleGroup: 'Chest',
        targetJoint: 'Shoulder-Elbow-Wrist',
        difficulty: 'INTERMEDIATE',
      },
      {
        slug: 'single_arm_dumbbell_row',
        name: 'Single Arm Dumbbell Row',
        description: 'Unilateral back exercise targeting the lats and rhomboids. Keep your back flat and pull the elbow past your torso.',
        muscleGroup: 'Back',
        targetJoint: 'Shoulder-Elbow-Wrist',
        difficulty: 'BEGINNER',
      },
      {
        slug: 'russian_twist',
        name: 'Russian Twist',
        description: 'Core rotation exercise targeting the obliques. Maintain a stable base and rotate through the torso, not the arms.',
        muscleGroup: 'Core',
        targetJoint: 'Shoulder-Hip-Spine',
        difficulty: 'INTERMEDIATE',
      },
    ];

    for (const exercise of exercises) {
      await query(
        `INSERT INTO exercises (slug, name, description, "muscleGroup", "targetJoint", difficulty)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           "muscleGroup" = EXCLUDED."muscleGroup",
           "targetJoint" = EXCLUDED."targetJoint",
           difficulty = EXCLUDED.difficulty`,
        [exercise.slug, exercise.name, exercise.description, exercise.muscleGroup, exercise.targetJoint, exercise.difficulty]
      );
      console.log(`  ✓ ${exercise.name}`);
    }

    console.log('\n✅ Seed complete.\n');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
