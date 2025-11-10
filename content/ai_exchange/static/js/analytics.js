/**
 * Advanced Analytics System for OWASP AI Security Exchange
 * Tracks learning behavior, generates insights, and provides AI-powered recommendations
 *
 * Features:
 * - Comprehensive learning analytics
 * - Pattern detection and insights
 * - AI-powered personalized recommendations
 * - Progress tracking and predictions
 * - Performance metrics and trends
 * - Learning style analysis
 * - Knowledge gap identification
 * - Optimal learning time detection
 */

class AnalyticsEngine {
  constructor() {
    this.data = this.loadData();
    this.insights = [];
    this.recommendations = [];

    // Analytics configuration
    this.config = {
      trackingEnabled: true,
      insightsEnabled: true,
      recommendationsEnabled: true,
      minSessionsForInsights: 3,
      minDataPointsForPrediction: 10
    };

    // Initialize
    this.init();
  }

  /**
   * Initialize analytics system
   */
  init() {
    // Start session tracking
    this.startSession();

    // Generate insights if enough data
    if (this.getTotalSessions() >= this.config.minSessionsForInsights) {
      this.generateInsights();
      this.generateRecommendations();
    }

    console.log('[Analytics] Initialized');
  }

  /**
   * Load analytics data from localStorage
   */
  loadData() {
    try {
      const saved = localStorage.getItem('analytics_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('[Analytics] Error loading data:', error);
    }

    // Default analytics data structure
    return {
      sessions: [],
      currentSession: null,
      learningEvents: [],
      quizResults: [],
      moduleProgress: {},
      timeSpent: {},
      streakData: {
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0
      },
      preferences: {
        learningStyle: null,
        preferredTime: null,
        averageSessionLength: 0
      },
      achievements: [],
      insights: [],
      recommendations: []
    };
  }

  /**
   * Save analytics data to localStorage
   */
  saveData() {
    try {
      localStorage.setItem('analytics_data', JSON.stringify(this.data));
    } catch (error) {
      console.error('[Analytics] Error saving data:', error);
    }
  }

  /**
   * Start a new session
   */
  startSession() {
    const session = {
      id: this.generateId(),
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      events: [],
      modulesVisited: [],
      quizzesTaken: [],
      xpEarned: 0,
      deviceType: this.detectDeviceType(),
      language: window.i18n?.getCurrentLanguage() || 'en'
    };

    this.data.currentSession = session;
    console.log('[Analytics] Session started:', session.id);
  }

  /**
   * End current session
   */
  endSession() {
    if (!this.data.currentSession) return;

    const session = this.data.currentSession;
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    // Save session to history
    this.data.sessions.push(session);

    // Update streak
    this.updateStreak();

    // Update preferences
    this.updatePreferences();

    // Keep only last 100 sessions
    if (this.data.sessions.length > 100) {
      this.data.sessions = this.data.sessions.slice(-100);
    }

    this.data.currentSession = null;
    this.saveData();

    console.log('[Analytics] Session ended:', session.id, `${(session.duration / 1000 / 60).toFixed(1)}min`);
  }

  /**
   * Track learning event
   */
  trackEvent(type, data = {}) {
    if (!this.config.trackingEnabled) return;

    const event = {
      id: this.generateId(),
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.data.currentSession?.id
    };

    // Add to current session
    if (this.data.currentSession) {
      this.data.currentSession.events.push(event);
    }

    // Add to global events
    this.data.learningEvents.push(event);

    // Keep only last 1000 events
    if (this.data.learningEvents.length > 1000) {
      this.data.learningEvents = this.data.learningEvents.slice(-1000);
    }

    this.saveData();
  }

  /**
   * Track module visit
   */
  trackModuleVisit(moduleId, moduleName) {
    this.trackEvent('module_visit', { moduleId, moduleName });

    if (this.data.currentSession) {
      if (!this.data.currentSession.modulesVisited.includes(moduleId)) {
        this.data.currentSession.modulesVisited.push(moduleId);
      }
    }

    // Update time spent tracking
    if (!this.data.timeSpent[moduleId]) {
      this.data.timeSpent[moduleId] = { total: 0, sessions: 0 };
    }
  }

  /**
   * Track module completion
   */
  trackModuleCompletion(moduleId, moduleName, score = null) {
    this.trackEvent('module_complete', { moduleId, moduleName, score });

    if (!this.data.moduleProgress[moduleId]) {
      this.data.moduleProgress[moduleId] = {
        completed: false,
        attempts: 0,
        bestScore: 0,
        completionDates: []
      };
    }

    this.data.moduleProgress[moduleId].completed = true;
    this.data.moduleProgress[moduleId].attempts++;
    this.data.moduleProgress[moduleId].completionDates.push(Date.now());

    if (score && score > this.data.moduleProgress[moduleId].bestScore) {
      this.data.moduleProgress[moduleId].bestScore = score;
    }

    this.saveData();
  }

  /**
   * Track quiz result
   */
  trackQuizResult(quizId, quizName, score, passed, totalQuestions) {
    const result = {
      id: this.generateId(),
      quizId,
      quizName,
      score,
      passed,
      totalQuestions,
      timestamp: Date.now(),
      sessionId: this.data.currentSession?.id
    };

    this.data.quizResults.push(result);

    if (this.data.currentSession) {
      this.data.currentSession.quizzesTaken.push(quizId);
    }

    this.trackEvent('quiz_complete', { quizId, quizName, score, passed });
    this.saveData();
  }

  /**
   * Track XP gain
   */
  trackXPGain(amount, reason) {
    this.trackEvent('xp_gain', { amount, reason });

    if (this.data.currentSession) {
      this.data.currentSession.xpEarned += amount;
    }

    this.saveData();
  }

  /**
   * Generate learning insights
   */
  generateInsights() {
    this.insights = [];

    // Learning pace insight
    const pace = this.calculateLearningPace();
    if (pace) {
      this.insights.push({
        type: 'pace',
        title: i18n?.t('analytics.insights.learningPace') || 'Learning Pace',
        description: pace.description,
        value: pace.value,
        trend: pace.trend,
        icon: '⚡',
        priority: 'high'
      });
    }

    // Optimal learning time
    const optimalTime = this.findOptimalLearningTime();
    if (optimalTime) {
      this.insights.push({
        type: 'timing',
        title: i18n?.t('analytics.insights.optimalTime') || 'Best Learning Time',
        description: optimalTime.description,
        value: optimalTime.timeRange,
        icon: '🕐',
        priority: 'medium'
      });
    }

    // Learning style
    const learningStyle = this.detectLearningStyle();
    if (learningStyle) {
      this.insights.push({
        type: 'style',
        title: i18n?.t('analytics.insights.learningStyle') || 'Learning Style',
        description: learningStyle.description,
        value: learningStyle.style,
        icon: '🎯',
        priority: 'medium'
      });
    }

    // Strength areas
    const strengths = this.identifyStrengths();
    if (strengths.length > 0) {
      this.insights.push({
        type: 'strengths',
        title: i18n?.t('analytics.insights.strengths') || 'Strong Areas',
        description: strengths.map(s => s.name).join(', '),
        value: strengths.length,
        icon: '💪',
        priority: 'medium'
      });
    }

    // Knowledge gaps
    const gaps = this.identifyKnowledgeGaps();
    if (gaps.length > 0) {
      this.insights.push({
        type: 'gaps',
        title: i18n?.t('analytics.insights.knowledgeGaps') || 'Areas to Improve',
        description: gaps.map(g => g.name).join(', '),
        value: gaps.length,
        icon: '📚',
        priority: 'high'
      });
    }

    // Consistency insight
    const consistency = this.calculateConsistency();
    if (consistency) {
      this.insights.push({
        type: 'consistency',
        title: i18n?.t('analytics.insights.consistency') || 'Learning Consistency',
        description: consistency.description,
        value: consistency.percentage,
        trend: consistency.trend,
        icon: '📈',
        priority: 'medium'
      });
    }

    // Predicted completion
    const prediction = this.predictCompletion();
    if (prediction) {
      this.insights.push({
        type: 'prediction',
        title: i18n?.t('analytics.insights.prediction') || 'Completion Estimate',
        description: prediction.description,
        value: prediction.daysRemaining,
        icon: '🔮',
        priority: 'low'
      });
    }

    this.data.insights = this.insights;
    this.saveData();

    console.log('[Analytics] Generated', this.insights.length, 'insights');
    return this.insights;
  }

  /**
   * Calculate learning pace (modules per week)
   */
  calculateLearningPace() {
    const completedModules = Object.values(this.data.moduleProgress).filter(m => m.completed);
    if (completedModules.length < 2) return null;

    const firstCompletion = Math.min(...completedModules.map(m => m.completionDates[0]));
    const lastCompletion = Math.max(...completedModules.flatMap(m => m.completionDates));

    const weeksElapsed = (lastCompletion - firstCompletion) / (1000 * 60 * 60 * 24 * 7);
    if (weeksElapsed < 0.1) return null;

    const modulesPerWeek = completedModules.length / weeksElapsed;

    let description, trend;
    if (modulesPerWeek >= 3) {
      description = i18n?.t('analytics.insights.paceFast') || 'Fast learner! You\'re completing 3+ modules per week.';
      trend = 'up';
    } else if (modulesPerWeek >= 1.5) {
      description = i18n?.t('analytics.insights.paceSteady') || 'Steady progress at ~2 modules per week.';
      trend = 'stable';
    } else {
      description = i18n?.t('analytics.insights.paceSlow') || 'Take your time! Consider setting aside more study time.';
      trend = 'down';
    }

    return {
      value: modulesPerWeek.toFixed(1),
      description,
      trend
    };
  }

  /**
   * Find optimal learning time based on performance
   */
  findOptimalLearningTime() {
    const quizResults = this.data.quizResults.slice(-20); // Last 20 quizzes
    if (quizResults.length < 5) return null;

    const timeSlots = {};
    quizResults.forEach(result => {
      const hour = new Date(result.timestamp).getHours();
      const slot = this.getTimeSlot(hour);

      if (!timeSlots[slot]) {
        timeSlots[slot] = { scores: [], count: 0 };
      }

      timeSlots[slot].scores.push(result.score);
      timeSlots[slot].count++;
    });

    // Find slot with highest average score
    let bestSlot = null;
    let bestAvg = 0;

    for (const [slot, data] of Object.entries(timeSlots)) {
      if (data.count >= 2) {
        const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestSlot = slot;
        }
      }
    }

    if (!bestSlot) return null;

    return {
      timeRange: bestSlot,
      description: i18n?.t('analytics.insights.optimalTimeDesc', { time: bestSlot }) ||
                  `Your performance is best during ${bestSlot}. Try studying then!`
    };
  }

