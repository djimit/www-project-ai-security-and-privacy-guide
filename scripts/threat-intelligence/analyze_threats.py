#!/usr/bin/env python3
"""
Analyze collected threat intelligence using LLMs.

Uses Claude/GPT to categorize threats according to OWASP AI taxonomy,
extract technical details, and generate documentation.
"""

import argparse
import json
import os
import sys
from typing import List, Dict, Optional
from anthropic import Anthropic
import openai

# OWASP AI Security Taxonomy
OWASP_TAXONOMY = """
# OWASP AI Security Threat Categories

## 1. General Controls
- 1.1 GOVERNANCE
- 1.2 SENSITIVE DATA LIMIT
- 1.3 LIMITING THE EFFECT OF UNWANTED BEHAVIOUR

## 2. Threats Through Use
- 2.1 EVASION (Fooling the model with crafted input)
- 2.2 SENSITIVE DATA DISCLOSURE (Obtaining sensitive data through model use)
- 2.3 MODEL THEFT (Stealing model or training data through use)
- 2.4 MODEL DOS (Denial of Service)

## 3. Development-time Threats
- 3.1 BROAD MODEL POISONING (Manipulation during training)
- 3.2 SENSITIVE DATA LEAK (Leaking sensitive training data)
- 3.3 TRANSFER LEARNING ATTACK
- 3.4 DATA POISONING (Poisoning training data)

## 4. Runtime Application Security Threats
- 4.1 NON AI APPLICATION SECURITY (Standard vulnerabilities)
- 4.2 RUNTIME MODEL POISONING
- 4.3 RUNTIME MODEL THEFT
- 4.4 INSECURE OUTPUT HANDLING
- 4.5 DIRECT PROMPT INJECTION
- 4.6 INDIRECT PROMPT INJECTION
- 4.7 TRAINING DATA LEAKAGE
- 4.8 MODEL INVERSION
- 4.9 MEMBERSHIP INFERENCE
"""


def analyze_with_claude(data: Dict, client: Anthropic) -> Dict:
    """Analyze threat data using Claude."""

    prompt = f"""You are an AI security expert analyzing threat intelligence data for the OWASP AI Security and Privacy Guide.

Your task is to analyze the following threat data and provide:
1. OWASP AI threat category classification
2. Severity assessment
3. Technical summary
4. Affected AI systems/components
5. Recommended OWASP controls
6. Whether this is a NEW threat or UPDATE to existing knowledge

Here is the OWASP taxonomy:
{OWASP_TAXONOMY}

Analyze this threat data:
{json.dumps(data, indent=2)}

Respond in JSON format:
{{
  "is_relevant": boolean,  // Is this relevant to AI security?
  "owasp_category": "X.Y CATEGORY_NAME",  // e.g., "2.1 EVASION"
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "threat_type": "NEW|UPDATE",  // Is this a new threat or update to existing?
  "title": "Brief threat title",
  "summary": "2-3 sentence technical summary",
  "technical_details": "Detailed technical explanation",
  "affected_systems": ["list of affected AI systems/components"],
  "attack_vector": "How the attack works",
  "impact": "What damage can be done",
  "recommended_controls": ["list of OWASP control IDs, e.g., 'C-2.1'"],
  "references": ["relevant URLs"],
  "keywords": ["list of relevant tags"]
}}

Be precise and technical. If the threat is not relevant to AI security, set is_relevant to false."""

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        # Extract JSON from response
        response_text = message.content[0].text

        # Find JSON in response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1

        if start_idx != -1 and end_idx != 0:
            json_str = response_text[start_idx:end_idx]
            return json.loads(json_str)
        else:
            print(f"Warning: Could not extract JSON from Claude response", file=sys.stderr)
            return {"is_relevant": False}

    except Exception as e:
        print(f"Error analyzing with Claude: {e}", file=sys.stderr)
        return {"is_relevant": False}


