#!/usr/bin/env python3
"""
Optimize the consolidated database by:
- Removing empty/unnecessary fields
- Compressing data structure
- Keeping only essential fields for non-popular names
"""

import json
from datetime import datetime

def optimize_name_entry(name_entry, is_popular):
    """Optimize a name entry based on popularity"""
    optimized = {
        'name': name_entry['name'],
        'gender': name_entry.get('gender', {})
    }

    # For popular names, keep more data
    if is_popular:
        optimized['isPopular'] = True
        if 'popularityRank' in name_entry:
            optimized['popularityRank'] = name_entry['popularityRank']
        if 'origin' in name_entry and name_entry['origin']:
            optimized['origin'] = name_entry['origin']
        if 'meaning' in name_entry and name_entry['meaning']:
            optimized['meaning'] = name_entry['meaning']
        if 'countries' in name_entry and name_entry['countries']:
            # Only keep top 5 countries
            countries = dict(sorted(name_entry['countries'].items(),
                                  key=lambda x: x[1])[:5])
            if countries:
                optimized['countries'] = countries
        if 'variations' in name_entry and name_entry['variations']:
            optimized['variations'] = name_entry['variations'][:5]  # Limit variations
    else:
        # For non-popular names, keep minimal data
        optimized['isPopular'] = False
        # Only keep countries if present and limited
        if 'countries' in name_entry and name_entry['countries']:
            countries = dict(sorted(name_entry['countries'].items(),
                                  key=lambda x: x[1])[:3])
            if countries:
                optimized['countries'] = countries

    # Clean up gender data - remove if empty or invalid
    if 'gender' in optimized:
        if isinstance(optimized['gender'], dict):
            # Remove zero probabilities
            optimized['gender'] = {k: v for k, v in optimized['gender'].items()
                                  if v and v > 0}
            if not optimized['gender']:
                del optimized['gender']
        elif not optimized['gender']:
            del optimized['gender']

    return optimized

def main():
    print("Loading consolidated database...")

    with open('src/data/consolidatedNamesDatabase.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    names = data['names']
    print(f"Loaded {len(names)} names")

    # Optimize each name entry
    optimized_names = []
    for i, name_entry in enumerate(names):
        is_popular = i < 10000  # First 10k are popular
        optimized = optimize_name_entry(name_entry, is_popular)
        optimized_names.append(optimized)

    # Create optimized database
    optimized_db = {
        'metadata': {
            'version': '4.1.0',
            'totalNames': len(optimized_names),
            'popularNames': 10000,
            'lastUpdated': datetime.now().isoformat(),
            'description': 'Optimized consolidated database - minimal size',
            'optimized': True
        },
        'names': optimized_names
    }

    # Save optimized version
    output_file = 'src/data/consolidatedNamesDatabase.json'
    print(f"Saving optimized database to {output_file}")

    with open(output_file, 'w', encoding='utf-8') as f:
        # Use compact JSON format
        json.dump(optimized_db, f, ensure_ascii=False, separators=(',', ':'))

    # Check file size
    import os
    original_size = os.path.getsize('public/data/consolidatedNamesDatabase.json') / (1024*1024)
    new_size = os.path.getsize(output_file) / (1024*1024)

    print(f"\nOptimization complete!")
    print(f"Original size: {original_size:.2f} MB")
    print(f"Optimized size: {new_size:.2f} MB")
    print(f"Size reduction: {(1 - new_size/original_size) * 100:.1f}%")
    print(f"Total names: {len(optimized_names)}")
    print(f"Popular names: {sum(1 for n in optimized_names if n.get('isPopular'))}")

if __name__ == '__main__':
    main()