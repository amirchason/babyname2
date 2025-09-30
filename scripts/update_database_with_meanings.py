#!/usr/bin/env python3
"""
Update the database with processed meanings from localStorage
This script syncs the meanings from the browser back to the database
"""

import json
import sys
from datetime import datetime

def update_database_with_meanings(database_file, meanings_file):
    """Update database with processed meanings"""

    # Load the database
    print(f"Loading database from {database_file}...")
    with open(database_file, 'r', encoding='utf-8') as f:
        database = json.load(f)

    # Load the meanings (exported from browser localStorage)
    print(f"Loading meanings from {meanings_file}...")
    with open(meanings_file, 'r', encoding='utf-8') as f:
        meanings = json.load(f)

    # Create lookup map
    meanings_map = {m['name']: m for m in meanings}

    # Update database entries
    updated_count = 0
    for entry in database['names']:
        if entry['name'] in meanings_map:
            meaning_data = meanings_map[entry['name']]
            entry['meaning'] = meaning_data.get('meaning')
            entry['meaningProcessed'] = meaning_data.get('meaningProcessed', False)
            entry['meaningUpdatedAt'] = meaning_data.get('meaningUpdatedAt')
            entry['categories'] = meaning_data.get('categories', [])
            updated_count += 1

    # Update metadata
    database['metadata']['meaningsProcessed'] = updated_count
    database['metadata']['lastMeaningUpdate'] = datetime.now().isoformat()

    # Save updated database
    output_file = database_file.replace('.json', '_with_meanings.json')
    print(f"Saving updated database to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(database, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Successfully updated {updated_count} names with meanings!")
    print(f"Updated database saved to: {output_file}")

    return updated_count

if __name__ == "__main__":
    # Default files
    database_file = "public/data/popularNames_cleaned.json"
    meanings_file = "public/data/meanings_export.json"

    if len(sys.argv) > 1:
        database_file = sys.argv[1]
    if len(sys.argv) > 2:
        meanings_file = sys.argv[2]

    update_database_with_meanings(database_file, meanings_file)