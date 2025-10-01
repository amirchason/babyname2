#!/usr/bin/env python3
"""
Clean up name database:
1. Split hyphenated names into individual names
2. Remove duplicates
3. Re-index popularity ranks to be continuous
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any

def split_hyphenated_name(name: str) -> List[str]:
    """Split hyphenated names into individual names."""
    if '-' in name:
        # Split by hyphen and capitalize each part
        parts = name.split('-')
        return [part.strip().capitalize() for part in parts if part.strip()]
    return [name]

def process_name_entry(entry: Dict[str, Any], new_rank: int) -> List[Dict[str, Any]]:
    """Process a single name entry, splitting if needed."""
    name = entry.get('name', '')
    split_names = split_hyphenated_name(name)

    results = []
    for idx, split_name in enumerate(split_names):
        new_entry = entry.copy()
        new_entry['name'] = split_name
        new_entry['originalName'] = split_name  # Update originalName too

        # Update popularity rank - if split, the parts get subsequent ranks
        new_entry['popularityRank'] = new_rank + idx

        # Mark if this was split from a hyphenated name
        if len(split_names) > 1:
            new_entry['splitFrom'] = name

        results.append(new_entry)

    return results

def clean_database(input_file: str, output_file: str):
    """Clean and process the database file."""
    print(f"Processing {input_file}...")

    # Create backup
    backup_file = input_file.replace('.json', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')

    # Read original data
    with open(input_file, 'r') as f:
        data = json.load(f)

    # Save backup
    with open(backup_file, 'w') as f:
        json.dump(data, f)
    print(f"Backup saved to {backup_file}")

    # Process names
    processed_names = []
    seen_names = set()  # Track duplicates
    current_rank = 1

    # Get the names array
    names = data.get('names', []) if 'names' in data else data

    for entry in names:
        # Process each name entry (may split into multiple)
        split_entries = process_name_entry(entry, current_rank)

        for new_entry in split_entries:
            name_lower = new_entry['name'].lower()

            # Skip duplicates
            if name_lower not in seen_names:
                seen_names.add(name_lower)
                # Fix the rank to be continuous
                new_entry['popularityRank'] = current_rank
                processed_names.append(new_entry)
                current_rank += 1
            else:
                print(f"  Skipping duplicate: {new_entry['name']}")

    # Update data structure
    if 'names' in data:
        data['names'] = processed_names
        # Update metadata
        if 'metadata' in data:
            data['metadata']['totalNames'] = len(processed_names)
            data['metadata']['lastUpdated'] = datetime.now().isoformat()
            data['metadata']['description'] = data['metadata'].get('description', '') + ' (cleaned, split hyphenated, continuous ranks)'
    else:
        data = processed_names

    # Save cleaned data
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"Processed {len(names)} -> {len(processed_names)} names")
    print(f"Saved to {output_file}")

    # Report statistics
    hyphenated_count = sum(1 for name in processed_names if 'splitFrom' in name)
    print(f"Split {hyphenated_count} names from hyphenated originals")
    print(f"Removed {len(names) + hyphenated_count - len(processed_names)} duplicates")

def main():
    """Main function to clean all database files."""
    base_dir = '/data/data/com.termux/files/home/proj/babyname2'

    # Files to process
    files_to_clean = [
        'public/data/popularNames_cache.json',
        'public/data/names-chunk1.json',
        'public/data/names-chunk2.json',
        'public/data/names-chunk3.json',
        'public/data/names-chunk4.json'
    ]

    for file_path in files_to_clean:
        full_path = os.path.join(base_dir, file_path)
        if os.path.exists(full_path):
            clean_database(full_path, full_path)
        else:
            print(f"File not found: {full_path}")

    print("\nAll databases cleaned successfully!")

if __name__ == "__main__":
    main()