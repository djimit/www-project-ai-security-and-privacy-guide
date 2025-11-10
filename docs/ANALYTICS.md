# Advanced Analytics Guide

Comprehensive documentation for the OWASP AI Security Exchange **Advanced Analytics System** featuring learning insights, pattern detection, and AI-powered personalized recommendations.

## 🎯 Overview

The Analytics Engine tracks learning behavior, generates actionable insights, and provides intelligent recommendations to optimize your learning journey.

### Key Features

- **📊 Learning Analytics** - Track sessions, time spent, modules completed
- **🧠 Intelligent Insights** - Pattern detection and learning style analysis
- **🎯 AI-Powered Recommendations** - Personalized suggestions based on your behavior
- **📈 Progress Tracking** - Detailed progress metrics and predictions
- **🔮 Predictive Analytics** - Estimate completion times and identify trends
- **⚡ Performance Metrics** - Quiz scores, consistency, and optimization
- **🕐 Timing Analysis** - Find your optimal learning time
- **💪 Strength/Gap Detection** - Identify what you know and what to improve

---

## 📁 File Structure

```
content/ai_exchange/
├── static/
│   ├── js/
│   │   └── analytics.js           # Analytics engine (700+ lines)
│   └── css/
│       └── analytics.css           # Dashboard styles (600+ lines)
└── docs/
    └── ANALYTICS.md                # This file
```

---

## 🚀 Quick Start

### Basic Usage

```html
<!-- Include analytics library -->
<script src="/js/analytics.js"></script>
<link rel="stylesheet" href="/css/analytics.css">

<script>
  // Analytics automatically initializes
  // Access global instance
  const analytics = window.analytics;

  // Track events
  analytics.trackModuleVisit('prompt-injection', 'Prompt Injection Basics');
  analytics.trackModuleCompletion('prompt-injection', 'Prompt Injection Basics', 95);
  analytics.trackQuizResult('quiz-1', 'Prompt Injection Quiz', 85, true, 10);
  analytics.trackXPGain(50, 'Module completion');

  // Generate insights
  const insights = analytics.generateInsights();
  const recommendations = analytics.generateRecommendations();

  // Get summary
  const summary = analytics.getSummary();
  console.log(summary);
</script>
```

---

## 📊 Data Tracking

### Session Tracking

Sessions are automatically tracked:

```javascript
// Session starts automatically on page load
// Session ends automatically on page unload

// Manually end session if needed
analytics.endSession();

// Current session data
console.log(analytics.data.currentSession);
// {
//   id: "1234567890-abc123",
//   startTime: 1704900000000,
//   endTime: null,
//   duration: 0,
//   events: [],
//   modulesVisited: [],
//   quizzesTaken: [],
//   xpEarned: 0,
//   deviceType: "desktop",
//   language: "en"
// }
```

### Event Tracking

Track learning events:

```javascript
// Generic event tracking
analytics.trackEvent('custom_event', { key: 'value' });

// Module visit
analytics.trackModuleVisit('module-id', 'Module Name');

// Module completion
analytics.trackModuleCompletion('module-id', 'Module Name', score);

// Quiz result
analytics.trackQuizResult(
  'quiz-id',
  'Quiz Name',
  85,        // score percentage
  true,      // passed
  10         // total questions
);

// XP gain
analytics.trackXPGain(50, 'Completed quiz');

// Page visibility
// Automatically tracked when tab is hidden/visible
```

### Data Structure

```javascript
{
  sessions: [
    {
      id: string,
      startTime: number,
      endTime: number,
      duration: number,
      events: Array,
      modulesVisited: Array<string>,
      quizzesTaken: Array<string>,
      xpEarned: number,
      deviceType: 'desktop' | 'mobile' | 'tablet',
      language: string
    }
  ],
  learningEvents: [
    {
      id: string,
      type: string,
      timestamp: number,
      data: object,
      sessionId: string
    }
  ],
  quizResults: [
    {
      id: string,
      quizId: string,
      quizName: string,
      score: number,
      passed: boolean,
      totalQuestions: number,
      timestamp: number,
      sessionId: string
    }
  ],
  moduleProgress: {
    [moduleId]: {
      completed: boolean,
      attempts: number,
      bestScore: number,
      completionDates: Array<number>
    }
  },
  timeSpent: {
    [moduleId]: {
      total: number,
      sessions: number
    }
  },
  streakData: {
    currentStreak: number,
    longestStreak: number,
    totalDays: number
  },
  preferences: {
    learningStyle: string | null,
    preferredTime: string | null,
    averageSessionLength: number
  },
  insights: Array<Insight>,
  recommendations: Array<Recommendation>
}
```

