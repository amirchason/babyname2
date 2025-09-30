#!/usr/bin/env python3
"""
Fix Popularity Ranking Script
Properly recalculate rankings based on popularity scores and handle null scores
"""

import json
from typing import Dict, List, Any

def fix_popularity_ranking(names_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Fix popularity rankings based on actual popularity scores"""

    print(f"Fixing popularity rankings for {len(names_data)} names...")

    # First, handle null popularity scores
    for name_entry in names_data:
        if name_entry.get('popularityScore') is None:
            # Calculate a minimal score based on other available data
            appearances = name_entry.get('appearances', 0)
            global_frequency = name_entry.get('globalFrequency', 0)

            # Give it a very low score if no data available
            estimated_score = max(appearances * 100, global_frequency * 10, 1)
            name_entry['popularityScore'] = estimated_score
            print(f"Fixed null score for '{name_entry['name']}': assigned {estimated_score}")

    # Sort by popularity score (higher = more popular = lower rank number)
    names_data.sort(key=lambda x: x.get('popularityScore', 0), reverse=True)

    # Assign new rankings
    for i, name_entry in enumerate(names_data, 1):
        name_entry['popularityRank'] = i

    print(f"✅ Recalculated rankings for {len(names_data)} names")
    return names_data

def main():
    """Main function to fix rankings"""

    # Read the names database
    input_file = '/data/data/com.termux/files/home/proj/babyname2/public/data/popularNames_cache.json'
    output_file = input_file  # Overwrite the same file

    print(f"Reading names from {input_file}...")

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Extract names array from the data structure
        if 'names' in data:
            names_data = data['names']
            metadata = data.get('metadata', {})
        else:
            names_data = data
            metadata = {}

        print(f"Loaded {len(names_data)} names")

        # Show current top 10 BEFORE fix
        print("\nCurrent top 10 (BEFORE fix):")
        current_top = sorted(names_data, key=lambda x: x.get('popularityRank', 999999))[:10]
        for name in current_top:
            variants_info = f" (+ {len(name.get('variants', []))} variants)" if name.get('variants') else ""
            score = name.get('popularityScore', 'null')
            print(f"Rank {name.get('popularityRank', '?'):2d}: {name['name']}{variants_info} - Score: {score}")

        # Fix rankings
        fixed_names = fix_popularity_ranking(names_data)

        # Show top 10 AFTER ranking fix
        print("\nTop 10 names AFTER ranking fix:")
        for i, name in enumerate(fixed_names[:10], 1):
            variants_info = f" (+ {len(name.get('variants', []))} variants)" if name.get('variants') else ""
            print(f"{i:2d}. {name['name']}{variants_info} - Score: {name.get('popularityScore', 0):,}")

        # Create output structure with metadata
        output_data = {
            'metadata': {
                **metadata,
                'description': 'Top 10,000 most popular names (worldwide) - Consolidated variants with corrected rankings',
                'lastUpdated': '2025-09-28T00:00:00.000Z',
                'totalNames': len(fixed_names)
            },
            'names': fixed_names
        }

        # Write back to file
        print(f"\nWriting {len(fixed_names)} names with corrected rankings to {output_file}...")

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        print(f"✅ Successfully fixed rankings for {len(fixed_names)} names")

        # Verify fix worked
        print(f"\n🔍 Verification:")
        print(f"Muhammad rank: {next(n for n in fixed_names if n['name'] == 'Muhammad')['popularityRank']}")
        print(f"Jose rank: {next(n for n in fixed_names if n['name'] == 'Jose')['popularityRank']}")
        print(f"John rank: {next(n for n in fixed_names if n['name'] == 'John')['popularityRank']}")

    except Exception as e:
        print(f"❌ Error during ranking fix: {e}")
        return False

    return True

if __name__ == "__main__":
    main()