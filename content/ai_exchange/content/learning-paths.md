---
title: "Learning Paths"
description: "Interactive learning paths with gamification, achievements, and progress tracking for OWASP AI Security"
weight: 5
---

<link rel="stylesheet" href="/css/gamification.css">
<script src="/js/gamification.js"></script>

# 🎓 AI Security Learning Paths

Master AI/ML security through structured learning paths tailored to your role and experience level. Earn XP, unlock achievements, and track your progress!

<div class="gamification-container">

<!-- Stats Dashboard -->
<div id="stats-section">
    <h2>📊 Your Progress</h2>
    <div id="level-display" class="level-badge">
        <span class="level-badge__icon">🌱</span>
        <div class="level-badge__info">
            <div class="level-badge__level">Level 1</div>
            <div class="level-badge__title">Novice</div>
            <div class="level-badge__xp">0 / 500 XP</div>
        </div>
    </div>

    <div class="progress-bar">
        <div class="progress-bar__fill" style="width: 0%" id="level-progress">
            <div class="progress-bar__label">0% to Level 2</div>
        </div>
    </div>

    <div class="stats-grid" id="stats-grid">
        <div class="stat-card">
            <div class="stat-card__icon">⭐</div>
            <div class="stat-card__value">0</div>
            <div class="stat-card__label">Total XP</div>
        </div>
        <div class="stat-card">
            <div class="stat-card__icon">🏆</div>
            <div class="stat-card__value">0</div>
            <div class="stat-card__label">Achievements</div>
        </div>
        <div class="stat-card">
            <div class="stat-card__icon">📚</div>
            <div class="stat-card__value">0</div>
            <div class="stat-card__label">Paths Completed</div>
        </div>
        <div class="stat-card">
            <div class="stat-card__icon">✅</div>
            <div class="stat-card__value">0</div>
            <div class="stat-card__label">Modules Done</div>
        </div>
        <div class="stat-card">
            <div class="stat-card__icon">🔥</div>
            <div class="stat-card__value">0</div>
            <div class="stat-card__label">Day Streak</div>
        </div>
        <div class="stat-card">
            <div class="stat-card__icon">💯</div>
            <div class="stat-card__value">0%</div>
            <div class="stat-card__label">Quiz Pass Rate</div>
        </div>
    </div>
</div>

<!-- Learning Paths Section -->
<div class="learning-paths">
    <h2>🗺️ Choose Your Path</h2>
    <p>Select learning paths based on your role, experience level, and interests.</p>

    <div class="learning-paths__filters">
        <button class="filter-button active" data-filter="all">All Paths</button>
        <button class="filter-button" data-filter="beginner">Beginner</button>
        <button class="filter-button" data-filter="intermediate">Intermediate</button>
        <button class="filter-button" data-filter="advanced">Advanced</button>
        <button class="filter-button" data-filter="developer">Developer</button>
        <button class="filter-button" data-filter="security-engineer">Security Engineer</button>
        <button class="filter-button" data-filter="ml-engineer">ML Engineer</button>
        <button class="filter-button" data-filter="manager">Manager</button>
    </div>

    <div class="paths-grid" id="paths-grid">
        <!-- Paths will be dynamically loaded here -->
    </div>
</div>

<!-- Achievements Section -->
<div class="achievements-section">
    <h2>🏆 Achievements</h2>
    <p>Unlock achievements by completing learning paths, quizzes, and exploring AI security concepts.</p>

    <div class="achievements-grid" id="achievements-grid">
        <!-- Achievements will be dynamically loaded here -->
    </div>
</div>

<!-- Progress Export/Import -->
<div style="text-align: center; margin: 40px 0; padding: 20px; background: var(--gamify-card-bg); border-radius: var(--gamify-radius);">
    <h3>💾 Manage Your Progress</h3>
    <p style="color: var(--gamify-text-muted); margin: 10px 0;">Your progress is automatically saved in your browser. Export to back it up or import to restore.</p>
    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 20px;">
        <button class="quiz-button primary" onclick="exportProgress()">📥 Export Progress</button>
        <button class="quiz-button secondary" onclick="importProgress()">📤 Import Progress</button>
        <button class="quiz-button secondary" onclick="resetProgress()" style="background: var(--gamify-danger);">🔄 Reset Progress</button>
    </div>
</div>

</div>

<script>
// Initialize UI after gamification engine is ready
window.owaspGamification.on('ready', updateUI);
window.owaspGamification.on('data-updated', updateUI);
window.owaspGamification.on('achievement-unlocked', showAchievementToast);
window.owaspGamification.on('level-up', showLevelUpToast);
window.owaspGamification.on('xp-gained', showXPNotification);

function updateUI() {
    updateStats();
    updateLearningPaths();
    updateAchievements();
}

