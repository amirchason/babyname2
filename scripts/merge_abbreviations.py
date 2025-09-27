#!/usr/bin/env python3
"""
Merge name abbreviations with their full forms
Combines popularity scores and shows abbreviations in UI
"""

import json
import os
import shutil
from datetime import datetime
from collections import defaultdict

# Common name abbreviations and their full forms
ABBREVIATION_MAPPINGS = {
    # Muhammad variations
    'Md': ['Muhammad', 'Mohammad', 'Mohammed'],
    'Moh': ['Mohammad', 'Mohammed'],
    'Mohd': ['Mohammad', 'Mohammed'],
    'Mhd': ['Muhammad'],
    'Muh': ['Muhammad'],

    # Other common abbreviations
    'Wm': ['William'],
    'Robt': ['Robert'],
    'Thos': ['Thomas'],
    'Jas': ['James'],
    'Jno': ['John'],
    'Jos': ['Joseph'],
    'Benj': ['Benjamin'],
    'Saml': ['Samuel'],
    'Danl': ['Daniel'],
    'Edw': ['Edward'],
    'Geo': ['George'],
    'Chas': ['Charles'],

    # Female abbreviations
    'Eliz': ['Elizabeth'],
    'Margt': ['Margaret'],
    'Cath': ['Catherine'],
}

# Arabic/special cases that need handling
SPECIAL_NAMES_TO_MERGE = {
    'محمد': 'Muhammad',  # Arabic Muhammad
    'ام': None,  # "Mother" in Arabic - should be removed
    '아': None,  # Korean character - should be removed
}

def load_database():
    """Load the current database"""
    db_path = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'

    print(f"Loading database from {db_path}...")
    with open(db_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"✓ Loaded {len(data['names'])} names")
    return data

def find_main_name(names_dict, possible_names):
    """Find which of the possible main names exists in the database"""
    for name in possible_names:
        if name in names_dict:
            return name
    return None

def merge_name_data(main_entry, abbrev_entry, abbrev):
    """Merge abbreviation data into main name entry"""
    # Add abbreviation to the list
    if 'abbreviations' not in main_entry:
        main_entry['abbreviations'] = []
    if abbrev not in main_entry['abbreviations']:
        main_entry['abbreviations'].append(abbrev)

    # Merge countries and ranks (keep best rank)
    for country, rank in abbrev_entry['countries'].items():
        if country not in main_entry['countries']:
            main_entry['countries'][country] = rank
        else:
            # Keep the better (lower) rank
            main_entry['countries'][country] = min(main_entry['countries'][country], rank)

    # Update frequencies
    main_entry['appearances'] = len(main_entry['countries'])
    main_entry['globalFrequency'] = main_entry.get('globalFrequency', 0) + abbrev_entry.get('globalFrequency', 0)

    # Merge gender data (weighted average)
    total_freq = main_entry.get('globalFrequency', 1) + abbrev_entry.get('globalFrequency', 1)
    main_weight = main_entry.get('globalFrequency', 1) / total_freq
    abbrev_weight = abbrev_entry.get('globalFrequency', 1) / total_freq

    for gender in ['Male', 'Female']:
        main_val = main_entry['gender'].get(gender, 0) * main_weight
        abbrev_val = abbrev_entry['gender'].get(gender, 0) * abbrev_weight
        main_entry['gender'][gender] = main_val + abbrev_val

def process_abbreviations(data):
    """Process and merge abbreviations"""
    names_dict = {entry['name']: entry for entry in data['names']}
    names_to_remove = []
    merge_count = 0

    print("\n" + "=" * 70)
    print("PROCESSING ABBREVIATIONS")
    print("=" * 70)

    # Process known abbreviations
    for abbrev, main_names in ABBREVIATION_MAPPINGS.items():
        if abbrev in names_dict:
            main_name = find_main_name(names_dict, main_names)
            if main_name:
                print(f"Merging '{abbrev}' into '{main_name}'")
                merge_name_data(names_dict[main_name], names_dict[abbrev], abbrev)
                names_to_remove.append(abbrev)
                merge_count += 1
            else:
                # If main name doesn't exist, keep the abbreviation but mark it
                print(f"Keeping '{abbrev}' (no main name found)")
                names_dict[abbrev]['isAbbreviation'] = True
                names_dict[abbrev]['possibleFullNames'] = main_names

    # Process special cases
    for special_name, merge_to in SPECIAL_NAMES_TO_MERGE.items():
        if special_name in names_dict:
            if merge_to and merge_to in names_dict:
                print(f"Merging '{special_name}' into '{merge_to}'")
                merge_name_data(names_dict[merge_to], names_dict[special_name], special_name)
                names_to_remove.append(special_name)
                merge_count += 1
            else:
                # Remove names that shouldn't be in database
                print(f"Removing '{special_name}' (not a valid first name)")
                names_to_remove.append(special_name)

    # Process very short names (1-2 characters) that might be abbreviations
    for name, entry in names_dict.items():
        if len(name) <= 2 and name not in names_to_remove:
            # Check if it's a valid 2-letter name (like "Ed", "Al", "Jo")
            common_short_names = ['Ed', 'Al', 'Jo', 'Bo', 'Mo', 'Si', 'Ty', 'Cy', 'Oz', 'Max']
            if name not in common_short_names:
                print(f"Marking '{name}' as potential abbreviation")
                entry['isPotentialAbbreviation'] = True

    # Remove merged abbreviations from the list
    data['names'] = [entry for entry in data['names'] if entry['name'] not in names_to_remove]

    print(f"\n✓ Merged {merge_count} abbreviations")
    print(f"✓ Removed {len(names_to_remove)} entries")
    print(f"✓ Final database has {len(data['names'])} names")

    return data

