#!/usr/bin/env python3
"""
Update the threat intelligence dashboard page.

Creates a live dashboard showing recent AI security threats.
"""

import argparse
import json
import os
import sys
from datetime import datetime
from typing import Dict

DASHBOARD_TEMPLATE = """---
title: "🔴 Live Threat Intelligence"
weight: 10
---

# AI Security Threat Intelligence Dashboard

**Last Updated:** {updated_at}

Real-time feed of AI security threats from multiple sources.

---

## 📊 Summary

{summary_stats}

---

## 🔥 Recent Critical Threats

{critical_threats}

---

## 📈 Trending Threats

{trending_section}

---

## 🌍 Threat Distribution by Category

{category_distribution}

---

## 📅 Recent Discoveries (Last 7 Days)

{recent_discoveries}

---

## 🔍 Data Sources

This dashboard aggregates data from:
- ✅ **CVE Database (NVD)** - National Vulnerability Database
- ✅ **GitHub Security Advisories** - {repo_count} AI/ML repositories monitored
- ✅ **arXiv Security Research** - Latest AI security papers
- ✅ **Security Vendor Disclosures** - Industry threat intelligence

**Analysis powered by:** AI (Claude/GPT) for automatic categorization and OWASP mapping

---

## 📖 How to Use This Dashboard

1. **Review critical threats** - Start with high-severity findings
2. **Check your category** - Filter by relevant OWASP categories
3. **Read technical details** - Click through for full analysis
4. **Implement controls** - Follow recommended OWASP controls
5. **Stay updated** - Dashboard refreshes daily

---

## ⚙️ Methodology

All threats are:
1. **Automatically discovered** from public sources
2. **Analyzed with AI** (LLM-powered categorization)
3. **Mapped to OWASP taxonomy** for consistency
4. **Reviewed by community** before publication

---

*This dashboard is automatically updated daily. [View source workflow](https://github.com/OWASP/www-project-ai-security-and-privacy-guide/blob/main/.github/workflows/threat-intelligence.yml)*
"""


def format_summary_stats(analysis: Dict) -> str:
    """Format summary statistics."""

    results = analysis.get('results', {})
    summary = results.get('summary', {})

    stats = f"""| Metric | Count |
|--------|-------|
| Total Threats Analyzed | {summary.get('total_analyzed', 0)} |
| Relevant AI Threats | {summary.get('relevant_threats', 0)} |
| **New Discoveries** | **{summary.get('new_threats', 0)}** |
| Updates to Known Threats | {summary.get('updated_threats', 0)} |
| Critical Severity | {summary.get('by_severity', {}).get('CRITICAL', 0)} 🔴 |
| High Severity | {summary.get('by_severity', {}).get('HIGH', 0)} 🟠 |
| Medium Severity | {summary.get('by_severity', {}).get('MEDIUM', 0)} 🟡 |
| Low Severity | {summary.get('by_severity', {}).get('LOW', 0)} 🟢 |
"""

    return stats


def format_critical_threats(analysis: Dict) -> str:
    """Format critical threats section."""

    results = analysis.get('results', {})

    # Collect all threats
    all_threats = []
    for cve in results.get('cves', []):
        all_threats.append(('CVE', cve))
    for advisory in results.get('advisories', []):
        all_threats.append(('Advisory', advisory))
    for paper in results.get('papers', []):
        all_threats.append(('Research', paper))

    # Filter critical/high
    critical = [t for t in all_threats if t[1].get('analysis', {}).get('severity') in ['CRITICAL', 'HIGH']]

    if not critical:
        return "*No critical threats in this update.*"

    output = ""
    for source_type, threat in critical[:10]:  # Top 10
        analysis_data = threat.get('analysis', {})
        source_data = threat.get('source', {})

        severity_emoji = "🔴" if analysis_data.get('severity') == 'CRITICAL' else "🟠"

        output += f"""### {severity_emoji} {analysis_data.get('title', 'Unknown')}

**Category:** {analysis_data.get('owasp_category', 'Unknown')} | **Severity:** {analysis_data.get('severity', 'Unknown')}

{analysis_data.get('summary', 'No summary available.')}

"""

        # Add source link
        if source_type == 'CVE':
            output += f"**Source:** [CVE-{source_data.get('id', 'Unknown')}](https://nvd.nist.gov/vuln/detail/{source_data.get('id')})\n\n"
        elif source_type == 'Advisory':
            output += f"**Source:** [GitHub Advisory {source_data.get('ghsa_id', 'Unknown')}](https://github.com/advisories/{source_data.get('ghsa_id')})\n\n"
        elif source_type == 'Research':
            output += f"**Source:** [arXiv Paper](https://arxiv.org/abs/{source_data.get('id')})\n\n"

        output += "---\n\n"

    return output


