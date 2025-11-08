// OWASP AI Threat Modeler - Interactive Threat Modeling Tool
// First of its kind - drag & drop AI architecture threat analysis

// Threat Database - Maps components to OWASP threats
const THREAT_DATABASE = {
  'llm-api': [
    {
      id: 'T-4.5',
      name: 'Direct Prompt Injection',
      category: '4.5 DIRECT PROMPT INJECTION',
      severity: 'HIGH',
      description: 'Malicious prompts can manipulate LLM behavior',
      controls: ['C-4.7', 'C-4.8', 'C-1.1']
    },
    {
      id: 'T-4.6',
      name: 'Indirect Prompt Injection',
      category: '4.6 INDIRECT PROMPT INJECTION',
      severity: 'HIGH',
      description: 'External content can inject malicious instructions',
      controls: ['C-4.7', 'C-4.9']
    },
    {
      id: 'T-2.3',
      name: 'Model Extraction',
      category: '2.3 MODEL THEFT',
      severity: 'MEDIUM',
      description: 'API queries can be used to extract model knowledge',
      controls: ['C-2.5', 'C-2.6']
    },
    {
      id: 'T-2.4',
      name: 'Model DOS',
      category: '2.4 MODEL DOS',
      severity: 'MEDIUM',
      description: 'Resource exhaustion through expensive queries',
      controls: ['C-2.7', 'C-2.8']
    }
  ],
  'user-input': [
    {
      id: 'T-2.1',
      name: 'Adversarial Input',
      category: '2.1 EVASION',
      severity: 'HIGH',
      description: 'Crafted inputs to fool the model',
      controls: ['C-2.1', 'C-2.2']
    },
    {
      id: 'T-4.1',
      name: 'Injection Attacks',
      category: '4.1 NON AI APPLICATION SECURITY',
      severity: 'HIGH',
      description: 'SQL, XSS, command injection through user input',
      controls: ['C-4.1', 'C-4.2']
    }
  ],
  'training-data': [
    {
      id: 'T-3.4',
      name: 'Data Poisoning',
      category: '3.4 DATA POISONING',
      severity: 'CRITICAL',
      description: 'Malicious training data can corrupt the model',
      controls: ['C-3.5', 'C-3.6', 'C-3.7']
    },
    {
      id: 'T-3.2',
      name: 'Sensitive Data Leak',
      category: '3.2 SENSITIVE DATA LEAK',
      severity: 'HIGH',
      description: 'Training data may contain PII or confidential information',
      controls: ['C-1.2', 'C-1.3']
    }
  ],
  'training-pipeline': [
    {
      id: 'T-3.1',
      name: 'Broad Model Poisoning',
      category: '3.1 BROAD MODEL POISONING',
      severity: 'CRITICAL',
      description: 'Manipulation during training phase',
      controls: ['C-3.1', 'C-3.2']
    },
    {
      id: 'T-4.2',
      name: 'Supply Chain Attack',
      category: '4.2 RUNTIME MODEL POISONING',
      severity: 'HIGH',
      description: 'Compromised dependencies in training pipeline',
      controls: ['C-3.3', 'C-3.4']
    }
  ],
  'rag-system': [
    {
      id: 'T-RAG-1',
      name: 'Retrieval Poisoning',
      category: '3.4 DATA POISONING',
      severity: 'HIGH',
      description: 'Malicious documents in knowledge base',
      controls: ['C-3.5', 'C-4.7']
    },
    {
      id: 'T-RAG-2',
      name: 'Context Injection',
      category: '4.6 INDIRECT PROMPT INJECTION',
      severity: 'HIGH',
      description: 'Retrieved content contains injection payloads',
      controls: ['C-4.7', 'C-4.9']
    }
  ],
  'vector-db': [
    {
      id: 'T-DB-1',
      name: 'Vector Database Poisoning',
      category: '3.4 DATA POISONING',
      severity: 'MEDIUM',
      description: 'Malicious embeddings in vector store',
      controls: ['C-3.5', 'C-1.3']
    },
    {
      id: 'T-2.2',
      name: 'Data Disclosure',
      category: '2.2 SENSITIVE DATA DISCLOSURE',
      severity: 'HIGH',
      description: 'Vectors may leak sensitive information',
      controls: ['C-1.2', 'C-1.3']
    }
  ],
  'model-store': [
    {
      id: 'T-4.3',
      name: 'Model Theft',
      category: '4.3 RUNTIME MODEL THEFT',
      severity: 'HIGH',
      description: 'Unauthorized access to model files',
      controls: ['C-2.5', 'C-4.5']
    },
    {
      id: 'T-MS-1',
      name: 'Model Tampering',
      category: '4.2 RUNTIME MODEL POISONING',
      severity: 'CRITICAL',
      description: 'Unauthorized modification of stored models',
      controls: ['C-3.3', 'C-4.5']
    }
  ],
  'api-gateway': [
    {
      id: 'T-4.1-2',
      name: 'Authentication Bypass',
      category: '4.1 NON AI APPLICATION SECURITY',
      severity: 'CRITICAL',
      description: 'Weak authentication on API gateway',
      controls: ['C-4.1', 'C-4.2']
    }
  ],
  'inference-engine': [
    {
      id: 'T-2.1-2',
      name: 'Evasion Attack',
      category: '2.1 EVASION',
      severity: 'HIGH',
      description: 'Adversarial examples at inference time',
      controls: ['C-2.1', 'C-2.2', 'C-2.3']
    }
  ]
};

