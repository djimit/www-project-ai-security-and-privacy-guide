# OWASP AI Security Gamification System

## Overview

The gamification system transforms the OWASP AI Security documentation into an **interactive learning platform** with structured learning paths, achievements, XP progression, and comprehensive progress tracking.

## 🎯 Key Features

### 1. Learning Paths System
- **6 Role-Based Paths**: Developer, Security Engineer, ML Engineer, Manager, and general paths
- **3 Difficulty Levels**: Beginner, Intermediate, Advanced
- **24+ Modules**: Structured learning content covering all OWASP AI Security topics
- **Progressive Learning**: Each module builds on previous knowledge

### 2. Gamification Engine
- **XP System**: Earn experience points for completing modules and quizzes
- **11 Levels**: Progress from Novice (Level 1) to Legend (Level 11)
- **33 Achievements**: Unlock badges across 6 categories
- **4 Achievement Tiers**: Bronze, Silver, Gold, Platinum

### 3. Interactive Quizzes
- **Knowledge Checks**: Multiple-choice quizzes for each module
- **Passing Scores**: 70-80% required depending on difficulty
- **Instant Feedback**: Explanations for all answers
- **Perfect Score Streaks**: Bonus XP for consecutive perfect scores

### 4. Progress Tracking
- **LocalStorage Persistence**: All progress saved in browser
- **Export/Import**: Back up and restore progress as JSON
- **Real-time Updates**: Instant UI updates on all actions
- **Comprehensive Stats**: Time spent, quizzes passed, streaks, etc.

### 5. Achievement System
Achievement categories:
- **Progression**: Complete paths and modules
- **Knowledge**: Master quizzes and maintain perfect scores
- **Specialization**: Become an expert in specific areas
- **Practical**: Create threat models and export SARIF
- **Engagement**: Build daily streaks and learning habits
- **Exploration**: Discover all documentation pages
- **Social**: Share progress and provide feedback
- **Milestones**: Reach XP thresholds

## 📁 Architecture

### File Structure
```
content/ai_exchange/
├── data/
│   ├── learning-paths.json      # Learning path definitions
│   ├── achievements.json         # Achievement definitions & levels
│   └── quizzes.json             # Quiz questions & answers
├── static/
│   ├── js/
│   │   └── gamification.js      # Core gamification engine
│   └── css/
│       └── gamification.css     # Gamification UI styles
├── content/
│   └── learning-paths.md        # Main learning paths hub page
└── layouts/
    └── partials/
        ├── progress-tracker.html     # Progress widget (optional)
        └── achievement-toast.html    # Toast notifications (optional)
```

### Core Components

#### 1. GamificationEngine Class (`gamification.js`)

**Main Class:**
```javascript
class GamificationEngine {
    constructor()           // Initialize engine and load data
    async init()           // Load JSON configs and setup

    // XP & Levels
    addXP(amount, reason)        // Award XP and check for level up
    calculateLevel(xp)           // Get level from XP amount
    getProgressToNextLevel()     // Calculate progress bar

    // Progress Tracking
    completeModule(pathId, moduleId, timeSpent)
    completeQuiz(quizId, score, perfectScore, timeSpent)
    checkPathCompletion(pathId)
    trackPageVisit(path)

    // Threat Modeler Integration
    trackThreatModel()      // Track model creation
    trackSARIFExport()      // Track SARIF export

    // Social Features
    trackSocialShare()      // Track social media shares
    trackFeedback()         // Track feedback submissions

    // Achievement System
    checkAchievement(achievementId)
    unlockAchievement(achievementId, achievement)
    getAchievementProgress(achievement)

    // Data Management
    getStats()              // Get all user statistics
    getAchievements()       // Get all achievements with progress
    getLearningPaths()      // Get all paths with completion status
    exportProgress()        // Export progress as JSON
    importProgress(data)    // Import progress from JSON
    resetProgress()         // Reset all data

    // Event System
    on(event, callback)     // Subscribe to events
    emit(event, data)       // Emit events
}
```

**Events:**
- `ready` - Engine initialized and configs loaded
- `data-updated` - Any data change (auto-save)
- `xp-gained` - XP awarded
- `level-up` - User leveled up
- `module-completed` - Module finished
- `quiz-completed` - Quiz finished
- `path-completed` - Entire path completed
- `achievement-unlocked` - Achievement earned
- `data-imported` - Progress imported
- `data-reset` - Progress reset