---

## 🧠 Learning Insights

### Types of Insights

#### 1. Learning Pace

Measures modules completed per week:

```javascript
{
  type: 'pace',
  title: 'Learning Pace',
  description: 'Fast learner! You\'re completing 3+ modules per week.',
  value: '3.2',
  trend: 'up',  // 'up', 'down', or 'stable'
  icon: '⚡',
  priority: 'high'
}
```

**Thresholds:**
- **Fast**: ≥3 modules/week
- **Steady**: 1.5-3 modules/week
- **Slow**: <1.5 modules/week

#### 2. Optimal Learning Time

Analyzes quiz performance by time of day:

```javascript
{
  type: 'timing',
  title: 'Best Learning Time',
  description: 'Your performance is best during Morning (5am-12pm)',
  value: 'Morning (5am-12pm)',
  icon: '🕐',
  priority: 'medium'
}
```

**Time Slots:**
- Morning: 5am-12pm
- Afternoon: 12pm-5pm
- Evening: 5pm-10pm
- Night: 10pm-5am

#### 3. Learning Style

Detects your preferred learning approach:

```javascript
{
  type: 'style',
  title: 'Learning Style',
  description: 'You learn best by testing your knowledge frequently.',
  value: 'Test-Oriented',
  icon: '🎯',
  priority: 'medium'
}
```

**Styles:**
- **Test-Oriented**: >40% quiz activities
- **Hands-On**: >30% practical activities (threat modeling)
- **Theoretical**: Primarily reading and module visits

#### 4. Strength Areas

Identifies topics you excel at:

```javascript
{
  type: 'strengths',
  title: 'Strong Areas',
  description: 'Prompt Injection, Model Security',
  value: 2,
  icon: '💪',
  priority: 'medium'
}
```

**Criteria:** Topics with ≥80% average quiz score

#### 5. Knowledge Gaps

Identifies topics needing improvement:

```javascript
{
  type: 'gaps',
  title: 'Areas to Improve',
  description: 'Data Privacy, Adversarial Attacks',
  value: 2,
  icon: '📚',
  priority: 'high'
}
```

**Criteria:** Topics with <70% average score or multiple failures

#### 6. Learning Consistency

Measures how regularly you study:

```javascript
{
  type: 'consistency',
  title: 'Learning Consistency',
  description: 'Excellent! You\'re learning almost every day.',
  value: '85',  // percentage
  trend: 'up',
  icon: '📈',
  priority: 'medium'
}
```

**Levels:**
- **High**: ≥80% of days
- **Medium**: 50-80% of days
- **Low**: <50% of days

#### 7. Completion Prediction

Estimates when you'll finish all modules:

```javascript
{
  type: 'prediction',
  title: 'Completion Estimate',
  description: 'At your current pace, you\'ll complete all modules in 45 days (March 15, 2025).',
  value: 45,  // days remaining
  icon: '🔮',
  priority: 'low'
}
```

### Generating Insights

```javascript
// Generate all insights
const insights = analytics.generateInsights();

// Access specific insight
const paceInsight = insights.find(i => i.type === 'pace');

// Filter by priority
const highPriority = insights.filter(i => i.priority === 'high');

// Stored in analytics data
console.log(analytics.data.insights);
```

---

## 🎯 AI-Powered Recommendations

### Types of Recommendations

#### 1. Topic Review

Recommends reviewing weak areas:

```javascript
{
  type: 'gap',
  title: 'Review Topic',
  description: 'Review Data Privacy - your average score is 62%',
  action: 'review',
  target: 'Data Privacy',
  priority: 'high',
  icon: '📖'
}
```

#### 2. Next Module

Suggests next learning step:

```javascript
{
  type: 'progression',
  title: 'Continue Learning',
  description: 'Try: Advanced Prompt Injection',
  action: 'start',
  target: 'Advanced Prompt Injection',
  priority: 'medium',
  icon: '🎯'
}
```

#### 3. Optimal Study Time

