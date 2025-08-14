/**
 * Speed of Mastery RAG System - Test Script
 * This script tests all RAG system endpoints after deployment
 */

const RAG_API_URL = process.env.RAG_API_URL || 'https://your-worker.your-subdomain.workers.dev';

// Test data
const testData = {
  search: {
    query: "English alphabet",
    language: "ar",
    limit: 5
  },
  recommendations: {
    user_level: "beginner",
    completed_lessons: [1, 2],
    interests: ["grammar", "vocabulary"]
  },
  lessonHelp: {
    lesson_id: 1,
    user_question: "How do I pronounce the letter A?",
    context: "Learning English alphabet"
  },
  conversation: {
    topic: "Greetings",
    user_level: "beginner",
    language: "ar"
  },
  grammar: {
    grammar_topic: "Present Simple",
    examples: ["I am", "You are", "He is"],
    user_level: "beginner"
  },
  vocabulary: {
    topic: "Colors",
    difficulty: "beginner",
    exercise_type: "matching"
  },
  pronunciation: {
    word: "Hello",
    phonetic: "həˈloʊ",
    audio_url: null
  },
  progress: {
    user_id: "test_user_123",
    lesson_id: 1,
    completed: true,
    score: 85,
    time_spent: 300
  },
  aiLesson: {
    topic: "Present Simple Tense",
    user_level: "beginner"
  },
  wordTranslation: {
    word: "hello",
    context: "greeting someone"
  },
  wordPronunciation: {
    word: "pronunciation"
  }
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to make HTTP requests
async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `${RAG_API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message
    };
  }
}

// Test functions
async function testHealth() {
  console.log('🏥 Testing Health Endpoint...');
  const result = await makeRequest('/api/health');
  
  if (result.success) {
    console.log('✅ Health check passed');
    console.log(`   Status: ${result.data.status}`);
    console.log(`   Service: ${result.data.service}`);
    console.log(`   Version: ${result.data.version}`);
    testResults.passed++;
  } else {
    console.log('❌ Health check failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Health Check',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testLessonSearch() {
  console.log('\n🔍 Testing Lesson Search...');
  const result = await makeRequest('/api/lessons/search', 'POST', testData.search);
  
  if (result.success) {
    console.log('✅ Lesson search passed');
    console.log(`   Query: ${result.data.query}`);
    console.log(`   Results: ${result.data.total_results}`);
    console.log(`   Suggestions: ${result.data.suggestions.length}`);
    testResults.passed++;
  } else {
    console.log('❌ Lesson search failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Lesson Search',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testRecommendations() {
  console.log('\n💡 Testing Learning Recommendations...');
  const result = await makeRequest('/api/lessons/recommendations', 'POST', testData.recommendations);
  
  if (result.success) {
    console.log('✅ Recommendations passed');
    console.log(`   Recommendations: ${result.data.recommendations?.length || 0}`);
    testResults.passed++;
  } else {
    console.log('❌ Recommendations failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Learning Recommendations',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testLessonHelp() {
  console.log('\n❓ Testing Lesson Help...');
  const result = await makeRequest('/api/lessons/help', 'POST', testData.lessonHelp);
  
  if (result.success) {
    console.log('✅ Lesson help passed');
    console.log(`   Help: ${result.data.help ? 'Generated' : 'Not generated'}`);
    testResults.passed++;
  } else {
    console.log('❌ Lesson help failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Lesson Help',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testConversationPractice() {
  console.log('\n💬 Testing Conversation Practice...');
  const result = await makeRequest('/api/practice/conversation', 'POST', testData.conversation);
  
  if (result.success) {
    console.log('✅ Conversation practice passed');
    console.log(`   Conversation: ${result.data.conversation ? 'Generated' : 'Not generated'}`);
    testResults.passed++;
  } else {
    console.log('❌ Conversation practice failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Conversation Practice',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testGrammarExplanation() {
  console.log('\n📖 Testing Grammar Explanation...');
  const result = await makeRequest('/api/grammar/explanation', 'POST', testData.grammar);
  
  if (result.success) {
    console.log('✅ Grammar explanation passed');
    console.log(`   Explanation: ${result.data.explanation ? 'Generated' : 'Not generated'}`);
    testResults.passed++;
  } else {
    console.log('❌ Grammar explanation failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Grammar Explanation',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testVocabularyExercises() {
  console.log('\n📝 Testing Vocabulary Exercises...');
  const result = await makeRequest('/api/vocabulary/exercises', 'POST', testData.vocabulary);
  
  if (result.success) {
    console.log('✅ Vocabulary exercises passed');
    console.log(`   Exercises: ${result.data.exercises?.length || 0}`);
    testResults.passed++;
  } else {
    console.log('❌ Vocabulary exercises failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Vocabulary Exercises',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testPronunciationHelp() {
  console.log('\n🔊 Testing Pronunciation Help...');
  const result = await makeRequest('/api/pronunciation/help', 'POST', testData.pronunciation);
  
  if (result.success) {
    console.log('✅ Pronunciation help passed');
    console.log(`   Word: ${result.data.pronunciation}`);
    console.log(`   Tips: ${result.data.tips?.length || 0}`);
    testResults.passed++;
  } else {
    console.log('❌ Pronunciation help failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Pronunciation Help',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testProgressUpdate() {
  console.log('\n📊 Testing Progress Update...');
  const result = await makeRequest('/api/progress/update', 'POST', testData.progress);
  
  if (result.success) {
    console.log('✅ Progress update passed');
    console.log(`   Message: ${result.data.message}`);
    testResults.passed++;
  } else {
    console.log('❌ Progress update failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Progress Update',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testProgressStats() {
  console.log('\n📈 Testing Progress Stats...');
  const result = await makeRequest(`/api/progress/stats?user_id=${testData.progress.user_id}`);
  
  if (result.success) {
    console.log('✅ Progress stats passed');
    console.log(`   User ID: ${result.data.user_id}`);
    console.log(`   Total Lessons: ${result.data.total_lessons}`);
    console.log(`   Completed: ${result.data.completed_lessons}`);
    testResults.passed++;
  } else {
    console.log('❌ Progress stats failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Progress Stats',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testAILessonGeneration() {
  console.log('\n🤖 Testing AI Lesson Generation...');
  const result = await makeRequest('/api/ai/generate-lesson', 'POST', testData.aiLesson);
  
  if (result.success) {
    console.log('✅ AI lesson generation passed');
    console.log(`   Topic: ${result.data.topic}`);
    console.log(`   Success: ${result.data.success}`);
    console.log(`   Examples: ${result.data.lesson?.examples?.length || 0}`);
    testResults.passed++;
  } else {
    console.log('❌ AI lesson generation failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'AI Lesson Generation',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testWordTranslation() {
  console.log('\n📝 Testing Word Translation...');
  const result = await makeRequest('/api/ai/translate-word', 'POST', testData.wordTranslation);
  
  if (result.success) {
    console.log('✅ Word translation passed');
    console.log(`   Word: ${result.data.word}`);
    console.log(`   Arabic: ${result.data.arabic_translation}`);
    console.log(`   Part of Speech: ${result.data.part_of_speech}`);
    testResults.passed++;
  } else {
    console.log('❌ Word translation failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Word Translation',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

async function testWordPronunciation() {
  console.log('\n🔊 Testing Word Pronunciation...');
  const result = await makeRequest('/api/ai/pronounce-word', 'POST', testData.wordPronunciation);
  
  if (result.success) {
    console.log('✅ Word pronunciation passed');
    console.log(`   Word: ${result.data.word}`);
    console.log(`   Audio: ${result.data.audio_base64 ? 'Generated' : 'Not generated'}`);
    console.log(`   Audio Type: ${result.data.audio_type}`);
    testResults.passed++;
  } else {
    console.log('❌ Word pronunciation failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.error || result.data.error}`);
    testResults.failed++;
  }
  
  testResults.total++;
  testResults.details.push({
    test: 'Word Pronunciation',
    success: result.success,
    status: result.status,
    data: result.data
  });
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Speed of Mastery RAG System Tests...\n');
  console.log(`🌐 Testing API at: ${RAG_API_URL}\n`);
  
  // Run all tests
  await testHealth();
  await testLessonSearch();
  await testRecommendations();
  await testLessonHelp();
  await testConversationPractice();
  await testGrammarExplanation();
  await testVocabularyExercises();
  await testPronunciationHelp();
  await testProgressUpdate();
  await testProgressStats();
  await testAILessonGeneration();
  await testWordTranslation();
  await testWordPronunciation();
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.total}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`   - ${test.test}: ${test.error || test.data?.error || 'Unknown error'}`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (testResults.failed === 0) {
    console.log('🎉 All tests passed! Your RAG system is working perfectly!');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }
  
  console.log('='.repeat(60));
}

// Run tests if this file is executed directly
if (require.main === module) {
  // Check if RAG_API_URL is set
  if (!process.env.RAG_API_URL) {
    console.log('⚠️  RAG_API_URL environment variable not set.');
    console.log('Please set it to your worker URL:');
    console.log('export RAG_API_URL=https://your-worker.your-subdomain.workers.dev');
    console.log('\nOr run the script with:');
    console.log('RAG_API_URL=https://your-worker.your-subdomain.workers.dev node test-rag-system.js');
    process.exit(1);
  }
  
  runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testResults,
  makeRequest
};
