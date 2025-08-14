'use client';

class UserProfileService {
  constructor() {
    this.initialized = false;
    this.userProfile = null;
    this.learningProgress = null;
    this.init();
  }

  init() {
    if (typeof window !== 'undefined') {
      this.loadUserProfile();
      this.loadLearningProgress();
      this.initialized = true;
    }
  }

  // User Profile Management
  loadUserProfile() {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        this.userProfile = JSON.parse(savedProfile);
      } else {
        this.userProfile = this.createDefaultProfile();
        this.saveUserProfile();
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.userProfile = this.createDefaultProfile();
    }
  }

  createDefaultProfile() {
    return {
      id: this.generateUserId(),
      fullName: '',
      email: '',
      joinDate: new Date().toISOString(),
      avatar: '',
      level: 'beginner',
      streak: 0,
      totalLessons: 0,
      totalQuizzes: 0,
      certificatesEarned: [],
      preferences: {
        language: 'ar',
        notifications: true,
        theme: 'system'
      },
      credentials: {
        isVerified: false,
        verificationDate: null
      }
    };
  }

  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  saveUserProfile() {
    if (this.userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
    }
  }

  updateUserProfile(updates) {
    if (this.userProfile) {
      this.userProfile = { ...this.userProfile, ...updates };
      this.saveUserProfile();
      return this.userProfile;
    }
    return null;
  }

  getUserProfile() {
    return this.userProfile;
  }

  // Learning Progress Management
  loadLearningProgress() {
    try {
      const savedProgress = localStorage.getItem('learningProgress');
      if (savedProgress) {
        this.learningProgress = JSON.parse(savedProgress);
      } else {
        this.learningProgress = this.createDefaultProgress();
        this.saveLearningProgress();
      }
    } catch (error) {
      console.error('Error loading learning progress:', error);
      this.learningProgress = this.createDefaultProgress();
    }
  }

  createDefaultProgress() {
    return {
      overallProgress: {
        grammar: { completed: 0, total: 100 },
        vocabulary: { completed: 0, total: 100 },
        listening: { completed: 0, total: 100 },
        speaking: { completed: 0, total: 100 }
      },
      lessons: {
        completed: 0,
        total: 56,
        list: []
      },
      games: {
        completed: 0,
        total: 35,
        list: []
      },
      quizzes: {
        completed: 0,
        total: 8,
        passed: 0,
        list: [],
        averageScore: 0
      },
      finalExam: {
        attempted: false,
        passed: false,
        score: 0,
        passingScore: 70,
        attempts: 0
      },
      aiInteractions: {
        personalAI: { sessions: 0, totalTime: 0 },
        moodTranslator: { completedMoods: 0, totalTime: 0 },
        voiceTranslator: { completedTranslations: 0, targetTranslations: 30 }
      },
      weeklyActivity: {
        currentWeek: this.getCurrentWeek(),
        lessons: [0, 0, 0, 0, 0, 0, 0], // Mon-Sun
        quizzes: [0, 0, 0, 0, 0, 0, 0]
      },
      achievements: [],
      certificateStatus: {
        eligible: false,
        generated: false,
        saved: false,
        downloadCount: 0,
        generatedAt: null,
        savedAt: null
      }
    };
  }

  getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }

  saveLearningProgress() {
    if (this.learningProgress) {
      localStorage.setItem('learningProgress', JSON.stringify(this.learningProgress));
    }
  }

  updateLearningProgress(section, updates) {
    if (this.learningProgress && this.learningProgress[section]) {
      this.learningProgress[section] = { ...this.learningProgress[section], ...updates };
      this.saveLearningProgress();
      this.checkCertificateEligibility();
      return this.learningProgress[section];
    }
    return null;
  }

  getLearningProgress() {
    return this.learningProgress;
  }

  // Specific Progress Updates
  completeLesson(lessonId, score = 100) {
    if (!this.learningProgress) return;

    const lesson = {
      id: lessonId,
      completedAt: new Date().toISOString(),
      score: score
    };

    this.learningProgress.lessons.list.push(lesson);
    this.learningProgress.lessons.completed = this.learningProgress.lessons.list.length;

    // Update weekly activity
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1; // Convert Sunday=0 to index 6
    this.learningProgress.weeklyActivity.lessons[dayIndex]++;

    // Update overall progress
    const grammarProgress = Math.min(100, (this.learningProgress.lessons.completed / this.learningProgress.lessons.total) * 100);
    this.learningProgress.overallProgress.grammar.completed = grammarProgress;

    this.saveLearningProgress();
    this.checkCertificateEligibility();
  }

  completeQuiz(quizId, score, passed) {
    if (!this.learningProgress) return;

    const quiz = {
      id: quizId,
      completedAt: new Date().toISOString(),
      score: score,
      passed: passed
    };

    this.learningProgress.quizzes.list.push(quiz);
    this.learningProgress.quizzes.completed = this.learningProgress.quizzes.list.length;
    
    if (passed) {
      this.learningProgress.quizzes.passed++;
    }

    // Calculate average score
    const totalScore = this.learningProgress.quizzes.list.reduce((sum, q) => sum + q.score, 0);
    this.learningProgress.quizzes.averageScore = totalScore / this.learningProgress.quizzes.list.length;

    // Update weekly activity
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;
    this.learningProgress.weeklyActivity.quizzes[dayIndex]++;

    this.saveLearningProgress();
    this.checkCertificateEligibility();
  }

  completeFinalExam(score) {
    if (!this.learningProgress) return;

    this.learningProgress.finalExam.attempted = true;
    this.learningProgress.finalExam.score = score;
    this.learningProgress.finalExam.attempts++;
    this.learningProgress.finalExam.passed = score >= this.learningProgress.finalExam.passingScore;

    this.saveLearningProgress();
    this.checkCertificateEligibility();
  }

  updateAIProgress(aiType, progressData) {
    if (!this.learningProgress || !this.learningProgress.aiInteractions[aiType]) return;

    this.learningProgress.aiInteractions[aiType] = {
      ...this.learningProgress.aiInteractions[aiType],
      ...progressData
    };

    this.saveLearningProgress();
  }

  // Certificate Management
  checkCertificateEligibility() {
    if (!this.learningProgress) return false;

    const allLessonsCompleted = this.learningProgress.lessons.completed >= this.learningProgress.lessons.total;
    const allQuizzesPassed = this.learningProgress.quizzes.passed >= this.learningProgress.quizzes.total;
    const finalExamPassed = this.learningProgress.finalExam.passed;
    const minimumScore = this.learningProgress.quizzes.averageScore >= 70;

    const eligible = allLessonsCompleted && allQuizzesPassed && finalExamPassed && minimumScore;

    this.learningProgress.certificateStatus.eligible = eligible;
    this.saveLearningProgress();

    return eligible;
  }

  generateCertificate() {
    if (!this.checkCertificateEligibility()) {
      throw new Error('User is not eligible for certificate');
    }

    if (this.learningProgress.certificateStatus.saved) {
      throw new Error('Certificate already saved and cannot be regenerated');
    }

    const certificateData = {
      userName: this.userProfile.fullName || 'مستخدم Speed of Mastery',
      credentialId: `SOM-${this.userProfile.id.slice(-6)}-${Date.now().toString().slice(-6)}`,
      completionDate: new Date().toLocaleDateString('ar-SA'),
      courseName: 'إتقان اللغة الإنجليزية للمبتدئين',
      achievements: {
        lessons: this.learningProgress.lessons.completed,
        quizzes: this.learningProgress.quizzes.passed,
        finalExamScore: this.learningProgress.finalExam.score,
        averageScore: this.learningProgress.quizzes.averageScore
      }
    };

    this.learningProgress.certificateStatus.generated = true;
    this.learningProgress.certificateStatus.generatedAt = new Date().toISOString();
    this.saveLearningProgress();

    return certificateData;
  }

  saveCertificate() {
    if (!this.learningProgress.certificateStatus.generated) {
      throw new Error('Certificate must be generated first');
    }

    this.learningProgress.certificateStatus.saved = true;
    this.learningProgress.certificateStatus.savedAt = new Date().toISOString();
    this.saveLearningProgress();

    // Add to user profile certificates
    if (this.userProfile) {
      const certificate = {
        id: `cert_${Date.now()}`,
        type: 'beginner_completion',
        earnedAt: new Date().toISOString(),
        credentialId: `SOM-${this.userProfile.id.slice(-6)}-${Date.now().toString().slice(-6)}`
      };
      
      this.userProfile.certificatesEarned.push(certificate);
      this.saveUserProfile();
    }

    return true;
  }

  downloadCertificate() {
    if (!this.learningProgress.certificateStatus.saved) {
      throw new Error('Certificate must be saved before downloading');
    }

    this.learningProgress.certificateStatus.downloadCount++;
    this.saveLearningProgress();

    return true;
  }

  getCertificateStatus() {
    return this.learningProgress?.certificateStatus || null;
  }

  // Statistics and Analytics
  getProgressStatistics() {
    if (!this.learningProgress) return null;

    const totalItems = this.learningProgress.lessons.total + this.learningProgress.games.total + this.learningProgress.quizzes.total + 1; // +1 for final exam
    const completedItems = this.learningProgress.lessons.completed + this.learningProgress.games.completed + this.learningProgress.quizzes.completed + (this.learningProgress.finalExam.passed ? 1 : 0);

    return {
      overallCompletion: Math.round((completedItems / totalItems) * 100),
      lessonsCompletion: Math.round((this.learningProgress.lessons.completed / this.learningProgress.lessons.total) * 100),
      quizzesCompletion: Math.round((this.learningProgress.quizzes.completed / this.learningProgress.quizzes.total) * 100),
      averageQuizScore: this.learningProgress.quizzes.averageScore,
      finalExamScore: this.learningProgress.finalExam.score,
      certificateEligible: this.learningProgress.certificateStatus.eligible,
      weeklyActivity: this.learningProgress.weeklyActivity
    };
  }

  // Achievement System
  checkAchievements() {
    const achievements = [];
    
    if (this.learningProgress.lessons.completed >= 10) {
      achievements.push({ id: 'lessons_10', name: 'First Steps', nameAr: 'الخطوات الأولى' });
    }
    
    if (this.learningProgress.lessons.completed >= this.learningProgress.lessons.total) {
      achievements.push({ id: 'all_lessons', name: 'Lesson Master', nameAr: 'سيد الدروس' });
    }
    
    if (this.learningProgress.quizzes.averageScore >= 90) {
      achievements.push({ id: 'quiz_master', name: 'Quiz Master', nameAr: 'بطل الاختبارات' });
    }
    
    if (this.learningProgress.finalExam.passed) {
      achievements.push({ id: 'exam_passed', name: 'Exam Champion', nameAr: 'بطل الامتحان' });
    }

    return achievements;
  }
}

// Create singleton instance
const userProfileService = new UserProfileService();

export default userProfileService;
