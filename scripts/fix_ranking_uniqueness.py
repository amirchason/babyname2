#!/usr/bin/env python3
"""Fix duplicate rankings - ensure each name has a unique rank across all files"""

import json
import os
from datetime import datetime

base_dir = '/data/data/com.termux/files/home/proj/babyname2'

print("FIXING DUPLICATE RANKINGS...")
print("="*60)

# Step 1: Collect ALL unique names from all chunks (not cache)
all_names = {}
chunk_files = [
    'public/data/names-chunk1.json',
    'public/data/names-chunk2.json',
    'public/data/names-chunk3.json',
    'public/data/names-chunk4.json'
]

print("Collecting all names from chunks...")
for file in chunk_files:
    path = os.path.join(base_dir, file)
    with open(path, 'r') as f:
        data = json.load(f)
        names = data['names'] if isinstance(data, dict) and 'names' in data else data

        for entry in names:
            name_lower = entry['name'].lower()
            # Keep first occurrence or higher ranked one
            if name_lower not in all_names or entry.get('popularityRank', 999999) < all_names[name_lower].get('popularityRank', 999999):
                all_names[name_lower] = entry

# Convert to list and sort
unique_names = list(all_names.values())
unique_names.sort(key=lambda x: x.get('popularityRank', 999999))

print(f"Found {len(unique_names)} unique names")

# Step 2: Re-rank ALL names uniquely from 1 to N
print("\nRe-ranking all names uniquely...")
for i, entry in enumerate(unique_names, 1):
    entry['popularityRank'] = i

# Step 3: Create cache with top 10,000 (just a copy, not new data)
cache_names = unique_names[:10000]
cache_data = {
    'names': cache_names,
    'metadata': {
        'totalNames': len(cache_names),
        'lastUpdated': datetime.now().isoformat(),
        'description': 'Top 10,000 baby names (cache for fast loading)',
        'note': 'This is a subset of chunk data for performance'
    }
}

cache_path = os.path.join(base_dir, 'public/data/popularNames_cache.json')
with open(cache_path, 'w') as f:
    json.dump(cache_data, f, indent=2)
print(f"Cache saved: {len(cache_names)} names (ranks 1-{len(cache_names)})")

# Step 4: Redistribute ALL names across chunks (no overlaps)
total = len(unique_names)
chunk_size = total // 4
remainder = total % 4

chunks = []
start = 0
for i in range(4):
    size = chunk_size + (1 if i < remainder else 0)
    chunk = unique_names[start:start + size]
    chunks.append(chunk)
    start += size

# Step 5: Save chunks with correct non-overlapping ranks
for i, chunk in enumerate(chunks, 1):
    if len(chunk) > 0:
        chunk_data = {
            'names': chunk,
            'metadata': {
                'chunkNumber': i,
                'totalNames': len(chunk),
                'startRank': chunk[0]['popularityRank'],
                'endRank': chunk[-1]['popularityRank'],
                'lastUpdated': datetime.now().isoformat(),
                'description': f'Name database chunk {i} of 4'
            }
        }

        chunk_path = os.path.join(base_dir, f'public/data/names-chunk{i}.json')
        with open(chunk_path, 'w') as f:
            json.dump(chunk_data, f, indent=2)

        print(f"Chunk {i}: {len(chunk)} names (ranks {chunk[0]['popularityRank']}-{chunk[-1]['popularityRank']})")

print("\n" + "="*60)
print("✅ SUCCESS! Rankings fixed:")
print(f"- {len(unique_names)} total unique names")
print(f"- Each name has a unique rank from 1 to {len(unique_names)}")
print(f"- Cache contains top 10,000 for fast loading")
print(f"- Chunks contain all names with no overlapping ranks")
print("- NO DUPLICATES!")