function updateStats() {
    const stats = window.owaspGamification.getStats();

    // Update level badge
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay && stats.levelInfo) {
        levelDisplay.innerHTML = `
            <span class="level-badge__icon">${stats.levelInfo.icon}</span>
            <div class="level-badge__info">
                <div class="level-badge__level">Level ${stats.level}</div>
                <div class="level-badge__title">${stats.levelInfo.title}</div>
                <div class="level-badge__xp">${stats.xp} XP</div>
            </div>
        `;
    }

    // Update progress bar
    const levelProgress = document.getElementById('level-progress');
    if (levelProgress && stats.nextLevel) {
        levelProgress.style.width = stats.nextLevel.progress + '%';
        levelProgress.querySelector('.progress-bar__label').textContent =
            stats.nextLevel.progress + '% to Level ' + (stats.level + 1);
    }

    // Update stat cards
    const statsGrid = document.getElementById('stats-grid');
    if (statsGrid) {
        const passRate = stats.quizzesTaken > 0
            ? Math.round((stats.quizzesPassed / stats.quizzesTaken) * 100)
            : 0;

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-card__icon">⭐</div>
                <div class="stat-card__value">${stats.xp.toLocaleString()}</div>
                <div class="stat-card__label">Total XP</div>
            </div>
            <div class="stat-card">
                <div class="stat-card__icon">🏆</div>
                <div class="stat-card__value">${stats.achievementCount} / ${stats.totalAchievements}</div>
                <div class="stat-card__label">Achievements</div>
            </div>
            <div class="stat-card">
                <div class="stat-card__icon">📚</div>
                <div class="stat-card__value">${stats.completedPaths} / ${stats.totalPaths}</div>
                <div class="stat-card__label">Paths Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-card__icon">✅</div>
                <div class="stat-card__value">${stats.completedModules}</div>
                <div class="stat-card__label">Modules Done</div>
            </div>
            <div class="stat-card">
                <div class="stat-card__icon">🔥</div>
                <div class="stat-card__value">${stats.dailyStreak}</div>
                <div class="stat-card__label">Day Streak</div>
            </div>
            <div class="stat-card">
                <div class="stat-card__icon">💯</div>
                <div class="stat-card__value">${passRate}%</div>
                <div class="stat-card__label">Quiz Pass Rate</div>
            </div>
        `;
    }
}

function updateLearningPaths() {
    const paths = window.owaspGamification.getLearningPaths();
    const pathsGrid = document.getElementById('paths-grid');

    if (!pathsGrid) return;

    pathsGrid.innerHTML = paths.map(path => `
        <div class="path-card ${path.completed ? 'completed' : ''}"
             style="--path-color: ${path.color}"
             data-difficulty="${path.difficulty}"
             data-role="${path.role}">
            <div class="path-card__header">
                <div class="path-card__icon">${path.icon}</div>
                <div>
                    <h3 class="path-card__title">${path.title}</h3>
                    <div class="path-card__meta">
                        <span class="path-card__difficulty ${path.difficulty}">
                            ${path.difficulty}
                        </span>
                        <span>⏱️ ${path.estimatedHours}h</span>
                        <span>📖 ${path.modules.length} modules</span>
                    </div>
                </div>
            </div>
            <p class="path-card__description">${path.description}</p>
            <div class="path-card__modules">
                ${path.completedModules} / ${path.modules.length} modules completed
            </div>
            <div class="path-card__progress">
                <div class="progress-bar">
                    <div class="progress-bar__fill" style="width: ${path.progress}%">
                        <div class="progress-bar__label">${Math.round(path.progress)}%</div>
                    </div>
                </div>
            </div>
            <button class="path-card__button ${path.completed ? 'completed' : ''}"
                    onclick="startPath('${path.id}')">
                ${path.completed ? '✅ Completed - Review' : path.progress > 0 ? '▶️ Continue' : '🚀 Start Path'}
            </button>
        </div>
    `).join('');
}

function updateAchievements() {
    const achievements = window.owaspGamification.getAchievements();
    const achievementsGrid = document.getElementById('achievements-grid');

    if (!achievementsGrid) return;

    // Sort: unlocked first, then by tier
    const sorted = [...achievements].sort((a, b) => {
        if (a.unlocked !== b.unlocked) return b.unlocked - a.unlocked;
        const tierOrder = { platinum: 4, gold: 3, silver: 2, bronze: 1 };
        return tierOrder[b.tier] - tierOrder[a.tier];
    });

    achievementsGrid.innerHTML = sorted.map(achievement => `
        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}"
             style="--tier-color: ${getTierColor(achievement.tier)}">
            <div class="achievement-card__tier" style="background: ${getTierColor(achievement.tier)}">
                ${achievement.tier.charAt(0).toUpperCase()}
            </div>
            <div class="achievement-card__icon">${achievement.icon}</div>
            <h4 class="achievement-card__title">${achievement.title}</h4>
            <p class="achievement-card__description">${achievement.description}</p>
            <div class="achievement-card__xp">+${achievement.xp} XP</div>
            ${!achievement.unlocked && achievement.progress > 0 ? `
                <div class="achievement-card__progress">
                    <div class="progress-bar">
                        <div class="progress-bar__fill" style="width: ${achievement.progress}%">
                            <div class="progress-bar__label">${achievement.progress}%</div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function getTierColor(tier) {
    const colors = {
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#FFD700',
        platinum: '#E5E4E2'
    };
    return colors[tier] || colors.bronze;
}

function startPath(pathId) {
    alert(`Path system will navigate to detailed path view for: ${pathId}\n\nIn production, this would open a detailed page showing all modules, quizzes, and content for the path.`);
    // In production: window.location.href = `/learning-paths/${pathId}/`;
}

function showAchievementToast(achievement) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div class="achievement-toast__header">
            <span class="achievement-toast__icon">${achievement.icon}</span>
            <div>
                <div class="achievement-toast__title">🎉 Achievement Unlocked!</div>
                <div class="achievement-toast__description">${achievement.title}</div>
            </div>
        </div>
        <p class="achievement-toast__description">${achievement.description}</p>
        <div class="achievement-toast__xp">+${achievement.xp} XP</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function showLevelUpToast(data) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.style.background = 'linear-gradient(135deg, #FFD700, #FF9800)';
    toast.innerHTML = `
        <div class="achievement-toast__header">
            <span class="achievement-toast__icon">${data.levelInfo.icon}</span>
            <div>
                <div class="achievement-toast__title">⬆️ Level Up!</div>
                <div class="achievement-toast__description">Level ${data.level}: ${data.levelInfo.title}</div>
            </div>
        </div>
        <p class="achievement-toast__description">You've reached a new level!</p>
        <div class="achievement-toast__xp">Total XP: ${data.xp}</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function showXPNotification(data) {
    // Subtle XP notification (could be enhanced with a small floating +XP indicator)
    console.log(`+${data.amount} XP: ${data.reason}`);
}

// Filtering
document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        const filter = button.dataset.filter;
        const cards = document.querySelectorAll('.path-card');

        cards.forEach(card => {
            if (filter === 'all') {
                card.style.display = '';
            } else {
                const matchesDifficulty = card.dataset.difficulty === filter;
                const matchesRole = card.dataset.role === filter || card.dataset.role === 'all';
                card.style.display = (matchesDifficulty || matchesRole) ? '' : 'none';
            }
        });
    });
});