#### 2. Data Structures

**Learning Path:**
```json
{
  "id": "path-id",
  "title": "Path Title",
  "description": "Path description",
  "difficulty": "beginner|intermediate|advanced",
  "estimatedHours": 8,
  "role": "developer|security-engineer|ml-engineer|manager|all",
  "icon": "🎓",
  "color": "#4CAF50",
  "modules": [
    {
      "id": "module-id",
      "title": "Module Title",
      "description": "Module description",
      "estimatedMinutes": 30,
      "pages": ["/docs/page1/", "/docs/page2/"],
      "quiz": "quiz-id",
      "xp": 100
    }
  ]
}
```

**Achievement:**
```json
{
  "id": "achievement-id",
  "title": "Achievement Title",
  "description": "How to unlock this",
  "icon": "🏆",
  "xp": 100,
  "tier": "bronze|silver|gold|platinum",
  "category": "progression|knowledge|specialization|...",
  "condition": {
    "type": "modules_completed|paths_completed|quizzes_passed|...",
    "value": 5
  }
}
```

**Quiz:**
```json
{
  "quiz-id": {
    "title": "Quiz Title",
    "passingScore": 70,
    "questions": [
      {
        "id": "q1",
        "question": "Question text?",
        "type": "multiple-choice",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": 1,
        "explanation": "Why this is the correct answer..."
      }
    ]
  }
}
```

**User Data (localStorage):**
```json
{
  "xp": 1500,
  "level": 3,
  "completedModules": ["path1:module1", "path1:module2"],
  "completedPaths": ["path1"],
  "completedQuizzes": [
    {
      "quizId": "intro-quiz",
      "score": 100,
      "perfectScore": true,
      "timeSpent": 300,
      "date": "2025-01-15T10:30:00Z"
    }
  ],
  "perfectQuizzes": ["intro-quiz", "taxonomy-quiz"],
  "quizStreak": 2,
  "achievements": ["first-steps", "quiz-novice", "getting-started"],
  "pagesVisited": ["/docs/intro/", "/docs/threats/"],
  "threatModelsCreated": 3,
  "sarifExports": 1,
  "socialShares": 0,
  "feedbackGiven": 2,
  "dailyStreak": 5,
  "lastActivityDate": "2025-01-15",
  "weekendModules": 2,
  "stats": {
    "totalTimeSpent": 7200,
    "fastestModule": {"pathId": "path1", "moduleId": "module1", "time": 600},
    "longestPath": null,
    "quizzesTaken": 5,
    "quizzesPassed": 4
  }
}
```

## 🎓 Learning Paths

### Available Paths

1. **AI Security Fundamentals** (Beginner, 8h, All Roles)
   - Introduction to AI Security
   - OWASP AI Security Taxonomy
   - Common AI Threats
   - Essential Security Controls

2. **Prompt Injection Mastery** (Intermediate, 6h, Developer)
   - Direct Prompt Injection
   - Indirect Prompt Injection
   - Defense Strategies
   - Threat Modeling for Injection

3. **ML Engineer Security Track** (Intermediate, 10h, ML Engineer)
   - Secure Training Pipelines
   - Model Poisoning Prevention
   - Model Theft & Evasion
   - Secure Model Deployment

4. **AppSec for AI Applications** (Intermediate, 7h, Security Engineer)
   - AI Application Attack Surface
   - AI Input Validation
   - Output Security & Filtering
   - RAG System Security
   - AI Security Testing

5. **AI Security Governance** (Advanced, 5h, Manager)
   - AI Risk Assessment
   - AI Compliance & Regulations
   - AI Security Program Design
   - AI Incident Response

6. **Advanced AI Attack Techniques** (Advanced, 12h, Security Engineer)
   - Adversarial Machine Learning
   - Model Inversion & Extraction
   - AI Supply Chain Attacks
   - Advanced Injection Techniques

## 🏆 Achievements

### Achievement Categories

