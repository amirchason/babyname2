#!/usr/bin/env python3
"""Fix rankings so cache and chunks don't overlap - each name has unique rank"""

import json
import os
from datetime import datetime

base_dir = '/data/data/com.termux/files/home/proj/babyname2'

print("FIXING RANKINGS - NO OVERLAPS")
print("="*60)

# Collect ALL unique names from all files
all_names = {}
all_files = [
    'public/data/popularNames_cache.json',
    'public/data/names-chunk1.json',
    'public/data/names-chunk2.json',
    'public/data/names-chunk3.json',
    'public/data/names-chunk4.json'
]

print("Collecting all unique names...")
for file in all_files:
    path = os.path.join(base_dir, file)
    with open(path, 'r') as f:
        data = json.load(f)
        names = data['names'] if isinstance(data, dict) and 'names' in data else data

        for entry in names:
            name_lower = entry['name'].lower()
            # Keep first occurrence or better ranked
            if name_lower not in all_names or entry.get('popularityRank', 999999) < all_names[name_lower].get('popularityRank', 999999):
                all_names[name_lower] = entry

# Convert to list and sort by current rank
unique_names = list(all_names.values())
unique_names.sort(key=lambda x: x.get('popularityRank', 999999))

print(f"Found {len(unique_names)} unique names")

# Re-rank all names from 1 to N
for i, entry in enumerate(unique_names, 1):
    entry['popularityRank'] = i

print(f"Re-ranked names from 1 to {len(unique_names)}")

# STRATEGY: Cache has top 10k, chunks have ALL names but app only uses chunks
# Cache is for initial fast load, chunks replace it when loaded

# Save cache (top 10,000)
cache_names = unique_names[:10000]
cache_data = {
    'names': cache_names,
    'metadata': {
        'totalNames': len(cache_names),
        'lastUpdated': datetime.now().isoformat(),
        'description': 'Top 10,000 baby names for initial fast loading',
        'note': 'This cache is replaced by chunk data when fully loaded'
    }
}

cache_path = os.path.join(base_dir, 'public/data/popularNames_cache.json')
with open(cache_path, 'w') as f:
    json.dump(cache_data, f, indent=2)
print(f"\n✅ Cache: {len(cache_names)} names (ranks 1-{cache_names[-1]['popularityRank']})")

# Distribute ALL names across chunks (including the top 10k)
# The app will use chunks once loaded, replacing cache
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

# Save chunks
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
                'description': f'Complete name database chunk {i} of 4'
            }
        }

        chunk_path = os.path.join(base_dir, f'public/data/names-chunk{i}.json')
        with open(chunk_path, 'w') as f:
            json.dump(chunk_data, f, indent=2)

        print(f"✅ Chunk {i}: {len(chunk)} names (ranks {chunk[0]['popularityRank']}-{chunk[-1]['popularityRank']})")

print("\n" + "="*60)
print("STRUCTURE:")
print("- Cache: Top 10k for fast initial load")
print("- Chunks: Complete database split into 4 parts")
print("- App loads cache first, then replaces with chunks")
print(f"- Total unique names: {len(unique_names)}")
print(f"- Each name has unique rank 1 to {len(unique_names)}")
print("="*60)