require('dotenv').config();
const bedrockService = require('../services/bedrock.service');

async function testBedrockIntegration() {
  console.log('====================================================');
  console.log('       FormFit AWS Bedrock Integration Test');
  console.log('====================================================\n');

  const status = bedrockService.getBedrockStatus();
  console.log('Diagnostic Status:', JSON.stringify(status, null, 2));

  console.log('\n--> Testing Workout Telemetry Analysis...');
  const sampleTelemetry = {
    currentWorkout: {
      overallScore: 88.5,
      totalCalories: 250,
      exercises: [
        {
          name: 'Shoulder Press',
          muscleGroup: 'Shoulders',
          reps: 10,
          weightKg: 20,
          volumeKg: 200,
          score: 85.0,
          errors: { ELBOW_FLARE: 2 },
        },
        {
          name: 'Barbell Squat',
          muscleGroup: 'Legs',
          reps: 8,
          weightKg: 60,
          volumeKg: 480,
          score: 92.0,
          errors: { KNEE_VALGUS: 1 },
        },
      ],
    },
    historicalContext: {
      previousAverage: 82.0,
      trend: 'improving',
      totalPreviousWorkouts: 4,
    },
  };

  try {
    const analysisResult = await bedrockService.getWorkoutRecommendations(sampleTelemetry);
    console.log('\n[Analysis Result]');
    console.log('Status:        ', analysisResult.status);
    console.log('Model Used:    ', analysisResult.model);
    console.log('Summary:       ', analysisResult.summary);
    console.log('Strengths:     ', analysisResult.strengths);
    console.log('Areas to Improve:', analysisResult.areasToImprove);
    console.log('Recommendations:', JSON.stringify(analysisResult.recommendations, null, 2));
  } catch (err) {
    console.error('Test Failed with Error:', err);
  }

  console.log('\n--> Testing AI Workout Plan Generation...');
  const sampleUserContext = {
    profile: { name: 'Test Athlete', fitnessLevel: 'Intermediate', primaryGoal: 'Hypertrophy' },
    recentWorkouts: [],
    requestedPlanType: 'DAILY',
  };

  try {
    const planResult = await bedrockService.generateWorkoutPlan(sampleUserContext);
    console.log('\n[Generated Plan Result]');
    console.log('Title:       ', planResult.title);
    console.log('Reasoning:   ', planResult.aiReasoning);
    console.log('Exercises:   ', JSON.stringify(planResult.exercises, null, 2));
  } catch (err) {
    console.error('Plan Test Failed with Error:', err);
  }

  console.log('\n====================================================');
  console.log('  Test Execution Completed.');
  console.log('====================================================');
}

testBedrockIntegration();
