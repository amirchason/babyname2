#!/usr/bin/env python3
"""
Script to clean compound names (names with spaces) and remove duplicates.
Extracts only the first name and merges duplicate entries.
"""

import json
import os
from datetime import datetime
from collections import defaultdict

def clean_compound_names(database: dict) -> dict:
    """
    Clean compound names and merge duplicates.
    """
    # Dictionary to store merged names
    merged_names = defaultdict(lambda: {
        'name': '',
        'originalName': '',
        'type': 'first',
        'gender': {'Male': 0, 'Female': 0},
        'popularityScore': 0,
        'globalPopularityScore': 0,
        'globalFrequency': 0,
        'primaryCountry': '',
        'countries': defaultdict(int),
        'globalCountries': defaultdict(float),
        'appearances': 0,
        'variants': set(),
        'count': 0  # Track how many entries were merged
    })

    compound_names_found = []

    for entry in database['names']:
        original_name = entry['name']

        # Check if it's a compound name
        if ' ' in original_name:
            # Extract just the first name
            first_name = original_name.split()[0]
            compound_names_found.append((original_name, first_name))
        else:
            first_name = original_name

        # Use uppercase first letter for consistency
        first_name = first_name.strip()
        if first_name:
            first_name = first_name[0].upper() + first_name[1:] if len(first_name) > 1 else first_name.upper()

        # Skip empty names or very short names (1 char) unless they're common initials
        if not first_name or (len(first_name) <= 1 and first_name not in ['A', 'B', 'C', 'D', 'E', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z']):
            continue

        # Merge data
        merged = merged_names[first_name]

        if not merged['name']:
            merged['name'] = first_name
            merged['originalName'] = first_name
            merged['type'] = entry.get('type', 'first')
            merged['primaryCountry'] = entry.get('primaryCountry', 'US')

        # Merge gender data (sum the values)
        for gender, value in entry.get('gender', {}).items():
            merged['gender'][gender] += value

        # Take the maximum popularity scores
        merged['popularityScore'] = max(merged['popularityScore'], entry.get('popularityScore', 0))
        merged['globalPopularityScore'] = max(merged['globalPopularityScore'], entry.get('globalPopularityScore', 0))

        # Sum frequencies and appearances
        merged['globalFrequency'] += entry.get('globalFrequency', 0)
        merged['appearances'] += entry.get('appearances', 0)

        # Merge countries data
        for country, count in entry.get('countries', {}).items():
            merged['countries'][country] += count

        for country, freq in entry.get('globalCountries', {}).items():
            merged['globalCountries'][country] += freq

        # Merge variants (but not the compound name itself)
        if entry.get('variants'):
            for variant in entry['variants']:
                if ' ' not in variant:  # Don't add compound variants
                    merged['variants'].add(variant)

        # If this was a compound name, add original as a variant (if different from first name)
        if original_name != first_name and ' ' in original_name:
            # Don't add the full compound name as a variant
            pass

        merged['count'] += 1

    # Convert merged_names to list
    final_names = []
    duplicates_removed = 0

    for name, data in merged_names.items():
        if data['count'] > 1:
            duplicates_removed += data['count'] - 1

        # Clean up the entry
        entry = {
            'name': data['name'],
            'originalName': data['originalName'],
            'type': data['type'],
            'gender': dict(data['gender']),
            'popularityRank': 0,  # Will be recalculated
            'popularityScore': data['popularityScore'],
            'globalPopularityScore': data['globalPopularityScore'],
            'globalFrequency': data['globalFrequency'],
            'primaryCountry': data['primaryCountry'],
            'countries': dict(data['countries']),
            'globalCountries': dict(data['globalCountries']),
            'appearances': data['appearances'],
            'variants': list(data['variants'])
        }
        final_names.append(entry)

    # Sort by popularity and update ranks
    final_names.sort(key=lambda x: x.get('popularityScore', 0), reverse=True)
    for i, name_entry in enumerate(final_names, 1):
        name_entry['popularityRank'] = i

    print(f"\nCompound names found and cleaned: {len(compound_names_found)}")
    print(f"Examples of compound names cleaned:")
    for orig, first in compound_names_found[:10]:
        print(f"  '{orig}' -> '{first}'")

    print(f"\nDuplicates removed: {duplicates_removed}")
    print(f"Total unique names: {len(final_names)}")

    # Update metadata
    database['names'] = final_names
    database['metadata']['totalNames'] = len(final_names)
    database['metadata']['lastUpdated'] = datetime.now().isoformat() + 'Z'
    database['metadata']['description'] = database['metadata'].get('description', '') + ' (Compound names cleaned, duplicates removed)'

    return database

def process_databases():
    """Process both popular and full databases."""

    # Process popular names database
    popular_path = '/data/data/com.termux/files/home/proj/babyname2/public/data/popularNames_cache.json'
    print(f"Processing popular names database...")

    with open(popular_path, 'r') as f:
        popular_db = json.load(f)

    print(f"Original database: {len(popular_db['names'])} names")

    popular_db = clean_compound_names(popular_db)

    # Backup original
    backup_path = popular_path + '.backup_before_compound_clean'
    if not os.path.exists(backup_path):
        with open(popular_path, 'r') as f:
            original = f.read()
        with open(backup_path, 'w') as f:
            f.write(original)
        print(f"Backed up original to {backup_path}")

    # Save updated popular database
    with open(popular_path, 'w') as f:
        json.dump(popular_db, f, separators=(',', ':'))

    print(f"Saved cleaned popular database: {len(popular_db['names'])} names")

    # Process full database if it exists
    full_path = '/data/data/com.termux/files/home/proj/babyname2/public/data/fullNames_cache.json'
    if os.path.exists(full_path):
        print(f"\nProcessing full names database...")

        with open(full_path, 'r') as f:
            full_db = json.load(f)

        print(f"Original database: {len(full_db['names'])} names")

        full_db = clean_compound_names(full_db)

        # Backup original
        backup_path = full_path + '.backup_before_compound_clean'
        if not os.path.exists(backup_path):
            with open(full_path, 'r') as f:
                original = f.read()
            with open(backup_path, 'w') as f:
                f.write(original)
            print(f"Backed up original to {backup_path}")

        # Save updated full database
        with open(full_path, 'w') as f:
            json.dump(full_db, f, separators=(',', ':'))

        print(f"Saved cleaned full database: {len(full_db['names'])} names")

if __name__ == '__main__':
    process_databases()