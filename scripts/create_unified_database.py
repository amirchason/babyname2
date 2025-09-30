#!/usr/bin/env python3
"""
Create a unified database combining:
1. Top 10,000 popular names (marked as popular)
2. All 174,595 names from fullNames_cache.json
3. All 224,058 names from namesDatabase.json
Total: ~224,058 unique names with popularity markers
"""

import json
import os
from datetime import datetime

def load_json_file(filepath):
    """Load JSON file and return data."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Handle different structures
            if isinstance(data, dict) and 'names' in data:
                return data['names']
            return data
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return []

def merge_name_data(name_dict, new_name, source, is_popular=False):
    """Merge name data from different sources."""
    name_key = new_name.get('name', '').strip()

    if not name_key:
        return

    if name_key not in name_dict:
        # Create new entry with all possible fields
        name_dict[name_key] = {
            'name': name_key,
            'gender': new_name.get('gender', 'unisex'),
            'origin': new_name.get('origin', ''),
            'meaning': new_name.get('meaning', ''),
            'popularity': new_name.get('popularity', 9999),
            'popularityRank': new_name.get('popularityRank', 9999),
            'isPopular': is_popular,
            'sources': [source],
            'variations': new_name.get('variations', []),
            'categories': new_name.get('categories', []),
            'description': new_name.get('description', ''),
            'culturalSignificance': new_name.get('culturalSignificance', ''),
            'famousPeople': new_name.get('famousPeople', []),
            'literaryReferences': new_name.get('literaryReferences', [])
        }
    else:
        # Merge data, preferring non-empty values
        existing = name_dict[name_key]

        # Update popularity status
        if is_popular:
            existing['isPopular'] = True

        # Add source if not already present
        if source not in existing.get('sources', []):
            existing['sources'].append(source)

        # Merge fields, preferring non-empty values
        for field in ['origin', 'meaning', 'description', 'culturalSignificance']:
            if not existing.get(field) and new_name.get(field):
                existing[field] = new_name[field]

        # Use better popularity rank (lower is better)
        if new_name.get('popularity', 9999) < existing.get('popularity', 9999):
            existing['popularity'] = new_name['popularity']
            existing['popularityRank'] = new_name.get('popularityRank', new_name['popularity'])

        # Merge lists
        for list_field in ['variations', 'categories', 'famousPeople', 'literaryReferences']:
            existing_list = existing.get(list_field, [])
            new_list = new_name.get(list_field, [])
            # Add unique items
            for item in new_list:
                if item and item not in existing_list:
                    existing_list.append(item)
            existing[list_field] = existing_list

def main():
    # Paths
    base_path = '/data/data/com.termux/files/home/proj/babyname2'

    # Input files
    main_db_path = os.path.join(base_path, 'data/namesDatabase.json')
    full_cache_path = os.path.join(base_path, 'public/data/fullNames_cache.json')
    popular_cache_path = os.path.join(base_path, 'public/data/popularNames_cache.json')

    # Output file
    unified_db_path = os.path.join(base_path, 'public/data/unifiedNamesDatabase.json')

    print("Creating unified database...")

    # Dictionary to hold all unique names
    all_names = {}

    # 1. Load main database (224,058 names)
    print(f"Loading main database from {main_db_path}...")
    main_names = load_json_file(main_db_path)
    print(f"Found {len(main_names)} names in main database")

    # First pass: Add first 10,000 names as popular
    for i, name in enumerate(main_names[:10000]):
        merge_name_data(all_names, name, 'main_database', is_popular=True)

    # Add remaining names
    for name in main_names[10000:]:
        merge_name_data(all_names, name, 'main_database', is_popular=False)

    # 2. Load and merge fullNames cache (174,595 names)
    print(f"Loading full names cache from {full_cache_path}...")
    full_names = load_json_file(full_cache_path)
    print(f"Found {len(full_names)} names in full cache")

    for i, name in enumerate(full_names):
        # Mark first 10,000 as popular
        is_popular = (i < 10000)
        merge_name_data(all_names, name, 'full_cache', is_popular=is_popular)

    # 3. Load and merge popular cache (should be subset)
    print(f"Loading popular names cache from {popular_cache_path}...")
    popular_names = load_json_file(popular_cache_path)
    print(f"Found {len(popular_names)} names in popular cache")

    for name in popular_names[:10000]:  # Ensure first 10k are marked popular
        merge_name_data(all_names, name, 'popular_cache', is_popular=True)

    # Convert to sorted list
    names_list = list(all_names.values())

    # Sort by popularity first, then alphabetically
    names_list.sort(key=lambda x: (x.get('popularity', 9999), x.get('name', '')))

    # Ensure popularity ranks are correct
    for i, name in enumerate(names_list):
        if name.get('isPopular'):
            name['popularityRank'] = i + 1

    # Create final structure
    unified_db = {
        'metadata': {
            'version': '3.0.0',
            'totalNames': len(names_list),
            'popularNames': sum(1 for n in names_list if n.get('isPopular', False)),
            'lastUpdated': datetime.now().isoformat(),
            'sources': ['main_database', 'full_cache', 'popular_cache'],
            'description': 'Unified database with all available names, top 10k marked as popular'
        },
        'names': names_list
    }

    # Save unified database
    print(f"Saving unified database to {unified_db_path}...")
    with open(unified_db_path, 'w', encoding='utf-8') as f:
        json.dump(unified_db, f, ensure_ascii=False, indent=2)

    # Print statistics
    print("\n=== Unified Database Statistics ===")
    print(f"Total unique names: {len(names_list)}")
    print(f"Popular names (top 10k): {unified_db['metadata']['popularNames']}")
    print(f"Names by gender:")
    gender_counts = {}
    for name in names_list:
        gender = name.get('gender', 'unknown')
        gender_counts[gender] = gender_counts.get(gender, 0) + 1
    for gender, count in sorted(gender_counts.items()):
        print(f"  {gender}: {count}")

    print(f"\nDatabase saved successfully to {unified_db_path}")
    print(f"File size: {os.path.getsize(unified_db_path) / (1024*1024):.2f} MB")

if __name__ == "__main__":
    main()