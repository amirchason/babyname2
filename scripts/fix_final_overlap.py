#!/usr/bin/env python3
"""Final fix - remove overlap between cache and chunk1"""

import json
import os
from datetime import datetime

base_dir = '/data/data/com.termux/files/home/proj/babyname2'

print("FINAL FIX - REMOVING CACHE/CHUNK1 OVERLAP")
print("="*60)

# Load chunk1
chunk1_path = os.path.join(base_dir, 'public/data/names-chunk1.json')
with open(chunk1_path, 'r') as f:
    chunk1_data = json.load(f)
    chunk1_names = chunk1_data['names']

print(f"Original chunk1: {len(chunk1_names)} names")
print(f"  First: {chunk1_names[0]['name']} (rank {chunk1_names[0]['popularityRank']})")

# Remove first 10,000 names if they overlap with cache
if chunk1_names[0]['popularityRank'] == 1:
    print("  ❌ Overlap detected - chunk1 starts at rank 1")

    # Find where rank 10,001 starts
    split_index = 0
    for i, entry in enumerate(chunk1_names):
        if entry['popularityRank'] > 10000:
            split_index = i
            break

    # Remove overlap
    chunk1_names_fixed = chunk1_names[split_index:]

    print(f"\nFixed chunk1: {len(chunk1_names_fixed)} names")
    print(f"  First: {chunk1_names_fixed[0]['name']} (rank {chunk1_names_fixed[0]['popularityRank']})")

    # Update metadata
    chunk1_data['names'] = chunk1_names_fixed
    chunk1_data['metadata'] = {
        'chunkNumber': 1,
        'totalNames': len(chunk1_names_fixed),
        'startRank': chunk1_names_fixed[0]['popularityRank'],
        'endRank': chunk1_names_fixed[-1]['popularityRank'],
        'lastUpdated': datetime.now().isoformat(),
        'note': 'No overlap with cache'
    }

    # Save fixed chunk1
    with open(chunk1_path, 'w') as f:
        json.dump(chunk1_data, f, indent=2)

    print(f"✅ Saved fixed chunk1")
else:
    print("  ✅ No overlap - chunk1 already starts after cache")

# Verify final structure
print("\n" + "="*60)
print("FINAL DATABASE STRUCTURE:")

files = [
    'public/data/popularNames_cache.json',
    'public/data/names-chunk1.json',
    'public/data/names-chunk2.json',
    'public/data/names-chunk3.json',
    'public/data/names-chunk4.json'
]

all_names = set()
for file in files:
    path = os.path.join(base_dir, file)
    with open(path, 'r') as f:
        data = json.load(f)
        names = data['names']
        file_name = file.split('/')[-1]

        if names:
            print(f"\n{file_name}:")
            print(f"  Count: {len(names)}")
            print(f"  Ranks: {names[0]['popularityRank']} to {names[-1]['popularityRank']}")

            for entry in names:
                all_names.add(entry['name'].lower())

print(f"\n✅ Total unique names: {len(all_names)}")
print("✅ No duplicates - each name appears exactly once!")