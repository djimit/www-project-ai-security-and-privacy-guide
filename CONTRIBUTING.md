# Contributing to OWASP AI Security and Privacy Guide

Thank you for your interest in contributing to the OWASP AI Security and Privacy Guide! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Local Development Setup](#local-development-setup)
- [Content Guidelines](#content-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project follows the [OWASP Code of Conduct](https://owasp.org/www-policy/operational/code-of-conduct). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Issues

- Check if the issue already exists in [GitHub Issues](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/issues)
- Use the issue template if available
- Provide clear description and examples
- Add relevant labels

### Suggesting Content Changes

- 📥 Send your suggestion to the [project leader](https://owaspai.org/connect/#owasp-ai-project-leader)
- 💡 Propose your concepts in [GitHub Discussions](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/discussions/categories/ideas)
- 🐞 Submit an [issue](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/issues)

### Contributing Content

- 👋 Join `#project-ai` in [OWASP Slack](https://owasp.slack.com/join/shared_invite/zt-g398htpy-AZ40HOM1WUOZguJKbblqkw#)
- 🗣️ Discuss with the [project leader](https://owaspai.org/connect/#owasp-ai-project-leader) to join the author group
- 📄 Fork the repo and submit a [Pull Request](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/pulls)

## Local Development Setup

### Prerequisites

- **Hugo**: v0.119.0 or later
- **Go**: 1.21 or later
- **Git**: Latest version
- **Text Editor**: VS Code, Sublime, or your preferred editor

### Installation Instructions

#### macOS

```bash
# Install Hugo
brew install hugo

# Install Go
brew install go

# Clone the repository
git clone https://github.com/OWASP/www-project-ai-security-and-privacy-guide.git
cd www-project-ai-security-and-privacy-guide
```

#### Linux

```bash
# Install Hugo
wget https://github.com/gohugoio/hugo/releases/download/v0.119.0/hugo_0.119.0_linux-amd64.deb
sudo dpkg -i hugo_0.119.0_linux-amd64.deb

# Install Go
sudo apt install golang-go

# Clone the repository
git clone https://github.com/OWASP/www-project-ai-security-and-privacy-guide.git
cd www-project-ai-security-and-privacy-guide
```

#### Windows

```powershell
# Install using Chocolatey
choco install hugo-extended
choco install golang

# Clone the repository
git clone https://github.com/OWASP/www-project-ai-security-and-privacy-guide.git
cd www-project-ai-security-and-privacy-guide
```

### Running the Development Server

```bash
# Navigate to the Hugo site directory
cd content/ai_exchange

# Get Hugo module dependencies
hugo mod get

# Start the development server
hugo server --gc --minify -D

# The site will be available at http://localhost:1313
```

The server will automatically reload when you make changes to content files.

### Project Structure

```
www-project-ai-security-and-privacy-guide/
├── .github/workflows/    # CI/CD workflows
├── assets/              # Jekyll site assets
├── content/
│   └── ai_exchange/     # Hugo site (main AI Exchange)
│       ├── content/     # Markdown content files
│       │   └── docs/    # Documentation pages
│       ├── layouts/     # Custom templates
│       │   ├── partials/
│       │   └── shortcodes/
│       ├── static/      # Static assets
│       ├── hugo.yaml    # Hugo configuration
│       └── firebase.json # Hosting configuration
├── index.md            # Main OWASP project page
└── README.md
```

## Content Guidelines

### Markdown Style

- Use **ATX-style headings** (`#` prefix, not underline style)
- Maximum line length: 120 characters (not enforced for tables/code)
- Use semantic line breaks (one sentence per line)
- Add blank line before and after headings
- Use fenced code blocks with language specification

Example:
````markdown
## Section Title

This is a paragraph with proper spacing.

```python
# Code example with language specified
def example():
    return "Hello, World!"
```

Another paragraph here.
````

### Links

- Prefer relative links for internal pages: `[text](/docs/page)`
- Use descriptive link text (not "click here")
- Verify all external links are valid
- Add `target="_blank"` for external links in HTML when needed

### Images

- Always include descriptive `alt` text
- Use WebP format when possible for better performance
- Store images in `content/ai_exchange/static/images/`
- Use Hugo shortcodes for responsive images:

```markdown
{{< image-centered src="images/diagram.png" alt="AI Security Diagram" >}}
```

### Hugo Shortcodes

Available custom shortcodes:

- `{{< small-card >}}` - Card component with icon/image
- `{{< image-centered >}}` - Centered image layout
- `{{< image-left >}}` - Left-aligned image
- `{{< spacer >}}` - Vertical spacing
- `{{< html-tab >}}` - Tabbed content

Example usage:
```markdown
{{< small-card
    title="AI Security Overview"
    link="/docs/ai_security_overview"
    icon="shield"
    subtitle="Comprehensive guide to AI security threats and controls"
>}}
```

### Content Organization

- Use clear, descriptive headings
- Keep sections focused and concise
- Use bullet points for lists
- Add cross-references to related sections
- Include examples where applicable

## Pull Request Process

### Before Submitting

1. **Test your changes locally**
   ```bash
   cd content/ai_exchange
   hugo server --gc --minify
   ```

2. **Run linting checks**
   ```bash
   # Markdown linting (if configured locally)
   markdownlint-cli2 "**/*.md"
   ```

3. **Verify all links work**
   - Check both internal and external links
   - Preview deployment will run automated link checking

4. **Review the preview**
   - PR preview deployment is automatically generated
   - Check the preview URL in PR comments

### Creating a Pull Request

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Edit content files in `content/ai_exchange/content/docs/`
   - Follow the content guidelines above

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new section on AI security"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**
   - Go to the [GitHub repository](https://github.com/OWASP/www-project-ai-security-and-privacy-guide)
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Wait for automated checks to pass
   - Request review from maintainers

### PR Review Process

- All PRs require review from project maintainers
- Automated checks must pass (linting, link validation, build)
- Preview deployment link will be provided
- Address reviewer feedback
- Once approved, maintainers will merge using squash merge

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature or content
- `fix`: Bug fix or correction
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(threats): add new LLM security threat section

fix(links): correct broken link to OWASP ML Top 10

docs(contributing): update local setup instructions

chore(deps): update Hugo to v0.120.0
```

### Scope

Common scopes:
- `threats`: Threat documentation
- `controls`: Control documentation
- `ci`: CI/CD changes
- `deps`: Dependency updates
- `config`: Configuration changes

## Additional Resources

- **Edit Pages**: Click "Edit on GitHub" button on [owaspai.org](https://owaspai.org)
- **Ask Questions**: [GitHub Discussions Q&A](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/discussions/categories/q-a)
- **Show Your Work**: [Show and Tell](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/discussions/categories/show-and-tell)
- **Connect**: Join `#project-ai` on [OWASP Slack](https://owasp.slack.com)

## Getting Help

If you need help:

1. Check existing [documentation](https://owaspai.org)
2. Search [GitHub Issues](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/issues)
3. Ask in [GitHub Discussions](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/discussions)
4. Reach out on OWASP Slack `#project-ai`
5. Contact the [project leader](mailto:rob.vanderveer@owasp.org)

## License

By contributing, you agree that your contributions will be licensed under the project's [Creative Commons CC0 License](https://creativecommons.org/publicdomain/zero/1.0/).

Thank you for contributing to making AI security better for everyone! 🙌