def analyze_with_openai(data: Dict, client: openai.OpenAI) -> Dict:
    """Analyze threat data using OpenAI GPT."""

    prompt = f"""You are an AI security expert analyzing threat intelligence for the OWASP AI Security Guide.

OWASP Taxonomy:
{OWASP_TAXONOMY}

Analyze this threat and respond with JSON only:
{json.dumps(data, indent=2)}

Required JSON format:
{{
  "is_relevant": boolean,
  "owasp_category": "X.Y CATEGORY",
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "threat_type": "NEW|UPDATE",
  "title": "Brief title",
  "summary": "2-3 sentence summary",
  "technical_details": "Detailed explanation",
  "affected_systems": ["systems"],
  "attack_vector": "How it works",
  "impact": "Damage assessment",
  "recommended_controls": ["control IDs"],
  "references": ["URLs"],
  "keywords": ["tags"]
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are an AI security expert. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)

    except Exception as e:
        print(f"Error analyzing with OpenAI: {e}", file=sys.stderr)
        return {"is_relevant": False}


def analyze_threat_data(cves: List[Dict], advisories: List[Dict], papers: List[Dict], use_claude: bool = True) -> Dict:
    """Analyze all threat data using LLM."""

    analyzed = {
        'cves': [],
        'advisories': [],
        'papers': [],
        'summary': {
            'total_analyzed': 0,
            'relevant_threats': 0,
            'new_threats': 0,
            'updated_threats': 0,
            'by_severity': {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0},
            'by_category': {}
        }
    }

    # Initialize clients
    claude_client = None
    openai_client = None

    if use_claude and os.getenv('ANTHROPIC_API_KEY'):
        claude_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    elif os.getenv('OPENAI_API_KEY'):
        openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        use_claude = False
    else:
        print("Error: No API keys found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY", file=sys.stderr)
        return analyzed

    print(f"Using {'Claude' if use_claude else 'OpenAI GPT'} for analysis")

    # Analyze CVEs
    print(f"\nAnalyzing {len(cves)} CVEs...")
    for i, cve in enumerate(cves):
        print(f"  [{i+1}/{len(cves)}] {cve.get('id', 'Unknown')}")

        if use_claude:
            analysis = analyze_with_claude(cve, claude_client)
        else:
            analysis = analyze_with_openai(cve, openai_client)

        if analysis.get('is_relevant', False):
            analyzed['cves'].append({
                'source': cve,
                'analysis': analysis
            })
            update_summary(analyzed['summary'], analysis)

    # Analyze advisories
    print(f"\nAnalyzing {len(advisories)} GitHub advisories...")
    for i, advisory in enumerate(advisories):
        print(f"  [{i+1}/{len(advisories)}] {advisory.get('ghsa_id', 'Unknown')}")

        if use_claude:
            analysis = analyze_with_claude(advisory, claude_client)
        else:
            analysis = analyze_with_openai(advisory, openai_client)

        if analysis.get('is_relevant', False):
            analyzed['advisories'].append({
                'source': advisory,
                'analysis': analysis
            })
            update_summary(analyzed['summary'], analysis)

    # Analyze papers
    print(f"\nAnalyzing {len(papers)} research papers...")
    for i, paper in enumerate(papers):
        print(f"  [{i+1}/{len(papers)}] {paper.get('title', 'Unknown')[:60]}...")

        if use_claude:
            analysis = analyze_with_claude(paper, claude_client)
        else:
            analysis = analyze_with_openai(paper, openai_client)

        if analysis.get('is_relevant', False):
            analyzed['papers'].append({
                'source': paper,
                'analysis': analysis
            })
            update_summary(analyzed['summary'], analysis)

    analyzed['summary']['total_analyzed'] = len(cves) + len(advisories) + len(papers)

    print(f"\n=== Analysis Complete ===")
    print(f"Total analyzed: {analyzed['summary']['total_analyzed']}")
    print(f"Relevant threats: {analyzed['summary']['relevant_threats']}")
    print(f"New threats: {analyzed['summary']['new_threats']}")
    print(f"Updated threats: {analyzed['summary']['updated_threats']}")

    return analyzed


def update_summary(summary: Dict, analysis: Dict):
    """Update summary statistics."""
    summary['relevant_threats'] += 1

    threat_type = analysis.get('threat_type', 'UPDATE')
    if threat_type == 'NEW':
        summary['new_threats'] += 1
    else:
        summary['updated_threats'] += 1

    severity = analysis.get('severity', 'MEDIUM')
    summary['by_severity'][severity] = summary['by_severity'].get(severity, 0) + 1

    category = analysis.get('owasp_category', 'UNKNOWN')
    summary['by_category'][category] = summary['by_category'].get(category, 0) + 1


def main():
    parser = argparse.ArgumentParser(description='Analyze threats with LLM')
    parser.add_argument('--cves', type=str, required=True,
                        help='CVEs JSON file')
    parser.add_argument('--advisories', type=str, required=True,
                        help='Advisories JSON file')
    parser.add_argument('--research', type=str, required=True,
                        help='Research papers JSON file')
    parser.add_argument('--output', type=str, required=True,
                        help='Output JSON file')
    parser.add_argument('--use-openai', action='store_true',
                        help='Use OpenAI instead of Claude')

    args = parser.parse_args()

    # Load input data
    with open(args.cves) as f:
        cves_data = json.load(f)
        cves = cves_data.get('cves', [])

    with open(args.advisories) as f:
        advisories_data = json.load(f)
        advisories = advisories_data.get('advisories', [])

    with open(args.research) as f:
        papers_data = json.load(f)
        papers = papers_data.get('papers', [])

    # Analyze
    results = analyze_threat_data(cves, advisories, papers, use_claude=not args.use_openai)

    # Save results
    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    output_data = {
        'analyzed_at': json.dumps(datetime.now().isoformat()),
        'llm_used': 'claude' if not args.use_openai else 'openai',
        'results': results
    }

    with open(args.output, 'w') as f:
        json.dump(output_data, f, indent=2)

    print(f"\nSaved analysis to {args.output}")

    return 0


if __name__ == '__main__':
    from datetime import datetime
    sys.exit(main())