def recalculate_scores(data):
    """Recalculate popularity scores with better algorithm"""
    print("\n" + "=" * 70)
    print("RECALCULATING POPULARITY SCORES")
    print("=" * 70)

    for entry in data['names']:
        # New scoring algorithm that better reflects actual popularity
        # Consider: number of countries, average rank, and total frequency

        num_countries = len(entry['countries'])
        avg_rank = sum(entry['countries'].values()) / num_countries if num_countries > 0 else 10000
        frequency = entry.get('globalFrequency', 1)

        # Calculate score components
        country_score = num_countries * 5000  # Weight for geographic spread
        rank_score = max(0, 10000 - avg_rank) * 2  # Weight for high ranks
        frequency_score = min(frequency * 100, 10000)  # Cap frequency impact

        # Bonus for names with abbreviations (shows they're very common)
        abbreviation_bonus = len(entry.get('abbreviations', [])) * 2000

        # Penalty for very short names that might be typos/abbreviations
        length_penalty = 0
        if len(entry['name']) <= 2 and not entry.get('abbreviations'):
            length_penalty = 5000

        # Calculate final score
        entry['globalPopularityScore'] = (
            country_score +
            rank_score +
            frequency_score +
            abbreviation_bonus -
            length_penalty
        )

    # Sort by new scores
    data['names'] = sorted(
        data['names'],
        key=lambda x: x.get('globalPopularityScore', 0),
        reverse=True
    )

    # Update popularity ranks
    for i, entry in enumerate(data['names'], 1):
        entry['popularityRank'] = i

    print(f"✓ Recalculated scores for {len(data['names'])} names")

    # Show top 10 for verification
    print("\nNew Top 10 Names:")
    for i in range(min(10, len(data['names']))):
        name = data['names'][i]
        abbrevs = name.get('abbreviations', [])
        abbrev_text = f" ({', '.join(abbrevs)})" if abbrevs else ""
        print(f"  {i+1}. {name['name']}{abbrev_text} - Score: {name['globalPopularityScore']:.0f}")

def save_database(data):
    """Save the updated database"""
    print("\n" + "=" * 70)
    print("SAVING UPDATED DATABASE")
    print("=" * 70)

    # Update metadata
    data['metadata']['lastUpdated'] = datetime.now().isoformat()
    data['metadata']['abbreviationsMerged'] = True
    data['metadata']['mergeDate'] = datetime.now().isoformat()
    data['metadata']['description'] = "Enhanced database with merged abbreviations"

    # Backup existing database
    db_path = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'
    backup_path = f'/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase_before_abbreviations_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'

    print(f"Creating backup at {backup_path}...")
    shutil.copy2(db_path, backup_path)
    print("✓ Backup created")

    # Save updated database
    print("Saving updated database...")
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    file_size = os.path.getsize(db_path) / 1024 / 1024
    print(f"✓ Database saved! Size: {file_size:.1f} MB")

    # Update cache with top 10,000
    cache_path = '/data/data/com.termux/files/home/proj/babyname2/data/popularNames_cache.json'
    cache_data = {
        "metadata": {
            "description": "Top 10,000 names with merged abbreviations",
            "lastUpdated": datetime.now().isoformat(),
            "totalNames": min(10000, len(data['names']))
        },
        "names": data['names'][:10000]
    }

    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(cache_data, f, ensure_ascii=False, indent=2)

    # Also copy to src/data for React
    src_cache_path = '/data/data/com.termux/files/home/proj/babyname2/src/data/popularNames_cache.json'
    with open(src_cache_path, 'w', encoding='utf-8') as f:
        json.dump(cache_data, f, ensure_ascii=False, indent=2)

    print("✓ Cache files updated")

def main():
    """Main execution"""
    print("\n" + "=" * 70)
    print("ABBREVIATION MERGER AND SCORE FIXER")
    print("=" * 70)

    # Load database
    data = load_database()

    # Process abbreviations
    data = process_abbreviations(data)

    # Recalculate scores
    recalculate_scores(data)

    # Save updated database
    save_database(data)

    print("\n✅ Abbreviation merging complete!")
    print("\nNext steps:")
    print("  1. Refresh the React app to see updated rankings")
    print("  2. Names with abbreviations will show them in parentheses")

if __name__ == "__main__":
    main()