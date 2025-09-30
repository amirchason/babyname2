#!/usr/bin/env python3
"""
Consolidate all name databases into a single unified file with:
- Top 10,000 names marked as popular
- All 240k+ unique names included
- Duplicates removed
- Consistent data structure
"""

import json
import os
from datetime import datetime
from collections import defaultdict

def load_json_file(filepath):
    """Load JSON file safely"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None

def normalize_name(name):
    """Normalize name for comparison (case-insensitive)"""
    return name.strip().lower()

def merge_name_data(existing, new):
    """Merge two name entries, preserving all data"""
    merged = existing.copy()

    # Merge gender probabilities
    if 'gender' in new:
        if not merged.get('gender'):
            merged['gender'] = new['gender']
        elif isinstance(new['gender'], dict) and isinstance(merged['gender'], dict):
            # Average the probabilities if both exist
            for g in ['Male', 'Female']:
                if g in new['gender']:
                    if g in merged['gender']:
                        merged['gender'][g] = (merged['gender'][g] + new['gender'][g]) / 2
                    else:
                        merged['gender'][g] = new['gender'][g]

    # Merge countries data
    if 'countries' in new and new['countries']:
        if not merged.get('countries'):
            merged['countries'] = new['countries']
        else:
            for country, rank in new['countries'].items():
                if country not in merged['countries'] or rank < merged['countries'][country]:
                    merged['countries'][country] = rank

    # Keep better popularity rank (lower is better)
    if 'popularityRank' in new:
        if 'popularityRank' not in merged or new['popularityRank'] < merged['popularityRank']:
            merged['popularityRank'] = new['popularityRank']

    # Preserve other important fields
    for field in ['origin', 'meaning', 'variations', 'categories', 'description',
                  'culturalSignificance', 'famousPeople', 'literaryReferences']:
        if field in new and new[field] and not merged.get(field):
            merged[field] = new[field]

    return merged

def main():
    print("Starting database consolidation...")

    # Load all databases
    databases = {
        'main': load_json_file('data/namesDatabase.json'),
        'popular': load_json_file('data/popularNames_cache.json'),
        'unified': load_json_file('public/data/unifiedNamesDatabase.json'),
        'full_cache': load_json_file('public/data/fullNames_cache.json'),
        'popular_cache': load_json_file('public/data/popularNames_cache.json')
    }

    # Collect all unique names
    all_names = {}  # normalized_name -> name_data
    name_variants = defaultdict(set)  # Track different capitalizations

    # Process each database
    for db_name, db_data in databases.items():
        if not db_data:
            print(f"Skipping {db_name} - no data")
            continue

        names_list = []
        if isinstance(db_data, dict):
            names_list = db_data.get('names', [])
        elif isinstance(db_data, list):
            names_list = db_data

        print(f"Processing {db_name}: {len(names_list)} names")

        for name_entry in names_list:
            if not name_entry or not name_entry.get('name'):
                continue

            name = name_entry['name']
            normalized = normalize_name(name)

            # Track capitalization variants
            name_variants[normalized].add(name)

            if normalized in all_names:
                # Merge with existing entry
                all_names[normalized] = merge_name_data(all_names[normalized], name_entry)
            else:
                # Add new entry
                all_names[normalized] = name_entry.copy()

    print(f"\nFound {len(all_names)} unique names (case-insensitive)")

    # Choose the most common capitalization for each name
    final_names = []
    for normalized, data in all_names.items():
        variants = name_variants[normalized]
        # Use the capitalization from the data, or the most common variant
        if data.get('name') in variants:
            best_name = data['name']
        else:
            # Use title case as default
            best_name = normalized.title()
            for variant in variants:
                if variant.istitle():
                    best_name = variant
                    break

        data['name'] = best_name
        data['originalName'] = best_name
        final_names.append(data)

    # Sort by popularity (if available) then alphabetically
    def sort_key(name):
        rank = name.get('popularityRank', 999999)
        # If from popular cache and no rank, give it a good rank
        if name.get('isPopular') and rank == 999999:
            rank = 5000
        return (rank, name['name'].lower())

    final_names.sort(key=sort_key)

    # Mark top 10,000 as popular and assign clean rankings
    for i, name in enumerate(final_names):
        if i < 10000:
            name['isPopular'] = True
            name['popularityRank'] = i + 1
        else:
            name['isPopular'] = False
            if 'popularityRank' in name:
                del name['popularityRank']

        # Ensure required fields exist
        if 'gender' not in name:
            name['gender'] = {}
        if 'countries' not in name:
            name['countries'] = {}

    # Create final database structure
    final_database = {
        'metadata': {
            'version': '4.0.0',
            'totalNames': len(final_names),
            'popularNames': 10000,
            'lastUpdated': datetime.now().isoformat(),
            'description': 'Consolidated database with all unique names, top 10k marked as popular',
            'sources': ['namesDatabase', 'popularNames_cache', 'unifiedNamesDatabase'],
            'duplicatesRemoved': len(name_variants) - len(final_names) if len(name_variants) > len(final_names) else 0
        },
        'names': final_names
    }

    # Save the new consolidated database
    output_file = 'public/data/consolidatedNamesDatabase.json'
    print(f"\nSaving consolidated database to {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_database, f, ensure_ascii=False, separators=(',', ':'))

    # Print summary
    print(f"\nConsolidation complete!")
    print(f"Total unique names: {len(final_names)}")
    print(f"Popular names (top 10k): {sum(1 for n in final_names if n.get('isPopular'))}")
    print(f"Non-popular names: {sum(1 for n in final_names if not n.get('isPopular'))}")
    print(f"First popular name: {final_names[0]['name'] if final_names else 'None'}")
    print(f"Last popular name: {final_names[9999]['name'] if len(final_names) >= 10000 else 'None'}")
    print(f"File size: {os.path.getsize(output_file) / (1024*1024):.2f} MB")

if __name__ == '__main__':
    main()