Recommends when to study:

```javascript
{
  type: 'timing',
  title: 'Study Schedule',
  description: 'Your performance is best during Morning (5am-12pm)',
  action: 'schedule',
  target: 'Morning (5am-12pm)',
  priority: 'low',
  icon: '⏰'
}
```

#### 4. More Practice

Suggests hands-on activities:

```javascript
{
  type: 'practice',
  title: 'More Practice',
  description: 'Try the Threat Modeler or take quizzes to reinforce learning',
  action: 'practice',
  target: 'threat-modeler',
  priority: 'medium',
  icon: '🛠️'
}
```

#### 5. Maintain Streak

Motivates streak continuation:

```javascript
{
  type: 'streak',
  title: 'Keep Your Streak!',
  description: 'You\'re on a 7 day streak! Don\'t break it.',
  action: 'continue',
  target: 'daily-learning',
  priority: 'high',
  icon: '🔥'
}
```

### Generating Recommendations

```javascript
// Generate recommendations
const recommendations = analytics.generateRecommendations();

// Filter by priority
const urgent = recommendations.filter(r => r.priority === 'high');

// Filter by type
const reviews = recommendations.filter(r => r.type === 'gap');

// Stored in analytics data
console.log(analytics.data.recommendations);
```

---

## 📈 Analytics API Reference

### AnalyticsEngine Class

```javascript
const analytics = new AnalyticsEngine();
```

#### Methods

##### `trackEvent(type, data)`

Track generic learning event.

```javascript
analytics.trackEvent('custom_action', {
  action: 'downloaded_resource',
  resourceId: 'whitepaper-1'
});
```

**Parameters:**
- `type` (string): Event type
- `data` (object): Event data

---

##### `trackModuleVisit(moduleId, moduleName)`

Track module page visit.

```javascript
analytics.trackModuleVisit('prompt-injection', 'Prompt Injection Basics');
```

**Parameters:**
- `moduleId` (string): Unique module identifier
- `moduleName` (string): Display name

---

##### `trackModuleCompletion(moduleId, moduleName, score)`

Track module completion.

```javascript
analytics.trackModuleCompletion('prompt-injection', 'Prompt Injection Basics', 95);
```

**Parameters:**
- `moduleId` (string): Module identifier
- `moduleName` (string): Display name
- `score` (number, optional): Completion score (0-100)

---

##### `trackQuizResult(quizId, quizName, score, passed, totalQuestions)`

Track quiz completion.

```javascript
analytics.trackQuizResult('quiz-1', 'Prompt Injection Quiz', 85, true, 10);
```

**Parameters:**
- `quizId` (string): Quiz identifier
- `quizName` (string): Quiz display name
- `score` (number): Score percentage (0-100)
- `passed` (boolean): Whether quiz was passed
- `totalQuestions` (number): Total number of questions

---

##### `trackXPGain(amount, reason)`

Track XP gained.

```javascript
analytics.trackXPGain(50, 'Completed module');
```

**Parameters:**
- `amount` (number): XP amount
- `reason` (string): Reason for XP gain

---

##### `generateInsights()`

Generate learning insights.

```javascript
const insights = analytics.generateInsights();
// Returns: Array<Insight>
```

**Returns:** Array of insight objects

**Minimum Data Required:**
- At least 3 sessions
- At least 2 completed modules for pace insights
- At least 5 quiz results for timing insights

---

##### `generateRecommendations()`

Generate personalized recommendations.

```javascript
const recommendations = analytics.generateRecommendations();
// Returns: Array<Recommendation>
```

**Returns:** Array of recommendation objects

---

##### `getSummary()`

Get analytics summary.

```javascript
const summary = analytics.getSummary();
```

**Returns:**
```javascript
{
  totalSessions: number,
  totalTimeSpent: number,  // milliseconds
  modulesCompleted: number,
  quizzesTaken: number,
  averageQuizScore: number,
  currentStreak: number,
  longestStreak: number,
  insights: Array<Insight>,
  recommendations: Array<Recommendation>
}
```

---

##### `startSession()`

Start new learning session (automatic).

```javascript
analytics.startSession();
```

---

##### `endSession()`

End current session (automatic on unload).

```javascript
analytics.endSession();
```

---

##### `exportData()`

Export analytics data.