  /**
   * Detect learning style based on behavior
   */
  detectLearningStyle() {
    const events = this.data.learningEvents.slice(-50);
    if (events.length < 10) return null;

    const typeCounts = {};
    events.forEach(event => {
      typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
    });

    const quizFocused = (typeCounts['quiz_complete'] || 0) / events.length;
    const readingFocused = (typeCounts['module_visit'] || 0) / events.length;
    const practiceFocused = (typeCounts['threat_model_created'] || 0) / events.length;

    let style, description;

    if (quizFocused > 0.4) {
      style = i18n?.t('analytics.styles.testOriented') || 'Test-Oriented';
      description = i18n?.t('analytics.styles.testDesc') || 'You learn best by testing your knowledge frequently.';
    } else if (practiceFocused > 0.3) {
      style = i18n?.t('analytics.styles.handson') || 'Hands-On';
      description = i18n?.t('analytics.styles.handsonDesc') || 'You prefer practical, interactive learning experiences.';
    } else {
      style = i18n?.t('analytics.styles.theoretical') || 'Theoretical';
      description = i18n?.t('analytics.styles.theoreticalDesc') || 'You enjoy reading and understanding concepts deeply.';
    }

    return { style, description };
  }

  /**
   * Identify strength areas
   */
  identifyStrengths() {
    const strengths = [];
    const quizResults = this.data.quizResults;

    if (quizResults.length < 3) return strengths;

    // Group by topic/category
    const byTopic = {};
    quizResults.forEach(result => {
      const topic = this.extractTopic(result.quizName);
      if (!byTopic[topic]) {
        byTopic[topic] = { scores: [], passed: 0, total: 0 };
      }
      byTopic[topic].scores.push(result.score);
      byTopic[topic].total++;
      if (result.passed) byTopic[topic].passed++;
    });

    // Find topics with >80% average score
    for (const [topic, data] of Object.entries(byTopic)) {
      if (data.total >= 2) {
        const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        if (avgScore >= 80) {
          strengths.push({
            name: topic,
            score: avgScore,
            passRate: (data.passed / data.total) * 100
          });
        }
      }
    }

    return strengths.sort((a, b) => b.score - a.score);
  }

