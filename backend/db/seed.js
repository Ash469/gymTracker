const prisma = require('./index');

const bcrypt = require('bcryptjs');

/**
 * Seed the exercises table and default demo user.
 */
async function seed() {
  console.log('🌱 Seeding database...\n');

  // Seed Demo User
  const demoEmail = 'demo@formfit.com';
  const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingUser) {
    const passwordHash = await bcrypt.hash('Demo1234!', 10);
    await prisma.user.create({
      data: {
        email: demoEmail,
        name: 'Demo Athlete',
        passwordHash,
        fitnessLevel: 'INTERMEDIATE',
        primaryGoal: 'improve form',
        workoutFrequency: '4x/week',
      },
    });
    console.log('  ✓ Demo user created (demo@formfit.com)');
  } else {
    console.log('  ✓ Demo user already exists');
  }

  const exercises = [
    {
      name: 'Bicep Curl',
      description: 'Isolate and strengthen the biceps with controlled curling motion. Keep elbows pinned to your sides and avoid swinging.',
      muscleGroup: 'Arms',
      difficulty: 'BEGINNER',
    },
    {
      name: 'Shoulder Press',
      description: 'Overhead pressing movement targeting the deltoids. Maintain a neutral spine and press directly overhead.',
      muscleGroup: 'Shoulders',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: 'Tricep Extension',
      description: 'Overhead or behind-the-head extension isolating the triceps. Keep upper arms stationary throughout the movement.',
      muscleGroup: 'Arms',
      difficulty: 'BEGINNER',
    },
    {
      name: 'Lateral Raise',
      description: 'Side raise movement targeting the lateral deltoids. Raise arms to shoulder height with a slight bend in the elbows.',
      muscleGroup: 'Shoulders',
      difficulty: 'BEGINNER',
    },
    {
      name: 'Squat',
      description: 'Fundamental lower body compound movement. Focus on depth, knee alignment, and maintaining an upright torso.',
      muscleGroup: 'Legs',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: 'Dumbbell Bench Press',
      description: 'Chest pressing movement with dumbbells. Keep shoulder blades retracted and control the descent.',
      muscleGroup: 'Chest',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: 'Single Arm Dumbbell Row',
      description: 'Unilateral back exercise targeting the lats and rhomboids. Keep your back flat and pull the elbow past your torso.',
      muscleGroup: 'Back',
      difficulty: 'BEGINNER',
    },
    {
      name: 'Russian Twist',
      description: 'Core rotation exercise targeting the obliques. Maintain a stable base and rotate through the torso, not the arms.',
      muscleGroup: 'Core',
      difficulty: 'INTERMEDIATE',
    },
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {
        description: exercise.description,
        muscleGroup: exercise.muscleGroup,
        difficulty: exercise.difficulty,
      },
      create: exercise,
    });
    console.log(`  ✓ ${exercise.name}`);
  }

  console.log('\n✅ Seed complete.\n');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
