---
title: "🎮 Interactive AI Threat Modeler"
weight: 5
---

# Interactive AI Threat Modeler

**Build your AI architecture visually and get instant threat assessments**

{{< rawhtml >}}
<link rel="stylesheet" href="/css/threat-modeler.css">

<div class="threat-modeler">
  <div class="threat-modeler__header">
    <h1 class="threat-modeler__title">🎮 AI Threat Modeler</h1>
    <p class="threat-modeler__subtitle">
      Drag & drop to build your AI system architecture, get real-time OWASP threat analysis
    </p>
  </div>

  <div class="threat-modeler__container">
    <!-- Component Palette -->
    <div class="component-palette">
      <h2 class="component-palette__title">📦 Components</h2>

      <div class="component-palette__category">
        <div class="component-palette__category-title">AI/ML Components</div>
        <div class="component-item" draggable="true" data-type="llm-api" data-category="ai">
          <div class="component-item__icon">🤖</div>
          <div class="component-item__name">LLM API</div>
        </div>
        <div class="component-item" draggable="true" data-type="training-pipeline" data-category="ai">
          <div class="component-item__icon">🔬</div>
          <div class="component-item__name">Training Pipeline</div>
        </div>
        <div class="component-item" draggable="true" data-type="inference-engine" data-category="ai">
          <div class="component-item__icon">⚡</div>
          <div class="component-item__name">Inference Engine</div>
        </div>
        <div class="component-item" draggable="true" data-type="model-store" data-category="ai">
          <div class="component-item__icon">💾</div>
          <div class="component-item__name">Model Store</div>
        </div>
        <div class="component-item" draggable="true" data-type="rag-system" data-category="ai">
          <div class="component-item__icon">📚</div>
          <div class="component-item__name">RAG System</div>
        </div>
      </div>

      <div class="component-palette__category">
        <div class="component-palette__category-title">Data Components</div>
        <div class="component-item" draggable="true" data-type="user-input" data-category="data">
          <div class="component-item__icon">👤</div>
          <div class="component-item__name">User Input</div>
        </div>
        <div class="component-item" draggable="true" data-type="training-data" data-category="data">
          <div class="component-item__icon">📊</div>
          <div class="component-item__name">Training Data</div>
        </div>
        <div class="component-item" draggable="true" data-type="vector-db" data-category="data">
          <div class="component-item__icon">🗄️</div>
          <div class="component-item__name">Vector DB</div>
        </div>
        <div class="component-item" draggable="true" data-type="data-pipeline" data-category="data">
          <div class="component-item__icon">🔄</div>
          <div class="component-item__name">Data Pipeline</div>
        </div>
      </div>

      <div class="component-palette__category">
        <div class="component-palette__category-title">Infrastructure</div>
        <div class="component-item" draggable="true" data-type="api-gateway" data-category="infra">
          <div class="component-item__icon">🚪</div>
          <div class="component-item__name">API Gateway</div>
        </div>
        <div class="component-item" draggable="true" data-type="web-app" data-category="infra">
          <div class="component-item__icon">🌐</div>
          <div class="component-item__name">Web Application</div>
        </div>
        <div class="component-item" draggable="true" data-type="monitoring" data-category="infra">
          <div class="component-item__icon">📈</div>
          <div class="component-item__name">Monitoring</div>
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div class="architecture-canvas">
      <div class="canvas__toolbar">
        <h3 class="canvas__title">Your AI Architecture</h3>
        <div class="canvas__actions">
          <button class="canvas__btn canvas__btn--primary" id="analyzeBtn">
            🔍 Analyze Threats
          </button>
          <button class="canvas__btn canvas__btn--secondary" id="exportBtn">
            💾 Export
          </button>
          <button class="canvas__btn canvas__btn--danger" id="clearBtn">
            🗑️ Clear
          </button>
        </div>
      </div>

      <div class="canvas__dropzone" id="dropzone">
        <div class="canvas__placeholder" id="placeholder">
          <div class="canvas__placeholder-icon">🎨</div>
          <div class="canvas__placeholder-text">
            Drag components here to build your AI architecture
          </div>
        </div>
        <!-- Components will be placed here -->
      </div>
    </div>

    <!-- Analysis Panel -->
    <div class="analysis-panel">
      <h2 class="analysis-panel__title">⚠️ Threat Analysis</h2>

      <div class="analysis-panel__section">
        <div class="analysis-panel__section-title">Risk Score</div>
        <div class="risk-score risk-score--low" id="riskScore">0</div>
        <div style="text-align: center; font-size: 0.9rem; color: #666;" id="riskLevel">
          No components added
        </div>
      </div>

      <div class="analysis-panel__section">
        <div class="analysis-panel__section-title">🎯 Identified Threats</div>
        <ul class="threat-list" id="threatList">
          <li style="text-align: center; color: #999; padding: 20px;">
            Add components to see threats
          </li>
        </ul>
      </div>

      <div class="analysis-panel__section">
        <div class="analysis-panel__section-title">🛡️ Recommended Controls</div>
        <ul class="control-list" id="controlList">
          <li style="text-align: center; color: #999; padding: 20px;">
            Threats will show recommended controls
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>

