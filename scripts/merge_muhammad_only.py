#!/usr/bin/env python3
"""
Merge ONLY Muhammad/Mohammad variations into a single entry
"""

import json
import os
import shutil
from datetime import datetime

def load_database():
    """Load the current database"""
    db_path = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'

    print(f"Loading database from {db_path}...")
    with open(db_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"✓ Loaded {len(data['names'])} names")
    return data

def merge_muhammad_mohammad(data):
    """Merge Mohammad into Muhammad"""
    names_dict = {entry['name']: entry for entry in data['names']}

    print("\n" + "=" * 70)
    print("MERGING MUHAMMAD/MOHAMMAD ONLY")
    print("=" * 70)

    if 'Muhammad' not in names_dict or 'Mohammad' not in names_dict:
        print("Error: Muhammad or Mohammad not found in database")
        return data

    muhammad = names_dict['Muhammad']
    mohammad = names_dict['Mohammad']

    print(f"\nBefore merge:")
    print(f"  Muhammad: {len(muhammad['countries'])} countries, rank #{muhammad['popularityRank']}")
    print(f"  Mohammad: {len(mohammad['countries'])} countries, rank #{mohammad['popularityRank']}")

    # Add Mohammad as a variant of Muhammad
    if 'variants' not in muhammad:
        muhammad['variants'] = []
    muhammad['variants'].append('Mohammad')

    # Preserve abbreviations from both
    muhammad_abbrevs = set(muhammad.get('abbreviations', []))
    mohammad_abbrevs = set(mohammad.get('abbreviations', []))
    all_abbrevs = muhammad_abbrevs | mohammad_abbrevs
    if all_abbrevs:
        muhammad['abbreviations'] = sorted(list(all_abbrevs))

    # Merge countries (keep best rank)
    for country, rank in mohammad['countries'].items():
        if country not in muhammad['countries']:
            muhammad['countries'][country] = rank
        else:
            muhammad['countries'][country] = min(muhammad['countries'][country], rank)

    # Update frequencies
    muhammad['appearances'] = len(muhammad['countries'])
    muhammad['globalFrequency'] = muhammad.get('globalFrequency', 0) + mohammad.get('globalFrequency', 0)

    # Merge gender data (weighted average)
    total_freq = muhammad['globalFrequency']
    if total_freq > 0:
        muhammad_weight = (muhammad.get('globalFrequency', 1) - mohammad.get('globalFrequency', 0)) / total_freq
        mohammad_weight = mohammad.get('globalFrequency', 0) / total_freq

        for gender in ['Male', 'Female']:
            muhammad_val = muhammad['gender'].get(gender, 0) * muhammad_weight
            mohammad_val = mohammad['gender'].get(gender, 0) * mohammad_weight
            muhammad['gender'][gender] = muhammad_val + mohammad_val

    # Remove Mohammad from the list
    data['names'] = [entry for entry in data['names'] if entry['name'] != 'Mohammad']

    print(f"\n✓ Merged Mohammad into Muhammad")
    print(f"  New Muhammad: {len(muhammad['countries'])} countries")

    return data

def recalculate_scores(data):
    """Recalculate popularity scores after merging"""
    print("\n" + "=" * 70)
    print("RECALCULATING POPULARITY SCORES")
    print("=" * 70)

    for entry in data['names']:
        # Same scoring as before
        num_countries = len(entry['countries'])
        avg_rank = sum(entry['countries'].values()) / num_countries if num_countries > 0 else 10000
        frequency = entry.get('globalFrequency', 1)

        # Calculate score components
        country_score = num_countries * 5000
        rank_score = max(0, 10000 - avg_rank) * 2
        frequency_score = min(frequency * 100, 10000)

        # Bonus for names with variants (shows it's the same name globally)
        variation_bonus = len(entry.get('variants', [])) * 3000

        # Bonus for names with abbreviations
        abbreviation_bonus = len(entry.get('abbreviations', [])) * 2000

        # Penalty for very short names
        length_penalty = 0
        if len(entry['name']) <= 2 and not entry.get('abbreviations') and not entry.get('variants'):
            length_penalty = 5000

        # Calculate final score
        entry['globalPopularityScore'] = (
            country_score +
            rank_score +
            frequency_score +
            variation_bonus +
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
        variants = name.get('variants', [])
        abbrevs = name.get('abbreviations', [])
        variant_text = f" (also: {', '.join(variants)})" if variants else ""
        abbrev_text = f" [{', '.join(abbrevs[:2])}]" if abbrevs else ""
        print(f"  {i+1}. {name['name']}{abbrev_text}{variant_text} - Score: {name['globalPopularityScore']:.0f}")

def save_database(data):
    """Save the updated database"""
    print("\n" + "=" * 70)
    print("SAVING UPDATED DATABASE")
    print("=" * 70)

    # Update metadata
    data['metadata']['lastUpdated'] = datetime.now().isoformat()
    data['metadata']['muhammadMerged'] = True
    data['metadata']['muhammadMergeDate'] = datetime.now().isoformat()
    data['metadata']['description'] = "Database with Muhammad/Mohammad merged"

    # Backup existing database
    db_path = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'
    backup_path = f'/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase_muhammad_merge_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'

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
            "description": "Top 10,000 names with Muhammad/Mohammad merged",
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
    print("MUHAMMAD/MOHAMMAD MERGER")
    print("=" * 70)
    print("\nThis will ONLY merge Mohammad into Muhammad")
    print("All other names will remain separate")

    # Load database
    data = load_database()

    # Merge Muhammad/Mohammad only
    data = merge_muhammad_mohammad(data)

    # Recalculate scores
    recalculate_scores(data)

    # Save updated database
    save_database(data)

    print("\n✅ Muhammad/Mohammad merge complete!")
    print("\nThe app will now show:")
    print("  • Muhammad with Mohammad as a variant")
    print("  • All other names remain unchanged")

if __name__ == "__main__":
    main()