#!/usr/bin/env python3
"""
Fetch AI/ML related CVEs from the National Vulnerability Database (NVD).

This script queries the NVD API for CVEs related to AI, machine learning,
and related technologies.
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict
import requests
from ratelimit import limits, sleep_and_retry

# NVD API endpoint
NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

# AI/ML related keywords
AI_KEYWORDS = [
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "neural network",
    "tensorflow",
    "pytorch",
    "keras",
    "scikit-learn",
    "huggingface",
    "transformers",
    "llm",
    "large language model",
    "gpt",
    "bert",
    "model",
    "training",
    "inference",
    "prompt injection",
    "adversarial",
    "model poisoning"
]


@sleep_and_retry
@limits(calls=5, period=30)  # NVD rate limit: 5 calls per 30 seconds
def query_nvd_api(params: Dict) -> Dict:
    """Query NVD API with rate limiting."""
    headers = {}
    api_key = os.getenv('NVD_API_KEY')
    if api_key:
        headers['apiKey'] = api_key

    response = requests.get(NVD_API_URL, params=params, headers=headers)
    response.raise_for_status()
    return response.json()


def fetch_cves(days_back: int = 7) -> List[Dict]:
    """
    Fetch CVEs from the last N days that relate to AI/ML.

    Args:
        days_back: Number of days to look back

    Returns:
        List of relevant CVE entries
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)

    # Format dates for NVD API
    start_date_str = start_date.strftime("%Y-%m-%dT00:00:00.000")
    end_date_str = end_date.strftime("%Y-%m-%dT23:59:59.999")

    print(f"Fetching CVEs from {start_date_str} to {end_date_str}")

    all_cves = []
    results_per_page = 2000
    start_index = 0

    while True:
        params = {
            'pubStartDate': start_date_str,
            'pubEndDate': end_date_str,
            'resultsPerPage': results_per_page,
            'startIndex': start_index
        }

        try:
            data = query_nvd_api(params)
        except requests.exceptions.RequestException as e:
            print(f"Error querying NVD API: {e}", file=sys.stderr)
            break

        vulnerabilities = data.get('vulnerabilities', [])
        if not vulnerabilities:
            break

        all_cves.extend(vulnerabilities)

        # Check if there are more results
        total_results = data.get('totalResults', 0)
        if start_index + results_per_page >= total_results:
            break

        start_index += results_per_page
        print(f"Fetched {len(all_cves)}/{total_results} CVEs...")

    print(f"Total CVEs fetched: {len(all_cves)}")

    # Filter for AI/ML related CVEs
    ai_cves = filter_ai_cves(all_cves)
    print(f"AI/ML related CVEs: {len(ai_cves)}")

    return ai_cves


def filter_ai_cves(cves: List[Dict]) -> List[Dict]:
    """Filter CVEs for AI/ML relevance based on keywords."""
    filtered = []

    for cve_entry in cves:
        cve = cve_entry.get('cve', {})
        cve_id = cve.get('id', '')

        # Get description
        descriptions = cve.get('descriptions', [])
        description_text = ' '.join([
            d.get('value', '') for d in descriptions
        ]).lower()

        # Get CPE (product) information
        configurations = cve.get('configurations', [])
        cpe_text = ' '.join([
            str(conf) for conf in configurations
        ]).lower()

        # Combine all text
        full_text = f"{description_text} {cpe_text}"

        # Check for AI/ML keywords
        if any(keyword.lower() in full_text for keyword in AI_KEYWORDS):
            # Extract relevant information
            metrics = cve.get('metrics', {})
            cvss_v3 = metrics.get('cvssMetricV31', [{}])[0] if metrics.get('cvssMetricV31') else {}
            cvss_data = cvss_v3.get('cvssData', {})

            filtered_cve = {
                'id': cve_id,
                'description': descriptions[0].get('value', '') if descriptions else '',
                'published': cve.get('published', ''),
                'last_modified': cve.get('lastModified', ''),
                'severity': cvss_data.get('baseSeverity', 'UNKNOWN'),
                'score': cvss_data.get('baseScore', 0.0),
                'vector': cvss_data.get('vectorString', ''),
                'references': [
                    {
                        'url': ref.get('url', ''),
                        'source': ref.get('source', '')
                    }
                    for ref in cve.get('references', [])
                ],
                'cpes': extract_cpes(configurations)
            }

            filtered.append(filtered_cve)

    return filtered


def extract_cpes(configurations: List[Dict]) -> List[str]:
    """Extract CPE (Common Platform Enumeration) strings."""
    cpes = []
    for config in configurations:
        nodes = config.get('nodes', [])
        for node in nodes:
            cpe_matches = node.get('cpeMatch', [])
            for match in cpe_matches:
                if match.get('vulnerable', False):
                    cpe = match.get('criteria', '')
                    if cpe:
                        cpes.append(cpe)
    return cpes


def main():
    parser = argparse.ArgumentParser(description='Fetch AI/ML CVEs from NVD')
    parser.add_argument('--days-back', type=int, default=7,
                        help='Number of days to look back (default: 7)')
    parser.add_argument('--output', type=str, required=True,
                        help='Output JSON file path')

    args = parser.parse_args()

    # Create output directory if needed
    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    # Fetch CVEs
    cves = fetch_cves(args.days_back)

    # Save results
    output_data = {
        'fetched_at': datetime.now().isoformat(),
        'days_back': args.days_back,
        'count': len(cves),
        'cves': cves
    }

    with open(args.output, 'w') as f:
        json.dump(output_data, f, indent=2)

    print(f"Saved {len(cves)} CVEs to {args.output}")

    return 0 if cves else 1


if __name__ == '__main__':
    sys.exit(main())