<!-- Export Modal (hidden by default) -->
<div class="export-modal" id="exportModal" style="display: none;">
  <div class="export-modal__content">
    <h2 class="export-modal__title">Export Threat Model</h2>
    <div class="export-options">
      <div class="export-option" data-format="json">
        <div class="export-option__icon">📄</div>
        <div class="export-option__name">JSON</div>
      </div>
      <div class="export-option" data-format="sarif">
        <div class="export-option__icon">🔒</div>
        <div class="export-option__name">SARIF</div>
      </div>
      <div class="export-option" data-format="pdf">
        <div class="export-option__icon">📋</div>
        <div class="export-option__name">PDF Report</div>
      </div>
      <div class="export-option" data-format="markdown">
        <div class="export-option__icon">📝</div>
        <div class="export-option__name">Markdown</div>
      </div>
    </div>
    <div style="text-align: right;">
      <button class="canvas__btn canvas__btn--secondary" id="closeExportModal">
        Cancel
      </button>
    </div>
  </div>
</div>

<script src="/js/threat-modeler.js"></script>
{{< /rawhtml >}}

---

## How to Use

### 1. Build Your Architecture
- **Drag components** from the left panel onto the canvas
- **Position them** to represent your system architecture
- **Add multiple components** to build a complete system

### 2. Analyze Threats
- Click **"Analyze Threats"** to get instant analysis
- View **risk score** (0-100 scale)
- See **identified threats** mapped to OWASP categories
- Review **recommended controls**

### 3. Export Results
- Click **"Export"** to save your threat model
- Choose format:
  - **JSON** - Machine-readable architecture
  - **SARIF** - Import to GitHub Security tab!
  - **PDF Report** - Share with stakeholders
  - **Markdown** - Documentation

---

## Example Architectures

### RAG Application
1. Add: **User Input** → **RAG System** → **Vector DB** → **LLM API**
2. Analyze to see prompt injection and data poisoning threats

### ML Training Pipeline
1. Add: **Training Data** → **Training Pipeline** → **Model Store**
2. Analyze for poisoning and model theft threats

### Production LLM API
1. Add: **API Gateway** → **LLM API** → **Monitoring**
2. See runtime security threats

---

## Features

✅ **Drag & Drop Interface** - Intuitive visual builder
✅ **Real-time Analysis** - Instant threat identification
✅ **OWASP Mapping** - All threats mapped to OWASP AI taxonomy
✅ **Risk Scoring** - Automated risk assessment
✅ **Control Recommendations** - Specific OWASP controls for each threat
✅ **Multiple Export Formats** - JSON, SARIF, PDF, Markdown
✅ **GitHub Integration** - SARIF export for Security tab
✅ **Save & Load** - Local storage persistence
✅ **Template Library** - Pre-built common architectures (coming soon)

---

## Threat Detection Engine

The modeler automatically identifies threats based on:

- **Component types** (LLM, training pipeline, user input, etc.)
- **Data flows** (user input → LLM = prompt injection risk)
- **Architectural patterns** (RAG = retrieval poisoning risk)
- **OWASP AI taxonomy** (all 40+ threat categories)

---

## Privacy & Security

- ✅ **100% client-side** - No data sent to servers
- ✅ **Local storage only** - Architectures saved in your browser
- ✅ **No tracking** - Complete privacy
- ✅ **Open source** - Inspect the code

---

**Need help?** Check the [OWASP AI Security Overview](/docs/ai_security_overview) for detailed threat descriptions.
