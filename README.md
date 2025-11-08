# OWASP AI Exchange & AI Security and Privacy Guide

[![Deploy to Live Channel](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/actions/workflows/deploy.yml/badge.svg)](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/actions/workflows/deploy.yml)
[![Security Scanning](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/actions/workflows/security.yml/badge.svg)](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/actions/workflows/security.yml)
[![Content Quality](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/actions/workflows/content-quality.yml/badge.svg)](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/actions/workflows/content-quality.yml)
[![License: CC0-1.0](https://img.shields.io/badge/License-CC0%201.0-lightgrey.svg)](http://creativecommons.org/publicdomain/zero/1.0/)
[![OWASP Flagship](https://img.shields.io/badge/OWASP-Flagship%20Project-orange.svg)](https://owasp.org/projects/)

> **Comprehensive, community-driven guidance on AI security threats and controls**

---

## 🌐 Live Sites

- **🔗 [OWASP AI Exchange](https://owaspai.org)** - Living documentation of AI security threats and controls
- **🔗 [OWASP AI Security & Privacy Guide](https://owasp.org/www-project-ai-security-and-privacy-guide/)** - Project homepage with privacy guidance

---

## 📖 About This Project

Welcome to the GitHub repository for two complementary initiatives:

### 1. OWASP AI Exchange ([owaspai.org](https://owaspai.org))

A **living, collaborative knowledge base** that collects AI security threats and controls from experts worldwide. The AI Exchange:

- ✅ Provides comprehensive threat modeling for AI systems
- ✅ Documents security controls and mitigations
- ✅ Feeds into major standards (EU AI Act, ISO/IEC 27090, OWASP ML Top 10, OWASP LLM Top 10)
- ✅ Maintained by a global community of AI security professionals

### 2. OWASP AI Security and Privacy Guide

Published at [owasp.org/www-project-ai-security-and-privacy-guide](https://owasp.org/www-project-ai-security-and-privacy-guide/), this guide:

- 🔒 Links to the AI Exchange for security guidance
- 🔐 Provides comprehensive AI privacy guidance
- 📚 Offers practical implementation advice

**Mission**: Collect and clearly present the state of the art on AI security and privacy through community collaboration.

---

## 🚀 Quick Start

### For Readers
- Visit [owaspai.org](https://owaspai.org) to browse the AI security knowledge base
- Download the [Navigator PDF](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/raw/main/assets/images/owaspaioverviewpdfv3.pdf) for offline reference

### For Contributors
```bash
# Clone the repository
git clone https://github.com/OWASP/www-project-ai-security-and-privacy-guide.git
cd www-project-ai-security-and-privacy-guide

# Navigate to Hugo site
cd content/ai_exchange

# Install dependencies
hugo mod get

# Run local development server
hugo server --gc --minify -D

# View at http://localhost:1313
```

**📖 See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup instructions**

---

## 👥 Project Leadership

**Project Lead**: [Rob van der Veer](https://www.linkedin.com/in/robvanderveer/) (Software Improvement Group)
📧 [rob.vanderveer@owasp.org](mailto:rob.vanderveer@owasp.org)

See [leaders.md](leaders.md) for full leadership team.

---

## 🤝 How to Contribute

We enthusiastically welcome all forms of contributions! This is an open-source community effort.

### 💡 Ways to Contribute

| Contribution Type | How to Do It |
|-------------------|--------------|
| 🐛 **Report Bugs** | [Create an issue](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/issues/new?template=bug_report.md) |
| ✨ **Suggest Features** | [Request a feature](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/issues/new?template=feature_request.md) |
| 📝 **Propose Content** | [Suggest content](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/issues/new?template=content_suggestion.md) |
| 🔧 **Submit Changes** | [Create a Pull Request](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/pulls) |
| 💬 **Join Discussion** | [GitHub Discussions](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/discussions) |
| 👋 **Chat with Us** | [OWASP Slack #project-ai](https://owasp.slack.com/join/shared_invite/zt-g398htpy-AZ40HOM1WUOZguJKbblqkw#) |

### 📚 For Contributors

- **Quick Fixes**: Fork and submit a PR directly for typos/grammar
- **Content Changes**: Discuss with the [project leader](https://owaspai.org/connect/#owasp-ai-project-leader) first
- **Author Group**: Join the core team by contacting the project leader
- **Edit Pages**: Click "Edit on GitHub" button on [owaspai.org](https://owaspai.org)

**📖 Read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines**

---

## 🛡️ Security

Found a security vulnerability? Please see [SECURITY.md](SECURITY.md) for responsible disclosure guidelines.

---

## 📊 Project Stats

- **Content Pages**: 6 main documentation files (2,256 lines)
- **Redirect Rules**: 480+ for stable deep linking
- **Contributors**: Community-driven with global collaboration
- **License**: [CC0 1.0 Universal](LICENSE) - Public Domain Dedication

---

## 🏗️ Project Structure

```
├── .github/
│   ├── workflows/          # CI/CD pipelines (deploy, security, quality checks)
│   ├── ISSUE_TEMPLATE/     # Issue templates for bugs, features, content
│   └── PULL_REQUEST_TEMPLATE.md
├── content/
│   └── ai_exchange/        # Main Hugo site
│       ├── content/docs/   # Documentation content
│       ├── layouts/        # Custom Hugo templates
│       ├── static/         # Static assets
│       └── hugo.yaml       # Site configuration
├── assets/                 # Jekyll site assets
├── CONTRIBUTING.md         # Contribution guidelines
├── SECURITY.md            # Security policy
├── CHANGELOG.md           # Version history
└── README.md              # This file
```

---

## 🔧 Technology Stack

- **Static Site Generator**: Hugo v0.119.0
- **Theme**: [Hextra](https://github.com/imfing/hextra) v0.7.3
- **Hosting**: Firebase Hosting
- **CI/CD**: GitHub Actions
- **Languages**: Go 1.21, Markdown

---

## 📜 License

This work is licensed under [CC0 1.0 Universal (Public Domain)](http://creativecommons.org/publicdomain/zero/1.0/).

You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.

---

## 🙏 Acknowledgments

This project is made possible by:

- **OWASP Foundation** - Supporting open security initiatives
- **Global Community** - Contributors from security, AI, and privacy domains
- **Partner Organizations** - Aligning with EU AI Act, ISO standards, and OWASP initiatives

---

## 📞 Connect

- 🌐 **Website**: [owaspai.org](https://owaspai.org)
- 💬 **Slack**: [#project-ai](https://owasp.slack.com/join/shared_invite/zt-g398htpy-AZ40HOM1WUOZguJKbblqkw#)
- 🐦 **Updates**: [OWASP LinkedIn](https://www.linkedin.com/company/owasp/)
- 📧 **Contact**: [rob.vanderveer@owasp.org](mailto:rob.vanderveer@owasp.org)
- 📝 **Discussions**: [GitHub Discussions](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/discussions)

---

**⭐ Star this repository to show your support!**
