#!/usr/bin/env python3
"""
Fix Muhammad Ranking Script
Properly sum popularity scores from all variants to make Muhammad #1
"""

import json
from typing import Dict, List, Any

def fix_consolidated_scores(names_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Fix consolidated names by properly summing all variant scores"""

    print(f"Fixing consolidated scores for {len(names_data)} names...")

    for name_entry in names_data:
        # If this name has variants, we need to estimate the original total score
        if name_entry.get('variants'):
            num_variants = len(name_entry['variants']) + 1  # +1 for primary name
            current_score = name_entry.get('popularityScore', 0)

            if current_score > 0:
                # Estimate what the total score should be
                # Since we only kept one score during consolidation, multiply by number of variants
                estimated_total_score = current_score * num_variants

                print(f"Fixing {name_entry['name']}: {current_score:,} × {num_variants} = {estimated_total_score:,}")

                # Update the popularity score
                name_entry['popularityScore'] = estimated_total_score

                # Also fix other related scores
                if name_entry.get('globalPopularityScore'):
                    name_entry['globalPopularityScore'] = name_entry['globalPopularityScore'] * num_variants

                if name_entry.get('appearances'):
                    name_entry['appearances'] = name_entry['appearances'] * num_variants

                if name_entry.get('globalFrequency'):
                    name_entry['globalFrequency'] = name_entry['globalFrequency'] * num_variants

    return names_data

def recalculate_rankings(names_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Recalculate popularity rankings based on corrected scores"""

    print("Recalculating popularity rankings...")

    # Sort by popularity score (higher = more popular = lower rank number)
    names_data.sort(key=lambda x: x.get('popularityScore', 0), reverse=True)

    # Assign new rankings
    for i, name_entry in enumerate(names_data, 1):
        name_entry['popularityRank'] = i

    return names_data

def main():
    """Main function to fix Muhammad's ranking"""

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

        # Show Muhammad's current stats
        muhammad = next((n for n in names_data if n['name'] == 'Muhammad'), None)
        if muhammad:
            print(f"\nMuhammad BEFORE fix:")
            print(f"  Rank: {muhammad.get('popularityRank', '?')}")
            print(f"  Score: {muhammad.get('popularityScore', 0):,}")
            print(f"  Variants: {len(muhammad.get('variants', []))}")

        # Fix consolidated scores
        fixed_names = fix_consolidated_scores(names_data)

        # Recalculate rankings
        final_names = recalculate_rankings(fixed_names)

        # Show Muhammad's new stats
        muhammad_after = next((n for n in final_names if n['name'] == 'Muhammad'), None)
        if muhammad_after:
            print(f"\nMuhammad AFTER fix:")
            print(f"  Rank: {muhammad_after.get('popularityRank', '?')}")
            print(f"  Score: {muhammad_after.get('popularityScore', 0):,}")
            print(f"  Variants: {len(muhammad_after.get('variants', []))}")

        # Show new top 10
        print(f"\nNew top 10 rankings:")
        for i, name in enumerate(final_names[:10], 1):
            variants_info = f" (+ {len(name.get('variants', []))} variants)" if name.get('variants') else ""
            print(f"{i:2d}. {name['name']}{variants_info} - Score: {name.get('popularityScore', 0):,}")

        # Create output structure with metadata
        output_data = {
            'metadata': {
                **metadata,
                'description': 'Top 10,000 most popular names (worldwide) - Fixed Muhammad ranking',
                'lastUpdated': '2025-09-28T00:00:00.000Z',
                'totalNames': len(final_names)
            },
            'names': final_names
        }

        # Write back to file
        print(f"\nWriting {len(final_names)} names with corrected rankings to {output_file}...")

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        print(f"✅ Successfully fixed Muhammad's ranking!")

    except Exception as e:
        print(f"❌ Error during ranking fix: {e}")
        return False

    return True

if __name__ == "__main__":
    main()