**Progression (6 achievements):**
- First Steps (1 module) - 50 XP
- Getting Started (1 path) - 200 XP
- Knowledge Seeker (3 paths) - 500 XP
- Master Learner (all paths) - 1000 XP
- Renaissance Learner (all difficulties) - 400 XP
- Multi-Role Master (3 roles) - 500 XP

**Knowledge (3 achievements):**
- Quiz Novice (1 quiz passed) - 50 XP
- Quiz Master (10 perfect scores) - 500 XP
- Perfect Streak (5 perfect in a row) - 300 XP

**Specialization (6 achievements):**
- Injection Expert (complete Prompt Injection path) - 300 XP
- ML Security Pro (complete ML Engineer path) - 400 XP
- AppSec Specialist (complete AppSec path) - 350 XP
- Governance Guru (complete Governance path) - 300 XP
- Threat Hunter (complete Advanced Attacks path) - 500 XP
- OWASP Champion (all OWASP modules) - 600 XP

**Practical (3 achievements):**
- Threat Modeler (1 threat model) - 100 XP
- Architecture Analyst (5 threat models) - 300 XP
- Security Architect (1 SARIF export) - 200 XP

**Engagement (8 achievements):**
- Early Bird (complete before 9 AM) - 50 XP
- Night Owl (complete after 10 PM) - 50 XP
- Weekend Warrior (5 weekend modules) - 100 XP
- Consistent Learner (7-day streak) - 200 XP
- Unstoppable (30-day streak) - 500 XP
- Speed Reader (module in <10 min) - 100 XP
- Thoroughness (2+ hours on path) - 150 XP

**Milestones (4 achievements):**
- XP Milestone: 1,000 - 100 XP
- XP Milestone: 5,000 - 300 XP
- XP Milestone: 10,000 - 500 XP
- Elite Status: 25,000 - 1000 XP

**Exploration & Social (3 achievements):**
- Explorer (20 pages visited) - 100 XP
- Documentation Master (50 pages) - 300 XP
- Community Contributor (social share) - 150 XP
- Feedback Provider (3 feedback) - 100 XP

## 📈 XP & Levels

### XP Awards
- **Module Completion**: 100-450 XP (varies by difficulty)
- **Quiz Pass**: 50 XP
- **Perfect Quiz**: +50 XP bonus
- **Path Completion**: 100 XP per estimated hour
- **Threat Model**: 100 XP
- **SARIF Export**: 200 XP
- **Social Share**: 150 XP
- **Feedback**: 50 XP
- **Achievements**: 50-1000 XP

### Level Progression
| Level | XP Required | Title | Icon |
|-------|-------------|-------|------|
| 1 | 0 | Novice | 🌱 |
| 2 | 500 | Learner | 📝 |
| 3 | 1,000 | Student | 🎓 |
| 4 | 2,000 | Practitioner | ⚙️ |
| 5 | 3,500 | Professional | 💼 |
| 6 | 5,500 | Expert | 🎯 |
| 7 | 8,000 | Specialist | 🔬 |
| 8 | 11,000 | Authority | 📚 |
| 9 | 15,000 | Master | 👑 |
| 10 | 20,000 | Grandmaster | 🏆 |
| 11 | 25,000 | Legend | ⭐ |

## 🔧 Integration Guide

### Basic Setup

1. **Include CSS and JS:**
```html
<link rel="stylesheet" href="/css/gamification.css">
<script src="/js/gamification.js"></script>
```

2. **Access Global Instance:**
```javascript
// Engine is automatically initialized
const gamification = window.owaspGamification;
```

3. **Subscribe to Events:**
```javascript
gamification.on('achievement-unlocked', (achievement) => {
    console.log('Unlocked:', achievement.title);
});

gamification.on('level-up', (data) => {
    console.log('New level:', data.level);
});
```

### Track Progress

**Complete a Module:**
```javascript
// Track when user finishes reading/watching a module
gamification.completeModule(
    'ai-security-fundamentals',  // pathId
    'intro-ai-security',          // moduleId
    1800                          // timeSpent in seconds
);
```

**Complete a Quiz:**
```javascript
// After user finishes quiz
gamification.completeQuiz(
    'intro-quiz',                 // quizId
    85,                           // score (0-100)
    false,                        // perfectScore
    300                           // timeSpent in seconds
);
```

