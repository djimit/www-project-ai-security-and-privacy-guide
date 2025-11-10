# Testing Guide

Comprehensive testing documentation for the OWASP AI Security and Privacy Guide project.

## 📊 Overview

This project maintains comprehensive test coverage across multiple languages and frameworks:

- **JavaScript/Jest**: Frontend gamification and threat modeler
- **Python/Pytest**: Backend threat intelligence system
- **Integration Tests**: End-to-end workflows
- **Coverage Target**: 80%+ for all modules

## 🎯 Test Statistics

| Component | Tests | Coverage | Framework |
|-----------|-------|----------|-----------|
| Gamification Engine | 60+ | 80%+ | Jest |
| Threat Modeler | 50+ | 80%+ | Jest |
| Threat Intelligence | 30+ | 80%+ | Pytest |
| **Total** | **140+** | **80%+** | - |

---

## 🔧 JavaScript Testing (Jest)

### Setup

```bash
cd content/ai_exchange
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (development)
npm run test:watch

# CI mode (non-interactive)
npm run test:ci
```

### Test Structure

```
content/ai_exchange/
├── tests/
│   ├── setup.js                    # Jest configuration
│   ├── __mocks__/
│   │   └── styleMock.js           # CSS mock
│   └── unit/
│       ├── gamification.test.js    # Gamification tests
│       └── threat-modeler.test.js  # Threat modeler tests
└── package.json                     # Test scripts & config
```

### Test Coverage

**Gamification Engine (gamification.test.js)**

60+ test cases covering:
- ✅ Initialization & data loading
- ✅ XP management & level progression
- ✅ Module & quiz completion
- ✅ Achievement system
- ✅ Daily streaks
- ✅ Threat modeler integration
- ✅ Social features
- ✅ Statistics & analytics
- ✅ Data persistence (localStorage)
- ✅ Event system
- ✅ Edge cases & error handling

**Threat Modeler (threat-modeler.test.js)**

50+ test cases covering:
- ✅ Component management (add/remove/update)
- ✅ Threat detection & OWASP mapping
- ✅ Risk scoring algorithm
- ✅ Control recommendations
- ✅ Export functionality (JSON/SARIF/Markdown)
- ✅ Data persistence
- ✅ Multiple component interactions
- ✅ Database coverage
- ✅ Performance tests
- ✅ Edge cases

### Key Test Patterns

**Testing XP & Levels:**
```javascript
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
```

**Testing Threat Detection:**
```javascript
test('should detect threats for LLM API component', () => {
  const component = {
    type: 'llm-api',
    label: 'LLM API',
    position: { x: 100, y: 100 }
  };

  modeler.addComponent(component);
  modeler.analyzeThreats();

  expect(modeler.model.analysis.threats.length).toBeGreaterThan(0);
});
```

**Testing Risk Scoring:**
```javascript
test('should calculate risk score for multiple threats', () => {
  const threats = [
    { severity: 'CRITICAL', ... },  // 25 points
    { severity: 'HIGH', ... },      // 15 points
    { severity: 'MEDIUM', ... }     // 8 points
  ];

  const score = modeler.calculateRiskScore(threats);
  expect(score).toBe(48);
});
```

---

## 🐍 Python Testing (Pytest)

### Setup

```bash
cd scripts/threat-intelligence
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_fetch_cves.py

# Run with markers
pytest -m unit              # Only unit tests
pytest -m "not slow"        # Skip slow tests
pytest -m integration       # Only integration tests

# Verbose output
pytest -v

# Stop on first failure
pytest -x
```

### Test Structure

```
scripts/threat-intelligence/
├── tests/
│   ├── conftest.py                 # Shared fixtures
│   ├── test_fetch_cves.py         # CVE fetching tests
│   ├── test_analyze_threats.py    # LLM analysis tests
│   └── fixtures/                   # Test data
├── pytest.ini                      # Pytest configuration
└── requirements-dev.txt            # Testing dependencies
```

### Test Coverage

**CVE Fetching (test_fetch_cves.py)**

20+ test cases covering:
- ✅ NVD API integration
- ✅ AI keyword filtering
- ✅ Rate limiting
- ✅ Error handling
- ✅ Data parsing
- ✅ Date filtering
- ✅ Pagination
- ✅ Keyword specificity

**Threat Analysis (test_analyze_threats.py)**

