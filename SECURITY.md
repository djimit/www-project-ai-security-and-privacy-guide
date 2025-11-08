# Security Policy

## Supported Versions

As a documentation project, we maintain the most current version published at [owaspai.org](https://owaspai.org). Historical versions are available through Git history.

| Version | Supported          |
| ------- | ------------------ |
| Latest (main branch) | :white_check_mark: |
| Older commits | :x: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in this project, please report it responsibly.

### For Security Issues in the Documentation Site

If you find a security vulnerability in the deployed website (owaspai.org) or its infrastructure:

**Please DO NOT create a public GitHub issue.**

Instead, report it privately through one of these channels:

1. **GitHub Security Advisory** (Preferred)
   - Go to the [Security tab](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/security/advisories)
   - Click "Report a vulnerability"
   - Provide detailed information about the issue

2. **Email the Project Leader**
   - Email: [rob.vanderveer@owasp.org](mailto:rob.vanderveer@owasp.org)
   - Subject: "[SECURITY] Vulnerability Report - AI Security Guide"
   - Include detailed description and steps to reproduce

3. **OWASP Security Contact**
   - For critical issues, contact OWASP security team
   - Email: [security@owasp.org](mailto:security@owasp.org)

### What to Include in Your Report

Please provide as much information as possible:

- **Type of vulnerability** (XSS, CSRF, authentication bypass, etc.)
- **Affected component** (website, CI/CD, repository, etc.)
- **Steps to reproduce** the vulnerability
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up questions

### Response Timeline

We aim to respond to security reports according to the following timeline:

- **Initial Response**: Within 48 hours
- **Vulnerability Assessment**: Within 7 days
- **Fix Implementation**: Varies by severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Next scheduled release

### Disclosure Policy

- We follow **coordinated disclosure** practices
- We will work with you to understand and fix the issue
- We will publicly acknowledge your contribution (unless you prefer to remain anonymous)
- We will not take legal action against researchers who:
  - Report vulnerabilities in good faith
  - Avoid privacy violations and data destruction
  - Give us reasonable time to fix issues before public disclosure

### Security Best Practices for Contributors

When contributing to this project:

1. **Never commit secrets** (API keys, tokens, passwords)
   - Use `.env` files (git-ignored) for local secrets
   - Secrets are detected by TruffleHog in CI

2. **Review dependencies** for known vulnerabilities
   - Dependabot will alert on vulnerable dependencies
   - Check https://deps.dev for dependency insights

3. **Follow secure coding practices**
   - Validate and sanitize all inputs
   - Use parameterized queries for any database operations
   - Implement proper authentication and authorization

4. **Test security features**
   - Run security scans locally when possible
   - Verify Content Security Policy doesn't break functionality
   - Test with security headers enabled

### Security Features in This Project

Our project implements several security measures:

#### Automated Security Scanning
- **CodeQL**: Static analysis for security vulnerabilities
- **Dependabot**: Automated dependency vulnerability alerts
- **TruffleHog**: Secret scanning to prevent credential leaks
- **govulncheck**: Go-specific vulnerability scanning

#### Security Headers (Firebase Hosting)
```
Content-Security-Policy
Strict-Transport-Security (HSTS)
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection
Referrer-Policy
Permissions-Policy
```

#### GitHub Repository Security
- Branch protection on `main` branch
- Required status checks before merging
- Dependency review on pull requests
- Secret scanning enabled

### Known Limitations

As a static documentation site:

- No user authentication or personal data storage
- No server-side code execution
- No database or backend services
- Limited attack surface (primarily XSS risks)

### Security-Related GitHub Issues

For **non-sensitive** security improvements (like adding security headers, improving CSP, etc.), you can:

- Open a public GitHub issue with label `security`
- Submit a pull request with security enhancements
- Discuss in GitHub Discussions

### Acknowledgments

We appreciate security researchers who help keep our project safe. Contributors who report valid security issues will be acknowledged in:

- Project README.md (if desired)
- Release notes for the fix
- Project website credits

### Questions?

If you're unsure whether an issue is a security vulnerability:

- When in doubt, report it privately first
- Contact the project leader for guidance
- We'd rather receive duplicate reports than miss a real issue

---

**Thank you for helping keep the OWASP AI Security and Privacy Guide secure!**

## Additional Resources

- [OWASP Security Practices](https://owasp.org/www-project-security-culture/)
- [OWASP Vulnerability Disclosure Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
