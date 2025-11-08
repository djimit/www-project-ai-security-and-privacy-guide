# Enterprise-Grade Improvements Guide

This document details all the enterprise-grade improvements implemented in the project and how to use them effectively.

## Table of Contents

- [Overview](#overview)
- [Security Improvements](#security-improvements)
- [Testing & Quality](#testing--quality)
- [Performance Monitoring](#performance-monitoring)
- [Development Environment](#development-environment)
- [CI/CD Enhancements](#cicd-enhancements)
- [Maintenance & Cleanup](#maintenance--cleanup)
- [Release Management](#release-management)

---

## Overview

The project has been upgraded from a basic static site to an enterprise-grade platform with:

- ✅ Automated security scanning (5 different tools)
- ✅ Comprehensive testing (content, links, accessibility, performance)
- ✅ Performance monitoring (Lighthouse CI, bundle size tracking)
- ✅ Developer productivity tools (VS Code integration, pre-commit hooks)
- ✅ Automated dependency management (Dependabot)
- ✅ Quality assurance workflows (markdown linting, spell checking)
- ✅ Repository maintenance (duplicate detection, image optimization)
- ✅ Release automation with changelog generation

---

## Security Improvements

### 1. Automated Security Scanning

**Workflow**: `.github/workflows/security.yml`

**Tools Implemented:**

#### CodeQL Analysis
- Scans Go and JavaScript code for vulnerabilities
- Runs on every push and PR
- Results visible in Security tab
- Queries: `security-and-quality`

#### Dependency Review
- Reviews PRs for vulnerable dependencies
- Blocks merges with moderate+ severity issues
- Posts summary in PR comments

#### TruffleHog OSS
- Scans for leaked secrets and credentials
- Checks commit history
- Only verifies actual secrets (reduces false positives)

#### govulncheck
- Go-specific vulnerability scanner
- Checks Hugo modules and dependencies
- Updated vulnerability database

**How to Use:**
```bash
# Security scans run automatically on push/PR
# View results in GitHub Security tab

# Run locally (if installed):
govulncheck ./...
trufflehog git file://. --only-verified
```

### 2. OpenSSF Scorecard

**Workflow**: `.github/workflows/scorecard.yml`

Evaluates project against security best practices:
- Dependency updates
- Code review practices
- Branch protection
- Security policy
- Vulnerability disclosure

**View Score:**
- Check Security tab → Scorecards
- Public score at OpenSSF badge
- Runs weekly on Sundays

### 3. Security Headers

**File**: `content/ai_exchange/firebase.json`

Implemented security headers:
```
Content-Security-Policy
Strict-Transport-Security (HSTS)
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Verify Headers:**
```bash
curl -I https://owaspai.org | grep -i "x-\|content-security\|strict-transport"
```

### 4. Security Policy

**File**: `SECURITY.md`

- Vulnerability reporting process
- Response timeline commitments
- Coordinated disclosure policy
- Security contact information

---

## Testing & Quality

### 1. Content Quality Checks

**Workflow**: `.github/workflows/content-quality.yml`

**Components:**

#### Markdown Linting
- Tool: `markdownlint-cli2`
- Config: `.markdownlint.json`
- Rules: 120 char lines, HTML allowed, consistent style

```bash
# Run locally
npx markdownlint-cli2 "**/*.md"
```

#### Link Validation
- Tool: `lychee`
- Checks internal and external links
- Respects rate limits
- Excludes: localhost, linkedin.com (blocks bots)

```bash
# Run after building
cd content/ai_exchange
hugo --gc --minify
lychee 'public/**/*.html'
```

#### Spell Checking
- Tool: `typos`
- Config: `.typos.toml`
- Custom dictionary for OWASP terms

```bash
# Run locally
typos .
```

#### Build Validation
- Verifies critical files exist
- Checks build size (<100MB limit)
- Ensures proper Hugo output

### 2. Pre-commit Hooks

**File**: `.pre-commit-config.yaml`

**Hooks:**
- Trailing whitespace removal
- EOF fixes
- YAML/JSON validation
- Large file detection (>1MB)
- Private key detection
- Markdown linting
- YAML formatting
- Spell checking

**Setup:**
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

---

## Performance Monitoring

### 1. Lighthouse CI

**Workflow**: `.github/workflows/performance.yml`
**Config**: `.lighthouserc.json`

**Metrics Tracked:**
- Performance score (target: 80+)
- Accessibility score (target: 90+)
- Best practices score (target: 80+)
- SEO score (target: 90+)

**Runs:**
- 3 runs per page for consistency
- Tests homepage, overview, controls pages
- Uploads results to temporary public storage

**View Reports:**
- Check Actions → Performance & Accessibility
- Download lighthouse-report artifact

### 2. Accessibility Testing

**Tool**: `pa11y-ci`
**Standard**: WCAG 2.0 AA

**Tested Pages:**
- Homepage
- AI Security Overview
- General Controls

```bash
# Run locally
npm install -g pa11y-ci
pa11y-ci --config .pa11yci.json
```

### 3. HTML Validation

- Validates all generated HTML
- Checks CSS syntax
- Allows custom attributes (x-, hx-)

### 4. Bundle Size Monitoring

**Tracks:**
- Total build size
- HTML size
- CSS size
- JavaScript size
- Image size

**Alerts** if total exceeds 100MB

**View Report:**
- Check workflow summary for size breakdown
- Compare across PR/commits

---

## Development Environment

### 1. VS Code Integration

**Files:**
- `.vscode/settings.json` - Editor settings
- `.vscode/extensions.json` - Recommended extensions
- `.vscode/tasks.json` - Build/lint tasks

**Recommended Extensions:**
- Markdown All in One
- markdownlint
- Hugo Language Support
- GitLens
- GitHub Actions
- Go language support
- Code Spell Checker

**Available Tasks** (Ctrl/Cmd + Shift + P → "Run Task"):
- Hugo: Start Server
- Hugo: Build
- Hugo: Clean
- Lint: Markdown
- Lint: YAML
- Test: Links
- Pre-commit: Run All
- Go: Update Modules

**Settings:**
- Format on save enabled
- 120 character ruler
- Trailing whitespace removal
- Markdown word wrap
- Go format with imports

### 2. EditorConfig

**File**: `.editorconfig`

Ensures consistency across editors:
- UTF-8 encoding
- LF line endings
- Trim trailing whitespace
- Insert final newline
- 2-space indent for YAML/JSON/Markdown
- Tab indent for Go

### 3. Local Development

```bash
# Quick start
cd content/ai_exchange
hugo server --gc --minify -D

# With tasks (VS Code)
Ctrl/Cmd + Shift + P → "Run Task" → "Hugo: Start Server"

# With hot reload
hugo server --gc --minify -D --navigateToChanged
```

---

## CI/CD Enhancements

### 1. Build Caching

**Implemented in:**
- `.github/workflows/deploy.yml`
- `.github/workflows/pr_deploy.yml`

**Cached:**
- Go modules (automatic with setup-go@v5)
- Hugo modules (~/.cache/hugo_cache)
- Hugo resources (content/ai_exchange/resources)

**Benefits:**
- 30-50% faster builds
- Reduced network usage
- Lower CI costs

### 2. Updated Actions

All actions updated to latest:
- `actions/checkout@v4` (was v2)
- `peaceiris/actions-hugo@v3` (was v2)
- `actions/setup-go@v5`
- `actions/cache@v4`

### 3. Workflow Efficiency

**Deploy Workflow:**
```yaml
Checkout (with full history)
  ↓
Setup Hugo + Go (with caching)
  ↓
Build (with module caching)
  ↓
Deploy to Firebase
```

**PR Workflow:**
```yaml
Checkout
  ↓
Quality Checks (parallel):
  - Security scan
  - Content quality
  - Performance test
  - Accessibility check
  ↓
Build & Preview Deploy
```

### 4. Version Consistency

**Fixed:**
- Hextra v0.7.1 → v0.7.3 (in go.mod)
- Workflow now uses `hugo mod get` without version
- Single source of truth: `go.mod`

---

## Maintenance & Cleanup

### 1. Repository Cleanup

**Workflow**: `.github/workflows/cleanup.yml`
**Schedule**: Monthly (1st of month)

**Tasks:**

#### Duplicate File Detection
- Uses `fdupes` to find duplicates
- Excludes build directories
- Creates GitHub issue if found
- Labels: `cleanup`, `automated`

#### Broken Link Monitoring
- Checks production site (owaspai.org)
- Runs against live site
- Generates report artifact
- Non-blocking (continues on errors)

#### Image Analysis
- Finds images >500KB
- Suggests WebP conversion
- Reports format distribution
- Optimization recommendations

**Manual Run:**
```bash
# Trigger via GitHub UI
Actions → Repository Cleanup → Run workflow
```

### 2. Dependabot

**File**: `.github/dependabot.yml`

**Updates:**
- Go modules: Weekly
- GitHub Actions: Weekly
- Max 5 PRs open per ecosystem
- Auto-labels: `dependencies`, `go`, `ci`
- Conventional commit messages

**Review Process:**
1. Dependabot creates PR
2. Security/quality checks run
3. Review changes
4. Merge if passing

---

## Release Management

### 1. Automated Releases

**Workflow**: `.github/workflows/release.yml`

**Triggers:**
- Push tag: `v*.*.*`
- Manual dispatch with version input

**Process:**
1. Extract version from tag/input
2. Pull changelog for version
3. Build Hugo site
4. Create tarball archive
5. Generate build report
6. Create GitHub release
7. Upload artifacts

**Create Release:**

**Option A: Tag-based (Recommended)**
```bash
# Update CHANGELOG.md first
git add CHANGELOG.md
git commit -m "docs: update changelog for v1.0.0"

# Create and push tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Release is created automatically
```

**Option B: Manual Dispatch**
```
1. Go to Actions → Release Management
2. Click "Run workflow"
3. Enter version (e.g., 1.0.0)
4. Click "Run workflow"
```

**Release Includes:**
- Changelog excerpt for version
- Build archive (tar.gz)
- Build report (statistics)
- Commit history

### 2. Changelog Maintenance

**File**: `CHANGELOG.md`

**Format**: [Keep a Changelog](https://keepachangelog.com/)

**Categories:**
- Added: New features
- Changed: Changes to existing functionality
- Deprecated: Soon-to-be removed features
- Removed: Removed features
- Fixed: Bug fixes
- Security: Security improvements

**Example:**
```markdown
## [Unreleased]

### Added
- New threat documentation for LLM attacks

### Fixed
- Broken link in general controls section

## [1.0.0] - 2024-11-08

### Added
- Enterprise-grade improvements
- Automated security scanning
...
```

---

## Best Practices

### 1. Before Committing

```bash
# Run pre-commit hooks
pre-commit run --all-files

# Build locally
cd content/ai_exchange && hugo --gc --minify

# Check for issues
markdownlint-cli2 "**/*.md"
typos .
```

### 2. For Pull Requests

- Fill out PR template completely
- Ensure all checks pass (green ✓)
- Review preview deployment
- Update CHANGELOG.md if needed
- Use conventional commit format

### 3. For Releases

1. Update CHANGELOG.md with version and date
2. Review all changes since last release
3. Test build locally
4. Create tag with semantic versioning
5. Push tag to trigger release
6. Verify release on GitHub

### 4. For Security Issues

- **Public issues**: Use issue template
- **Vulnerabilities**: Follow SECURITY.md process
- **Private disclosure**: Email project leader
- Never commit secrets or credentials

---

## Troubleshooting

### Build Failures

**Hugo build fails:**
```bash
# Clear cache
rm -rf content/ai_exchange/resources
rm -rf content/ai_exchange/public

# Update modules
cd content/ai_exchange
hugo mod clean
hugo mod get -u
hugo mod tidy
```

**Linting failures:**
```bash
# Auto-fix markdown
markdownlint-cli2 --fix "**/*.md"

# Check specific file
markdownlint-cli2 path/to/file.md
```

### Workflow Issues

**Caching problems:**
- Clear cache: Actions → Caches → Delete
- Rebuild will regenerate cache

**Permission errors:**
- Check workflow permissions in settings
- Ensure GITHUB_TOKEN has required scopes

### Local Development

**Hugo server not starting:**
```bash
# Check Hugo version
hugo version  # Should be 0.119.0+

# Check Go version
go version  # Should be 1.21+

# Clear modules
hugo mod clean
```

**Pre-commit hooks failing:**
```bash
# Update hooks
pre-commit autoupdate

# Skip hooks temporarily
git commit --no-verify
```

---

## Metrics & Monitoring

### Key Performance Indicators

**Security:**
- OpenSSF Scorecard: Target 8+/10
- Security scan pass rate: 100%
- Days to patch vulnerabilities: <7

**Quality:**
- Markdown lint pass rate: 100%
- Link validation pass rate: >95%
- Accessibility score: >90 (WCAG AA)

**Performance:**
- Lighthouse performance: >80
- Build time: <3 minutes
- Build size: <100MB

**Maintenance:**
- Dependabot PRs/month: ~4-8
- Time to merge Dependabot PRs: <48 hours
- Duplicate files: 0

### Monitoring Dashboards

**GitHub Insights:**
- Actions tab: Build success rate
- Security tab: Vulnerabilities, Scorecard
- Pulse: Activity and contributions

**Workflow Summaries:**
- Performance reports in job summaries
- Bundle size trends over time
- Image optimization suggestions

---

## Additional Resources

- [Contributing Guide](../CONTRIBUTING.md)
- [Security Policy](../SECURITY.md)
- [Changelog](../CHANGELOG.md)
- [Hugo Documentation](https://gohugo.io/documentation/)
- [Hextra Theme Docs](https://imfing.github.io/hextra/)
- [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/)

---

**Questions or Issues?**

- GitHub Discussions: [Q&A](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/discussions/categories/q-a)
- Slack: [#project-ai](https://owasp.slack.com)
- Email: [rob.vanderveer@owasp.org](mailto:rob.vanderveer@owasp.org)
