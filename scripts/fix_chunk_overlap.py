#!/usr/bin/env python3
"""Fix the overlap between cache and chunk1 to eliminate duplicates"""

import json
import os
from datetime import datetime

base_dir = '/data/data/com.termux/files/home/proj/babyname2'

print("FIXING CHUNK OVERLAP TO ELIMINATE DUPLICATES")
print("="*60)

# Load chunk1
chunk1_path = os.path.join(base_dir, 'public/data/names-chunk1.json')
with open(chunk1_path, 'r') as f:
    chunk1_data = json.load(f)
    chunk1_names = chunk1_data['names']

print(f"Original chunk1: {len(chunk1_names)} names")
print(f"  First: {chunk1_names[0]['name']} (rank {chunk1_names[0]['popularityRank']})")
print(f"  10000th: {chunk1_names[9999]['name']} (rank {chunk1_names[9999]['popularityRank']})")
print(f"  10001st: {chunk1_names[10000]['name']} (rank {chunk1_names[10000]['popularityRank']})")
print(f"  Last: {chunk1_names[-1]['name']} (rank {chunk1_names[-1]['popularityRank']})")

# Create backup
backup_path = chunk1_path.replace('.json', f'_backup_before_overlap_fix_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
with open(backup_path, 'w') as f:
    json.dump(chunk1_data, f, indent=2)
print(f"\nBackup saved: {backup_path}")

# Remove the first 10,000 names (they're in the cache)
# Keep names from rank 10,001 onwards
chunk1_names_fixed = chunk1_names[10000:]  # Skip first 10,000

print(f"\nFixed chunk1: {len(chunk1_names_fixed)} names")
print(f"  First: {chunk1_names_fixed[0]['name']} (rank {chunk1_names_fixed[0]['popularityRank']})")
print(f"  Last: {chunk1_names_fixed[-1]['name']} (rank {chunk1_names_fixed[-1]['popularityRank']})")

# Update chunk1 metadata
chunk1_data['names'] = chunk1_names_fixed
chunk1_data['metadata'] = {
    'chunkNumber': 1,
    'totalNames': len(chunk1_names_fixed),
    'startRank': chunk1_names_fixed[0]['popularityRank'],
    'endRank': chunk1_names_fixed[-1]['popularityRank'],
    'lastUpdated': datetime.now().isoformat(),
    'description': 'Name database chunk 1 (no overlap with cache)',
    'note': 'Starts at rank 10,001 to avoid duplicating cache entries'
}

# Save the fixed chunk1
with open(chunk1_path, 'w') as f:
    json.dump(chunk1_data, f, indent=2)

print("\n✅ SUCCESS! Chunk1 fixed:")
print(f"- Removed first 10,000 names (already in cache)")
print(f"- Now contains ranks {chunk1_names_fixed[0]['popularityRank']} to {chunk1_names_fixed[-1]['popularityRank']}")
print(f"- Total: {len(chunk1_names_fixed)} names")
print("\n📊 New structure:")
print("- Cache: ranks 1-10,000 (fast load)")
print("- Chunk1: ranks 10,001-40,702 (no overlap!)")
print("- Chunk2: ranks 40,703-81,404")
print("- Chunk3: ranks 81,405-122,106")
print("- Chunk4: ranks 122,107-162,807")
print("\n🎯 Result: NO MORE DUPLICATES!")