// Control Database
const CONTROL_DATABASE = {
  'C-1.1': 'Implement governance and oversight',
  'C-1.2': 'Limit sensitive data in training/prompts',
  'C-1.3': 'Data sanitization and PII removal',
  'C-2.1': 'Input validation and sanitization',
  'C-2.2': 'Adversarial training',
  'C-2.3': 'Anomaly detection',
  'C-2.5': 'Rate limiting and query monitoring',
  'C-2.6': 'Model watermarking',
  'C-2.7': 'Resource quotas',
  'C-2.8': 'Query complexity limits',
  'C-3.1': 'Training data validation',
  'C-3.2': 'Secure training environment',
  'C-3.3': 'Supply chain security',
  'C-3.4': 'Dependency scanning',
  'C-3.5': 'Data provenance tracking',
  'C-3.6': 'Outlier detection',
  'C-3.7': 'Data quality checks',
  'C-4.1': 'Authentication and authorization',
  'C-4.2': 'Input validation (XSS, SQLi, etc.)',
  'C-4.5': 'Access control and encryption',
  'C-4.7': 'Prompt filtering and sanitization',
  'C-4.8': 'Output validation',
  'C-4.9': 'Content security policies'
};

class ThreatModeler {
  constructor() {
    this.components = [];
    this.nextId = 1;
    this.selectedComponent = null;
    this.init();
  }

  init() {
    this.setupDragAndDrop();
    this.setupEventListeners();
    this.loadFromStorage();
  }