def format_category_distribution(analysis: Dict) -> str:
    """Format category distribution chart."""

    results = analysis.get('results', {})
    summary = results.get('summary', {})
    by_category = summary.get('by_category', {})

    if not by_category:
        return "*No category data available.*"

    output = "| OWASP Category | Threats | Percentage |\n"
    output += "|----------------|---------|------------|\n"

    total = sum(by_category.values())

    # Sort by count
    sorted_cats = sorted(by_category.items(), key=lambda x: x[1], reverse=True)

    for category, count in sorted_cats:
        percentage = (count / total * 100) if total > 0 else 0
        bar = "█" * int(percentage / 5)  # Visual bar
        output += f"| {category} | {count} | {percentage:.1f}% {bar} |\n"

    return output


def format_recent_discoveries(analysis: Dict) -> str:
    """Format recent discoveries timeline."""

    results = analysis.get('results', {})

    # Get all threats
    all_threats = []
    for cve in results.get('cves', []):
        all_threats.append(cve)
    for advisory in results.get('advisories', []):
        all_threats.append(advisory)
    for paper in results.get('papers', []):
        all_threats.append(paper)

    # Filter NEW threats
    new_threats = [t for t in all_threats if t.get('analysis', {}).get('threat_type') == 'NEW']

    if not new_threats:
        return "*No new threats discovered in this period.*"

    output = ""
    for threat in new_threats[:15]:  # Top 15
        analysis_data = threat.get('analysis', {})

        severity = analysis_data.get('severity', 'UNKNOWN')
        emoji = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}.get(severity, "⚪")

        output += f"- {emoji} **{analysis_data.get('title', 'Unknown')}** ({analysis_data.get('owasp_category', 'Unknown')})\n"

    return output


def update_dashboard(analysis_data: Dict, output_file: str):
    """Update the dashboard page."""

    # Generate sections
    summary_stats = format_summary_stats(analysis_data)
    critical_threats = format_critical_threats(analysis_data)
    category_dist = format_category_distribution(analysis_data)
    recent = format_recent_discoveries(analysis_data)

    # Count repositories
    repo_count = 12  # From fetch_advisories.py

    # Generate trending (placeholder for now)
    trending = "*Trending analysis coming soon...*"

    # Fill template
    content = DASHBOARD_TEMPLATE.format(
        updated_at=datetime.now().strftime('%Y-%m-%d %H:%M UTC'),
        summary_stats=summary_stats,
        critical_threats=critical_threats,
        trending_section=trending,
        category_distribution=category_dist,
        recent_discoveries=recent,
        repo_count=repo_count
    )

    # Write file
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(output_file, 'w') as f:
        f.write(content)

    print(f"Dashboard updated: {output_file}")


def main():
    parser = argparse.ArgumentParser(description='Update threat intelligence dashboard')
    parser.add_argument('--analysis', type=str, required=True,
                        help='Analysis JSON file')
    parser.add_argument('--output', type=str, required=True,
                        help='Output markdown file')

    args = parser.parse_args()

    # Load analysis
    with open(args.analysis) as f:
        analysis_data = json.load(f)

    # Update dashboard
    update_dashboard(analysis_data, args.output)

    return 0


if __name__ == '__main__':
    sys.exit(main())
