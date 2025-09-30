#!/usr/bin/env python3
"""
Clean invalid and corrupted names from the database
Removes non-English characters, encoding issues, and invalid entries
"""

import json
import re
import string

def is_valid_name(name):
    """Check if a name is valid English name"""
    if not name or not isinstance(name, str):
        return False

    # Remove names that are just single letters or dots
    if len(name) <= 1 and name != "I":
        return False

    # Remove names with special characters (except hyphen and apostrophe)
    # Allow: letters, spaces, hyphens, apostrophes
    valid_pattern = re.compile(r"^[A-Za-z\s\-']+$")
    if not valid_pattern.match(name):
        return False

    # Remove names that look like abbreviations (e.g., "A.", "B.")
    if name.endswith('.') and len(name) <= 3:
        return False

    # Remove names with encoding issues (containing special unicode)
    try:
        name.encode('ascii', 'ignore').decode('ascii')
        if len(name.encode('ascii', 'ignore').decode('ascii')) < len(name) * 0.8:
            # More than 20% of characters are non-ASCII
            return False
    except:
        return False

    # Remove names that are just punctuation or numbers
    if all(c in string.punctuation + string.digits for c in name):
        return False

    # Remove specific problematic names
    invalid_names = [
        "┘àï¡┘àï»", "A", "A.", "B.", "C.",
        "A-drian", "A-j", "A-jay", "A-kay", "A.franko"
    ]
    if name in invalid_names:
        return False

    return True

def clean_database(input_file, output_file):
    """Clean the names database"""
    print(f"Loading database from {input_file}...")

    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data['names'])
    print(f"Original database has {original_count:,} names")

    # Filter out invalid names
    cleaned_names = []
    removed_names = []

    for entry in data['names']:
        name = entry.get('name', '')
        if is_valid_name(name):
            # Also clean the name (trim whitespace, fix capitalization)
            entry['name'] = name.strip()
            cleaned_names.append(entry)
        else:
            removed_names.append(name)

    # Update metadata
    data['names'] = cleaned_names
    data['metadata']['totalNames'] = len(cleaned_names)
    data['metadata']['note'] = "Cleaned database - removed invalid and non-English names"

    # Save cleaned database
    print(f"Saving cleaned database to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nCleaning complete!")
    print(f"Removed {len(removed_names):,} invalid names")
    print(f"New database has {len(cleaned_names):,} names")

    # Show some examples of removed names
    if removed_names:
        print("\nExamples of removed names:")
        for name in removed_names[:20]:
            print(f"  - {repr(name)}")

    return len(cleaned_names)

if __name__ == "__main__":
    # Clean the popularNames_cache.json file
    input_file = "public/data/popularNames_cache.json"
    output_file = "public/data/popularNames_cleaned.json"

    clean_database(input_file, output_file)

    print("\n✅ Database cleaned successfully!")
    print(f"Clean database saved to: {output_file}")