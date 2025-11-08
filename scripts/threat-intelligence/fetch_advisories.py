#!/usr/bin/env python3
"""
Fetch security advisories from GitHub for AI/ML repositories.

Monitors popular AI/ML projects for security advisories.
"""

import argparse
import json
import os
import sys
from datetime import datetime
from typing import List, Dict
import requests

# Popular AI/ML repositories to monitor
AI_ML_REPOS = [
    "tensorflow/tensorflow",
    "pytorch/pytorch",
    "huggingface/transformers",
    "scikit-learn/scikit-learn",
    "keras-team/keras",
    "openai/openai-python",
    "langchain-ai/langchain",
    "anthropics/anthropic-sdk-python",
    "ray-project/ray",
    "microsoft/DeepSpeed",
    "AUTOMATIC1111/stable-diffusion-webui",
    "comfyanonymous/ComfyUI"
]

GITHUB_API_URL = "https://api.github.com"


def fetch_repo_advisories(repo: str, token: str) -> List[Dict]:
    """Fetch security advisories for a specific repository."""
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
    }

    # Use GitHub GraphQL API for security advisories
    query = """
    query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        securityVulnerabilities(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            advisory {
              ghsaId
              summary
              description
              severity
              publishedAt
              updatedAt
              references {
                url
              }
              identifiers {
                type
                value
              }
            }
            vulnerableVersionRange
            package {
              name
              ecosystem
            }
          }
        }
      }
    }
    """

    owner, name = repo.split('/')
    variables = {
        "owner": owner,
        "name": name
    }

    try:
        response = requests.post(
            f"{GITHUB_API_URL}/graphql",
            headers=headers,
            json={"query": query, "variables": variables}
        )
        response.raise_for_status()
        data = response.json()

        vulnerabilities = data.get('data', {}).get('repository', {}).get('securityVulnerabilities', {}).get('nodes', [])

        advisories = []
        for vuln in vulnerabilities:
            advisory = vuln.get('advisory', {})
            advisories.append({
                'repository': repo,
                'ghsa_id': advisory.get('ghsaId', ''),
                'summary': advisory.get('summary', ''),
                'description': advisory.get('description', ''),
                'severity': advisory.get('severity', ''),
                'published_at': advisory.get('publishedAt', ''),
                'updated_at': advisory.get('updatedAt', ''),
                'vulnerable_versions': vuln.get('vulnerableVersionRange', ''),
                'package': vuln.get('package', {}).get('name', ''),
                'ecosystem': vuln.get('package', {}).get('ecosystem', ''),
                'references': [
                    ref.get('url') for ref in advisory.get('references', [])
                ],
                'identifiers': advisory.get('identifiers', [])
            })

        return advisories

    except requests.exceptions.RequestException as e:
        print(f"Error fetching advisories for {repo}: {e}", file=sys.stderr)
        return []


def main():
    parser = argparse.ArgumentParser(description='Fetch GitHub Security Advisories')
    parser.add_argument('--output', type=str, required=True,
                        help='Output JSON file path')

    args = parser.parse_args()

    token = os.getenv('GITHUB_TOKEN')
    if not token:
        print("Error: GITHUB_TOKEN environment variable not set", file=sys.stderr)
        return 1

    # Create output directory
    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    all_advisories = []

    print(f"Fetching advisories from {len(AI_ML_REPOS)} repositories...")

    for repo in AI_ML_REPOS:
        print(f"  Checking {repo}...")
        advisories = fetch_repo_advisories(repo, token)
        all_advisories.extend(advisories)
        print(f"    Found {len(advisories)} advisories")

    # Save results
    output_data = {
        'fetched_at': datetime.now().isoformat(),
        'repositories_checked': AI_ML_REPOS,
        'count': len(all_advisories),
        'advisories': all_advisories
    }

    with open(args.output, 'w') as f:
        json.dump(output_data, f, indent=2)

    print(f"\nTotal advisories: {len(all_advisories)}")
    print(f"Saved to {args.output}")

    return 0


if __name__ == '__main__':
    sys.exit(main())
