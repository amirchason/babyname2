#!/usr/bin/env python3
"""
Script to format the full 224K names database to match the popular names structure.
Adds the 'variants' field that's missing from the full database.
"""

import json
import os
from datetime import datetime

def format_full_database():
    """Format the full database to match the popular names structure."""

    # Paths
    full_db_path = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'
    popular_db_path = '/data/data/com.termux/files/home/proj/babyname2/public/data/popularNames_cache.json'
    output_path = '/data/data/com.termux/files/home/proj/babyname2/public/data/fullNames_cache.json'

    print("Loading databases...")

    # Load full database
    with open(full_db_path, 'r') as f:
        full_db = json.load(f)

    # Load popular database to understand structure
    with open(popular_db_path, 'r') as f:
        popular_db = json.load(f)

    print(f"Full database: {len(full_db['names'])} names")
    print(f"Popular database: {len(popular_db['names'])} names")

    # Check structure differences
    if full_db['names']:
        full_keys = set(full_db['names'][0].keys())
        popular_keys = set(popular_db['names'][0].keys())

        missing_in_full = popular_keys - full_keys
        extra_in_full = full_keys - popular_keys

        print(f"\nMissing in full database: {missing_in_full}")
        print(f"Extra in full database: {extra_in_full}")

    # Format each name to match popular structure
    formatted_names = []
    for name in full_db['names']:
        formatted_name = {
            'name': name['name'],
            'originalName': name.get('originalName', name['name']),
            'type': name.get('type', 'first'),
            'gender': name.get('gender', {'Male': 0.5, 'Female': 0.5}),
            'popularityRank': name.get('popularityRank', 99999),
            'popularityScore': name.get('popularityScore', 0),
            'globalPopularityScore': name.get('globalPopularityScore', 0),
            'globalFrequency': name.get('globalFrequency', 0),
            'primaryCountry': name.get('primaryCountry', 'US'),
            'countries': name.get('countries', {}),
            'globalCountries': name.get('globalCountries', {}),
            'appearances': name.get('appearances', 1),
            'variants': []  # Add empty variants field
        }
        formatted_names.append(formatted_name)

    # Create formatted database
    formatted_db = {
        'metadata': {
            'description': 'Complete database with 224K+ names from English & Spanish speaking countries',
            'totalNames': len(formatted_names),
            'lastUpdated': datetime.now().isoformat() + 'Z',
            'source': 'philipperemy/name-dataset',
            'version': '4.0.0'
        },
        'names': formatted_names
    }

    # Save formatted database
    print(f"\nSaving formatted database to {output_path}")
    with open(output_path, 'w') as f:
        json.dump(formatted_db, f, separators=(',', ':'))

    # Get file size
    file_size = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Formatted database saved: {len(formatted_names)} names, {file_size:.1f} MB")

    return len(formatted_names)

if __name__ == '__main__':
    format_full_database()