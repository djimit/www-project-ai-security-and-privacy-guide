#!/usr/bin/env python3
"""
Generate documentation updates from analyzed threat intelligence.

Creates markdown content that can be merged into OWASP AI documentation.
"""

import argparse
import json
import os
import sys
from datetime import datetime
from typing import Dict, List
from jinja2 import Template

# Template for new threat documentation
THREAT_TEMPLATE = """### {{title}}

**Severity:** {{severity}} | **Category:** {{owasp_category}} | **Discovered:** {{date}}

{{summary}}

#### Technical Details
{{technical_details}}

#### Attack Vector
{{attack_vector}}

#### Impact
{{impact}}

#### Affected Systems
{% for system in affected_systems %}
- {{system}}
{% endfor %}

#### Recommended Controls
{% for control in recommended_controls %}
- {{control}}
{% endfor %}

#### References
{% for ref in references %}
- [{{ref}}]({{ref}})
{% endfor %}

{% if source_cve %}
**CVE:** [{{source_cve}}](https://nvd.nist.gov/vuln/detail/{{source_cve}})
{% endif %}

{% if source_ghsa %}
**GitHub Advisory:** [{{source_ghsa}}](https://github.com/advisories/{{source_ghsa}})
{% endif %}

{% if source_paper %}
**Research Paper:** [{{source_paper_title}}]({{source_paper_url}})
{% endif %}

---

"""


def generate_threat_markdown(threat: Dict, source_type: str) -> str:
    """Generate markdown for a single threat."""

    template = Template(THREAT_TEMPLATE)

    analysis = threat.get('analysis', {})
    source = threat.get('source', {})

    context = {
        'title': analysis.get('title', 'Unknown Threat'),
        'severity': analysis.get('severity', 'MEDIUM'),
        'owasp_category': analysis.get('owasp_category', 'Unknown'),
        'date': datetime.now().strftime('%Y-%m-%d'),
        'summary': analysis.get('summary', ''),
        'technical_details': analysis.get('technical_details', ''),
        'attack_vector': analysis.get('attack_vector', ''),
        'impact': analysis.get('impact', ''),
        'affected_systems': analysis.get('affected_systems', []),
        'recommended_controls': analysis.get('recommended_controls', []),
        'references': analysis.get('references', []),
        'source_cve': source.get('id') if source_type == 'cve' else None,
        'source_ghsa': source.get('ghsa_id') if source_type == 'advisory' else None,
        'source_paper': source.get('id') if source_type == 'paper' else None,
        'source_paper_title': source.get('title') if source_type == 'paper' else None,
        'source_paper_url': source.get('abs_url') if source_type == 'paper' else None,
    }

    return template.render(**context)


def organize_by_category(threats: List[Dict]) -> Dict[str, List[Dict]]:
    """Organize threats by OWASP category."""

    by_category = {}

    for threat in threats:
        category = threat.get('analysis', {}).get('owasp_category', 'UNKNOWN')
        if category not in by_category:
            by_category[category] = []
        by_category[category].append(threat)

    return by_category


def generate_updates(analysis_data: Dict, output_dir: str) -> Dict:
    """Generate documentation updates from analysis."""

    results = analysis_data.get('results', {})

    all_threats = (
        [(t, 'cve') for t in results.get('cves', [])] +
        [(t, 'advisory') for t in results.get('advisories', [])] +
        [(t, 'paper') for t in results.get('papers', [])]
    )

    # Organize by category
    by_category = {}
    for threat, source_type in all_threats:
        category = threat.get('analysis', {}).get('owasp_category', 'UNKNOWN')
        if category not in by_category:
            by_category[category] = []
        by_category[category].append((threat, source_type))

    # Generate markdown files for each category
    summary = {
        'new_threats': [],
        'updated_threats': [],
        'files_created': []
    }

    os.makedirs(output_dir, exist_ok=True)

    for category, threats in by_category.items():
        # Create filename from category
        filename = f"threat_intel_{category.replace('.', '_').replace(' ', '_').lower()}.md"
        filepath = os.path.join(output_dir, filename)

        content = f"""---
title: "Threat Intelligence: {category}"
weight: 100
---

# Recent Threat Intelligence: {category}

**Last Updated:** {datetime.now().strftime('%Y-%m-%d')}

This page contains automatically discovered threats related to the **{category}** category.

⚠️ **Note:** This content is automatically generated from threat intelligence sources and reviewed by the OWASP community.

"""

        for threat, source_type in threats:
            content += generate_threat_markdown(threat, source_type)

            # Track for summary
            threat_type = threat.get('analysis', {}).get('threat_type', 'UPDATE')
            threat_title = threat.get('analysis', {}).get('title', 'Unknown')

            if threat_type == 'NEW':
                summary['new_threats'].append({
                    'title': threat_title,
                    'category': category,
                    'file': filename
                })
            else:
                summary['updated_threats'].append({
                    'title': threat_title,
                    'category': category,
                    'file': filename
                })

        # Write file
        with open(filepath, 'w') as f:
            f.write(content)

        summary['files_created'].append(filename)

        print(f"Created {filepath} with {len(threats)} threats")

    return summary


def main():
    parser = argparse.ArgumentParser(description='Generate documentation updates')
    parser.add_argument('--analysis', type=str, required=True,
                        help='Analysis JSON file')
    parser.add_argument('--output-dir', type=str, required=True,
                        help='Output directory for markdown files')
    parser.add_argument('--summary', type=str, required=True,
                        help='Summary JSON file path')

    args = parser.parse_args()

    # Load analysis
    with open(args.analysis) as f:
        analysis_data = json.load(f)

    # Generate updates
    summary = generate_updates(analysis_data, args.output_dir)

    # Save summary
    os.makedirs(os.path.dirname(args.summary), exist_ok=True)

    with open(args.summary, 'w') as f:
        json.dump(summary, f, indent=2)

    print(f"\n=== Generation Complete ===")
    print(f"Files created: {len(summary['files_created'])}")
    print(f"New threats: {len(summary['new_threats'])}")
    print(f"Updated threats: {len(summary['updated_threats'])}")
    print(f"Summary saved to {args.summary}")

    return 0


if __name__ == '__main__':
    sys.exit(main())