  /**
   * Identify knowledge gaps
   */
  identifyKnowledgeGaps() {
    const gaps = [];
    const quizResults = this.data.quizResults;

    if (quizResults.length < 3) return gaps;

    // Group by topic
    const byTopic = {};
    quizResults.forEach(result => {
      const topic = this.extractTopic(result.quizName);
      if (!byTopic[topic]) {
        byTopic[topic] = { scores: [], failed: 0, total: 0 };
      }
      byTopic[topic].scores.push(result.score);
      byTopic[topic].total++;
      if (!result.passed) byTopic[topic].failed++;
    });

    // Find topics with <70% average score or multiple failures
    for (const [topic, data] of Object.entries(byTopic)) {
      if (data.total >= 2) {
        const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        if (avgScore < 70 || data.failed >= 2) {
          gaps.push({
            name: topic,
            score: avgScore,
            failureRate: (data.failed / data.total) * 100
          });
        }
      }
    }

    return gaps.sort((a, b) => a.score - b.score);
  }

  /**
   * Calculate learning consistency (% of days with activity)
   */
  calculateConsistency() {
    if (this.data.sessions.length < 7) return null;

    const daysSinceStart = this.getDaysSinceFirstSession();
    const uniqueDays = this.getUniqueLearningDays();

    const percentage = (uniqueDays / daysSinceStart) * 100;

    let description, trend;
    if (percentage >= 80) {
      description = i18n?.t('analytics.insights.consistencyHigh') || 'Excellent! You\'re learning almost every day.';
      trend = 'up';
    } else if (percentage >= 50) {
      description = i18n?.t('analytics.insights.consistencyMedium') || 'Good consistency. Try to study more regularly.';
      trend = 'stable';
    } else {
      description = i18n?.t('analytics.insights.consistencyLow') || 'Try to establish a daily learning habit.';
      trend = 'down';
    }

    return { percentage: percentage.toFixed(0), description, trend };
  }

