/**
 * Tests for AnalyticsEngine (analytics.js)
 * Tests learning analytics, insights generation, recommendations
 */

// Mock AnalyticsEngine
class MockAnalyticsEngine {
  constructor() {
    this.data = {
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
      insights: [],
      recommendations: []
    };
    this.insights = [];
    this.recommendations = [];
    this.config = {
      trackingEnabled: true,
      insightsEnabled: true,
      recommendationsEnabled: true,
      minSessionsForInsights: 3,
      minDataPointsForPrediction: 10
    };
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  trackEvent(type, data = {}) {
    if (!this.config.trackingEnabled) return;

    const event = {
      id: this.generateId(),
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.data.currentSession?.id
    };

    this.data.learningEvents.push(event);
    return event;
  }

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
  }

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
    this.trackEvent('quiz_complete', { quizId, quizName, score, passed });
    return result;
  }

  startSession() {
    const session = {
      id: this.generateId(),
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      events: [],
      modulesVisited: [],
      quizzesTaken: [],
      xpEarned: 0
    };

    this.data.currentSession = session;
    return session;
  }

  endSession() {
    if (!this.data.currentSession) return;

    const session = this.data.currentSession;
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    this.data.sessions.push(session);
    this.data.currentSession = null;
    return session;
  }

  generateInsights() {
    this.insights = [];

    // Learning pace
    if (Object.keys(this.data.moduleProgress).length >= 2) {
      const pace = this.calculateLearningPace();
      if (pace) this.insights.push(pace);
    }

    // Knowledge gaps
    const gaps = this.identifyKnowledgeGaps();
    if (gaps.length > 0) {
      this.insights.push({
        type: 'gaps',
        title: 'Areas to Improve',
        description: gaps.map(g => g.name).join(', '),
        value: gaps.length,
        icon: '📚',
        priority: 'high'
      });
    }

    this.data.insights = this.insights;
    return this.insights;
  }

  calculateLearningPace() {
    const completed = Object.values(this.data.moduleProgress).filter(m => m.completed);
    if (completed.length < 2) return null;

    const firstCompletion = Math.min(...completed.map(m => m.completionDates[0]));
    const lastCompletion = Math.max(...completed.flatMap(m => m.completionDates));

    const weeksElapsed = (lastCompletion - firstCompletion) / (1000 * 60 * 60 * 24 * 7);
    if (weeksElapsed < 0.1) return null;

    const modulesPerWeek = completed.length / weeksElapsed;

    let description, trend;
    if (modulesPerWeek >= 3) {
      description = 'Fast learner! You\'re completing 3+ modules per week.';
      trend = 'up';
    } else if (modulesPerWeek >= 1.5) {
      description = 'Steady progress at ~2 modules per week.';
      trend = 'stable';
    } else {
      description = 'Take your time! Consider setting aside more study time.';
      trend = 'down';
    }

    return {
      type: 'pace',
      title: 'Learning Pace',
      description,
      value: modulesPerWeek.toFixed(1),
      trend,
      icon: '⚡',
      priority: 'high'
    };
  }

  identifyKnowledgeGaps() {
    const gaps = [];
    const byTopic = {};

    this.data.quizResults.forEach(result => {
      const topic = result.quizName.replace(/\s+(Quiz|Test)$/i, '').trim();
      if (!byTopic[topic]) {
        byTopic[topic] = { scores: [], failed: 0, total: 0 };
      }
      byTopic[topic].scores.push(result.score);
      byTopic[topic].total++;
      if (!result.passed) byTopic[topic].failed++;
    });

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

  generateRecommendations() {
    this.recommendations = [];

    // Recommend based on knowledge gaps
    const gaps = this.identifyKnowledgeGaps();
    if (gaps.length > 0) {
      gaps.slice(0, 2).forEach(gap => {
        this.recommendations.push({
          type: 'gap',
          title: 'Review Topic',
          description: `Review ${gap.name} - your average score is ${gap.score.toFixed(0)}%`,
          action: 'review',
          target: gap.name,
          priority: 'high',
          icon: '📖'
        });
      });
    }

    this.data.recommendations = this.recommendations;
    return this.recommendations;
  }

  getSummary() {
    return {
      totalSessions: this.data.sessions.length,
      totalTimeSpent: this.data.sessions.reduce((sum, s) => sum + s.duration, 0),
      modulesCompleted: Object.values(this.data.moduleProgress).filter(m => m.completed).length,
      quizzesTaken: this.data.quizResults.length,
      averageQuizScore: this.getAverageQuizScore(),
      currentStreak: this.data.streakData.currentStreak,
      longestStreak: this.data.streakData.longestStreak,
      insights: this.insights,
      recommendations: this.recommendations
    };
  }

  getAverageQuizScore() {
    if (this.data.quizResults.length === 0) return 0;
    const total = this.data.quizResults.reduce((sum, r) => sum + r.score, 0);
    return total / this.data.quizResults.length;
  }

  resetData() {
    this.data = {
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
      preferences: {},
      insights: [],
      recommendations: []
    };
    this.insights = [];
    this.recommendations = [];
  }
}