**Track Threat Modeling:**
```javascript
// In threat modeler save functionality
gamification.trackThreatModel();
gamification.trackSARIFExport();  // When exporting SARIF
```

**Track Page Visits:**
```javascript
// Automatically tracked, but can be called manually
gamification.trackPageVisit(window.location.pathname);
```

### Display User Stats

```javascript
const stats = gamification.getStats();

console.log('Level:', stats.level);
console.log('XP:', stats.xp);
console.log('Progress to next level:', stats.nextLevel.progress + '%');
console.log('Achievements:', stats.achievementCount);
console.log('Daily streak:', stats.dailyStreak);
```

### Show Learning Paths

```javascript
const paths = gamification.getLearningPaths();

paths.forEach(path => {
    console.log(`${path.title}: ${path.progress}% complete`);
    console.log(`Completed: ${path.completed}`);
    console.log(`Modules: ${path.completedModules}/${path.modules.length}`);
});
```

### Show Achievements

```javascript
const achievements = gamification.getAchievements();

achievements.forEach(achievement => {
    if (achievement.unlocked) {
        console.log(`✅ ${achievement.title} - ${achievement.description}`);
    } else {
        console.log(`🔒 ${achievement.title} (${achievement.progress}% progress)`);
    }
});
```

## 🎨 UI Components

### Progress Bar
```html
<div class="progress-bar">
    <div class="progress-bar__fill" style="width: 65%">
        <div class="progress-bar__label">65%</div>
    </div>
</div>
```

### Level Badge
```html
<div class="level-badge">
    <span class="level-badge__icon">🎓</span>
    <div class="level-badge__info">
        <div class="level-badge__level">Level 5</div>
        <div class="level-badge__title">Professional</div>
        <div class="level-badge__xp">3,750 XP</div>
    </div>
</div>
```

### Stat Card
```html
<div class="stat-card">
    <div class="stat-card__icon">⭐</div>
    <div class="stat-card__value">3,750</div>
    <div class="stat-card__label">Total XP</div>
</div>
```

### Achievement Card
```html
<div class="achievement-card unlocked" style="--tier-color: #FFD700">
    <div class="achievement-card__tier" style="background: #FFD700">G</div>
    <div class="achievement-card__icon">🏆</div>
    <h4 class="achievement-card__title">Knowledge Seeker</h4>
    <p class="achievement-card__description">Complete 3 learning paths</p>
    <div class="achievement-card__xp">+500 XP</div>
</div>
```

## 📱 Mobile Responsive

All UI components are fully responsive:
- Grid layouts adapt to screen size
- Touch-friendly buttons and cards
- Optimized typography for mobile
- Collapsible sections on small screens

## 🔒 Privacy & Data

- **100% Client-Side**: All data stored in browser localStorage
- **No Tracking**: No analytics or external tracking
- **Export/Import**: Users own their data
- **Reset Anytime**: Complete control over progress

## 🚀 Future Enhancements

Potential additions:
1. **Leaderboards** (opt-in, privacy-conscious)
2. **Challenges** (weekly/monthly themed challenges)
3. **Certificates** (downloadable completion certificates)
4. **Custom Paths** (user-created learning sequences)
5. **Team Mode** (organizational progress tracking)
6. **API Integration** (sync with GitHub profile)
7. **Advanced Analytics** (learning patterns, recommendations)
8. **Peer Reviews** (community quiz contributions)

## 📊 Analytics & Insights

Track engagement with built-in stats:
- Total time spent learning
- Fastest module completion
- Quiz pass rate
- Daily/weekly streaks
- Most visited pages
- Preferred learning times

## 🤝 Contributing

To add new content:

**Add a Learning Path:**
1. Edit `data/learning-paths.json`
2. Define path metadata and modules
3. Link to existing documentation pages
4. Create quizzes for each module

**Add Achievements:**
1. Edit `data/achievements.json`
2. Define achievement conditions
3. Assign appropriate XP and tier
4. Update checking logic if needed

**Add Quiz Questions:**
1. Edit `data/quizzes.json`
2. Create multiple-choice questions
3. Provide clear explanations
4. Set appropriate passing scores

---

**Version:** 1.0
**Last Updated:** January 2025
**License:** Apache 2.0 (aligned with OWASP project)
