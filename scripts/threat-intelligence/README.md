# AI Threat Intelligence System

**Automated threat discovery and documentation using AI.**

This system automatically:
1. Fetches AI/ML vulnerabilities from multiple sources
2. Analyzes them using Claude/GPT
3. Categorizes according to OWASP AI taxonomy
4. Generates documentation updates
5. Creates pull requests for human review

## 🎯 Overview

The threat intelligence system is a **groundbreaking use of AI to maintain AI security documentation**. It dogfoods AI technology to keep the OWASP AI Security Guide up-to-date with the latest threats.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Daily Threat Intelligence Scan              │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │   CVEs   │    │ GitHub   │    │  arXiv   │
    │   (NVD)  │    │ Advisories│    │  Papers  │
    └──────────┘    └──────────┘    └──────────┘
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                  ┌─────────────────┐
                  │  LLM Analysis   │
                  │ (Claude/GPT)    │
                  └─────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  OWASP   │    │ Generate │    │ Dashboard│
    │ Category │    │   Docs   │    │  Update  │
    └──────────┘    └──────────┘    └──────────┘
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                  ┌─────────────────┐
                  │  Auto PR with   │
                  │  Human Review   │
                  └─────────────────┘
```

## 📁 Components

### 1. Data Fetchers

**`fetch_cves.py`**
- Queries NVD API for AI/ML related CVEs
- Keywords: "machine learning", "neural network", "pytorch", etc.
- Rate-limited to respect NVD API limits
- Filters for AI relevance

**`fetch_advisories.py`**
- Monitors 12+ popular AI/ML GitHub repositories
- Uses GitHub GraphQL API
- Fetches GHSA security advisories
- Tracks: TensorFlow, PyTorch, HuggingFace, etc.

**`fetch_research.py`**
- Searches arXiv for AI security papers
- Categories: cs.CR, cs.LG, cs.AI
- Keywords: "adversarial", "backdoor", "poisoning", etc.
- Captures latest academic research

### 2. AI Analysis

**`analyze_threats.py`**
- **The core innovation** - uses LLM to analyze threats
- Supports both Claude and OpenAI GPT
- Categorizes according to OWASP taxonomy
- Extracts: severity, attack vector, impact, controls
- Determines if threat is NEW or UPDATE

**LLM Prompt includes:**
- Full OWASP AI taxonomy
- Structured JSON output format
- Technical analysis requirements
- Control recommendations

### 3. Documentation Generation

**`generate_updates.py`**
- Converts LLM analysis to markdown
- Organizes by OWASP category
- Creates formatted threat pages
- Includes references and controls

**`update_dashboard.py`**
- Generates live threat dashboard
- Summary statistics
- Critical threat highlights
- Category distribution
- Recent discoveries timeline

### 4. Workflow

**`.github/workflows/threat-intelligence.yml`**
- Runs daily at 00:00 UTC
- Can be triggered manually
- Creates automated PRs
- Posts workflow summaries

## 🚀 Setup

### Prerequisites

```bash
# Python 3.11+
python3 --version

# Install dependencies
pip install -r requirements.txt
```

### API Keys Required

1. **NVD API Key** (optional but recommended)
   - Get from: https://nvd.nist.gov/developers/request-an-api-key
   - Set as: `NVD_API_KEY` GitHub secret

2. **Anthropic API Key** (for Claude)
   - Get from: https://console.anthropic.com/
   - Set as: `ANTHROPIC_API_KEY` GitHub secret

3. **OpenAI API Key** (alternative to Claude)
   - Get from: https://platform.openai.com/api-keys
   - Set as: `OPENAI_API_KEY` GitHub secret

4. **GitHub Token** (automatic)
   - `GITHUB_TOKEN` is provided automatically
   - No setup needed

### Configuration

Set GitHub Secrets:
1. Go to repository Settings → Secrets → Actions
2. Add:
   - `NVD_API_KEY` (optional)
   - `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
3. `GITHUB_TOKEN` is automatic
4. `FIREBASE_SERVICE_ACCOUNT` (existing, for deployment)

## 📖 Usage

### Manual Run

Trigger via GitHub Actions UI:
1. Go to Actions → AI Threat Intelligence Update
2. Click "Run workflow"
3. Set days to look back (default: 7)
4. Click "Run workflow"