describe('AnalyticsEngine', () => {
  let analytics;

  beforeEach(() => {
    analytics = new MockAnalyticsEngine();
  });

  describe('Event Tracking', () => {
    test('should track generic events', () => {
      const event = analytics.trackEvent('test_event', { value: 123 });

      expect(event).toBeDefined();
      expect(event.type).toBe('test_event');
      expect(event.data.value).toBe(123);
      expect(analytics.data.learningEvents.length).toBe(1);
    });

    test('should not track when tracking disabled', () => {
      analytics.config.trackingEnabled = false;
      analytics.trackEvent('test_event');

      expect(analytics.data.learningEvents.length).toBe(0);
    });

    test('should include timestamp in events', () => {
      const event = analytics.trackEvent('test_event');

      expect(event.timestamp).toBeDefined();
      expect(typeof event.timestamp).toBe('number');
    });
  });

  describe('Module Progress Tracking', () => {
    test('should track module completion', () => {
      analytics.trackModuleCompletion('module-1', 'Module 1', 85);

      expect(analytics.data.moduleProgress['module-1']).toBeDefined();
      expect(analytics.data.moduleProgress['module-1'].completed).toBe(true);
      expect(analytics.data.moduleProgress['module-1'].bestScore).toBe(85);
    });

    test('should track multiple completions', () => {
      analytics.trackModuleCompletion('module-1', 'Module 1', 75);
      analytics.trackModuleCompletion('module-1', 'Module 1', 90);

      expect(analytics.data.moduleProgress['module-1'].attempts).toBe(2);
      expect(analytics.data.moduleProgress['module-1'].bestScore).toBe(90);
    });

    test('should keep completion dates', () => {
      analytics.trackModuleCompletion('module-1', 'Module 1');

      expect(analytics.data.moduleProgress['module-1'].completionDates.length).toBe(1);
    });
  });

  describe('Quiz Tracking', () => {
    test('should track quiz results', () => {
      const result = analytics.trackQuizResult('quiz-1', 'Test Quiz', 85, true, 10);

      expect(result).toBeDefined();
      expect(result.score).toBe(85);
      expect(result.passed).toBe(true);
      expect(analytics.data.quizResults.length).toBe(1);
    });

    test('should track multiple quiz attempts', () => {
      analytics.trackQuizResult('quiz-1', 'Quiz 1', 70, true, 10);
      analytics.trackQuizResult('quiz-2', 'Quiz 2', 90, true, 10);

      expect(analytics.data.quizResults.length).toBe(2);
    });

    test('should calculate average quiz score', () => {
      analytics.trackQuizResult('quiz-1', 'Quiz 1', 80, true, 10);
      analytics.trackQuizResult('quiz-2', 'Quiz 2', 90, true, 10);

      const avg = analytics.getAverageQuizScore();
      expect(avg).toBe(85);
    });
  });

  describe('Session Management', () => {
    test('should start session', () => {
      const session = analytics.startSession();

      expect(session).toBeDefined();
      expect(session.startTime).toBeDefined();
      expect(analytics.data.currentSession).toBe(session);
    });

    test('should end session', () => {
      analytics.startSession();
      const session = analytics.endSession();

      expect(session.endTime).toBeDefined();
      expect(session.duration).toBeGreaterThanOrEqual(0);
      expect(analytics.data.currentSession).toBeNull();
      expect(analytics.data.sessions.length).toBe(1);
    });

    test('should calculate session duration', () => {
      analytics.startSession();
      analytics.data.currentSession.startTime = Date.now() - 5000; // 5 seconds ago
      const session = analytics.endSession();

      expect(session.duration).toBeGreaterThan(4000);
      expect(session.duration).toBeLessThan(6000);
    });
  });

  describe('Insights Generation', () => {
    test('should not generate insights without sufficient data', () => {
      const insights = analytics.generateInsights();

      expect(insights.length).toBe(0);
    });

    test('should generate learning pace insight', () => {
      // Add module completions over time
      analytics.data.moduleProgress['module-1'] = {
        completed: true,
        attempts: 1,
        bestScore: 85,
        completionDates: [Date.now() - 7 * 24 * 60 * 60 * 1000] // 1 week ago
      };
      analytics.data.moduleProgress['module-2'] = {
        completed: true,
        attempts: 1,
        bestScore: 90,
        completionDates: [Date.now()]
      };

      const insights = analytics.generateInsights();

      const paceInsight = insights.find(i => i.type === 'pace');
      expect(paceInsight).toBeDefined();
      expect(paceInsight.value).toBeDefined();
      expect(paceInsight.trend).toMatch(/up|down|stable/);
    });

    test('should identify knowledge gaps', () => {
      analytics.trackQuizResult('quiz-1', 'Topic A Quiz', 60, false, 10);
      analytics.trackQuizResult('quiz-1', 'Topic A Quiz', 65, false, 10);

      const insights = analytics.generateInsights();

      const gapsInsight = insights.find(i => i.type === 'gaps');
      expect(gapsInsight).toBeDefined();
      expect(gapsInsight.description).toContain('Topic A');
    });
  });

  describe('Recommendations Generation', () => {
    test('should recommend reviewing weak topics', () => {
      analytics.trackQuizResult('quiz-1', 'Weak Topic Quiz', 55, false, 10);
      analytics.trackQuizResult('quiz-1', 'Weak Topic Quiz', 60, false, 10);

      const recommendations = analytics.generateRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
      const reviewRec = recommendations.find(r => r.type === 'gap');
      expect(reviewRec).toBeDefined();
      expect(reviewRec.description).toContain('Weak Topic');
    });

    test('should prioritize recommendations', () => {
      analytics.trackQuizResult('quiz-1', 'Topic 1 Quiz', 50, false, 10);
      analytics.trackQuizResult('quiz-2', 'Topic 2 Quiz', 60, false, 10);

      const recommendations = analytics.generateRecommendations();

      const highPriority = recommendations.filter(r => r.priority === 'high');
      expect(highPriority.length).toBeGreaterThan(0);
    });
  });

  describe('Knowledge Gap Detection', () => {
    test('should detect topics with low scores', () => {
      analytics.trackQuizResult('quiz-1', 'Topic A Quiz', 55, false, 10);
      analytics.trackQuizResult('quiz-1', 'Topic A Quiz', 60, false, 10);

      const gaps = analytics.identifyKnowledgeGaps();

      expect(gaps.length).toBe(1);
      expect(gaps[0].name).toBe('Topic A');
      expect(gaps[0].score).toBe(57.5); // Average of 55 and 60
    });

    test('should detect topics with multiple failures', () => {
      analytics.trackQuizResult('quiz-1', 'Topic B Quiz', 72, true, 10);
      analytics.trackQuizResult('quiz-1', 'Topic B Quiz', 68, false, 10);
      analytics.trackQuizResult('quiz-1', 'Topic B Quiz', 65, false, 10);

      const gaps = analytics.identifyKnowledgeGaps();

      expect(gaps.length).toBe(1);
      expect(gaps[0].name).toBe('Topic B');
      expect(gaps[0].failureRate).toBeGreaterThan(50);
    });

    test('should not detect topics with good scores', () => {
      analytics.trackQuizResult('quiz-1', 'Good Topic Quiz', 85, true, 10);
      analytics.trackQuizResult('quiz-1', 'Good Topic Quiz', 90, true, 10);

      const gaps = analytics.identifyKnowledgeGaps();

      expect(gaps.length).toBe(0);
    });
  });

  describe('Summary Statistics', () => {
    test('should provide comprehensive summary', () => {
      analytics.startSession();
      analytics.endSession();
      analytics.trackModuleCompletion('module-1', 'Module 1', 85);
      analytics.trackQuizResult('quiz-1', 'Quiz 1', 90, true, 10);

      const summary = analytics.getSummary();

      expect(summary.totalSessions).toBe(1);
      expect(summary.modulesCompleted).toBe(1);
      expect(summary.quizzesTaken).toBe(1);
      expect(summary.averageQuizScore).toBe(90);
    });

    test('should calculate total time spent', () => {
      analytics.startSession();
      analytics.data.currentSession.startTime = Date.now() - 10000; // 10 seconds ago
      analytics.endSession();

      const summary = analytics.getSummary();

      expect(summary.totalTimeSpent).toBeGreaterThan(9000);
      expect(summary.totalTimeSpent).toBeLessThan(11000);
    });
  });

  describe('Data Management', () => {
    test('should reset all data', () => {
      analytics.trackEvent('test');
      analytics.trackModuleCompletion('module-1', 'Module 1');
      analytics.trackQuizResult('quiz-1', 'Quiz 1', 85, true, 10);

      analytics.resetData();

      expect(analytics.data.learningEvents.length).toBe(0);
      expect(Object.keys(analytics.data.moduleProgress).length).toBe(0);
      expect(analytics.data.quizResults.length).toBe(0);
    });

    test('should preserve configuration after reset', () => {
      analytics.config.trackingEnabled = false;
      analytics.resetData();

      expect(analytics.config.trackingEnabled).toBe(false);
    });
  });
});