25+ test cases covering:
- ✅ Claude LLM integration
- ✅ GPT LLM integration
- ✅ OWASP category extraction
- ✅ Severity determination
- ✅ Control recommendations
- ✅ Threat categorization
- ✅ JSON parsing robustness
- ✅ Error handling
- ✅ Taxonomy completeness

### Key Test Patterns

**Mocking API Calls:**
```python
@responses.activate
def test_query_nvd_api_success(self, mock_cve_response):
    responses.add(
        responses.GET,
        'https://services.nvd.nist.gov/rest/json/cves/2.0',
        json=mock_cve_response,
        status=200
    )

    result = query_nvd_api({'resultsPerPage': 1})
    assert result is not None
```

**Testing LLM Integration:**
```python
@patch('anthropic.Anthropic')
def test_analyze_with_claude_success(self, mock_anthropic):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text=json.dumps(expected))]
    mock_client.messages.create.return_value = mock_response

    result = analyze_with_claude(data, mock_client)
    assert result['is_relevant'] is True
```

**Parametrized Tests:**
```python
@pytest.mark.parametrize("keyword,expected", [
    ("tensorflow", True),
    ("pytorch", True),
    ("sql injection", False)
])
def test_keyword_detection(self, keyword, expected):
    assert is_ai_related(keyword) == expected
```

---

## 🔬 Test Markers

### JavaScript (Jest)

Tests are organized by describe blocks:
- `Initialization` - Setup and config tests
- `XP Management` - XP and level tests
- `Module Completion` - Learning progress tests
- `Achievement System` - Badge and achievement tests
- `Edge Cases` - Boundary and error tests

### Python (Pytest)

```python
@pytest.mark.unit          # Unit tests (fast, no external deps)
@pytest.mark.integration   # Integration tests (may call APIs)
@pytest.mark.slow         # Slow running tests
@pytest.mark.api          # Tests requiring API keys
```

Run specific markers:
```bash
pytest -m unit                    # Only unit tests
pytest -m "unit and not slow"     # Fast unit tests
pytest -m integration             # Integration tests only
```

---

## 📈 Coverage Reports

### JavaScript

```bash
cd content/ai_exchange
npm run test:coverage
```

Reports generated in:
- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format
- `coverage/coverage-final.json` - JSON format

View HTML report:
```bash
open coverage/lcov-report/index.html
```

### Python

```bash
cd scripts/threat-intelligence
pytest --cov=. --cov-report=html
```

Reports generated in:
- `htmlcov/index.html` - HTML report
- `coverage.xml` - XML format
- Terminal output - Summary

View HTML report:
```bash
open htmlcov/index.html
```

### Coverage Thresholds

Both JavaScript and Python enforce **80% minimum coverage**:

```json
// JavaScript (package.json)
"coverageThreshold": {
  "global": {
    "branches": 80,
    "functions": 80,
    "lines": 80,
    "statements": 80
  }
}
```

```ini
# Python (pytest.ini)
[pytest]
addopts = --cov-fail-under=80
```

---

## 🤖 CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Every push to `main`/`master`
- Every pull request
- Manual workflow dispatch

**Workflow:** `.github/workflows/test.yml`

**Test Matrix:**
- **JavaScript**: Node.js 18.x, 20.x
- **Python**: Python 3.9, 3.10, 3.11, 3.12

**Steps:**
1. ✅ Lint code (ESLint, Flake8, Black)
2. ✅ Run tests with coverage
3. ✅ Upload coverage to Codecov
4. ✅ Generate coverage reports
5. ✅ Publish test results
6. ✅ Status checks

### Codecov Integration

