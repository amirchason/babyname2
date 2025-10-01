#!/usr/bin/env python3
"""Emergency fix for duplicate names in database"""

import json
import os
from datetime import datetime

def fix_duplicates(file_path):
    """Remove all duplicate names, keep only one with best data"""
    print(f"Fixing {file_path}...")

    with open(file_path, 'r') as f:
        data = json.load(f)

    # Get names array
    if isinstance(data, dict) and 'names' in data:
        names = data['names']
    else:
        names = data

    print(f"  Before: {len(names)} entries")

    # Remove duplicates - keep first occurrence
    seen = {}
    unique_names = []

    for entry in names:
        name = entry['name'].lower()
        if name not in seen:
            seen[name] = True
            unique_names.append(entry)

    print(f"  After: {len(unique_names)} unique names")
    print(f"  Removed {len(names) - len(unique_names)} duplicates!")

    # Sort by rank
    unique_names.sort(key=lambda x: x.get('popularityRank', 999999))

    # Re-index ranks to be continuous
    for i, entry in enumerate(unique_names, 1):
        entry['popularityRank'] = i

    # Update data
    if isinstance(data, dict) and 'names' in data:
        data['names'] = unique_names
        if 'metadata' in data:
            data['metadata']['totalNames'] = len(unique_names)
    else:
        data = unique_names

    # Save
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

# Fix all files
base_dir = '/data/data/com.termux/files/home/proj/babyname2'
files = [
    'public/data/popularNames_cache.json',
    'public/data/names-chunk1.json',
    'public/data/names-chunk2.json',
    'public/data/names-chunk3.json',
    'public/data/names-chunk4.json'
]

print("REMOVING ALL DUPLICATES...")
for file in files:
    path = os.path.join(base_dir, file)
    fix_duplicates(path)

print("\nDONE! All duplicates removed.")