  /**
   * Predict completion time
   */
  predictCompletion() {
    const totalModules = 24; // From learning paths
    const completedModules = Object.values(this.data.moduleProgress).filter(m => m.completed).length;

    if (completedModules < 3) return null;

    const daysSinceStart = this.getDaysSinceFirstSession();
    const modulesPerDay = completedModules / daysSinceStart;

    if (modulesPerDay === 0) return null;

    const remainingModules = totalModules - completedModules;
    const daysRemaining = Math.ceil(remainingModules / modulesPerDay);

    const completionDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);
    const formattedDate = completionDate.toLocaleDateString();

    return {
      daysRemaining,
      description: i18n?.t('analytics.insights.predictionDesc', { days: daysRemaining, date: formattedDate }) ||
                  `At your current pace, you'll complete all modules in ${daysRemaining} days (${formattedDate}).`
    };
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations() {
    this.recommendations = [];

    // Recommend based on knowledge gaps
    const gaps = this.identifyKnowledgeGaps();
    if (gaps.length > 0) {
      gaps.slice(0, 2).forEach(gap => {
        this.recommendations.push({
          type: 'gap',
          title: i18n?.t('analytics.recommendations.reviewTopic') || 'Review Topic',
          description: i18n?.t('analytics.recommendations.reviewDesc', { topic: gap.name }) ||
                      `Review ${gap.name} - your average score is ${gap.score.toFixed(0)}%`,
          action: 'review',
          target: gap.name,
          priority: 'high',
          icon: '📖'
        });
      });
    }

    // Recommend next modules based on learning path
    const nextModules = this.suggestNextModules();
    if (nextModules.length > 0) {
      this.recommendations.push({
        type: 'progression',
        title: i18n?.t('analytics.recommendations.nextModule') || 'Continue Learning',
        description: i18n?.t('analytics.recommendations.nextModuleDesc', { module: nextModules[0] }) ||
                    `Try: ${nextModules[0]}`,
        action: 'start',
        target: nextModules[0],
        priority: 'medium',
        icon: '🎯'
      });
    }

    // Recommend optimal study time
    const optimalTime = this.findOptimalLearningTime();
    if (optimalTime && this.isNotOptimalTime()) {
      this.recommendations.push({
        type: 'timing',
        title: i18n?.t('analytics.recommendations.optimalTime') || 'Study Schedule',
        description: i18n?.t('analytics.recommendations.optimalTimeDesc', { time: optimalTime.timeRange }) ||
                    `Your performance is best during ${optimalTime.timeRange}`,
        action: 'schedule',
        target: optimalTime.timeRange,
        priority: 'low',
        icon: '⏰'
      });
    }

    // Recommend practice if mostly theoretical learning
    const recentEvents = this.data.learningEvents.slice(-20);
    const practiceRate = recentEvents.filter(e => e.type.includes('threat_model') || e.type.includes('quiz')).length / recentEvents.length;

    if (practiceRate < 0.3 && recentEvents.length >= 10) {
      this.recommendations.push({
        type: 'practice',
        title: i18n?.t('analytics.recommendations.morePractice') || 'More Practice',
        description: i18n?.t('analytics.recommendations.morePracticeDesc') ||
                    'Try the Threat Modeler or take quizzes to reinforce learning',
        action: 'practice',
        target: 'threat-modeler',
        priority: 'medium',
        icon: '🛠️'
      });
    }

    // Recommend maintaining streak
    if (this.data.streakData.currentStreak >= 3) {
      this.recommendations.push({
        type: 'streak',
        title: i18n?.t('analytics.recommendations.maintainStreak') || 'Keep Your Streak!',
        description: i18n?.t('analytics.recommendations.maintainStreakDesc', { days: this.data.streakData.currentStreak }) ||
                    `You're on a ${this.data.streakData.currentStreak} day streak! Don't break it.`,
        action: 'continue',
        target: 'daily-learning',
        priority: 'high',
        icon: '🔥'
      });
    }

    this.data.recommendations = this.recommendations;
    this.saveData();

    console.log('[Analytics] Generated', this.recommendations.length, 'recommendations');
    return this.recommendations;
  }

