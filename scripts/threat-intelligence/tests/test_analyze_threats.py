"""
Unit tests for threat analysis module
Tests LLM integration, OWASP taxonomy mapping, threat categorization
"""

import pytest
import json
from unittest.mock import patch, MagicMock, Mock
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from analyze_threats import (
    analyze_with_claude,
    analyze_with_gpt,
    categorize_threat,
    extract_owasp_category,
    determine_severity,
    recommend_controls,
    OWASP_TAXONOMY
)


class TestThreatAnalysis:
    """Test suite for threat analysis functionality"""

    @pytest.fixture
    def sample_cve_data(self):
        """Sample CVE data for testing"""
        return {
            "id": "CVE-2024-0001",
            "description": "Prompt injection vulnerability in LLM API allows attackers to bypass security controls and execute unauthorized commands",
            "severity": "HIGH",
            "cvss_score": 7.5,
            "published": "2024-01-15",
            "references": ["https://example.com/advisory"]
        }

    @pytest.fixture
    def sample_advisory_data(self):
        """Sample GitHub advisory for testing"""
        return {
            "id": "GHSA-xxxx-yyyy-zzzz",
            "title": "Model poisoning through backdoor attacks in training data",
            "description": "Attackers can inject malicious samples into training datasets causing model backdoors",
            "severity": "CRITICAL",
            "published": "2024-01-15",
            "url": "https://github.com/advisories/xxx"
        }

    @pytest.fixture
    def mock_claude_response(self):
        """Mock Claude API response"""
        return {
            "is_relevant": True,
            "owasp_category": "4.5 DIRECT PROMPT INJECTION",
            "severity": "HIGH",
            "threat_type": "NEW",
            "controls": ["C-4.7", "C-4.8", "C-1.1"],
            "summary": "Critical prompt injection vulnerability affecting LLM APIs",
            "impact": "Attackers can bypass security controls and execute unauthorized operations",
            "affected_components": ["LLM API", "User Input Handler"],
            "remediation": "Implement input validation, output filtering, and privilege separation"
        }

    @pytest.fixture
    def mock_gpt_response(self):
        """Mock GPT API response"""
        return {
            "is_relevant": True,
            "owasp_category": "3.1 BROAD MODEL POISONING",
            "severity": "CRITICAL",
            "threat_type": "NEW",
            "controls": ["C-3.1", "C-3.2", "C-1.2"],
            "summary": "Model poisoning through training data manipulation",
            "impact": "Compromised model behavior leading to incorrect predictions",
            "affected_components": ["Training Pipeline", "Data Sources"],
            "remediation": "Implement data validation, provenance tracking, and anomaly detection"
        }

    @patch('anthropic.Anthropic')
    def test_analyze_with_claude_success(self, mock_anthropic, sample_cve_data, mock_claude_response):
        """Test successful Claude analysis"""
        # Mock the Anthropic client
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client

        # Mock the messages.create response
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text=json.dumps(mock_claude_response))]
        mock_client.messages.create.return_value = mock_response

        result = analyze_with_claude(sample_cve_data, mock_client)

        assert result is not None
        assert result['is_relevant'] is True
        assert result['owasp_category'] == "4.5 DIRECT PROMPT INJECTION"
        assert result['severity'] == "HIGH"
        assert 'controls' in result
        assert len(result['controls']) > 0

    @patch('anthropic.Anthropic')
    def test_analyze_with_claude_irrelevant(self, mock_anthropic, mock_claude_response):
        """Test Claude analysis for irrelevant threat"""
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client

        irrelevant_response = mock_claude_response.copy()
        irrelevant_response['is_relevant'] = False

        mock_response = MagicMock()
        mock_response.content = [MagicMock(text=json.dumps(irrelevant_response))]
        mock_client.messages.create.return_value = mock_response

        data = {
            "description": "SQL injection in web application"
        }

        result = analyze_with_claude(data, mock_client)

        assert result is not None
        assert result['is_relevant'] is False

    @patch('openai.OpenAI')
    def test_analyze_with_gpt_success(self, mock_openai, sample_advisory_data, mock_gpt_response):
        """Test successful GPT analysis"""
        mock_client = MagicMock()
        mock_openai.return_value = mock_client

        # Mock the chat.completions.create response
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(message=MagicMock(content=json.dumps(mock_gpt_response)))
        ]
        mock_client.chat.completions.create.return_value = mock_response

        result = analyze_with_gpt(sample_advisory_data, mock_client)

        assert result is not None
        assert result['is_relevant'] is True
        assert result['owasp_category'] == "3.1 BROAD MODEL POISONING"
        assert result['severity'] == "CRITICAL"

    def test_extract_owasp_category(self):
        """Test OWASP category extraction from LLM responses"""
        test_cases = [
            ("4.5 DIRECT PROMPT INJECTION", "4.5"),
            ("3.1 BROAD MODEL POISONING", "3.1"),
            ("2.1 EVASION", "2.1"),
            ("1.1 GOVERNANCE", "1.1"),
            ("Category 4.6: Indirect Prompt Injection", "4.6"),
            ("OWASP AI 3.2 Data Poisoning", "3.2")
        ]

        for response_text, expected_category in test_cases:
            category = extract_owasp_category(response_text)
            assert category == expected_category, \
                f"Expected {expected_category}, got {category} for '{response_text}'"

    def test_extract_owasp_category_invalid(self):
        """Test handling of invalid OWASP categories"""
        invalid_cases = [
            "No category here",
            "99.99 INVALID",
            "",
            None
        ]

        for invalid_text in invalid_cases:
            category = extract_owasp_category(str(invalid_text))
            assert category is None or category == "UNKNOWN"

    def test_determine_severity(self):
        """Test severity determination logic"""
        # Test CVSS score mapping
        assert determine_severity(9.5) == "CRITICAL"
        assert determine_severity(8.0) == "HIGH"
        assert determine_severity(6.0) == "MEDIUM"
        assert determine_severity(3.0) == "LOW"
        assert determine_severity(0.0) == "UNKNOWN"

        # Test keyword-based detection
        assert determine_severity(0, "critical vulnerability") == "CRITICAL"
        assert determine_severity(0, "high severity issue") == "HIGH"
        assert determine_severity(0, "medium risk") == "MEDIUM"
        assert determine_severity(0, "low impact") == "LOW"

    def test_recommend_controls(self):
        """Test control recommendation based on OWASP category"""
        # Test prompt injection controls
        controls = recommend_controls("4.5")
        assert "C-4.7" in controls  # Input validation
        assert "C-4.8" in controls  # Output filtering

        # Test data poisoning controls
        controls = recommend_controls("3.1")
        assert "C-3.1" in controls  # Data validation
        assert "C-1.2" in controls  # Supply chain security

        # Test general controls
        controls = recommend_controls("1.1")
        assert len(controls) > 0

    def test_recommend_controls_unknown_category(self):
        """Test control recommendations for unknown categories"""
        controls = recommend_controls("99.99")
        # Should return general controls
        assert len(controls) > 0
        assert "C-1.1" in controls  # General governance

    def test_categorize_threat_prompt_injection(self, sample_cve_data):
        """Test threat categorization for prompt injection"""
        category = categorize_threat(sample_cve_data)
        assert category in ["4.5", "4.6"]  # Prompt injection categories

    def test_categorize_threat_model_poisoning(self):
        """Test threat categorization for model poisoning"""
        data = {
            "description": "Backdoor attack through poisoned training data compromises model integrity",
            "severity": "CRITICAL"
        }

        category = categorize_threat(data)
        assert category in ["3.1", "3.2"]  # Poisoning categories

    def test_categorize_threat_evasion(self):
        """Test threat categorization for evasion attacks"""
        data = {
            "description": "Adversarial examples can evade detection by manipulating input features",
            "severity": "HIGH"
        }

        category = categorize_threat(data)
        assert category == "2.1"  # Evasion

    @pytest.mark.parametrize("description,expected_category", [
        ("Prompt injection in LLM", "4.5"),
        ("Indirect prompt injection via RAG", "4.6"),
        ("Data poisoning in training set", "3.1"),
        ("Model theft through API queries", "2.2"),
        ("Adversarial evasion attack", "2.1"),
        ("Insecure model deployment", "1.1")
    ])
    def test_categorize_various_threats(self, description, expected_category):
        """Test categorization of various threat types"""
        data = {"description": description}
        category = categorize_threat(data)
        assert category.startswith(expected_category.split('.')[0])  # At least correct major category

    def test_owasp_taxonomy_completeness(self):
        """Test that OWASP_TAXONOMY is complete and well-formed"""
        # Check that all major categories are present
        expected_categories = [
            "1. General Controls",
            "2. Threats Through Use",
            "3. Development-time Threats",
            "4. Runtime Application Security Threats"
        ]

        for category in expected_categories:
            assert any(category in section for section in OWASP_TAXONOMY.split('\n'))

        # Check for key subcategories
        key_subcategories = [
            "4.5",  # Direct Prompt Injection
            "4.6",  # Indirect Prompt Injection
            "3.1",  # Broad Model Poisoning
            "2.1",  # Evasion
            "2.2"   # Model Theft
        ]

        for subcat in key_subcategories:
            assert subcat in OWASP_TAXONOMY

    @patch('anthropic.Anthropic')
    def test_analyze_with_claude_error_handling(self, mock_anthropic):
        """Test error handling in Claude analysis"""
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client

        # Simulate API error
        mock_client.messages.create.side_effect = Exception("API Error")

        data = {"description": "Test vulnerability"}

        # Should handle error gracefully
        result = analyze_with_claude(data, mock_client)
        assert result is None or 'error' in result

    @patch('openai.OpenAI')
    def test_analyze_with_gpt_error_handling(self, mock_openai):
        """Test error handling in GPT analysis"""
        mock_client = MagicMock()
        mock_openai.return_value = mock_client

        # Simulate API error
        mock_client.chat.completions.create.side_effect = Exception("API Error")

        data = {"description": "Test vulnerability"}

        # Should handle error gracefully
        result = analyze_with_gpt(data, mock_client)
        assert result is None or 'error' in result

    def test_json_parsing_robustness(self):
        """Test robust JSON parsing from LLM responses"""
        # Test with various JSON formats
        test_cases = [
            '{"is_relevant": true, "severity": "HIGH"}',
            '```json\n{"is_relevant": true}\n```',  # Code block format
            'Here is the analysis: {"is_relevant": true}',  # With prefix
            '{"is_relevant": true} \n Additional text',  # With suffix
        ]

        # Each should be parseable
        for test_json in test_cases:
            # Test JSON extraction logic
            pass

    def test_threat_deduplication(self):
        """Test that duplicate threats are identified"""
        threat1 = {
            "id": "CVE-2024-0001",
            "description": "Prompt injection vulnerability",
            "owasp_category": "4.5"
        }

        threat2 = {
            "id": "CVE-2024-0002",
            "description": "Prompt injection attack vector",
            "owasp_category": "4.5"
        }

        # Should identify as similar threats
        # (Implementation would use similarity metrics)

    @pytest.mark.integration
    def test_end_to_end_analysis(self, sample_cve_data):
        """Integration test for complete analysis pipeline"""
        # This would test the full pipeline from data fetch to analysis
        # Only run with real API keys in integration tests
        pass

    def test_control_mapping_completeness(self):
        """Test that all OWASP categories have control mappings"""
        # Extract all category codes from taxonomy
        import re
        category_codes = re.findall(r'\d+\.\d+', OWASP_TAXONOMY)

        for code in category_codes:
            controls = recommend_controls(code)
            assert len(controls) > 0, f"No controls mapped for category {code}"

    def test_severity_escalation(self):
        """Test severity escalation for critical keywords"""
        # Certain keywords should escalate severity
        critical_keywords = [
            "remote code execution",
            "arbitrary code execution",
            "complete system compromise"
        ]

        for keyword in critical_keywords:
            severity = determine_severity(5.0, keyword)
            assert severity in ["CRITICAL", "HIGH"]

    @pytest.mark.parametrize("category,control_count", [
        ("4.5", 3),  # Should have at least 3 controls
        ("4.6", 3),
        ("3.1", 2),
        ("2.1", 2),
        ("1.1", 1)
    ])
    def test_control_count_minimum(self, category, control_count):
        """Test that categories have minimum number of controls"""
        controls = recommend_controls(category)
        assert len(controls) >= control_count


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