  setupDragAndDrop() {
    const componentItems = document.querySelectorAll('.component-item');
    const dropzone = document.getElementById('dropzone');

    componentItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('componentType', e.target.dataset.type);
        e.dataTransfer.setData('componentName', e.target.querySelector('.component-item__name').textContent);
        e.dataTransfer.setData('componentIcon', e.target.querySelector('.component-item__icon').textContent);
      });
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('canvas__dropzone--active');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('canvas__dropzone--active');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('canvas__dropzone--active');

      const type = e.dataTransfer.getData('componentType');
      const name = e.dataTransfer.getData('componentName');
      const icon = e.dataTransfer.getData('componentIcon');

      const rect = dropzone.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.addComponent(type, name, icon, x, y);
    });
  }

  setupEventListeners() {
    document.getElementById('analyzeBtn').addEventListener('click', () => this.analyzeThreats());
    document.getElementById('clearBtn').addEventListener('click', () => this.clearCanvas());
    document.getElementById('exportBtn').addEventListener('click', () => this.showExportModal());
    document.getElementById('closeExportModal').addEventListener('click', () => this.hideExportModal());

    document.querySelectorAll('.export-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const format = e.currentTarget.dataset.format;
        this.exportModel(format);
      });
    });
  }

  addComponent(type, name, icon, x, y) {
    const component = {
      id: this.nextId++,
      type,
      name,
      icon,
      x,
      y
    };

    this.components.push(component);
    this.renderComponent(component);
    this.hidePlaceholder();
    this.saveToStorage();
    this.analyzeThreats(); // Auto-analyze on add
  }

  renderComponent(component) {
    const dropzone = document.getElementById('dropzone');
    const el = document.createElement('div');
    el.className = 'placed-component';
    el.dataset.id = component.id;
    el.style.left = `${component.x}px`;
    el.style.top = `${component.y}px`;

    el.innerHTML = `
      <div class="placed-component__header">
        <span class="placed-component__icon">${component.icon}</span>
        <span class="placed-component__name">${component.name}</span>
        <button class="placed-component__remove" data-id="${component.id}">×</button>
      </div>
      <div class="placed-component__type">${component.type}</div>
    `;

    // Make draggable
    el.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('placed-component__remove')) {
        this.removeComponent(component.id);
        return;
      }
      this.startDrag(e, component, el);
    });

    dropzone.appendChild(el);
  }

  startDrag(e, component, el) {
    const startX = e.clientX - component.x;
    const startY = e.clientY - component.y;

    const onMouseMove = (e) => {
      const dropzone = document.getElementById('dropzone');
      const rect = dropzone.getBoundingClientRect();

      component.x = e.clientX - rect.left - startX;
      component.y = e.clientY - rect.top - startY;

      el.style.left = `${component.x}px`;
      el.style.top = `${component.y}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this.saveToStorage();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  removeComponent(id) {
    this.components = this.components.filter(c => c.id !== id);
    document.querySelector(`[data-id="${id}"]`).remove();

    if (this.components.length === 0) {
      this.showPlaceholder();
    }

    this.saveToStorage();
    this.analyzeThreats();
  }

  analyzeThreats() {
    const threats = [];
    const controls = new Set();

    // Collect all threats from components
    this.components.forEach(component => {
      const componentThreats = THREAT_DATABASE[component.type] || [];
      componentThreats.forEach(threat => {
        threats.push(threat);
        threat.controls.forEach(c => controls.add(c));
      });
    });

    // Calculate risk score
    const riskScore = this.calculateRiskScore(threats);

    // Update UI
    this.updateRiskScore(riskScore);
    this.updateThreatList(threats);
    this.updateControlList(Array.from(controls));
  }

  calculateRiskScore(threats) {
    if (threats.length === 0) return 0;

    const severityScores = {
      'CRITICAL': 25,
      'HIGH': 15,
      'MEDIUM': 8,
      'LOW': 3
    };

    const totalScore = threats.reduce((sum, threat) => {
      return sum + (severityScores[threat.severity] || 0);
    }, 0);

    return Math.min(100, totalScore);
  }

  updateRiskScore(score) {
    const scoreEl = document.getElementById('riskScore');
    const levelEl = document.getElementById('riskLevel');

    scoreEl.textContent = score;

    let level, className;
    if (score === 0) {
      level = 'No components added';
      className = 'risk-score--low';
    } else if (score < 30) {
      level = 'Low Risk';
      className = 'risk-score--low';
    } else if (score < 60) {
      level = 'Medium Risk';
      className = 'risk-score--medium';
    } else if (score < 80) {
      level = 'High Risk';
      className = 'risk-score--high';
    } else {
      level = 'Critical Risk';
      className = 'risk-score--critical';
    }

    scoreEl.className = `risk-score ${className}`;
    levelEl.textContent = level;
  }

  updateThreatList(threats) {
    const listEl = document.getElementById('threatList');

    if (threats.length === 0) {
      listEl.innerHTML = '<li style="text-align: center; color: #999; padding: 20px;">No threats identified</li>';
      return;
    }

    // Sort by severity
    const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
    threats.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    listEl.innerHTML = threats.map(threat => `
      <li class="threat-item threat-item--${threat.severity.toLowerCase()}">
        <div class="threat-item__title">${threat.name}</div>
        <div class="threat-item__category">${threat.category} • ${threat.severity}</div>
      </li>
    `).join('');
  }

  updateControlList(controls) {
    const listEl = document.getElementById('controlList');

    if (controls.length === 0) {
      listEl.innerHTML = '<li style="text-align: center; color: #999; padding: 20px;">No controls recommended</li>';
      return;
    }

    listEl.innerHTML = controls.sort().map(controlId => `
      <li class="control-item">
        <span class="control-item__id">${controlId}:</span>
        ${CONTROL_DATABASE[controlId] || 'Control description'}
      </li>
    `).join('');
  }

  clearCanvas() {
    if (!confirm('Clear all components and start over?')) return;

    this.components = [];
    document.querySelectorAll('.placed-component').forEach(el => el.remove());
    this.showPlaceholder();
    this.saveToStorage();
    this.analyzeThreats();
  }

  hidePlaceholder() {
    document.getElementById('placeholder').style.display = 'none';
  }

  showPlaceholder() {
    document.getElementById('placeholder').style.display = 'block';
  }

  showExportModal() {
    document.getElementById('exportModal').style.display = 'flex';
  }

  hideExportModal() {
    document.getElementById('exportModal').style.display = 'none';
  }

  exportModel(format) {
    const model = {
      version: '1.0.0',
      created: new Date().toISOString(),
      components: this.components,
      analysis: this.getAnalysis()
    };

    switch (format) {
      case 'json':
        this.downloadJSON(model);
        break;
      case 'sarif':
        this.downloadSARIF(model);
        break;
      case 'markdown':
        this.downloadMarkdown(model);
        break;
      case 'pdf':
        alert('PDF export coming soon! Use Markdown export and convert to PDF.');
        break;
    }

    this.hideExportModal();
  }

  getAnalysis() {
    const threats = [];
    this.components.forEach(component => {
      const componentThreats = THREAT_DATABASE[component.type] || [];
      threats.push(...componentThreats);
    });

    return {
      riskScore: this.calculateRiskScore(threats),
      threats: threats,
      controls: [...new Set(threats.flatMap(t => t.controls))]
    };
  }

  downloadJSON(model) {
    const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' });
    this.download(blob, 'threat-model.json');
  }

  downloadSARIF(model) {
    // SARIF format for GitHub Security tab
    const sarif = {
      version: '2.1.0',
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      runs: [{
        tool: {
          driver: {
            name: 'OWASP AI Threat Modeler',
            version: '1.0.0',
            informationUri: 'https://owaspai.org/threat-modeler'
          }
        },
        results: model.analysis.threats.map(threat => ({
          ruleId: threat.id,
          level: threat.severity.toLowerCase(),
          message: {
            text: threat.description
          },
          properties: {
            category: threat.category,
            controls: threat.controls
          }
        }))
      }]
    };

    const blob = new Blob([JSON.stringify(sarif, null, 2)], { type: 'application/json' });
    this.download(blob, 'threat-model.sarif');
  }

  downloadMarkdown(model) {
    let md = `# AI Threat Model Report\n\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    md += `**Risk Score:** ${model.analysis.riskScore}/100\n\n`;
    md += `## Architecture\n\n`;
    md += `Components in system:\n`;
    model.components.forEach(c => {
      md += `- ${c.icon} ${c.name} (${c.type})\n`;
    });
    md += `\n## Identified Threats\n\n`;
    model.analysis.threats.forEach(threat => {
      md += `### ${threat.name}\n`;
      md += `- **Category:** ${threat.category}\n`;
      md += `- **Severity:** ${threat.severity}\n`;
      md += `- **Description:** ${threat.description}\n`;
      md += `- **Controls:** ${threat.controls.join(', ')}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    this.download(blob, 'threat-model.md');
  }

  download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  saveToStorage() {
    localStorage.setItem('owaspThreatModel', JSON.stringify(this.components));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('owaspThreatModel');
    if (saved) {
      try {
        this.components = JSON.parse(saved);
        this.components.forEach(c => this.renderComponent(c));
        if (this.components.length > 0) {
          this.hidePlaceholder();
          this.analyzeThreats();
        }
      } catch (e) {
        console.error('Failed to load saved model:', e);
      }
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ThreatModeler();
});
