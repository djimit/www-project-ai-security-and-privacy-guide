# Changelog

All notable changes to the OWASP AI Security and Privacy Guide will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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

### Changed
- Updated GitHub Actions to latest versions (v2 → v4 for checkout, v2 → v3 for Hugo setup)
- Updated Hextra theme from v0.7.1 to v0.7.3 in go.mod
- Improved workflow consistency by using go.mod version instead of hardcoding
- Added Go setup step to all Hugo build workflows

### Fixed
- Version inconsistency between go.mod and GitHub Actions workflows
- Added fetch-depth: 0 to checkout actions for better Hugo builds

### Security
- Added comprehensive security headers (CSP, HSTS, X-Frame-Options, etc.)
- Implemented weekly security scans
- Added secret scanning with TruffleHog
- Enabled dependency vulnerability checks

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
