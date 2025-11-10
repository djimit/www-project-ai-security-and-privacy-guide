/**
 * Jest Test Setup
 * Configures the testing environment for OWASP AI Security tests
 */

// Import jest-dom for additional matchers
require('@testing-library/jest-dom');

// Mock localStorage
require('jest-localstorage-mock');

// Mock fetch API
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear localStorage
  localStorage.clear();

  // Reset fetch mock
  fetch.mockClear();

  // Mock successful fetch responses
  fetch.mockImplementation((url) => {
    // Mock learning paths
    if (url.includes('learning-paths.json')) {
      return Promise.resolve({
        json: () => Promise.resolve({
          paths: [
            {
              id: 'test-path',
              title: 'Test Path',
              difficulty: 'beginner',
              estimatedHours: 5,
              role: 'all',
              icon: '🎓',
              color: '#4CAF50',
              modules: [
                {
                  id: 'test-module',
                  title: 'Test Module',
                  description: 'Test module description',
                  estimatedMinutes: 30,
                  pages: ['/test/'],
                  quiz: 'test-quiz',
                  xp: 100
                }
              ]
            }
          ]
        })
      });
    }

    // Mock achievements
    if (url.includes('achievements.json')) {
      return Promise.resolve({
        json: () => Promise.resolve({
          achievements: [
            {
              id: 'test-achievement',
              title: 'Test Achievement',
              description: 'Test description',
              icon: '🏆',
              xp: 100,
              tier: 'bronze',
              category: 'test',
              condition: { type: 'modules_completed', value: 1 }
            }
          ],
          tiers: {
            bronze: { color: '#CD7F32', minAchievements: 0 },
            silver: { color: '#C0C0C0', minAchievements: 5 },
            gold: { color: '#FFD700', minAchievements: 15 },
            platinum: { color: '#E5E4E2', minAchievements: 25 }
          },
          levels: [
            { level: 1, minXP: 0, title: 'Novice', icon: '🌱' },
            { level: 2, minXP: 500, title: 'Learner', icon: '📝' },
            { level: 3, minXP: 1000, title: 'Student', icon: '🎓' }
          ]
        })
      });
    }

    // Mock quizzes
    if (url.includes('quizzes.json')) {
      return Promise.resolve({
        json: () => Promise.resolve({
          quizzes: {
            'test-quiz': {
              title: 'Test Quiz',
              passingScore: 70,
              questions: [
                {
                  id: 'q1',
                  question: 'Test question?',
                  type: 'multiple-choice',
                  options: ['A', 'B', 'C', 'D'],
                  correctAnswer: 0,
                  explanation: 'Test explanation'
                }
              ]
            }
          }
        })
      });
    }

    return Promise.reject(new Error('Not found'));
  });
});

// Mock window.location
delete window.location;
window.location = {
  pathname: '/test/',
  href: 'https://example.com/test/',
  search: '',
  hash: ''
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};

// Helper function to wait for async operations
global.waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to create mock event
global.createMockEvent = (type, properties = {}) => {
  const event = new Event(type);
  Object.assign(event, properties);
  return event;
};

// Helper to wait for condition
global.waitFor = async (callback, timeout = 1000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const result = await callback();
      if (result) return result;
    } catch (e) {
      // Continue waiting
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Timeout waiting for condition');
};
