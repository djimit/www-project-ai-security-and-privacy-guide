# Changelog

All notable changes to the OWASP AI Security and Privacy Guide will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Phase 1: Core Enterprise Improvements
- Comprehensive enterprise-grade improvements:
  - Automated security scanning (CodeQL, Dependabot, TruffleHog, govulncheck)
  - Content quality workflows (markdown linting, link validation, spell checking)
  - Security headers in Firebase hosting configuration
  - Pre-commit hooks for code quality
  - CONTRIBUTING.md with detailed development guidelines
  - .editorconfig for consistent code formatting
  - .markdownlint.json for markdown style consistency
  - .typos.toml for spell checking configuration
- Dependabot configuration for automated dependency updates
- Build validation in CI/CD pipeline

#### Phase 2: Advanced Features & Monitoring
- **SECURITY.md** - Comprehensive security policy with vulnerability reporting guidelines
- **OpenSSF Scorecard** workflow for security best practices evaluation
- **Performance & Accessibility** monitoring:
  - Lighthouse CI for performance tracking
  - pa11y-ci for WCAG 2.0 AA accessibility testing
  - HTML validation with html5validator
  - Bundle size monitoring and alerts
- **VS Code workspace configuration**:
  - Editor settings for consistency
  - Recommended extensions (16 total)
  - Custom tasks for Hugo, linting, testing
- **Repository cleanup workflows**:
  - Automated duplicate file detection
  - Production site link checking
  - Image optimization analysis
- **Release automation**:
  - Automated GitHub releases from tags
  - Changelog extraction and formatting
  - Build artifact generation
  - Version management workflow
- **Enhanced README.md**:
  - Status badges for all workflows
  - Quick start guide
  - Contribution matrix
  - Project statistics
  - Technology stack details
  - Professional formatting and structure
- **Comprehensive documentation** (docs/IMPROVEMENTS_GUIDE.md):
  - Detailed guide for all enterprise features
  - Setup instructions for each tool
  - Troubleshooting guide
  - Best practices and workflows
  - Monitoring and metrics guidelines

#### Phase 3: AI-Powered Threat Intelligence (Revolutionary)
- **Automated Threat Intelligence System** (scripts/threat-intelligence/):
  - Daily automated scanning of AI/ML vulnerabilities
  - CVE database monitoring for AI/ML threats
  - GitHub Security Advisory tracking (12+ AI/ML repositories)
  - arXiv research paper monitoring for novel attacks
  - **LLM-powered analysis** using Claude/GPT for automatic categorization
  - OWASP taxonomy mapping with AI
  - Automated documentation generation
  - Auto-created pull requests for human review
  - Live threat intelligence dashboard
  - Comprehensive threat analysis workflow
- **Data Sources Integration**:
  - National Vulnerability Database (NVD) API
  - GitHub GraphQL API for security advisories
  - arXiv feed parsing for research papers
  - Rate-limited API clients
- **Python Scripts** (6 modules, 1000+ lines):
  - fetch_cves.py - CVE collection with AI keyword filtering
  - fetch_advisories.py - GitHub advisory monitoring
  - fetch_research.py - Academic paper tracking
  - analyze_threats.py - LLM-powered threat analysis (core innovation)
  - generate_updates.py - Markdown documentation generation
  - update_dashboard.py - Live dashboard updates

### Changed
- Updated GitHub Actions to latest versions (v2 → v4 for checkout, v2 → v3 for Hugo setup)
- Updated Hextra theme from v0.7.1 to v0.7.3 in go.mod
- Improved workflow consistency by using go.mod version instead of hardcoding
- Added Go setup step to all Hugo build workflows

### Fixed
- Version inconsistency between go.mod and GitHub Actions workflows
- Added fetch-depth: 0 to checkout actions for better Hugo builds
- Removed firebase.json from .gitignore (was incorrectly excluded)

### Security
- Added comprehensive security headers (CSP, HSTS, X-Frame-Options, etc.)
- Implemented weekly security scans (5 different scanners)
- Added secret scanning with TruffleHog
- Enabled dependency vulnerability checks
- OpenSSF Scorecard for continuous security posture assessment
- Security policy (SECURITY.md) with clear vulnerability reporting process
- Automated security monitoring and alerting

## [Previous Versions]

### Recent Changes (from git history)

#### 2024-11-08
- Added disrupt, deceive, disclose concepts
- Added resource of Vischer
- Summarized AI privacy in "how about privacy" section
- Explained that an inaccurate model may also create a privacy issue
- Clearer breakdown of privacy

#### 2024 (Earlier)
- Better intro content
- Fixed deployment issues
- Added note that continuous validation will not help backdoor attacks
- Added link to copyright element
- Made the creative commons copyright paragraph visible

---

## Release Notes Guidelines

When releasing a new version, please:

1. Update the `[Unreleased]` section header to the new version number and date
2. Create a new empty `[Unreleased]` section at the top
3. Add a comparison link at the bottom
4. Ensure changes are categorized properly (Added/Changed/Deprecated/Removed/Fixed/Security)

## Categories

- **Added**: New features or content
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements or vulnerability fixes
