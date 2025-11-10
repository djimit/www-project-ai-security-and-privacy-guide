/**
 * Unit Tests for Gamification Engine
 * Tests XP system, levels, achievements, progress tracking
 */

// Load the gamification engine
const fs = require('fs');
const path = require('path');
const gamificationCode = fs.readFileSync(
  path.join(__dirname, '../../static/js/gamification.js'),
  'utf8'
);

// Evaluate the code in the test environment
eval(gamificationCode);

describe('GamificationEngine', () => {
  let engine;

  beforeEach(async () => {
    engine = new GamificationEngine();
    // Wait for initialization
    await waitForAsync(100);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    test('should initialize with default data', () => {
      expect(engine.data).toBeDefined();
      expect(engine.data.xp).toBe(0);
      expect(engine.data.level).toBe(1);
      expect(engine.data.completedModules).toEqual([]);
      expect(engine.data.completedPaths).toEqual([]);
      expect(engine.data.achievements).toEqual([]);
    });

    test('should load learning paths', async () => {
      await waitFor(() => engine.learningPaths !== null);
      expect(engine.learningPaths).toBeDefined();
      expect(engine.learningPaths.paths).toBeDefined();
      expect(Array.isArray(engine.learningPaths.paths)).toBe(true);
    });

    test('should load achievements', async () => {
      await waitFor(() => engine.achievements !== null);
      expect(engine.achievements).toBeDefined();
      expect(engine.achievements.achievements).toBeDefined();
      expect(Array.isArray(engine.achievements.achievements)).toBe(true);
    });

    test('should emit ready event', (done) => {
      const newEngine = new GamificationEngine();
      newEngine.on('ready', (data) => {
        expect(data).toBeDefined();
        expect(data.xp).toBe(0);
        done();
      });
    });
  });

  describe('XP Management', () => {
    test('should add XP correctly', () => {
      engine.addXP(100, 'Test XP');
      expect(engine.data.xp).toBe(100);
    });

    test('should emit xp-gained event', (done) => {
      engine.on('xp-gained', (data) => {
        expect(data.amount).toBe(150);
        expect(data.reason).toBe('Test reward');
        expect(data.totalXP).toBe(150);
        done();
      });
      engine.addXP(150, 'Test reward');
    });

    test('should accumulate XP over multiple awards', () => {
      engine.addXP(100, 'First');
      engine.addXP(200, 'Second');
      engine.addXP(50, 'Third');
      expect(engine.data.xp).toBe(350);
    });
  });

  describe('Level Progression', () => {
    test('should start at level 1', () => {
      expect(engine.data.level).toBe(1);
    });

    test('should level up when reaching threshold', async () => {
      await waitFor(() => engine.achievements !== null);

      let leveledUp = false;
      engine.on('level-up', (data) => {
        leveledUp = true;
        expect(data.level).toBe(2);
      });

      engine.addXP(500, 'Level up test');
      expect(leveledUp).toBe(true);
      expect(engine.data.level).toBe(2);
    });

    test('should calculate correct level from XP', async () => {
      await waitFor(() => engine.achievements !== null);

      expect(engine.calculateLevel(0)).toBe(1);
      expect(engine.calculateLevel(500)).toBe(2);
      expect(engine.calculateLevel(1000)).toBe(3);
      expect(engine.calculateLevel(2000)).toBe(4);
    });

    test('should get level info correctly', async () => {
      await waitFor(() => engine.achievements !== null);

      const level1Info = engine.getLevelInfo(1);
      expect(level1Info).toBeDefined();
      expect(level1Info.title).toBe('Novice');
      expect(level1Info.icon).toBe('🌱');
    });

    test('should calculate progress to next level', async () => {
      await waitFor(() => engine.achievements !== null);

      engine.addXP(250, 'Test');
      const progress = engine.getProgressToNextLevel();

      expect(progress.progress).toBe(50); // 250/500 = 50%
      expect(progress.current).toBe(250);
      expect(progress.needed).toBe(500);
    });
  });

  describe('Module Completion', () => {
    test('should complete a module', async () => {
      await waitFor(() => engine.learningPaths !== null);

      engine.completeModule('test-path', 'test-module', 1800);

      expect(engine.data.completedModules).toContain('test-path:test-module');
      expect(engine.data.xp).toBeGreaterThan(0);
    });

    test('should not complete same module twice', async () => {
      await waitFor(() => engine.learningPaths !== null);

      engine.completeModule('test-path', 'test-module', 1800);
      const xpAfterFirst = engine.data.xp;

      engine.completeModule('test-path', 'test-module', 1800);
      expect(engine.data.xp).toBe(xpAfterFirst);
    });

    test('should emit module-completed event', (done) => {
      waitFor(() => engine.learningPaths !== null).then(() => {
        engine.on('module-completed', (data) => {
          expect(data.pathId).toBe('test-path');
          expect(data.moduleId).toBe('test-module');
          done();
        });
        engine.completeModule('test-path', 'test-module', 1800);
      });
    });

    test('should track fastest module time', async () => {
      await waitFor(() => engine.learningPaths !== null);

      engine.completeModule('test-path', 'test-module', 600);

      expect(engine.data.stats.fastestModule).toBeDefined();
      expect(engine.data.stats.fastestModule.time).toBe(600);
    });

    test('should update total time spent', async () => {
      await waitFor(() => engine.learningPaths !== null);

      engine.completeModule('test-path', 'test-module', 1800);
      expect(engine.data.stats.totalTimeSpent).toBe(1800);
    });
  });

  describe('Quiz Completion', () => {
    test('should complete a quiz', () => {
      engine.completeQuiz('test-quiz', 85, false, 300);

      expect(engine.data.completedQuizzes.length).toBe(1);
      expect(engine.data.stats.quizzesTaken).toBe(1);
      expect(engine.data.stats.quizzesPassed).toBe(1);
    });

    test('should award XP for passing quiz', () => {
      const initialXP = engine.data.xp;
      engine.completeQuiz('test-quiz', 80, false, 300);

      expect(engine.data.xp).toBeGreaterThan(initialXP);
    });

    test('should award bonus XP for perfect score', () => {
      const initialXP = engine.data.xp;
      engine.completeQuiz('test-quiz', 100, true, 300);

      // Should get base XP + perfect bonus
      expect(engine.data.xp).toBe(initialXP + 100); // 50 + 50 bonus
    });

    test('should track perfect quiz streak', () => {
      engine.completeQuiz('quiz1', 100, true, 300);
      expect(engine.data.quizStreak).toBe(1);

      engine.completeQuiz('quiz2', 100, true, 300);
      expect(engine.data.quizStreak).toBe(2);
    });

    test('should reset streak on non-perfect score', () => {
      engine.completeQuiz('quiz1', 100, true, 300);
      expect(engine.data.quizStreak).toBe(1);

      engine.completeQuiz('quiz2', 85, false, 300);
      expect(engine.data.quizStreak).toBe(0);
    });

    test('should not award XP for failing quiz', () => {
      const initialXP = engine.data.xp;
      engine.completeQuiz('test-quiz', 50, false, 300);

      expect(engine.data.xp).toBe(initialXP);
      expect(engine.data.stats.quizzesPassed).toBe(0);
    });
  });

  describe('Path Completion', () => {
    test('should mark path as completed when all modules done', async () => {
      await waitFor(() => engine.learningPaths !== null);

      engine.completeModule('test-path', 'test-module', 1800);

      expect(engine.data.completedPaths).toContain('test-path');
    });

    test('should emit path-completed event', (done) => {
      waitFor(() => engine.learningPaths !== null).then(() => {
        engine.on('path-completed', (data) => {
          expect(data.pathId).toBe('test-path');
          done();
        });
        engine.completeModule('test-path', 'test-module', 1800);
      });
    });
  });

  describe('Achievement System', () => {
    test('should unlock achievement when condition met', async () => {
      await waitFor(() => engine.achievements !== null);

      const unlocked = engine.checkAchievement('test-achievement');

      // Should not be unlocked yet (need 1 module)
      expect(unlocked).toBe(false);

      engine.completeModule('test-path', 'test-module', 1800);

      // Now should be unlocked
      expect(engine.data.achievements).toContain('test-achievement');
    });

    test('should not unlock same achievement twice', async () => {
      await waitFor(() => engine.achievements !== null);

      engine.completeModule('test-path', 'test-module', 1800);
      const achievementCount = engine.data.achievements.length;

      engine.checkAchievement('test-achievement');
      expect(engine.data.achievements.length).toBe(achievementCount);
    });

    test('should emit achievement-unlocked event', (done) => {
      waitFor(() => engine.achievements !== null).then(() => {
        engine.on('achievement-unlocked', (achievement) => {
          expect(achievement.id).toBe('test-achievement');
          done();
        });

        engine.completeModule('test-path', 'test-module', 1800);
      });
    });

    test('should calculate achievement progress', async () => {
      await waitFor(() => engine.achievements !== null);

      const achievement = engine.achievements.achievements[0];

      // No progress yet
      let progress = engine.getAchievementProgress(achievement);
      expect(progress).toBe(0);

      // Complete one module
      engine.completeModule('test-path', 'test-module', 1800);

      // Should be 100% (condition: 1 module)
      progress = engine.getAchievementProgress(achievement);
      expect(progress).toBe(100);
    });
  });

  describe('Daily Streak', () => {
    test('should start daily streak on first activity', () => {
      engine.updateDailyStreak();
      expect(engine.data.dailyStreak).toBe(1);
    });

    test('should increment streak on consecutive days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      engine.data.lastActivityDate = yesterday.toISOString().split('T')[0];

      engine.updateDailyStreak();
      expect(engine.data.dailyStreak).toBe(2);
    });

    test('should reset streak after gap', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      engine.data.lastActivityDate = threeDaysAgo.toISOString().split('T')[0];
      engine.data.dailyStreak = 5;

      engine.updateDailyStreak();
      expect(engine.data.dailyStreak).toBe(1);
    });
  });

  describe('Threat Modeler Integration', () => {
    test('should track threat model creation', () => {
      engine.trackThreatModel();

      expect(engine.data.threatModelsCreated).toBe(1);
      expect(engine.data.xp).toBe(100);
    });

    test('should track SARIF exports', () => {
      engine.trackSARIFExport();

      expect(engine.data.sarifExports).toBe(1);
      expect(engine.data.xp).toBe(200);
    });
  });

  describe('Social Features', () => {
    test('should track social shares', () => {
      engine.trackSocialShare();

      expect(engine.data.socialShares).toBe(1);
      expect(engine.data.xp).toBe(150);
    });

    test('should track feedback', () => {
      engine.trackFeedback();

      expect(engine.data.feedbackGiven).toBe(1);
      expect(engine.data.xp).toBe(50);
    });
  });

  describe('Statistics', () => {
    test('should return comprehensive stats', async () => {
      await waitFor(() => engine.achievements !== null);

      const stats = engine.getStats();

      expect(stats).toHaveProperty('xp');
      expect(stats).toHaveProperty('level');
      expect(stats).toHaveProperty('levelInfo');
      expect(stats).toHaveProperty('achievementCount');
      expect(stats).toHaveProperty('completedPaths');
      expect(stats).toHaveProperty('dailyStreak');
    });

    test('should calculate quiz pass rate', () => {
      engine.completeQuiz('quiz1', 80, false, 300);
      engine.completeQuiz('quiz2', 60, false, 300);
      engine.completeQuiz('quiz3', 90, false, 300);

      const stats = engine.getStats();

      // 2 passed out of 3 = 67%
      const passRate = Math.round(
        (stats.quizzesPassed / stats.quizzesTaken) * 100
      );
      expect(passRate).toBe(67);
    });
  });

  describe('Data Persistence', () => {
    test('should save data to localStorage', () => {
      engine.addXP(100, 'Test');
      engine.saveData();

      const stored = localStorage.getItem('owasp_ai_gamification');
      expect(stored).toBeDefined();

      const data = JSON.parse(stored);
      expect(data.xp).toBe(100);
    });

    test('should load data from localStorage', () => {
      const testData = {
        xp: 500,
        level: 2,
        completedModules: ['path1:module1'],
        completedPaths: [],
        achievements: ['test'],
        created: new Date().toISOString()
      };

      localStorage.setItem('owasp_ai_gamification', JSON.stringify(testData));

      const newEngine = new GamificationEngine();
      expect(newEngine.data.xp).toBe(500);
      expect(newEngine.data.level).toBe(2);
    });

    test('should export progress as JSON', () => {
      engine.addXP(200, 'Test');
      const exported = engine.exportProgress();

      expect(exported.version).toBe('1.0');
      expect(exported.data.xp).toBe(200);
      expect(exported.exported).toBeDefined();
    });

    test('should import progress from JSON', () => {
      const importData = {
        version: '1.0',
        exported: new Date().toISOString(),
        data: {
          xp: 1000,
          level: 3,
          completedModules: ['test:module'],
          completedPaths: [],
          achievements: ['achievement1'],
          created: new Date().toISOString()
        }
      };

      const result = engine.importProgress(importData);
      expect(result).toBe(true);
      expect(engine.data.xp).toBe(1000);
      expect(engine.data.level).toBe(3);
    });
  });

  describe('Event System', () => {
    test('should register event listeners', () => {
      const callback = jest.fn();
      engine.on('test-event', callback);

      engine.emit('test-event', { data: 'test' });
      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    test('should support multiple listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      engine.on('test-event', callback1);
      engine.on('test-event', callback2);

      engine.emit('test-event', { data: 'test' });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('Learning Paths', () => {
    test('should return learning paths with progress', async () => {
      await waitFor(() => engine.learningPaths !== null);

      const paths = engine.getLearningPaths();

      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);

      const path = paths[0];
      expect(path).toHaveProperty('progress');
      expect(path).toHaveProperty('completed');
      expect(path).toHaveProperty('completedModules');
    });

    test('should calculate path progress correctly', async () => {
      await waitFor(() => engine.learningPaths !== null);

      const paths = engine.getLearningPaths();
      const testPath = paths.find(p => p.id === 'test-path');

      expect(testPath.progress).toBe(0);

      engine.completeModule('test-path', 'test-module', 1800);

      const updatedPaths = engine.getLearningPaths();
      const updatedPath = updatedPaths.find(p => p.id === 'test-path');

      expect(updatedPath.progress).toBe(100);
      expect(updatedPath.completed).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle negative XP gracefully', () => {
      engine.addXP(-100, 'Negative test');
      // XP should not go negative
      expect(engine.data.xp).toBeGreaterThanOrEqual(0);
    });

    test('should handle extremely large XP values', async () => {
      await waitFor(() => engine.achievements !== null);

      engine.addXP(1000000, 'Large XP');
      expect(engine.data.xp).toBe(1000000);
      expect(engine.data.level).toBeGreaterThan(1);
    });

    test('should handle invalid achievement IDs', () => {
      const result = engine.checkAchievement('nonexistent-achievement');
      expect(result).toBe(false);
    });

    test('should handle missing quiz data', () => {
      const quiz = engine.getQuiz('nonexistent-quiz');
      expect(quiz).toBeUndefined();
    });
  });
});
