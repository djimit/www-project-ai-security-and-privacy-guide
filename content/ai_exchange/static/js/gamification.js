/**
 * OWASP AI Security Gamification Engine
 * Tracks learning progress, awards achievements, and manages XP/levels
 */

class GamificationEngine {
    constructor() {
        this.storageKey = 'owasp_ai_gamification';
        this.data = this.loadData();
        this.learningPaths = null;
        this.achievements = null;
        this.quizzes = null;
        this.listeners = [];

        this.init();
    }

    async init() {
        // Load configuration data
        await Promise.all([
            this.loadLearningPaths(),
            this.loadAchievements(),
            this.loadQuizzes()
        ]);

        // Track page visit
        this.trackPageVisit(window.location.pathname);

        // Check for time-based achievements
        this.checkTimeBasedAchievements();

        // Emit ready event
        this.emit('ready', this.data);
    }

    async loadLearningPaths() {
        try {
            const response = await fetch('/data/learning-paths.json');
            this.learningPaths = await response.json();
        } catch (error) {
            console.error('Failed to load learning paths:', error);
            this.learningPaths = { paths: [] };
        }
    }

    async loadAchievements() {
        try {
            const response = await fetch('/data/achievements.json');
            this.achievements = await response.json();
        } catch (error) {
            console.error('Failed to load achievements:', error);
            this.achievements = { achievements: [], tiers: {}, levels: [] };
        }
    }

