#!/usr/bin/env python3
"""
Fetch AI security research papers from arXiv.

Monitors arXiv for recent papers on AI security, adversarial ML, etc.
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict
import feedparser

# arXiv categories for AI security research
ARXIV_CATEGORIES = [
    'cs.CR',  # Cryptography and Security
    'cs.LG',  # Machine Learning
    'cs.AI',  # Artificial Intelligence
]

# Security-related keywords to filter papers
SECURITY_KEYWORDS = [
    'adversarial',
    'backdoor',
    'poisoning',
    'privacy',
    'security',
    'attack',
    'defense',
    'robustness',
    'vulnerability',
    'jailbreak',
    'prompt injection',
    'model extraction',
    'membership inference',
    'differential privacy',
    'federated learning security',
    'model inversion',
    'trojan',
    'watermarking'
]


def fetch_arxiv_papers(days_back: int = 7) -> List[Dict]:
    """
    Fetch recent AI security papers from arXiv.

    Args:
        days_back: Number of days to look back

    Returns:
        List of relevant papers
    """
    papers = []

    for category in ARXIV_CATEGORIES:
        print(f"Searching arXiv category: {category}")

        # arXiv API query
        # Note: arXiv doesn't support date filtering directly, so we fetch recent and filter
        query = f'cat:{category}'
        url = f'http://export.arxiv.org/api/query?search_query={query}&sortBy=lastUpdatedDate&sortOrder=descending&max_results=200'

        feed = feedparser.parse(url)

        cutoff_date = datetime.now() - timedelta(days=days_back)

        for entry in feed.entries:
            # Parse publication date
            published = datetime.strptime(entry.published, '%Y-%m-%dT%H:%M:%SZ')

            # Filter by date
            if published < cutoff_date:
                continue

            # Check if paper is security-related
            title_and_summary = f"{entry.title} {entry.summary}".lower()

            if any(keyword.lower() in title_and_summary for keyword in SECURITY_KEYWORDS):
                # Extract authors
                authors = [author.name for author in entry.authors] if hasattr(entry, 'authors') else []

                paper = {
                    'id': entry.id.split('/abs/')[-1],
                    'title': entry.title,
                    'summary': entry.summary,
                    'authors': authors,
                    'published': entry.published,
                    'updated': entry.updated if hasattr(entry, 'updated') else entry.published,
                    'categories': [tag.term for tag in entry.tags] if hasattr(entry, 'tags') else [category],
                    'pdf_url': entry.id.replace('/abs/', '/pdf/') + '.pdf',
                    'abs_url': entry.id
                }

                papers.append(paper)

    # Remove duplicates (papers can appear in multiple categories)
    unique_papers = {}
    for paper in papers:
        paper_id = paper['id']
        if paper_id not in unique_papers:
            unique_papers[paper_id] = paper

    papers_list = list(unique_papers.values())

    # Sort by publication date (newest first)
    papers_list.sort(key=lambda x: x['published'], reverse=True)

    return papers_list


def main():
    parser = argparse.ArgumentParser(description='Fetch AI security papers from arXiv')
    parser.add_argument('--days-back', type=int, default=7,
                        help='Number of days to look back (default: 7)')
    parser.add_argument('--output', type=str, required=True,
                        help='Output JSON file path')

    args = parser.parse_args()

    # Create output directory
    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    # Fetch papers
    print(f"Fetching papers from the last {args.days_back} days...")
    papers = fetch_arxiv_papers(args.days_back)

    # Save results
    output_data = {
        'fetched_at': datetime.now().isoformat(),
        'days_back': args.days_back,
        'categories': ARXIV_CATEGORIES,
        'count': len(papers),
        'papers': papers
    }

    with open(args.output, 'w') as f:
        json.dump(output_data, f, indent=2)

    print(f"Found {len(papers)} security-related papers")
    print(f"Saved to {args.output}")

    return 0 if papers else 1


if __name__ == '__main__':
    sys.exit(main())