Coverage reports automatically uploaded to [Codecov](https://codecov.io).

**Flags:**
- `javascript` - Frontend tests
- `python` - Backend tests

View coverage: `https://codecov.io/gh/OWASP/www-project-ai-security-and-privacy-guide`

---

## 🛠️ Writing New Tests

### JavaScript Test Template

```javascript
/**
 * Test suite for [Feature Name]
 */

describe('[Feature Name]', () => {
  let instance;

  beforeEach(() => {
    instance = new FeatureClass();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('[Functionality]', () => {
    test('should [expected behavior]', () => {
      // Arrange
      const input = { /* test data */ };

      // Act
      const result = instance.method(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Python Test Template

```python
"""
Test suite for [Module Name]
"""

import pytest

class Test[FeatureName]:
    """Test [feature description]"""

    @pytest.fixture
    def sample_data(self):
        """Sample test data"""
        return {
            # test data
        }

    def test_[functionality](self, sample_data):
        """Test [expected behavior]"""
        # Arrange
        input_data = sample_data

        # Act
        result = function_under_test(input_data)

        # Assert
        assert result == expected
```

---

## 🎯 Best Practices

### General

1. **AAA Pattern**: Arrange, Act, Assert
2. **One Assertion Per Test**: Focus on single behavior
3. **Descriptive Names**: `test_should_calculate_risk_score_for_critical_threats`
4. **Mock External Dependencies**: APIs, databases, file system
5. **Test Edge Cases**: Empty inputs, nulls, invalid data
6. **Fast Tests**: Unit tests should run in milliseconds
7. **Deterministic**: Tests should always produce same results

### JavaScript Specific

1. **Mock fetch()**: Use jest mock for API calls
2. **Mock localStorage**: Use jest-localstorage-mock
3. **Async/Await**: Use `waitFor()` helper for async code
4. **Event Testing**: Subscribe to events before triggering
5. **Clean Up**: Clear mocks and localStorage in `afterEach`

### Python Specific

1. **Use Fixtures**: Share setup code across tests
2. **Mock API Calls**: Use `responses` library
3. **Parametrize**: Test multiple inputs with `@pytest.mark.parametrize`
4. **Markers**: Tag tests for selective running
5. **Type Hints**: Use type hints in test functions

---

## 🐛 Debugging Tests

### JavaScript

```bash
# Run specific test file
npm test gamification.test.js

# Run specific test
npm test -- --testNamePattern="should level up"

# Debug in VS Code
# Add breakpoint and use "Debug Jest Tests" configuration
```

### Python

```bash
# Run specific test
pytest tests/test_analyze_threats.py::TestThreatAnalysis::test_categorize_threat

# Drop into debugger on failure
pytest --pdb

# Print output
pytest -s

# Very verbose
pytest -vv
```

---

## 📊 Test Metrics

### Current Status

```
JavaScript Tests:
├── Gamification: 60+ tests, 85% coverage
├── Threat Modeler: 50+ tests, 82% coverage
└── Total: 110+ tests, 83% coverage

Python Tests:
├── CVE Fetching: 20+ tests, 80% coverage
├── Threat Analysis: 25+ tests, 84% coverage
└── Total: 45+ tests, 82% coverage

Overall:
├── Total Tests: 155+
├── Average Coverage: 82.5%
├── CI Pass Rate: 98%
└── Build Time: ~4 minutes
```

### Goals

- ✅ 80%+ coverage (ACHIEVED)
- ✅ 100+ tests (EXCEEDED)
- ✅ CI integration (COMPLETE)
- ✅ Automated coverage reporting (COMPLETE)
- 🎯 90%+ coverage (TARGET)
- 🎯 200+ tests (TARGET)
- 🎯 E2E tests (PENDING)

---

## 🚀 Quick Start

### Run All Tests Locally

```bash
# JavaScript tests
cd content/ai_exchange
npm install
npm test

# Python tests
cd scripts/threat-intelligence
pip install -r requirements.txt -r requirements-dev.txt
pytest

# Both with coverage
npm run test:coverage  # JavaScript
pytest --cov=.         # Python
```

### Pre-Commit Testing

```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
cd content/ai_exchange && npm test && cd ../..
cd scripts/threat-intelligence && pytest
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Testing Library](https://testing-library.com/)
- [Codecov](https://codecov.io/)
- [GitHub Actions Testing](https://docs.github.com/en/actions)

---

## 🤝 Contributing Tests

When contributing:

1. **Write tests first** (TDD approach)
2. **Achieve 80%+ coverage** for new code
3. **Run tests locally** before pushing
4. **Update documentation** for new test patterns
5. **Use descriptive names** for tests
6. **Add markers** for Python tests
7. **Mock external dependencies**

### Test Checklist

- [ ] Unit tests for all new functions/classes
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Integration tests for workflows
- [ ] Coverage ≥ 80%
- [ ] Tests pass locally
- [ ] Tests pass in CI
- [ ] Documentation updated

---

**Version:** 1.0
**Last Updated:** January 2025
**Maintainers:** OWASP AI Security Team