```javascript
const data = analytics.exportData();
// Returns all analytics data as JSON

// Download as file
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'analytics-export.json';
a.click();
```

---

##### `resetData()`

Reset all analytics data (with confirmation).

```javascript
analytics.resetData();
// Prompts user for confirmation
```

---

## 🎨 Dashboard UI

### Basic Dashboard

```html
<div class="analytics-dashboard">
  <!-- Header -->
  <div class="analytics-header">
    <h1 class="analytics-title">Learning Analytics</h1>
    <p class="analytics-subtitle">Track your progress and get personalized insights</p>
  </div>

  <!-- Summary Cards -->
  <div class="analytics-grid analytics-grid-4">
    <div class="analytics-card">
      <div class="analytics-card-header">
        <span class="analytics-card-title">
          <span class="analytics-card-icon">📚</span>
          Modules Completed
        </span>
      </div>
      <div class="analytics-card-value" id="modules-completed">0</div>
      <div class="analytics-card-label">out of 24 total</div>
    </div>

    <div class="analytics-card">
      <div class="analytics-card-header">
        <span class="analytics-card-title">
          <span class="analytics-card-icon">📝</span>
          Average Score
        </span>
      </div>
      <div class="analytics-card-value" id="avg-score">0%</div>
      <div class="analytics-card-label">across all quizzes</div>
    </div>

    <div class="analytics-card">
      <div class="analytics-card-header">
        <span class="analytics-card-title">
          <span class="analytics-card-icon">🔥</span>
          Current Streak
        </span>
        <span class="analytics-card-trend up">+2</span>
      </div>
      <div class="analytics-card-value" id="current-streak">0</div>
      <div class="analytics-card-label">days in a row</div>
    </div>

    <div class="analytics-card">
      <div class="analytics-card-header">
        <span class="analytics-card-title">
          <span class="analytics-card-icon">⏱️</span>
          Time Spent
        </span>
      </div>
      <div class="analytics-card-value" id="time-spent">0h</div>
      <div class="analytics-card-label">total learning time</div>
    </div>
  </div>

  <!-- Insights -->
  <div class="insights-section">
    <h2>Insights</h2>
    <div class="insights-grid" id="insights-container">
      <!-- Insights dynamically inserted -->
    </div>
  </div>

  <!-- Recommendations -->
  <div class="recommendations-section">
    <h2>Recommendations</h2>
    <div class="recommendations-list" id="recommendations-container">
      <!-- Recommendations dynamically inserted -->
    </div>
  </div>
</div>

<script>
  // Populate dashboard
  function updateDashboard() {
    const summary = analytics.getSummary();

    // Update cards
    document.getElementById('modules-completed').textContent = summary.modulesCompleted;
    document.getElementById('avg-score').textContent = summary.averageQuizScore.toFixed(0) + '%';
    document.getElementById('current-streak').textContent = summary.currentStreak;
    document.getElementById('time-spent').textContent =
      (summary.totalTimeSpent / 1000 / 60 / 60).toFixed(1) + 'h';

    // Render insights
    const insightsContainer = document.getElementById('insights-container');
    insightsContainer.innerHTML = summary.insights.map(insight => `
      <div class="insight-card priority-${insight.priority}">
        <div class="insight-icon">${insight.icon}</div>
        <div class="insight-title">${insight.title}</div>
        <div class="insight-description">${insight.description}</div>
        ${insight.value ? `<div class="insight-value">${insight.value}</div>` : ''}
      </div>
    `).join('');

    // Render recommendations
    const recsContainer = document.getElementById('recommendations-container');
    recsContainer.innerHTML = summary.recommendations.map(rec => `
      <div class="recommendation-card">
        <div class="recommendation-icon">${rec.icon}</div>
        <div class="recommendation-content">
          <div class="recommendation-title">${rec.title}</div>
          <div class="recommendation-description">${rec.description}</div>
        </div>
        <div class="recommendation-action">
          <button class="recommendation-button">Take Action</button>
        </div>
      </div>
    `).join('');
  }

  // Update on page load
  updateDashboard();
</script>
```

---

## 🔌 Integration Examples

### Gamification Integration