  /**
   * Get analytics summary
   */
  getSummary() {
    return {
      totalSessions: this.getTotalSessions(),
      totalTimeSpent: this.getTotalTimeSpent(),
      modulesCompleted: Object.values(this.data.moduleProgress).filter(m => m.completed).length,
      quizzesTaken: this.data.quizResults.length,
      averageQuizScore: this.getAverageQuizScore(),
      currentStreak: this.data.streakData.currentStreak,
      longestStreak: this.data.streakData.longestStreak,
      insights: this.insights,
      recommendations: this.recommendations
    };
  }

  // Helper methods

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  detectDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  getTimeSlot(hour) {
    if (hour >= 5 && hour < 12) return 'Morning (5am-12pm)';
    if (hour >= 12 && hour < 17) return 'Afternoon (12pm-5pm)';
    if (hour >= 17 && hour < 22) return 'Evening (5pm-10pm)';
    return 'Night (10pm-5am)';
  }

  extractTopic(quizName) {
    // Extract topic from quiz name (e.g., "Prompt Injection Quiz" -> "Prompt Injection")
    return quizName.replace(/\s+(Quiz|Test|Assessment)$/i, '').trim();
  }

  getTotalSessions() {
    return this.data.sessions.length;
  }

  getTotalTimeSpent() {
    return this.data.sessions.reduce((total, session) => total + session.duration, 0);
  }