### Review PR

When threats are found:
1. Automated PR is created
2. Review the documentation changes
3. Verify accuracy of LLM analysis
4. Check OWASP category mappings
5. Merge if correct

### Local Testing

```bash
# Fetch CVEs
python scripts/threat-intelligence/fetch_cves.py \
  --days-back 7 \
  --output data/cves.json

# Fetch advisories
export GITHUB_TOKEN=your_token
python scripts/threat-intelligence/fetch_advisories.py \
  --output data/advisories.json

# Fetch research
python scripts/threat-intelligence/fetch_research.py \
  --days-back 7 \
  --output data/research.json

# Analyze with LLM
export ANTHROPIC_API_KEY=your_key
python scripts/threat-intelligence/analyze_threats.py \
  --cves data/cves.json \
  --advisories data/advisories.json \
  --research data/research.json \
  --output data/analysis.json

# Generate documentation
python scripts/threat-intelligence/generate_updates.py \
  --analysis data/analysis.json \
  --output-dir content/ai_exchange/content/docs/threats/ \
  --summary data/summary.json

# Update dashboard
python scripts/threat-intelligence/update_dashboard.py \
  --analysis data/analysis.json \
  --output content/ai_exchange/content/threat-intelligence.md
```

## 🎯 LLM Analysis Details

### What the LLM Does

For each threat, the LLM:
1. **Determines relevance** - Is this actually AI security related?
2. **Categorizes** - Maps to OWASP taxonomy (e.g., "2.1 EVASION")
3. **Assesses severity** - CRITICAL/HIGH/MEDIUM/LOW
4. **Classifies type** - NEW discovery or UPDATE to existing
5. **Extracts details** - Attack vector, impact, affected systems
6. **Recommends controls** - Maps to OWASP control IDs
7. **Generates summary** - Human-readable technical description

### Why LLM-Powered?

Traditional keyword matching would:
- ❌ Miss nuanced threats
- ❌ Require constant pattern updates
- ❌ Generate false positives
- ❌ Cannot map to taxonomy

LLM analysis provides:
- ✅ **Semantic understanding** of threats
- ✅ **Context-aware** categorization
- ✅ **Automatic** OWASP mapping
- ✅ **High accuracy** with review
- ✅ **Generates documentation** automatically

## 📊 Data Sources

### CVE Database (NVD)
- Official US vulnerability database
- Comprehensive CVE coverage
- CVSS scores included
- CPE (product) information

### GitHub Security Advisories
- Direct from AI/ML projects
- GHSA identifiers
- Package-specific info
- Vulnerability details

### arXiv Research
- Latest academic findings
- Novel attack techniques
- Defense mechanisms
- Cutting-edge research

## 🔒 Security Considerations

### API Key Safety
- Never commit API keys
- Use GitHub Secrets only
- Rotate keys periodically

### LLM Output Validation
- **Human review required** before merge
- LLM can hallucinate
- Verify technical details
- Check references

### Rate Limiting
- NVD: 5 calls/30 seconds
- GitHub: 5000/hour
- LLM APIs: See provider limits

## 📈 Metrics

Track in workflow summaries:
- Total threats analyzed
- Relevant AI threats found
- New vs. updated
- Severity distribution
- Category breakdown

## 🔮 Future Enhancements

Planned improvements:
- [ ] Deduplication logic
- [ ] Threat similarity detection
- [ ] Trending threat analysis
- [ ] Email notifications for critical threats
- [ ] Integration with MITRE ATT&CK
- [ ] Historical trend analysis
- [ ] RSS feed generation

## 🤝 Contributing

To improve the system:
1. Add new data sources (`fetch_*.py`)
2. Enhance LLM prompts (`analyze_threats.py`)
3. Improve categorization accuracy
4. Add visualization features

## 📜 License

Same as parent project: CC0 1.0 Universal (Public Domain)

## 🙏 Credits

This innovative system was created as part of the enterprise-grade improvements to the OWASP AI Security and Privacy Guide.

**Powered by:**
- Anthropic Claude / OpenAI GPT
- National Vulnerability Database (NVD)
- GitHub Security Advisories
- arXiv.org

---

**Questions?** See main project [IMPROVEMENTS_GUIDE.md](../../docs/IMPROVEMENTS_GUIDE.md)