```javascript
class GamificationEngine {
  constructor() {
    this.analytics = window.analytics;
  }

  addXP(amount, reason) {
    this.data.xp += amount;

    // Track in analytics
    this.analytics.trackXPGain(amount, reason);

    this.checkLevelUp();
    this.saveData();
  }

  completeModule(moduleId, moduleName) {
    this.data.modulesCompleted.push(moduleId);

    // Track in analytics
    this.analytics.trackModuleCompletion(moduleId, moduleName);

    this.addXP(100, 'Module completion');
  }

  submitQuiz(quizId, quizName, score, passed, totalQuestions) {
    // Track in analytics
    this.analytics.trackQuizResult(quizId, quizName, score, passed, totalQuestions);

    if (passed) {
      this.addXP(50, 'Quiz passed');
    }
  }
}
```

### Learning Paths Integration

```javascript
class LearningPathManager {
  constructor() {
    this.analytics = window.analytics;
  }

  visitModule(moduleId, moduleName) {
    // Track visit
    this.analytics.trackModuleVisit(moduleId, moduleName);

    // Show personalized recommendations
    const recommendations = this.analytics.generateRecommendations();
    const nextModule = recommendations.find(r => r.type === 'progression');

    if (nextModule) {
      this.showRecommendation(nextModule);
    }
  }

  showProgressInsights() {
    const insights = this.analytics.generateInsights();

    // Show pace insight
    const pace = insights.find(i => i.type === 'pace');
    if (pace) {
      this.displayInsight(pace);
    }

    // Show prediction
    const prediction = insights.find(i => i.type === 'prediction');
    if (prediction) {
      this.displayPrediction(prediction);
    }
  }
}
```

### Accessibility Integration

```javascript
// Announce insights to screen readers
const insights = analytics.generateInsights();
insights.forEach(insight => {
  if (insight.priority === 'high') {
    window.a11y?.announce(
      `${insight.title}: ${insight.description}`,
      true  // assertive
    );
  }
});

// Translate analytics messages
const summary = analytics.getSummary();
const message = i18n.t('analytics.summary', {
  modules: summary.modulesCompleted,
  score: summary.averageQuizScore.toFixed(0)
});
```

---

## 📊 Data Privacy

### Client-Side Storage

All analytics data is stored locally in the browser:

- **Storage**: localStorage
- **Key**: `analytics_data`
- **Size**: ~100KB typical
- **Retention**: Last 100 sessions, last 1000 events
- **Privacy**: 100% client-side, no server tracking

### Data Control

```javascript
// Export your data
const data = analytics.exportData();

// Reset/delete all data
analytics.resetData();

// Disable tracking
analytics.config.trackingEnabled = false;

// Disable insights
analytics.config.insightsEnabled = false;

// Disable recommendations
analytics.config.recommendationsEnabled = false;
```

---

## 🧪 Testing

### Manual Testing

```javascript
// Generate test data
function generateTestData() {
  // Track 10 sessions
  for (let i = 0; i < 10; i++) {
    analytics.startSession();

    // Visit modules
    analytics.trackModuleVisit('module-1', 'Module 1');
    analytics.trackModuleVisit('module-2', 'Module 2');

    // Complete modules
    analytics.trackModuleCompletion('module-1', 'Module 1', 90);

    // Take quizzes
    analytics.trackQuizResult('quiz-1', 'Quiz 1', 85, true, 10);
    analytics.trackQuizResult('quiz-2', 'Quiz 2', 92, true, 10);

    // Gain XP
    analytics.trackXPGain(150, 'Test data');

    analytics.endSession();
  }

  // Generate insights
  analytics.generateInsights();
  analytics.generateRecommendations();

  console.log('Test data generated!');
  console.log(analytics.getSummary());
}

generateTestData();
```

### Automated Testing

