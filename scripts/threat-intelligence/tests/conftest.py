"""
Shared pytest fixtures and configuration
"""

import pytest
import os
from unittest.mock import MagicMock


@pytest.fixture(scope='session')
def test_data_dir():
    """Path to test data directory"""
    return os.path.join(os.path.dirname(__file__), 'fixtures')


@pytest.fixture
def mock_env_vars(monkeypatch):
    """Mock environment variables"""
    monkeypatch.setenv('ANTHROPIC_API_KEY', 'test-claude-key')
    monkeypatch.setenv('OPENAI_API_KEY', 'test-gpt-key')
    monkeypatch.setenv('GITHUB_TOKEN', 'test-github-token')
    monkeypatch.setenv('NVD_API_KEY', 'test-nvd-key')


@pytest.fixture
def sample_threats():
    """Sample threat data for testing"""
    return [
        {
            "id": "CVE-2024-0001",
            "type": "cve",
            "description": "Prompt injection vulnerability",
            "severity": "HIGH",
            "category": "4.5",
            "published": "2024-01-15"
        },
        {
            "id": "GHSA-xxxx-yyyy-zzzz",
            "type": "advisory",
            "description": "Model poisoning attack",
            "severity": "CRITICAL",
            "category": "3.1",
            "published": "2024-01-14"
        }
    ]


@pytest.fixture
def mock_anthropic_client():
    """Mock Anthropic API client"""
    client = MagicMock()
    client.messages = MagicMock()
    return client


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI API client"""
    client = MagicMock()
    client.chat = MagicMock()
    client.chat.completions = MagicMock()
    return client


@pytest.fixture
def temp_output_dir(tmp_path):
    """Temporary directory for test outputs"""
    output_dir = tmp_path / "output"
    output_dir.mkdir()
    return output_dir


# Configure test markers
def pytest_configure(config):
    """Configure custom pytest markers"""
    config.addinivalue_line(
        "markers", "unit: mark test as a unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "api: mark test as requiring API access"
    )
