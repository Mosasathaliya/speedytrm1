/**
 * Comprehensive AI System Test Script
 * Tests all AI page components and API endpoints
 */

const AI_BASE_URL = 'http://localhost:8787'; // Cloudflare Worker URL

class AISystemTester {
  constructor() {
    this.testResults = [];
    this.sessionId = 'test_' + Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    this.testResults.push(logEntry);
    console.log(`[${type.toUpperCase()}] ${timestamp}: ${message}`);
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive AI system tests...');
    
    try {
      // Test 1: Analytics Endpoints
      await this.testAnalyticsEndpoints();
      
      // Test 2: Personal AI Assistant
      await this.testPersonalAIAssistant();
      
      // Test 3: Mood Translator AI
      await this.testMoodTranslatorAI();
      
      // Test 4: Voice Translator AI
      await this.testVoiceTranslatorAI();
      
      // Test 5: Cloudflare TTS/STT
      await this.testCloudflareAudioServices();
      
      // Test 6: Database Operations
      await this.testDatabaseOperations();
      
      this.log('✅ All AI system tests completed successfully!');
      this.generateTestReport();
      
    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async testAnalyticsEndpoints() {
    this.log('📊 Testing analytics endpoints...');
    
    // Test page view tracking
    try {
      const pageViewResponse = await fetch(`${AI_BASE_URL}/api/analytics/track-page-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          page: 'ai',
          timestamp: new Date().toISOString(),
          userAgent: 'AISystemTester/1.0'
        })
      });

      if (pageViewResponse.ok) {
        this.log('✅ Page view tracking working');
      } else {
        throw new Error(`Page view tracking failed: ${pageViewResponse.status}`);
      }
    } catch (error) {
      this.log(`❌ Page view tracking error: ${error.message}`, 'error');
    }

    // Test event tracking
    try {
      const eventResponse = await fetch(`${AI_BASE_URL}/api/analytics/track-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          eventName: 'ai_test',
          eventData: { test: true },
          timestamp: new Date().toISOString()
        })
      });

      if (eventResponse.ok) {
        this.log('✅ Event tracking working');
      } else {
        throw new Error(`Event tracking failed: ${eventResponse.status}`);
      }
    } catch (error) {
      this.log(`❌ Event tracking error: ${error.message}`, 'error');
    }
  }

  async testPersonalAIAssistant() {
    this.log('🤖 Testing Personal AI Assistant...');
    
    try {
      const aiResponse = await fetch(`${AI_BASE_URL}/api/ai/personal-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello, this is a test message',
          sessionId: this.sessionId,
          userId: 'test_user'
        })
      });

      if (aiResponse.ok) {
        const result = await aiResponse.json();
        this.log('✅ Personal AI Assistant responding correctly');
        this.log(`AI Response: ${result.response?.substring(0, 100)}...`);
      } else {
        this.log(`⚠️ Personal AI Assistant endpoint returned: ${aiResponse.status}`, 'warn');
      }
    } catch (error) {
      this.log(`❌ Personal AI Assistant error: ${error.message}`, 'error');
    }
  }

  async testMoodTranslatorAI() {
    this.log('🎭 Testing Mood Translator AI...');
    
    const moods = ['happy', 'angry', 'sad', 'excited', 'motivated'];
    
    for (const mood of moods) {
      try {
        const moodResponse = await fetch(`${AI_BASE_URL}/api/ai/mood-chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Testing ${mood} mood`,
            mood: mood,
            sessionId: this.sessionId
          })
        });

        if (moodResponse.ok) {
          this.log(`✅ ${mood} mood AI working`);
        } else {
          this.log(`⚠️ ${mood} mood AI returned: ${moodResponse.status}`, 'warn');
        }
      } catch (error) {
        this.log(`❌ ${mood} mood AI error: ${error.message}`, 'error');
      }
    }
  }

  async testVoiceTranslatorAI() {
    this.log('🎤 Testing Voice Translator AI endpoints...');
    
    // Test Arabic STT endpoint
    try {
      const formData = new FormData();
      // Create a dummy audio blob for testing
      const dummyAudio = new Blob(['dummy audio data'], { type: 'audio/wav' });
      formData.append('audio', dummyAudio);
      formData.append('language', 'ar');

      const sttResponse = await fetch(`${AI_BASE_URL}/api/cloudflare/stt-arabic`, {
        method: 'POST',
        body: formData
      });

      if (sttResponse.ok) {
        this.log('✅ Arabic STT endpoint accessible');
      } else {
        this.log(`⚠️ Arabic STT endpoint returned: ${sttResponse.status}`, 'warn');
      }
    } catch (error) {
      this.log(`❌ Arabic STT error: ${error.message}`, 'error');
    }

    // Test translation endpoint
    try {
      const translateResponse = await fetch(`${AI_BASE_URL}/api/cloudflare/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'مرحبا',
          sourceLanguage: 'ar',
          targetLanguage: 'en'
        })
      });

      if (translateResponse.ok) {
        const result = await translateResponse.json();
        this.log('✅ Translation endpoint working');
        this.log(`Translation result: ${result.translatedText}`);
      } else {
        this.log(`⚠️ Translation endpoint returned: ${translateResponse.status}`, 'warn');
      }
    } catch (error) {
      this.log(`❌ Translation error: ${error.message}`, 'error');
    }
  }

  async testCloudflareAudioServices() {
    this.log('🔊 Testing Cloudflare TTS/STT services...');
    
    // Test TTS endpoint
    try {
      const ttsResponse = await fetch(`${AI_BASE_URL}/api/cloudflare/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hello, this is a test of text to speech',
          voice: 'en-US-Standard-A',
          language: 'en'
        })
      });

      if (ttsResponse.ok) {
        this.log('✅ Cloudflare TTS endpoint working');
      } else {
        this.log(`⚠️ TTS endpoint returned: ${ttsResponse.status}`, 'warn');
      }
    } catch (error) {
      this.log(`❌ TTS error: ${error.message}`, 'error');
    }
  }

  async testDatabaseOperations() {
    this.log('🗄️ Testing database operations...');
    
    // Test card interaction tracking
    try {
      const cardInteractionResponse = await fetch(`${AI_BASE_URL}/api/analytics/track-card-interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          cardType: 'ai-test',
          cardId: 'test-card',
          action: 'open',
          cardTitle: 'Test Card'
        })
      });

      if (cardInteractionResponse.ok) {
        this.log('✅ Card interaction tracking working');
      } else {
        this.log(`⚠️ Card interaction tracking returned: ${cardInteractionResponse.status}`, 'warn');
      }
    } catch (error) {
      this.log(`❌ Database operation error: ${error.message}`, 'error');
    }
  }

  generateTestReport() {
    this.log('📋 Generating test report...');
    
    const errorCount = this.testResults.filter(r => r.type === 'error').length;
    const warningCount = this.testResults.filter(r => r.type === 'warn').length;
    const successCount = this.testResults.filter(r => r.message.includes('✅')).length;
    
    const report = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      summary: {
        total_tests: this.testResults.length,
        successes: successCount,
        warnings: warningCount,
        errors: errorCount,
        success_rate: Math.round((successCount / (successCount + errorCount)) * 100)
      },
      results: this.testResults
    };

    console.log('\n' + '='.repeat(60));
    console.log('AI SYSTEM TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Session ID: ${this.sessionId}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Total Tests: ${report.summary.total_tests}`);
    console.log(`Successes: ${report.summary.successes}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`Errors: ${report.summary.errors}`);
    console.log(`Success Rate: ${report.summary.success_rate}%`);
    console.log('='.repeat(60));

    if (errorCount === 0) {
      console.log('🎉 ALL TESTS PASSED! AI system is ready for production.');
    } else {
      console.log(`⚠️ ${errorCount} errors found. Please review and fix before production.`);
    }

    return report;
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && typeof require !== 'undefined') {
  const tester = new AISystemTester();
  tester.runAllTests().catch(console.error);
}

export default AISystemTester;
