'use client';

class UserTrackingService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (typeof window !== 'undefined') {
      this.sessionId = localStorage.getItem('sessionId') || this.generateSessionId();
      localStorage.setItem('sessionId', this.sessionId);
      this.userId = localStorage.getItem('userId') || null;
      this.isInitialized = true;
    }
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setUserId(userId) {
    this.userId = userId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
    }
  }

  async trackPageView(page) { return { success: true, data: { page } }; }

  async trackEvent(eventName, eventData = {}) { return { success: true, data: { eventName, eventData } }; }

  async trackCardInteraction(cardType, cardId, action, cardTitle = '') {
    return this.trackEvent('card_interaction', {
      cardType,
      cardId,
      action,
      cardTitle
    });
  }

  async trackAIInteraction(aiType, interaction, metadata = {}) {
    return this.trackEvent('ai_interaction', {
      aiType,
      interaction,
      metadata
    });
  }

  async trackUserProgress(progressType, progressData = {}) {
    return this.trackEvent('user_progress', {
      progressType,
      progressData
    });
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      isInitialized: this.isInitialized
    };
  }
}

// Create singleton instance
const userTrackingService = new UserTrackingService();

export default userTrackingService;