```javascript
describe('AnalyticsEngine', () => {
  let analytics;

  beforeEach(() => {
    localStorage.clear();
    analytics = new AnalyticsEngine();
  });

  test('should track session', () => {
    analytics.startSession();
    expect(analytics.data.currentSession).not.toBeNull();
    expect(analytics.data.currentSession.startTime).toBeDefined();
  });

  test('should track module completion', () => {
    analytics.trackModuleCompletion('test-module', 'Test Module', 85);
    expect(analytics.data.moduleProgress['test-module'].completed).toBe(true);
    expect(analytics.data.moduleProgress['test-module'].bestScore).toBe(85);
  });

  test('should generate insights with enough data', () => {
    // Add test data
    for (let i = 0; i < 5; i++) {
      analytics.trackModuleCompletion(`module-${i}`, `Module ${i}`, 80);
      analytics.trackQuizResult(`quiz-${i}`, `Quiz ${i}`, 85, true, 10);
    }

    const insights = analytics.generateInsights();
    expect(insights.length).toBeGreaterThan(0);
  });

  test('should calculate learning pace', () => {
    // Add completions over time
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    analytics.data.moduleProgress['module-1'] = {
      completed: true,
      attempts: 1,
      bestScore: 85,
      completionDates: [oneWeekAgo]
    };
    analytics.data.moduleProgress['module-2'] = {
      completed: true,
      attempts: 1,
      bestScore: 90,
      completionDates: [Date.now()]
    };

    const pace = analytics.calculateLearningPace();
    expect(pace).not.toBeNull();
    expect(pace.value).toBeDefined();
  });
});
```

---

## 🚀 Best Practices

### 1. Track Early, Track Often

```javascript
// Track page visits
analytics.trackModuleVisit(moduleId, moduleName);

// Track all learning activities
analytics.trackQuizResult(quizId, name, score, passed, total);
analytics.trackModuleCompletion(moduleId, name, score);
analytics.trackXPGain(amount, reason);
```

### 2. Generate Insights Regularly

```javascript
// On dashboard load
const insights = analytics.generateInsights();
const recommendations = analytics.generateRecommendations();

// Update when significant actions occur
function onModuleComplete() {
  analytics.trackModuleCompletion(id, name);

  // Regenerate insights
  setTimeout(() => {
    analytics.generateInsights();
    analytics.generateRecommendations();
    updateDashboard();
  }, 1000);
}
```

### 3. Respect Privacy

```javascript
// Allow users to disable tracking
if (userPreferences.analyticsEnabled) {
  analytics.config.trackingEnabled = true;
} else {
  analytics.config.trackingEnabled = false;
}

// Provide data export
function exportMyData() {
  const data = analytics.exportData();
  downloadJSON(data, 'my-analytics.json');
}
```

### 4. Provide Context

```javascript
// Don't just show numbers
// BAD:
"85%"

// GOOD:
"Your average quiz score is 85%, which is excellent! You're in the top 20% of learners."

// Use insights and recommendations
const insights = analytics.generateInsights();
insights.forEach(insight => {
  showContextualMessage(insight.title, insight.description);
});
```

### 5. Act on Insights

```javascript
// Use recommendations to guide users
const recommendations = analytics.generateRecommendations();

// Show high-priority recommendations prominently
const urgent = recommendations.filter(r => r.priority === 'high');
if (urgent.length > 0) {
  showNotification(urgent[0].title, urgent[0].description);
}

// Auto-suggest next module
const nextModule = recommendations.find(r => r.type === 'progression');
if (nextModule) {
  highlightModule(nextModule.target);
}
```

---

## 📈 Metrics Reference

| Metric | Description | Good Value |
|--------|-------------|------------|
| **Learning Pace** | Modules per week | ≥2 |
| **Quiz Average** | Average quiz score | ≥80% |
| **Consistency** | % of days with activity | ≥50% |
| **Current Streak** | Consecutive learning days | ≥7 |
| **Session Length** | Average session duration | 20-45 min |
| **Completion Rate** | % of started modules completed | ≥75% |

---

## 🔮 Future Enhancements

Planned features for future releases:

1. **Advanced Visualizations**
   - Interactive charts with Chart.js/D3.js
   - Learning heatmaps
   - Progress timelines
   - Skill radars

2. **Comparative Analytics**
   - Anonymous peer comparisons
   - Percentile rankings
   - Leaderboards (opt-in)

3. **Predictive Models**
   - ML-based completion predictions
   - Personalized learning paths
   - Adaptive difficulty

4. **Export Options**
   - PDF reports
   - CSV exports
   - Integration with learning management systems

5. **Social Features**
   - Share achievements
   - Study groups
   - Collaborative learning

6. **Advanced Insights**
   - Time-of-day performance patterns
   - Topic correlation analysis
   - Forgetting curve tracking
   - Spaced repetition suggestions

---

**Version:** 1.0
**Author:** OWASP AI Security Team
**Last Updated:** January 2025
**License:** Apache 2.0