    async loadQuizzes() {
        try {
            const response = await fetch('/data/quizzes.json');
            this.quizzes = await response.json();
        } catch (error) {
            console.error('Failed to load quizzes:', error);
            this.quizzes = { quizzes: {} };
        }
    }

    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            return JSON.parse(stored);
        }

        // Initialize default data structure
        return {
            xp: 0,
            level: 1,
            completedModules: [],
            completedPaths: [],
            completedQuizzes: [],
            perfectQuizzes: [],
            quizStreak: 0,
            achievements: [],
            pagesVisited: [],
            threatModelsCreated: 0,
            sarifExports: 0,
            socialShares: 0,
            feedbackGiven: 0,
            dailyStreak: 0,
            lastActivityDate: null,
            weekendModules: 0,
            stats: {
                totalTimeSpent: 0,
                fastestModule: null,
                longestPath: null,
                quizzesTaken: 0,
                quizzesPassed: 0
            },
            created: new Date().toISOString()
        };
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        this.emit('data-updated', this.data);
    }

    // Event system
    on(event, callback) {
        this.listeners.push({ event, callback });
    }

    emit(event, data) {
        this.listeners
            .filter(l => l.event === event)
            .forEach(l => l.callback(data));
    }

    // XP and Level Management
    addXP(amount, reason) {
        const oldLevel = this.data.level;
        this.data.xp += amount;

        // Check for level up
        const newLevel = this.calculateLevel(this.data.xp);
        if (newLevel > oldLevel) {
            this.data.level = newLevel;
            this.emit('level-up', {
                level: newLevel,
                levelInfo: this.getLevelInfo(newLevel),
                xp: this.data.xp
            });
        }

        this.emit('xp-gained', {
            amount,
            reason,
            totalXP: this.data.xp,
            level: this.data.level
        });

        // Check XP milestone achievements
        this.checkXPAchievements();

        this.saveData();
    }

    calculateLevel(xp) {
        if (!this.achievements || !this.achievements.levels) return 1;

        const levels = this.achievements.levels;
        for (let i = levels.length - 1; i >= 0; i--) {
            if (xp >= levels[i].minXP) {
                return levels[i].level;
            }
        }
        return 1;
    }

    getLevelInfo(level) {
        if (!this.achievements || !this.achievements.levels) return null;
        return this.achievements.levels.find(l => l.level === level);
    }

    getProgressToNextLevel() {
        const currentLevel = this.getLevelInfo(this.data.level);
        const nextLevel = this.getLevelInfo(this.data.level + 1);

        if (!nextLevel) {
            return { progress: 100, current: this.data.xp, needed: 0 };
        }

        const current = this.data.xp - currentLevel.minXP;
        const needed = nextLevel.minXP - currentLevel.minXP;
        const progress = (current / needed) * 100;

        return {
            progress: Math.min(100, Math.round(progress)),
            current: current,
            needed: needed,
            total: this.data.xp,
            nextLevelXP: nextLevel.minXP
        };
    }

    // Module Progress
    completeModule(pathId, moduleId, timeSpent) {
        const moduleKey = `${pathId}:${moduleId}`;

        if (this.data.completedModules.includes(moduleKey)) {
            return; // Already completed
        }

        this.data.completedModules.push(moduleKey);

        // Find the module to get XP
        const path = this.learningPaths?.paths.find(p => p.id === pathId);
        const module = path?.modules.find(m => m.id === moduleId);

        if (module) {
            this.addXP(module.xp, `Completed: ${module.title}`);
        }

        // Update stats
        this.data.stats.totalTimeSpent += timeSpent || 0;
        if (!this.data.stats.fastestModule || timeSpent < this.data.stats.fastestModule.time) {
            this.data.stats.fastestModule = {
                pathId,
                moduleId,
                time: timeSpent
            };
        }

        // Check if weekend
        const now = new Date();
        if (now.getDay() === 0 || now.getDay() === 6) {
            this.data.weekendModules++;
        }

        // Update daily streak
        this.updateDailyStreak();

        // Check achievements
        this.checkModuleAchievements(timeSpent);
        this.checkPathCompletion(pathId);

        this.emit('module-completed', { pathId, moduleId, module });
        this.saveData();
    }

    completeQuiz(quizId, score, perfectScore, timeSpent) {
        const quizData = {
            quizId,
            score,
            perfectScore,
            timeSpent,
            date: new Date().toISOString()
        };

        this.data.completedQuizzes.push(quizData);
        this.data.stats.quizzesTaken++;

        const quiz = this.quizzes?.quizzes[quizId];
        const passed = score >= (quiz?.passingScore || 70);

        if (passed) {
            this.data.stats.quizzesPassed++;
            this.addXP(50, `Passed quiz: ${quiz?.title || quizId}`);
        }

        // Perfect score handling
        if (score === 100) {
            this.data.perfectQuizzes.push(quizId);
            this.data.quizStreak++;
            this.addXP(50, 'Perfect quiz score bonus!');
        } else {
            this.data.quizStreak = 0;
        }

        // Check quiz achievements
        this.checkQuizAchievements();

        this.emit('quiz-completed', { quizId, score, passed, perfectScore });
        this.saveData();
    }

    checkPathCompletion(pathId) {
        const path = this.learningPaths?.paths.find(p => p.id === pathId);
        if (!path) return;

        const allModulesComplete = path.modules.every(module => {
            const moduleKey = `${pathId}:${module.id}`;
            return this.data.completedModules.includes(moduleKey);
        });

        if (allModulesComplete && !this.data.completedPaths.includes(pathId)) {
            this.data.completedPaths.push(pathId);
            this.addXP(path.estimatedHours * 100, `Completed path: ${path.title}`);

            this.emit('path-completed', { pathId, path });
            this.checkPathAchievements();
            this.saveData();
        }
    }

    // Page Tracking
    trackPageVisit(path) {
        if (!this.data.pagesVisited.includes(path)) {
            this.data.pagesVisited.push(path);
            this.checkExplorationAchievements();
            this.saveData();
        }
    }

    // Daily Streak
    updateDailyStreak() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const lastActivity = this.data.lastActivityDate;

        if (!lastActivity || lastActivity !== today) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastActivity === yesterdayStr) {
                this.data.dailyStreak++;
            } else if (lastActivity !== today) {
                this.data.dailyStreak = 1;
            }

            this.data.lastActivityDate = today;
            this.checkStreakAchievements();
        }
    }

    // Threat Modeler Integration
    trackThreatModel() {
        this.data.threatModelsCreated++;
        this.addXP(100, 'Created threat model');
        this.checkThreatModelAchievements();
        this.saveData();
    }

    trackSARIFExport() {
        this.data.sarifExports++;
        this.addXP(200, 'Exported to SARIF');
        this.checkThreatModelAchievements();
        this.saveData();
    }

    // Social Features
    trackSocialShare() {
        this.data.socialShares++;
        this.addXP(150, 'Shared on social media');
        this.checkSocialAchievements();
        this.saveData();
    }

    trackFeedback() {
        this.data.feedbackGiven++;
        this.addXP(50, 'Provided feedback');
        this.checkSocialAchievements();
        this.saveData();
    }

    // Achievement Checking
    checkAchievement(achievementId) {
        if (this.data.achievements.includes(achievementId)) {
            return false; // Already unlocked
        }

        const achievement = this.achievements?.achievements.find(a => a.id === achievementId);
        if (!achievement) return false;

        let unlocked = false;
        const condition = achievement.condition;

        switch (condition.type) {
            case 'modules_completed':
                unlocked = this.data.completedModules.length >= condition.value;
                break;
            case 'paths_completed':
                unlocked = this.data.completedPaths.length >= condition.value;
                break;
            case 'quizzes_passed':
                unlocked = this.data.stats.quizzesPassed >= condition.value;
                break;
            case 'perfect_quizzes':
                unlocked = this.data.perfectQuizzes.length >= condition.value;
                break;
            case 'quiz_streak':
                unlocked = this.data.quizStreak >= condition.value;
                break;
            case 'specific_path':
                unlocked = this.data.completedPaths.includes(condition.value);
                break;
            case 'threat_models_created':
                unlocked = this.data.threatModelsCreated >= condition.value;
                break;
            case 'sarif_exports':
                unlocked = this.data.sarifExports >= condition.value;
                break;
            case 'daily_streak':
                unlocked = this.data.dailyStreak >= condition.value;
                break;
            case 'weekend_modules':
                unlocked = this.data.weekendModules >= condition.value;
                break;
            case 'pages_visited':
                unlocked = this.data.pagesVisited.length >= condition.value;
                break;
            case 'total_xp':
                unlocked = this.data.xp >= condition.value;
                break;
            case 'social_share':
                unlocked = this.data.socialShares >= condition.value;
                break;
            case 'feedback_given':
                unlocked = this.data.feedbackGiven >= condition.value;
                break;
            case 'difficulty_variety':
                const difficulties = new Set();
                this.data.completedPaths.forEach(pathId => {
                    const path = this.learningPaths?.paths.find(p => p.id === pathId);
                    if (path) difficulties.add(path.difficulty);
                });
                unlocked = difficulties.size >= condition.value;
                break;
            case 'role_variety':
                const roles = new Set();
                this.data.completedPaths.forEach(pathId => {
                    const path = this.learningPaths?.paths.find(p => p.id === pathId);
                    if (path && path.role !== 'all') roles.add(path.role);
                });
                unlocked = roles.size >= condition.value;
                break;
        }

        if (unlocked) {
            this.unlockAchievement(achievementId, achievement);
            return true;
        }

        return false;
    }

    unlockAchievement(achievementId, achievement) {
        this.data.achievements.push(achievementId);
        this.addXP(achievement.xp, `Achievement unlocked: ${achievement.title}`);

        this.emit('achievement-unlocked', achievement);
        this.saveData();
    }

    checkModuleAchievements(timeSpent) {
        this.checkAchievement('first-steps');

        if (timeSpent && timeSpent < 600) {
            this.checkAchievement('speed-reader');
        }
    }

    checkPathAchievements() {
        this.checkAchievement('getting-started');
        this.checkAchievement('knowledge-seeker');
        this.checkAchievement('master-learner');
        this.checkAchievement('renaissance-learner');
        this.checkAchievement('multi-role-master');

        // Check specific path achievements
        const specificPaths = [
            'injection-expert',
            'ml-security-pro',
            'appsec-specialist',
            'governance-guru',
            'threat-hunter'
        ];
        specificPaths.forEach(id => this.checkAchievement(id));
    }

    checkQuizAchievements() {
        this.checkAchievement('quiz-novice');
        this.checkAchievement('quiz-master');
        this.checkAchievement('perfect-streak');
    }

    checkThreatModelAchievements() {
        this.checkAchievement('threat-modeler');
        this.checkAchievement('architecture-analyst');
        this.checkAchievement('security-architect');
    }

    checkExplorationAchievements() {
        this.checkAchievement('explorer');
        this.checkAchievement('documentation-master');
    }

    checkSocialAchievements() {
        this.checkAchievement('community-contributor');
        this.checkAchievement('feedback-provider');
    }

    checkStreakAchievements() {
        this.checkAchievement('consistent-learner');
        this.checkAchievement('unstoppable');
    }

    checkXPAchievements() {
        this.checkAchievement('xp-milestone-1k');
        this.checkAchievement('xp-milestone-5k');
        this.checkAchievement('xp-milestone-10k');
        this.checkAchievement('xp-elite');
    }

    checkTimeBasedAchievements() {
        // This is called when modules are completed, checking time of day
        const hour = new Date().getHours();
        if (hour < 9) {
            this.checkAchievement('early-bird');
        } else if (hour >= 22) {
            this.checkAchievement('night-owl');
        }
    }

    // Getters
    getStats() {
        return {
            ...this.data.stats,
            xp: this.data.xp,
            level: this.data.level,
            levelInfo: this.getLevelInfo(this.data.level),
            nextLevel: this.getProgressToNextLevel(),
            achievementCount: this.data.achievements.length,
            totalAchievements: this.achievements?.achievements.length || 0,
            completedPaths: this.data.completedPaths.length,
            totalPaths: this.learningPaths?.paths.length || 0,
            completedModules: this.data.completedModules.length,
            dailyStreak: this.data.dailyStreak
        };
    }

    getAchievements() {
        if (!this.achievements) return [];

        return this.achievements.achievements.map(achievement => ({
            ...achievement,
            unlocked: this.data.achievements.includes(achievement.id),
            progress: this.getAchievementProgress(achievement)
        }));
    }

    getAchievementProgress(achievement) {
        const condition = achievement.condition;
        let current = 0;
        let target = condition.value;

        switch (condition.type) {
            case 'modules_completed':
                current = this.data.completedModules.length;
                break;
            case 'paths_completed':
                current = this.data.completedPaths.length;
                break;
            case 'quizzes_passed':
                current = this.data.stats.quizzesPassed;
                break;
            case 'perfect_quizzes':
                current = this.data.perfectQuizzes.length;
                break;
            case 'quiz_streak':
                current = this.data.quizStreak;
                break;
            case 'threat_models_created':
                current = this.data.threatModelsCreated;
                break;
            case 'sarif_exports':
                current = this.data.sarifExports;
                break;
            case 'daily_streak':
                current = this.data.dailyStreak;
                break;
            case 'weekend_modules':
                current = this.data.weekendModules;
                break;
            case 'pages_visited':
                current = this.data.pagesVisited.length;
                break;
            case 'total_xp':
                current = this.data.xp;
                break;
            case 'social_share':
                current = this.data.socialShares;
                break;
            case 'feedback_given':
                current = this.data.feedbackGiven;
                break;
            default:
                return 0;
        }

        return Math.min(100, Math.round((current / target) * 100));
    }

    getLearningPaths() {
        if (!this.learningPaths) return [];

        return this.learningPaths.paths.map(path => {
            const completedModules = path.modules.filter(module => {
                const moduleKey = `${path.id}:${module.id}`;
                return this.data.completedModules.includes(moduleKey);
            }).length;

            return {
                ...path,
                progress: (completedModules / path.modules.length) * 100,
                completed: this.data.completedPaths.includes(path.id),
                completedModules
            };
        });
    }

    getQuiz(quizId) {
        return this.quizzes?.quizzes[quizId];
    }

    // Export/Import
    exportProgress() {
        return {
            version: '1.0',
            exported: new Date().toISOString(),
            data: this.data
        };
    }

    importProgress(exportedData) {
        if (exportedData.version === '1.0') {
            this.data = exportedData.data;
            this.saveData();
            this.emit('data-imported', this.data);
            return true;
        }
        return false;
    }

    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            localStorage.removeItem(this.storageKey);
            this.data = this.loadData();
            this.saveData();
            this.emit('data-reset', this.data);
            window.location.reload();
        }
    }
}

// Global instance
window.owaspGamification = new GamificationEngine();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamificationEngine;
}
