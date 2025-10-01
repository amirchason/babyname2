#!/usr/bin/env python3
"""Rebuild top 5000 names from SSA state data files"""

import os
import re
import json
from collections import defaultdict
from datetime import datetime

print("REBUILDING TOP 5000 NAMES FROM SSA DATA")
print("="*60)

# Directory with state files
names_dir = '/storage/emulated/0/Download/names/'
base_dir = '/data/data/com.termux/files/home/proj/babyname2'

# Aggregate name counts across all states and recent years
name_totals = defaultdict(lambda: {'count': 0, 'male': 0, 'female': 0})

# Process each state file
state_files = [f for f in os.listdir(names_dir) if f.endswith('.TXT')]
print(f"Found {len(state_files)} state files")

for state_file in state_files:
    state = state_file.replace('.TXT', '')
    file_path = os.path.join(names_dir, state_file)

    print(f"Processing {state}...", end='')

    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()

        for line in lines:
            parts = line.strip().split(',')
            if len(parts) >= 5:
                state_code, gender, year, name, count = parts[0], parts[1], parts[2], parts[3], parts[4]

                # Focus on recent years for current popularity (2000-2024)
                try:
                    year_int = int(year)
                    count_int = int(count)

                    if year_int >= 2000:
                        # Only include names with English letters
                        if re.match(r'^[A-Za-z]+$', name):
                            name_totals[name]['count'] += count_int
                            if gender == 'M':
                                name_totals[name]['male'] += count_int
                            else:
                                name_totals[name]['female'] += count_int
                except ValueError:
                    continue

        print(f" ✓")
    except Exception as e:
        print(f" ✗ Error: {e}")

print(f"\nTotal unique names found: {len(name_totals)}")

# Sort by total count to get popularity ranking
sorted_names = sorted(name_totals.items(), key=lambda x: x[1]['count'], reverse=True)

print(f"\nTop 20 most popular names (2000-2024):")
for i, (name, data) in enumerate(sorted_names[:20], 1):
    gender = 'M' if data['male'] > data['female'] else 'F'
    print(f"  {i:3}. {name:15} ({gender}) - {data['count']:,} occurrences")

# Load existing database
print("\nLoading existing database...")
with open(os.path.join(base_dir, 'public/data/popularNames_cache.json'), 'r') as f:
    cache_data = json.load(f)
    existing_names = {n['name'].lower(): n for n in cache_data['names']}

# Create enhanced top 5000 list
top_5000_names = []
for i, (name, data) in enumerate(sorted_names[:5000], 1):
    # Calculate gender probability
    total = data['male'] + data['female']
    if total > 0:
        male_prob = data['male'] / total
        female_prob = data['female'] / total
    else:
        male_prob = 0.5
        female_prob = 0.5

    # Check if name exists in database, preserve existing data if available
    name_lower = name.lower()
    if name_lower in existing_names:
        entry = existing_names[name_lower].copy()
        entry['popularityRank'] = i  # Update rank
        entry['ssaCount'] = data['count']  # Add SSA count
        if 'gender' not in entry or not isinstance(entry['gender'], dict):
            entry['gender'] = {'Male': male_prob, 'Female': female_prob}
    else:
        # Create new entry
        entry = {
            'name': name,
            'popularityRank': i,
            'gender': {'Male': male_prob, 'Female': female_prob},
            'ssaCount': data['count'],
            'origin': 'American',
            'meaning': None
        }

    top_5000_names.append(entry)

print(f"\nCreated top 5000 list")

# Get remaining names from existing database (ranked 5001+)
remaining_names = []
existing_name_set = set(n.lower() for n, _ in sorted_names[:5000])

# Collect all existing names not in top 5000
all_chunks = [
    'public/data/names-chunk1.json',
    'public/data/names-chunk2.json',
    'public/data/names-chunk3.json',
    'public/data/names-chunk4.json'
]

all_existing = []
for chunk_file in all_chunks:
    try:
        with open(os.path.join(base_dir, chunk_file), 'r') as f:
            chunk_data = json.load(f)
            all_existing.extend(chunk_data['names'])
    except:
        pass

# Add existing names not in top 5000
for entry in all_existing:
    if entry['name'].lower() not in existing_name_set:
        remaining_names.append(entry)

# Sort remaining by their original rank or name
remaining_names.sort(key=lambda x: x.get('popularityRank', 999999))

# Re-rank all names
all_names = top_5000_names + remaining_names
for i, entry in enumerate(all_names, 1):
    entry['popularityRank'] = i

print(f"Total names after merge: {len(all_names)}")

# Save new cache (top 10,000)
cache_names = all_names[:10000]
cache_data = {
    'names': cache_names,
    'metadata': {
        'totalNames': len(cache_names),
        'lastUpdated': datetime.now().isoformat(),
        'description': 'Top 10,000 names based on SSA data 2000-2024',
        'source': 'Social Security Administration state data'
    }
}

cache_path = os.path.join(base_dir, 'public/data/popularNames_cache.json')
with open(cache_path, 'w') as f:
    json.dump(cache_data, f, indent=2)

print(f"\n✅ Saved cache with top 10,000 names")

# Redistribute across chunks
total = len(all_names)
chunk_size = total // 4
remainder = total % 4

chunks = []
start = 0
for i in range(4):
    size = chunk_size + (1 if i < remainder else 0)
    chunks.append(all_names[start:start + size])
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
                'lastUpdated': datetime.now().isoformat()
            }
        }

        chunk_path = os.path.join(base_dir, f'public/data/names-chunk{i}.json')
        with open(chunk_path, 'w') as f:
            json.dump(chunk_data, f, indent=2)

        print(f"✅ Chunk {i}: {len(chunk)} names (ranks {chunk[0]['popularityRank']}-{chunk[-1]['popularityRank']})")

print("\n" + "="*60)
print("✅ SUCCESS! Database rebuilt with correct popularity rankings")
print(f"- Top 5000 based on actual SSA data (2000-2024)")
print(f"- Rankings are sequential: 1, 2, 3, 4, 5... {len(all_names)}")
print(f"- English letters only")
print("="*60)