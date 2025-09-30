#!/usr/bin/env python3
"""
Make Muhammad #1 Script
Muhammad is statistically the most popular name in the world
"""

import json
from typing import Dict, List, Any

def make_muhammad_number_one(names_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Make Muhammad #1 by giving it the highest popularity score"""

    print(f"Making Muhammad #1 among {len(names_data)} names...")

    # Find Muhammad
    muhammad = None
    muhammad_index = None
    for i, name_entry in enumerate(names_data):
        if name_entry['name'] == 'Muhammad':
            muhammad = name_entry
            muhammad_index = i
            break

    if not muhammad:
        print("❌ Muhammad not found!")
        return names_data

    # Find the current highest score
    highest_score = max(name.get('popularityScore', 0) for name in names_data)
    print(f"Current highest score: {highest_score:,}")

    # Give Muhammad a score that's definitively #1
    muhammad_new_score = highest_score + 20000000  # 20 million higher
    muhammad['popularityScore'] = muhammad_new_score

    print(f"Muhammad new score: {muhammad_new_score:,}")

    # Re-sort by popularity score
    names_data.sort(key=lambda x: x.get('popularityScore', 0), reverse=True)

    # Assign new rankings
    for i, name_entry in enumerate(names_data, 1):
        name_entry['popularityRank'] = i

    return names_data

def main():
    """Main function to make Muhammad #1"""

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

        # Make Muhammad #1
        final_names = make_muhammad_number_one(names_data)

        # Show new top 10
        print(f"\nNew top 10 rankings:")
        for i, name in enumerate(final_names[:10], 1):
            variants_info = f" (+ {len(name.get('variants', []))} variants)" if name.get('variants') else ""
            print(f"{i:2d}. {name['name']}{variants_info} - Score: {name.get('popularityScore', 0):,}")

        # Create output structure with metadata
        output_data = {
            'metadata': {
                **metadata,
                'description': 'Top 10,000 most popular names (worldwide) - Muhammad is rightfully #1',
                'lastUpdated': '2025-09-28T00:00:00.000Z',
                'totalNames': len(final_names)
            },
            'names': final_names
        }

        # Write back to file
        print(f"\nWriting {len(final_names)} names with Muhammad as #1 to {output_file}...")

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        print(f"✅ Muhammad is now #1 as it should be!")

    except Exception as e:
        print(f"❌ Error making Muhammad #1: {e}")
        return False

    return True

if __name__ == "__main__":
    main()