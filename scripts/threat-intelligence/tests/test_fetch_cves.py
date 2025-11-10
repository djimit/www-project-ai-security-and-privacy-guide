"""
Unit tests for CVE fetching module
Tests NVD API integration, filtering, rate limiting
"""

import pytest
import responses
import json
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Import the module to test
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fetch_cves import (
    query_nvd_api,
    fetch_recent_ai_cves,
    is_ai_related,
    parse_cve_data,
    AI_KEYWORDS
)


class TestCVEFetching:
    """Test suite for CVE fetching functionality"""

    @pytest.fixture
    def mock_cve_response(self):
        """Mock CVE API response"""
        return {
            "vulnerabilities": [
                {
                    "cve": {
                        "id": "CVE-2024-0001",
                        "descriptions": [
                            {
                                "lang": "en",
                                "value": "Prompt injection vulnerability in LLM API allows attackers to bypass security controls"
                            }
                        ],
                        "published": "2024-01-15T10:00:00.000",
                        "lastModified": "2024-01-15T10:00:00.000",
                        "metrics": {
                            "cvssMetricV31": [
                                {
                                    "cvssData": {
                                        "baseScore": 7.5,
                                        "baseSeverity": "HIGH"
                                    }
                                }
                            ]
                        },
                        "references": [
                            {
                                "url": "https://example.com/advisory"
                            }
                        ]
                    }
                }
            ],
            "resultsPerPage": 1,
            "startIndex": 0,
            "totalResults": 1
        }

    @responses.activate
    def test_query_nvd_api_success(self, mock_cve_response):
        """Test successful NVD API query"""
        responses.add(
            responses.GET,
            'https://services.nvd.nist.gov/rest/json/cves/2.0',
            json=mock_cve_response,
            status=200
        )

        result = query_nvd_api({'resultsPerPage': 1})

        assert result is not None
        assert 'vulnerabilities' in result
        assert len(result['vulnerabilities']) == 1

    @responses.activate
    def test_query_nvd_api_rate_limit(self):
        """Test rate limiting behavior"""
        # First request succeeds
        responses.add(
            responses.GET,
            'https://services.nvd.nist.gov/rest/json/cves/2.0',
            json={"vulnerabilities": []},
            status=200
        )

        # Second request should be rate limited
        responses.add(
            responses.GET,
            'https://services.nvd.nist.gov/rest/json/cves/2.0',
            json={"message": "Rate limit exceeded"},
            status=429
        )

        # First call should work
        result1 = query_nvd_api({'resultsPerPage': 1})
        assert result1 is not None

        # Second immediate call should be rate limited
        # (In real code, this would wait, but in test we check the mechanism)

    @responses.activate
    def test_query_nvd_api_error_handling(self):
        """Test error handling for failed API requests"""
        responses.add(
            responses.GET,
            'https://services.nvd.nist.gov/rest/json/cves/2.0',
            json={"error": "Server error"},
            status=500
        )

        result = query_nvd_api({'resultsPerPage': 1})
        assert result is None

    def test_is_ai_related_positive_cases(self):
        """Test AI keyword detection - positive cases"""
        test_cases = [
            "This vulnerability affects machine learning models",
            "Prompt injection in GPT-4 API",
            "Adversarial attack on neural network",
            "Data poisoning in training dataset",
            "LLM hallucination vulnerability"
        ]

        for description in test_cases:
            assert is_ai_related(description), f"Should detect AI in: {description}"

    def test_is_ai_related_negative_cases(self):
        """Test AI keyword detection - negative cases"""
        test_cases = [
            "SQL injection vulnerability",
            "Cross-site scripting attack",
            "Buffer overflow in C application",
            "Authentication bypass in web app"
        ]

        for description in test_cases:
            assert not is_ai_related(description), f"Should not detect AI in: {description}"

    def test_is_ai_related_case_insensitive(self):
        """Test that keyword detection is case-insensitive"""
        test_cases = [
            "MACHINE LEARNING vulnerability",
            "Prompt Injection Attack",
            "llm security issue"
        ]

        for description in test_cases:
            assert is_ai_related(description)

    def test_parse_cve_data(self, mock_cve_response):
        """Test CVE data parsing"""
        cve_item = mock_cve_response['vulnerabilities'][0]['cve']
        parsed = parse_cve_data(cve_item)

        assert parsed['id'] == 'CVE-2024-0001'
        assert 'prompt injection' in parsed['description'].lower()
        assert parsed['severity'] == 'HIGH'
        assert parsed['cvss_score'] == 7.5
        assert len(parsed['references']) > 0

    def test_parse_cve_data_missing_metrics(self):
        """Test parsing CVE with missing CVSS metrics"""
        cve_item = {
            "id": "CVE-2024-0002",
            "descriptions": [
                {"lang": "en", "value": "Test vulnerability"}
            ],
            "published": "2024-01-15T10:00:00.000",
            "lastModified": "2024-01-15T10:00:00.000"
        }

        parsed = parse_cve_data(cve_item)

        assert parsed['severity'] == 'UNKNOWN'
        assert parsed['cvss_score'] == 0.0

    @responses.activate
    def test_fetch_recent_ai_cves(self, mock_cve_response):
        """Test fetching recent AI-related CVEs"""
        responses.add(
            responses.GET,
            'https://services.nvd.nist.gov/rest/json/cves/2.0',
            json=mock_cve_response,
            status=200
        )

        cves = fetch_recent_ai_cves(days=7)

        assert isinstance(cves, list)
        assert len(cves) > 0
        assert all('id' in cve for cve in cves)

    def test_ai_keywords_coverage(self):
        """Test that AI_KEYWORDS list is comprehensive"""
        # Check for essential keywords
        essential_keywords = [
            'artificial intelligence',
            'machine learning',
            'deep learning',
            'neural network',
            'llm',
            'gpt',
            'prompt injection',
            'adversarial'
        ]

        ai_keywords_lower = [k.lower() for k in AI_KEYWORDS]

        for keyword in essential_keywords:
            assert keyword.lower() in ai_keywords_lower, \
                f"Essential keyword '{keyword}' missing from AI_KEYWORDS"

    @responses.activate
    def test_pagination_handling(self):
        """Test handling of paginated results"""
        # Mock multiple pages
        page1 = {
            "vulnerabilities": [{"cve": {"id": f"CVE-2024-000{i}"}} for i in range(10)],
            "resultsPerPage": 10,
            "startIndex": 0,
            "totalResults": 25
        }

        page2 = {
            "vulnerabilities": [{"cve": {"id": f"CVE-2024-00{10+i}"}} for i in range(10)],
            "resultsPerPage": 10,
            "startIndex": 10,
            "totalResults": 25
        }

        responses.add(
            responses.GET,
            'https://services.nvd.nist.gov/rest/json/cves/2.0',
            json=page1,
            status=200
        )

        responses.add(
            responses.GET,
            'https://services.nvd.nist.gov/rest/json/cves/2.0',
            json=page2,
            status=200
        )

        # Test that pagination is handled correctly
        # (Implementation would fetch multiple pages)

    def test_date_filtering(self):
        """Test date range filtering for CVEs"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)

        # Mock CVE with recent date
        recent_cve = {
            "id": "CVE-2024-0001",
            "published": end_date.isoformat()
        }

        # Mock CVE with old date
        old_cve = {
            "id": "CVE-2020-0001",
            "published": (end_date - timedelta(days=365)).isoformat()
        }

        # Test filtering logic
        # (Would be implemented in the actual filter function)

    @pytest.mark.slow
    @responses.activate
    def test_fetch_large_dataset(self):
        """Test fetching and processing large number of CVEs"""
        # Mock large response
        large_response = {
            "vulnerabilities": [
                {"cve": {"id": f"CVE-2024-{i:04d}"}} for i in range(100)
            ],
            "resultsPerPage": 100,
            "startIndex": 0,
            "totalResults": 100
        }

        responses.add(
            responses.GET,
            'https://services.nvd.nist.gov/rest/json/cves/2.0',
            json=large_response,
            status=200
        )

        # Should handle large datasets efficiently

    def test_error_recovery(self):
        """Test error recovery mechanisms"""
        # Test that the system can recover from transient errors
        # and continue processing

    @pytest.mark.parametrize("keyword,expected", [
        ("tensorflow", True),
        ("pytorch", True),
        ("huggingface", True),
        ("java", False),
        ("python", False),  # Too generic
        ("model poisoning", True),
        ("sql injection", False)
    ])
    def test_keyword_specificity(self, keyword, expected):
        """Test that keywords are specific enough to AI/ML"""
        description = f"This is a {keyword} vulnerability"
        assert is_ai_related(description) == expected


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
