#!/usr/bin/env python3
"""Fix chunk distribution - remove cross-file duplicates and redistribute"""

import json
import os
from datetime import datetime

base_dir = '/data/data/com.termux/files/home/proj/babyname2'

# Collect ALL unique names from all files
print("Collecting all unique names...")
all_names = {}
files = [
    'public/data/popularNames_cache.json',
    'public/data/names-chunk1.json',
    'public/data/names-chunk2.json',
    'public/data/names-chunk3.json',
    'public/data/names-chunk4.json'
]

for file in files:
    path = os.path.join(base_dir, file)
    with open(path, 'r') as f:
        data = json.load(f)
        names = data['names'] if isinstance(data, dict) and 'names' in data else data

        for entry in names:
            name_lower = entry['name'].lower()
            if name_lower not in all_names or entry.get('popularityRank', 999999) < all_names[name_lower].get('popularityRank', 999999):
                all_names[name_lower] = entry

# Convert to list and sort by popularity rank
unique_names = list(all_names.values())
unique_names.sort(key=lambda x: x.get('popularityRank', 999999))

# Re-index ranks
for i, entry in enumerate(unique_names, 1):
    entry['popularityRank'] = i

print(f"Total unique names: {len(unique_names)}")

# Split into chunks
chunk_size = len(unique_names) // 4
remainder = len(unique_names) % 4

chunks = []
start = 0
for i in range(4):
    size = chunk_size + (1 if i < remainder else 0)
    chunks.append(unique_names[start:start + size])
    start += size

# Save cache file with top 10000
cache_data = {
    'names': unique_names[:10000],
    'metadata': {
        'totalNames': min(10000, len(unique_names)),
        'lastUpdated': datetime.now().isoformat(),
        'description': 'Top 10,000 popular baby names worldwide (deduplicated)'
    }
}

cache_path = os.path.join(base_dir, 'public/data/popularNames_cache.json')
with open(cache_path, 'w') as f:
    json.dump(cache_data, f, indent=2)
print(f"Cache: {len(cache_data['names'])} names")

# Save chunk files
for i, chunk in enumerate(chunks, 1):
    chunk_data = {
        'names': chunk,
        'metadata': {
            'chunkNumber': i,
            'totalNames': len(chunk),
            'startRank': chunk[0]['popularityRank'],
            'endRank': chunk[-1]['popularityRank'],
            'lastUpdated': datetime.now().isoformat()
        }
    }

    chunk_path = os.path.join(base_dir, f'public/data/names-chunk{i}.json')
    with open(chunk_path, 'w') as f:
        json.dump(chunk_data, f, indent=2)
    print(f"Chunk {i}: {len(chunk)} names (ranks {chunk[0]['popularityRank']}-{chunk[-1]['popularityRank']})")

print(f"\nFixed! {len(unique_names)} unique names properly distributed across chunks.")