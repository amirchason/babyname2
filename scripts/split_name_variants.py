#!/usr/bin/env python3
"""
Script to split incorrectly grouped name variants into separate entries.
Only keeps truly similar names together (same pronunciation, minor spelling differences).
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Set
import Levenshtein  # For string similarity

# Define rules for what should stay together as variants
KEEP_TOGETHER = {
    # Arabic names with spelling variations
    'Muhammad': ['Mohammed', 'Mohammad', 'Mohamed', 'Muhammed', 'Mohamad'],
    'Ahmed': ['Ahmad', 'Ahmet'],
    'Ali': ['Aly'],

    # Simple spelling variations
    'Catherine': ['Katherine', 'Kathryn', 'Catharine'],
    'Stephen': ['Steven'],
    'Geoffrey': ['Jeffrey', 'Jeffery'],
    'Philip': ['Phillip'],
    'Teresa': ['Theresa'],
    'Sara': ['Sarah'],
    'Jon': ['John'],
    'Marc': ['Mark'],
    'Eric': ['Erik'],
    'Carl': ['Karl'],
    'Christina': ['Kristina'],
    'Rebecca': ['Rebekah'],

    # Common nicknames that are too short to be standalone
    'Al': ['Alan', 'Albert', 'Alexander'],
    'Ed': ['Edward', 'Edwin', 'Edgar'],
    'Jo': ['Joseph', 'Joanne'],
}

# Names that should DEFINITELY be separated
MUST_SEPARATE = {
    'Elizabeth': ['Betty', 'Elsie', 'Liz', 'Beth', 'Elise', 'Eliza', 'Lizzy'],
    'Larry': ['Lorenzo', 'Enzo', 'Lawrence'],
    'Susan': ['Susana', 'Suzanne', 'Sue', 'Suzy'],
    'Manuel': ['Max', 'Emmanuel', 'Maxwell', 'Maximilian'],
    'Katie': ['Kate', 'Kathleen', 'Kitty', 'Katherine'],
    'Abby': ['Abigail', 'Gail'],
    'Jackie': ['Jack', 'Jacqueline', 'Jill'],
    'William': ['Guillermo', 'Billy', 'Bill', 'Will'],
    'James': ['Jaime', 'Jamie', 'Jim', 'Jimmy'],
    'Mary': ['Maria', 'Marie', 'Mia'],
    'Richard': ['Ricardo', 'Rick', 'Dick'],
    'Carol': ['Caroline', 'Carrie', 'Carolyn', 'Carly'],
    'Veronica': ['Vera', 'Ron', 'Ronnie'],
    'Victoria': ['Vicky', 'Tori'],
    'Linda': ['Lynn', 'Lynda', 'Lynne'],
    'Janet': ['Jane', 'Jean', 'Janice', 'Jeanne'],
    'Luis': ['Lucas', 'Louis', 'Luca', 'Luke'],
}

def should_keep_together(name1: str, name2: str) -> bool:
    """
    Determine if two names should be kept as variants.
    Returns True only if they're very similar spellings of the same name.
    """
    name1_lower = name1.lower()
    name2_lower = name2.lower()

    # Check explicit keep-together rules
    for main_name, variants in KEEP_TOGETHER.items():
        if name1_lower == main_name.lower():
            return name2 in variants
        if name2_lower == main_name.lower():
            return name1 in variants

    # Check if explicitly marked for separation
    for main_name, to_separate in MUST_SEPARATE.items():
        if name1_lower == main_name.lower() and name2 in to_separate:
            return False
        if name2_lower == main_name.lower() and name1 in to_separate:
            return False

    # Use string similarity for close matches
    # Only keep together if VERY similar (> 85% similar)
    similarity = Levenshtein.ratio(name1_lower, name2_lower)

    # Additional checks:
    # 1. Length difference shouldn't be too big
    len_diff = abs(len(name1) - len(name2))
    if len_diff > 3:
        return False

    # 2. Should share most characters
    if similarity > 0.85:
        return True

    # 3. Check if one is contained in the other with small difference
    if name1_lower in name2_lower or name2_lower in name1_lower:
        if len_diff <= 2:
            return True

    return False

def split_variants(database: dict) -> dict:
    """
    Split variants into separate name entries where appropriate.
    """
    new_names = []
    total_split = 0

    for entry in database['names']:
        name = entry['name']
        variants = entry.get('variants', [])

        if not variants:
            new_names.append(entry)
            continue

        # Separate variants into keep and split
        keep_variants = []
        split_variants = []

        for variant in variants:
            if should_keep_together(name, variant):
                keep_variants.append(variant)
            else:
                split_variants.append(variant)

        # Update main entry with only kept variants
        entry['variants'] = keep_variants
        new_names.append(entry)

        # Create new entries for split variants
        for split_name in split_variants:
            if split_name and split_name != name:  # Don't create duplicates
                # Create a new entry for this variant
                new_entry = {
                    'name': split_name,
                    'originalName': split_name,
                    'type': entry.get('type', 'first'),
                    'gender': entry.get('gender', {'Male': 0.5, 'Female': 0.5}),
                    'popularityRank': 99999,  # Will be recalculated
                    'popularityScore': 0,
                    'globalPopularityScore': 0,
                    'globalFrequency': 1,
                    'primaryCountry': entry.get('primaryCountry', 'US'),
                    'countries': {},
                    'globalCountries': {},
                    'appearances': 1,
                    'variants': []  # Start with no variants
                }
                new_names.append(new_entry)
                total_split += 1

    print(f"Split {total_split} variants into separate names")
    print(f"Total names: {len(database['names'])} -> {len(new_names)}")

    # Sort by popularity and update ranks
    new_names.sort(key=lambda x: x.get('popularityScore', 0), reverse=True)
    for i, name_entry in enumerate(new_names, 1):
        name_entry['popularityRank'] = i

    # Update metadata
    database['names'] = new_names
    database['metadata']['totalNames'] = len(new_names)
    database['metadata']['lastUpdated'] = datetime.now().isoformat() + 'Z'
    database['metadata']['description'] = database['metadata'].get('description', '') + ' (Variants properly separated)'

    return database

def process_databases():
    """Process both popular and full databases."""

    # Process popular names database
    popular_path = '/data/data/com.termux/files/home/proj/babyname2/public/data/popularNames_cache.json'
    print(f"\nProcessing popular names database...")

    with open(popular_path, 'r') as f:
        popular_db = json.load(f)

    popular_db = split_variants(popular_db)

    # Save updated popular database
    output_path = '/data/data/com.termux/files/home/proj/babyname2/public/data/popularNames_cache_new.json'
    with open(output_path, 'w') as f:
        json.dump(popular_db, f, separators=(',', ':'))

    print(f"Saved updated popular database to {output_path}")

    # Process full database
    full_path = '/data/data/com.termux/files/home/proj/babyname2/public/data/fullNames_cache.json'
    if os.path.exists(full_path):
        print(f"\nProcessing full names database...")

        with open(full_path, 'r') as f:
            full_db = json.load(f)

        full_db = split_variants(full_db)

        # Save updated full database
        output_path = '/data/data/com.termux/files/home/proj/babyname2/public/data/fullNames_cache_new.json'
        with open(output_path, 'w') as f:
            json.dump(full_db, f, separators=(',', ':'))

        print(f"Saved updated full database to {output_path}")

if __name__ == '__main__':
    try:
        import Levenshtein
    except ImportError:
        print("Installing required package...")
        import subprocess
        subprocess.check_call(['pip', 'install', 'python-Levenshtein'])
        import Levenshtein

    process_databases()