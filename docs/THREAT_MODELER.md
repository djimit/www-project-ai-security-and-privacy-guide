# Interactive AI Threat Modeler - Documentation

**The world's first interactive AI threat modeling tool integrated into documentation!**

## 🎯 Overview

The OWASP AI Threat Modeler is a revolutionary web-based tool that allows users to visually build their AI system architecture and receive instant, automated threat assessments based on the OWASP AI Security taxonomy.

## 🌟 Key Features

### 1. Visual Architecture Builder
- **Drag & Drop Interface** - Intuitive component placement
- **13 Component Types** - Covering all AI/ML system parts
- **Unlimited Components** - Build complex architectures
- **Persistent Storage** - Auto-saves to browser localStorage

### 2. Real-time Threat Analysis
- **40+ Threat Patterns** - Mapped to OWASP categories
- **Automatic Risk Scoring** - 0-100 scale
- **Severity Classification** - CRITICAL, HIGH, MEDIUM, LOW
- **Instant Updates** - Analysis refreshes on changes

### 3. OWASP Taxonomy Integration
- **Full OWASP Mapping** - All threats categorized
- **Control Recommendations** - Specific OWASP controls for each threat
- **Category Coverage** - All 4 main threat categories

### 4. Export Capabilities
- **JSON** - Machine-readable architecture
- **SARIF** - Import directly to GitHub Security tab!
- **Markdown** - Documentation and reporting
- **PDF** - Professional reports (coming soon)

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          Component Palette              │
│  (Drag source for AI components)        │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│        Architecture Canvas              │
│  (Drop zone - visual builder)           │
│                                         │
│  [User Input] → [LLM API] → [Output]   │
│        ↓                                │
│  [Vector DB] → [RAG System]            │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Threat Analysis Engine             │
│  • Pattern matching                     │
│  • Risk scoring                         │
│  • Control mapping                      │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Results Panel                   │
│  • Risk score                           │
│  • Threat list                          │
│  • Control recommendations              │
└─────────────────────────────────────────┘
```

## 📦 Components Available

### AI/ML Components
| Icon | Component | Threats |
|------|-----------|---------|
| 🤖 | **LLM API** | Prompt injection, model extraction, DOS |
| 🔬 | **Training Pipeline** | Model poisoning, supply chain attacks |
| ⚡ | **Inference Engine** | Evasion attacks, adversarial examples |
| 💾 | **Model Store** | Model theft, tampering |
| 📚 | **RAG System** | Retrieval poisoning, context injection |

### Data Components
| Icon | Component | Threats |
|------|-----------|---------|
| 👤 | **User Input** | Adversarial input, injection attacks |
| 📊 | **Training Data** | Data poisoning, sensitive data leaks |
| 🗄️ | **Vector DB** | Vector poisoning, data disclosure |
| 🔄 | **Data Pipeline** | Pipeline poisoning, data tampering |

### Infrastructure
| Icon | Component | Threats |
|------|-----------|---------|
| 🚪 | **API Gateway** | Authentication bypass, rate limit bypass |
| 🌐 | **Web Application** | Standard web vulnerabilities |
| 📈 | **Monitoring** | Log injection, monitoring blind spots |

## 🔍 How It Works

### 1. Component-Based Threat Detection

Each component has associated threats from the THREAT_DATABASE:

```javascript
'llm-api': [
  {
    id: 'T-4.5',
    name: 'Direct Prompt Injection',
    category: '4.5 DIRECT PROMPT INJECTION',
    severity: 'HIGH',
    description: 'Malicious prompts can manipulate LLM behavior',
    controls: ['C-4.7', 'C-4.8', 'C-1.1']
  },
  // ... more threats
]
```

### 2. Risk Scoring Algorithm

```javascript
Risk Score = Σ (Severity Scores)
Where:
  CRITICAL = 25 points
  HIGH = 15 points
  MEDIUM = 8 points
  LOW = 3 points

Final Score = min(100, Total Points)
```

### 3. Control Mapping

Each threat includes recommended OWASP controls:
- **C-1.x**: Governance controls
- **C-2.x**: Threats through use controls
- **C-3.x**: Development-time controls
- **C-4.x**: Runtime application security controls

## 🎮 Usage Examples

### Example 1: RAG Application

**Architecture:**
```
User Input → RAG System → Vector DB
                ↓
             LLM API
```

**Identified Threats:**
- 🔴 **CRITICAL**: Retrieval Poisoning
- 🟠 **HIGH**: Direct Prompt Injection
- 🟠 **HIGH**: Indirect Prompt Injection (via context)
- 🟠 **HIGH**: Vector Database Poisoning

**Risk Score:** 72/100 (High Risk)

**Recommended Controls:**
- C-4.7: Prompt filtering and sanitization
- C-3.5: Data provenance tracking
- C-1.2: Limit sensitive data
- C-4.9: Content security policies

### Example 2: ML Training Pipeline

**Architecture:**
```
Training Data → Training Pipeline → Model Store
```

**Identified Threats:**
- 🔴 **CRITICAL**: Broad Model Poisoning
- 🔴 **CRITICAL**: Data Poisoning
- 🟠 **HIGH**: Supply Chain Attack
- 🟠 **HIGH**: Sensitive Data Leak

**Risk Score:** 85/100 (Critical Risk)

**Recommended Controls:**
- C-3.1: Training data validation
- C-3.5: Data provenance tracking
- C-3.3: Supply chain security
- C-1.3: Data sanitization

### Example 3: Production LLM Service

**Architecture:**
```
API Gateway → LLM API → Monitoring
      ↑
  User Input