// Progress management
function exportProgress() {
    const data = window.owaspGamification.exportProgress();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owasp-ai-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importProgress() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (window.owaspGamification.importProgress(data)) {
                    alert('Progress imported successfully!');
                    window.location.reload();
                } else {
                    alert('Invalid progress file format.');
                }
            } catch (error) {
                alert('Error importing progress: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function resetProgress() {
    window.owaspGamification.resetProgress();
}

// Demo mode - uncomment to test with sample data
// window.addEventListener('load', () => {
//     setTimeout(() => {
//         window.owaspGamification.completeModule('ai-security-fundamentals', 'intro-ai-security', 1800);
//         window.owaspGamification.completeQuiz('intro-quiz', 100, true, 300);
//         window.owaspGamification.trackThreatModel();
//     }, 1000);
// });
</script>

---

## 🎯 How It Works

### Learning Paths
Choose from **6 comprehensive learning paths** designed for different roles:
- **AI Security Fundamentals** - Perfect for beginners
- **Prompt Injection Mastery** - Deep dive into injection attacks
- **ML Engineer Security Track** - For ML practitioners
- **AppSec for AI Applications** - Security engineer focus
- **AI Security Governance** - For managers and leaders
- **Advanced AI Attack Techniques** - Expert-level content

### XP & Levels
- Complete modules to earn **XP (Experience Points)**
- Pass quizzes for bonus XP
- Level up from **Novice** to **Legend** (11 levels)
- Track your progress in real-time

### Achievements
Unlock **33 unique achievements** across 6 categories:
- **Progression** - Complete paths and modules
- **Knowledge** - Master quizzes
- **Specialization** - Expert in specific areas
- **Practical** - Use the threat modeler
- **Engagement** - Build learning streaks
- **Exploration** - Discover all content

### Quizzes
- Interactive quizzes for each module
- Passing score: 70-80% depending on difficulty
- Instant feedback and explanations
- Track your quiz streak

---

## 💡 Tips for Success

1. **Start with Fundamentals** - Build a strong foundation
2. **Maintain Your Streak** - Daily learning builds expertise
3. **Explore Different Paths** - Unlock multi-role achievements
4. **Use the Threat Modeler** - Practice what you learn
5. **Share Your Progress** - Earn social achievements

---

## 🔗 Integration with OWASP AI Content

All learning paths are built on the comprehensive [OWASP AI Security and Privacy Guide](/docs/) content, ensuring you're learning from authoritative sources.

Ready to start your AI security journey? Choose a path above!
