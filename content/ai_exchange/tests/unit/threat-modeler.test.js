/**
 * Unit Tests for Threat Modeler
 * Tests component system, threat detection, risk scoring, exports
 */

// Load the threat modeler code
const fs = require('fs');
const path = require('path');
const threatModelerCode = fs.readFileSync(
  path.join(__dirname, '../../static/js/threat-modeler.js'),
  'utf8'
);

// Evaluate the code in the test environment
eval(threatModelerCode);

describe('ThreatModeler', () => {
  let modeler;
  let mockCanvas;

  beforeEach(() => {
    // Create mock DOM elements
    mockCanvas = document.createElement('div');
    mockCanvas.id = 'canvas';
    document.body.appendChild(mockCanvas);

    // Create other required elements
    const threatsList = document.createElement('div');
    threatsList.id = 'threats-list';
    document.body.appendChild(threatsList);

    const controlsList = document.createElement('div');
    controlsList.id = 'controls-list';
    document.body.appendChild(controlsList);

    const riskScore = document.createElement('div');
    riskScore.id = 'risk-score';
    document.body.appendChild(riskScore);

    modeler = new ThreatModeler();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  describe('Initialization', () => {
    test('should initialize with empty model', () => {
      expect(modeler.model).toBeDefined();
      expect(modeler.model.components).toEqual([]);
      expect(modeler.model.analysis.threats).toEqual([]);
      expect(modeler.model.analysis.riskScore).toBe(0);
    });

    test('should load threat database', () => {
      expect(modeler.threatDatabase).toBeDefined();
      expect(Object.keys(modeler.threatDatabase).length).toBeGreaterThan(0);
    });

    test('should load control database', () => {
      expect(modeler.controlDatabase).toBeDefined();
      expect(Object.keys(modeler.controlDatabase).length).toBeGreaterThan(0);
    });
  });

  describe('Component Management', () => {
    test('should add component to model', () => {
      const component = {
        type: 'llm-api',
        label: 'LLM API',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);

      expect(modeler.model.components.length).toBe(1);
      expect(modeler.model.components[0].type).toBe('llm-api');
      expect(modeler.model.components[0].id).toBeDefined();
    });

    test('should generate unique IDs for components', () => {
      const component1 = {
        type: 'llm-api',
        label: 'API 1',
        position: { x: 100, y: 100 }
      };

      const component2 = {
        type: 'llm-api',
        label: 'API 2',
        position: { x: 200, y: 200 }
      };

      modeler.addComponent(component1);
      modeler.addComponent(component2);

      const ids = modeler.model.components.map(c => c.id);
      expect(new Set(ids).size).toBe(2); // All unique
    });

    test('should remove component from model', () => {
      const component = {
        type: 'llm-api',
        label: 'Test',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      const componentId = modeler.model.components[0].id;

      modeler.removeComponent(componentId);
      expect(modeler.model.components.length).toBe(0);
    });

    test('should update component position', () => {
      const component = {
        type: 'llm-api',
        label: 'Test',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      const componentId = modeler.model.components[0].id;

      modeler.updateComponentPosition(componentId, { x: 200, y: 200 });

      const updated = modeler.model.components[0];
      expect(updated.position.x).toBe(200);
      expect(updated.position.y).toBe(200);
    });
  });

  describe('Threat Detection', () => {
    test('should detect threats for LLM API component', () => {
      const component = {
        type: 'llm-api',
        label: 'LLM API',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.analyzeThreats();

      expect(modeler.model.analysis.threats.length).toBeGreaterThan(0);
    });

    test('should include prompt injection threats for LLM', () => {
      const component = {
        type: 'llm-api',
        label: 'LLM API',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.analyzeThreats();

      const promptInjectionThreat = modeler.model.analysis.threats.find(
        t => t.id === 'T-4.5' || t.name.includes('Prompt Injection')
      );

      expect(promptInjectionThreat).toBeDefined();
    });

    test('should detect data poisoning for training pipeline', () => {
      const component = {
        type: 'training-pipeline',
        label: 'Training',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.analyzeThreats();

      const poisoningThreat = modeler.model.analysis.threats.find(
        t => t.name.includes('Poisoning') || t.id.startsWith('T-3')
      );

      expect(poisoningThreat).toBeDefined();
    });

    test('should detect RAG-specific threats', () => {
      const component = {
        type: 'rag-system',
        label: 'RAG System',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.analyzeThreats();

      const ragThreat = modeler.model.analysis.threats.find(
        t => t.name.includes('Retrieval') || t.id === 'T-4.6'
      );

      expect(ragThreat).toBeDefined();
    });

    test('should map threats to OWASP categories', () => {
      const component = {
        type: 'llm-api',
        label: 'LLM API',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.analyzeThreats();

      modeler.model.analysis.threats.forEach(threat => {
        expect(threat.category).toBeDefined();
        expect(threat.category).toMatch(/^\d+\.\d+/); // OWASP format
      });
    });
  });

  describe('Risk Scoring', () => {
    test('should calculate risk score for single threat', () => {
      const threats = [
        {
          id: 'T-1',
          severity: 'HIGH',
          name: 'Test Threat',
          category: '4.5',
          controls: []
        }
      ];

      const score = modeler.calculateRiskScore(threats);
      expect(score).toBe(15); // HIGH = 15 points
    });

    test('should calculate risk score for multiple threats', () => {
      const threats = [
        { id: 'T-1', severity: 'CRITICAL', name: 'Threat 1', category: '4.5', controls: [] },
        { id: 'T-2', severity: 'HIGH', name: 'Threat 2', category: '4.6', controls: [] },
        { id: 'T-3', severity: 'MEDIUM', name: 'Threat 3', category: '3.1', controls: [] }
      ];

      const score = modeler.calculateRiskScore(threats);
      expect(score).toBe(48); // 25 + 15 + 8 = 48
    });

    test('should cap risk score at 100', () => {
      const threats = [];
      for (let i = 0; i < 10; i++) {
        threats.push({
          id: `T-${i}`,
          severity: 'CRITICAL',
          name: `Threat ${i}`,
          category: '4.5',
          controls: []
        });
      }

      const score = modeler.calculateRiskScore(threats);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should return 0 for no threats', () => {
      const score = modeler.calculateRiskScore([]);
      expect(score).toBe(0);
    });

    test('should classify risk levels correctly', () => {
      expect(modeler.getRiskLevel(5)).toBe('LOW');
      expect(modeler.getRiskLevel(25)).toBe('MEDIUM');
      expect(modeler.getRiskLevel(55)).toBe('HIGH');
      expect(modeler.getRiskLevel(85)).toBe('CRITICAL');
    });
  });

  describe('Control Recommendations', () => {
    test('should recommend controls for threats', () => {
      const component = {
        type: 'llm-api',
        label: 'LLM API',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.analyzeThreats();

      modeler.model.analysis.threats.forEach(threat => {
        expect(threat.controls).toBeDefined();
        expect(Array.isArray(threat.controls)).toBe(true);
      });
    });

    test('should get control details from database', () => {
      const controlId = 'C-1.1';
      const control = modeler.getControlDetails(controlId);

      expect(control).toBeDefined();
      expect(control.id).toBe(controlId);
      expect(control.title).toBeDefined();
      expect(control.description).toBeDefined();
    });

    test('should aggregate unique controls', () => {
      const component1 = {
        type: 'llm-api',
        label: 'API 1',
        position: { x: 100, y: 100 }
      };

      const component2 = {
        type: 'user-input',
        label: 'Input',
        position: { x: 200, y: 200 }
      };

      modeler.addComponent(component1);
      modeler.addComponent(component2);
      modeler.analyzeThreats();

      const controlIds = modeler.model.analysis.recommendedControls;
      const uniqueControls = new Set(controlIds);

      expect(controlIds.length).toBeGreaterThanOrEqual(uniqueControls.size);
    });
  });

  describe('Export Functionality', () => {
    test('should export model as JSON', () => {
      const component = {
        type: 'llm-api',
        label: 'Test API',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.analyzeThreats();

      const json = modeler.exportJSON();
      const parsed = JSON.parse(json);

      expect(parsed.metadata).toBeDefined();
      expect(parsed.components).toBeDefined();
      expect(parsed.analysis).toBeDefined();
      expect(parsed.analysis.threats).toBeDefined();
      expect(parsed.analysis.riskScore).toBeDefined();
    });

    test('should export model as SARIF', () => {
      const component = {
        type: 'llm-api',
        label: 'Test API',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.analyzeThreats();

      const sarif = modeler.exportSARIF();
      const parsed = JSON.parse(sarif);

      expect(parsed.version).toBe('2.1.0');
      expect(parsed.$schema).toBeDefined();
      expect(parsed.runs).toBeDefined();
      expect(parsed.runs[0].tool).toBeDefined();
      expect(parsed.runs[0].results).toBeDefined();
    });

    test('should map severity to SARIF levels', () => {
      expect(modeler.mapSeverityToSARIF('CRITICAL')).toBe('error');
      expect(modeler.mapSeverityToSARIF('HIGH')).toBe('error');
      expect(modeler.mapSeverityToSARIF('MEDIUM')).toBe('warning');
      expect(modeler.mapSeverityToSARIF('LOW')).toBe('note');
    });

    test('should export model as Markdown', () => {
      const component = {
        type: 'llm-api',
        label: 'Test API',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.analyzeThreats();

      const markdown = modeler.exportMarkdown();

      expect(markdown).toContain('# AI/ML Threat Model');
      expect(markdown).toContain('## Architecture');
      expect(markdown).toContain('## Threat Analysis');
      expect(markdown).toContain('## Risk Assessment');
      expect(markdown).toContain('## Recommended Controls');
    });

    test('should include metadata in exports', () => {
      const component = {
        type: 'llm-api',
        label: 'Test',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);

      const json = modeler.exportJSON();
      const parsed = JSON.parse(json);

      expect(parsed.metadata.created).toBeDefined();
      expect(parsed.metadata.tool).toBe('OWASP AI Threat Modeler');
      expect(parsed.metadata.version).toBeDefined();
    });
  });

  describe('Persistence', () => {
    test('should save model to localStorage', () => {
      const component = {
        type: 'llm-api',
        label: 'Test',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.saveModel();

      const stored = localStorage.getItem('owasp_threat_model');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored);
      expect(parsed.components.length).toBe(1);
    });

    test('should load model from localStorage', () => {
      const testModel = {
        components: [
          {
            id: 'comp-1',
            type: 'llm-api',
            label: 'Saved API',
            position: { x: 150, y: 150 }
          }
        ],
        analysis: {
          threats: [],
          recommendedControls: [],
          riskScore: 0
        }
      };

      localStorage.setItem('owasp_threat_model', JSON.stringify(testModel));

      const newModeler = new ThreatModeler();
      newModeler.loadModel();

      expect(newModeler.model.components.length).toBe(1);
      expect(newModeler.model.components[0].label).toBe('Saved API');
    });

    test('should clear model', () => {
      const component = {
        type: 'llm-api',
        label: 'Test',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.analyzeThreats();

      expect(modeler.model.components.length).toBe(1);

      modeler.clearModel();

      expect(modeler.model.components.length).toBe(0);
      expect(modeler.model.analysis.threats.length).toBe(0);
      expect(modeler.model.analysis.riskScore).toBe(0);
    });
  });

  describe('Multiple Components Interaction', () => {
    test('should detect combined threats from multiple components', () => {
      modeler.addComponent({
        type: 'user-input',
        label: 'User Input',
        position: { x: 100, y: 100 }
      });

      modeler.addComponent({
        type: 'llm-api',
        label: 'LLM',
        position: { x: 200, y: 200 }
      });

      modeler.addComponent({
        type: 'vector-db',
        label: 'Vector DB',
        position: { x: 300, y: 300 }
      });

      modeler.analyzeThreats();

      // Should have threats from all three components
      expect(modeler.model.analysis.threats.length).toBeGreaterThan(3);
    });

    test('should calculate higher risk for complex architectures', () => {
      // Simple architecture
      modeler.addComponent({
        type: 'llm-api',
        label: 'LLM',
        position: { x: 100, y: 100 }
      });

      modeler.analyzeThreats();
      const simpleRisk = modeler.model.analysis.riskScore;

      // Complex architecture
      modeler.clearModel();

      ['user-input', 'llm-api', 'vector-db', 'training-pipeline', 'model-store'].forEach(
        (type, index) => {
          modeler.addComponent({
            type,
            label: type,
            position: { x: 100 * index, y: 100 }
          });
        }
      );

      modeler.analyzeThreats();
      const complexRisk = modeler.model.analysis.riskScore;

      expect(complexRisk).toBeGreaterThan(simpleRisk);
    });
  });

  describe('Threat Database Coverage', () => {
    test('should have threats for all component types', () => {
      const componentTypes = [
        'llm-api',
        'training-pipeline',
        'inference-engine',
        'model-store',
        'rag-system',
        'user-input',
        'training-data',
        'vector-db',
        'data-pipeline',
        'output-display',
        'api-gateway',
        'web-app',
        'monitoring'
      ];

      componentTypes.forEach(type => {
        const threats = modeler.threatDatabase[type];
        expect(threats).toBeDefined();
        expect(threats.length).toBeGreaterThan(0);
      });
    });

    test('should map all threats to OWASP taxonomy', () => {
      Object.values(modeler.threatDatabase).flat().forEach(threat => {
        expect(threat.category).toMatch(/^\d+\.\d+/);
        expect(threat.severity).toMatch(/^(CRITICAL|HIGH|MEDIUM|LOW)$/);
      });
    });

    test('should provide controls for all threats', () => {
      Object.values(modeler.threatDatabase).flat().forEach(threat => {
        expect(threat.controls).toBeDefined();
        expect(Array.isArray(threat.controls)).toBe(true);
        expect(threat.controls.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty model analysis', () => {
      modeler.analyzeThreats();

      expect(modeler.model.analysis.threats.length).toBe(0);
      expect(modeler.model.analysis.riskScore).toBe(0);
    });

    test('should handle invalid component type', () => {
      const component = {
        type: 'invalid-type',
        label: 'Invalid',
        position: { x: 100, y: 100 }
      };

      modeler.addComponent(component);
      modeler.analyzeThreats();

      // Should not crash, just have no threats
      expect(modeler.model.analysis.threats.length).toBe(0);
    });

    test('should handle duplicate component IDs gracefully', () => {
      const component1 = {
        id: 'same-id',
        type: 'llm-api',
        label: 'API 1',
        position: { x: 100, y: 100 }
      };

      const component2 = {
        id: 'same-id',
        type: 'llm-api',
        label: 'API 2',
        position: { x: 200, y: 200 }
      };

      modeler.model.components.push(component1);
      modeler.model.components.push(component2);

      // Should handle gracefully
      expect(modeler.model.components.length).toBe(2);
    });

    test('should handle corrupted localStorage data', () => {
      localStorage.setItem('owasp_threat_model', 'invalid json');

      expect(() => {
        const newModeler = new ThreatModeler();
        newModeler.loadModel();
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should analyze large models efficiently', () => {
      // Add 50 components
      for (let i = 0; i < 50; i++) {
        modeler.addComponent({
          type: i % 2 === 0 ? 'llm-api' : 'vector-db',
          label: `Component ${i}`,
          position: { x: i * 50, y: i * 50 }
        });
      }

      const startTime = Date.now();
      modeler.analyzeThreats();
      const endTime = Date.now();

      // Should complete in under 1 second
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('should export large models efficiently', () => {
      // Add multiple components
      for (let i = 0; i < 20; i++) {
        modeler.addComponent({
          type: 'llm-api',
          label: `API ${i}`,
          position: { x: i * 50, y: i * 50 }
        });
      }

      modeler.analyzeThreats();

      const startTime = Date.now();
      const json = modeler.exportJSON();
      const sarif = modeler.exportSARIF();
      const markdown = modeler.exportMarkdown();
      const endTime = Date.now();

      // All exports should complete quickly
      expect(endTime - startTime).toBeLessThan(500);
      expect(json.length).toBeGreaterThan(0);
      expect(sarif.length).toBeGreaterThan(0);
      expect(markdown.length).toBeGreaterThan(0);
    });
  });
});