```

**Identified Threats:**
- 🔴 **CRITICAL**: Authentication Bypass
- 🟠 **HIGH**: Direct Prompt Injection
- 🟠 **HIGH**: Adversarial Input
- 🟡 **MEDIUM**: Model DOS

**Risk Score:** 68/100 (High Risk)

**Recommended Controls:**
- C-4.1: Authentication and authorization
- C-4.7: Prompt filtering
- C-2.1: Input validation
- C-2.7: Resource quotas

## 💾 Export Formats

### 1. JSON Export
```json
{
  "version": "1.0.0",
  "created": "2024-11-08T12:00:00Z",
  "components": [
    {
      "id": 1,
      "type": "llm-api",
      "name": "LLM API",
      "x": 100,
      "y": 100
    }
  ],
  "analysis": {
    "riskScore": 72,
    "threats": [...],
    "controls": [...]
  }
}
```

### 2. SARIF Export (GitHub Integration!)

```json
{
  "version": "2.1.0",
  "$schema": "https://...",
  "runs": [{
    "tool": {
      "driver": {
        "name": "OWASP AI Threat Modeler"
      }
    },
    "results": [
      {
        "ruleId": "T-4.5",
        "level": "high",
        "message": {
          "text": "Malicious prompts can manipulate LLM behavior"
        },
        "properties": {
          "category": "4.5 DIRECT PROMPT INJECTION",
          "controls": ["C-4.7", "C-4.8"]
        }
      }
    ]
  }]
}
```

**Import to GitHub:**
1. Export as SARIF
2. Go to repository Security tab
3. Upload SARIF file
4. See threats in Security Overview!

### 3. Markdown Export

```markdown
# AI Threat Model Report

**Generated:** 2024-11-08 12:00:00
**Risk Score:** 72/100

## Architecture
- 🤖 LLM API (llm-api)
- 👤 User Input (user-input)
- 📚 RAG System (rag-system)

## Identified Threats

### Direct Prompt Injection
- **Category:** 4.5 DIRECT PROMPT INJECTION
- **Severity:** HIGH
- **Description:** Malicious prompts can manipulate LLM behavior
- **Controls:** C-4.7, C-4.8, C-1.1
...
```

## 🔒 Privacy & Security

### Client-Side Only
- ✅ **No server** - 100% browser-based
- ✅ **No data transmission** - Nothing sent to servers
- ✅ **Local storage only** - Saved in your browser
- ✅ **No tracking** - Complete privacy

### Data Storage
- Uses browser `localStorage`
- Key: `owaspThreatModel`
- Automatically saved on changes
- Persists between sessions
- Clear browser data to reset

## 🚀 Future Enhancements

### Planned Features
- [ ] **LLM Integration** - AI-powered threat analysis
- [ ] **Template Library** - Pre-built common architectures
- [ ] **Data Flow Arrows** - Visual connections between components
- [ ] **Threat Details Modal** - Expandable threat information
- [ ] **PDF Export** - Professional report generation
- [ ] **Collaboration** - Share models via URL
- [ ] **Version Control** - Track model changes
- [ ] **Compliance Mapping** - Map to regulations (GDPR, AI Act)
- [ ] **Custom Components** - User-defined components
- [ ] **Advanced Scoring** - Likelihood × Impact calculation

### Community Contributions
Want to enhance the threat modeler?
1. Add new components to `THREAT_DATABASE`
2. Improve threat detection logic
3. Add more export formats
4. Enhance UI/UX
5. Contribute threat patterns

## 📊 Technical Details

### Files
- `static/css/threat-modeler.css` - Styles (500+ lines)
- `static/js/threat-modeler.js` - Logic (800+ lines)
- `content/threat-modeler.md` - Page content
- `layouts/shortcodes/rawhtml.html` - Hugo integration

### Dependencies
- **None!** - Pure vanilla JavaScript
- No frameworks required
- Works in all modern browsers
- Mobile-responsive design

### Browser Compatibility
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers

## 🎯 Use Cases

### 1. Security Review
- Model existing AI systems
- Identify security gaps
- Prioritize remediation

### 2. Design Phase
- Threat modeling during architecture
- Security-by-design approach
- Early risk identification

### 3. Compliance
- Document security analysis
- Export for audits
- Demonstrate due diligence

### 4. Education
- Learn AI security threats
- Understand OWASP taxonomy
- Practice threat modeling

### 5. Communication
- Share threat models with stakeholders
- Export professional reports
- Align teams on security

## 📚 Related Resources

- [OWASP AI Security Overview](/docs/ai_security_overview)
- [Threat Categories](/docs/2_threats_through_use)
- [Security Controls](/docs/1_general_controls)
- [Development Threats](/docs/3_development_time_threats)
- [Runtime Threats](/docs/4_runtime_application_security_threats)

## 🤝 Contributing

Improve the threat modeler:
1. Add new threat patterns
2. Enhance scoring algorithm
3. Improve UI/UX
4. Add export formats
5. Create component library

**Submit PRs** to: [GitHub Repository](https://github.com/OWASP/www-project-ai-security-and-privacy-guide)

---

**Questions?** See main [IMPROVEMENTS_GUIDE.md](IMPROVEMENTS_GUIDE.md) or open an issue!