  getAverageQuizScore() {
    if (this.data.quizResults.length === 0) return 0;
    const total = this.data.quizResults.reduce((sum, result) => sum + result.score, 0);
    return total / this.data.quizResults.length;
  }

  getDaysSinceFirstSession() {
    if (this.data.sessions.length === 0) return 0;
    const firstSession = this.data.sessions[0].startTime;
    return Math.ceil((Date.now() - firstSession) / (1000 * 60 * 60 * 24));
  }

  getUniqueLearningDays() {
    const days = new Set();
    this.data.sessions.forEach(session => {
      const day = new Date(session.startTime).toDateString();
      days.add(day);
    });
    return days.size;
  }

  updateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    const recentSessions = this.data.sessions.slice(-10);
    const lastSessionDate = recentSessions.length > 0 ?
      new Date(recentSessions[recentSessions.length - 1].startTime).toDateString() : null;

    if (lastSessionDate === today) {
      // Already logged today, no change
    } else if (lastSessionDate === yesterday) {
      // Consecutive day
      this.data.streakData.currentStreak++;
      if (this.data.streakData.currentStreak > this.data.streakData.longestStreak) {
        this.data.streakData.longestStreak = this.data.streakData.currentStreak;
      }
    } else {
      // Streak broken
      this.data.streakData.currentStreak = 1;
    }

    this.data.streakData.totalDays++;
  }

  updatePreferences() {
    // Update average session length
    const recentSessions = this.data.sessions.slice(-10);
    if (recentSessions.length > 0) {
      const avgDuration = recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length;
      this.data.preferences.averageSessionLength = avgDuration;
    }

    // Update preferred time
    const optimalTime = this.findOptimalLearningTime();
    if (optimalTime) {
      this.data.preferences.preferredTime = optimalTime.timeRange;
    }

    // Update learning style
    const style = this.detectLearningStyle();
    if (style) {
      this.data.preferences.learningStyle = style.style;
    }
  }

  suggestNextModules() {
    // This would integrate with learning paths data
    // For now, return placeholder
    return ['Advanced Prompt Injection', 'Model Security', 'Data Privacy'];
  }

  isNotOptimalTime() {
    if (!this.data.preferences.preferredTime) return false;
    const currentHour = new Date().getHours();
    const currentSlot = this.getTimeSlot(currentHour);
    return currentSlot !== this.data.preferences.preferredTime;
  }

  /**
   * Export analytics data
   */
  exportData() {
    return {
      summary: this.getSummary(),
      sessions: this.data.sessions,
      insights: this.insights,
      recommendations: this.recommendations,
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Reset analytics data
   */
  resetData() {
    if (confirm('Are you sure you want to reset all analytics data? This cannot be undone.')) {
      localStorage.removeItem('analytics_data');
      this.data = this.loadData();
      this.insights = [];
      this.recommendations = [];
      console.log('[Analytics] Data reset');
    }
  }
}

// Create global instance
const analytics = new AnalyticsEngine();

// Make available globally
if (typeof window !== 'undefined') {
  window.analytics = analytics;

  // Auto-end session on page unload
  window.addEventListener('beforeunload', () => {
    analytics.endSession();
  });

  // Track page visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      analytics.trackEvent('page_hidden');
    } else {
      analytics.trackEvent('page_visible');
    }
  });
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsEngine;
}
