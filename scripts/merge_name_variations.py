#!/usr/bin/env python3
"""
Merge name variations (like Muhammad/Mohammad/Mohammed)
into a single entry with all variations listed
"""

import json
import os
import shutil
from datetime import datetime
from collections import defaultdict

# Name variations to merge (all variations of the same name)
NAME_VARIATIONS = {
    'Muhammad': [
        'Mohammad', 'Mohammed', 'Muhammed', 'Mohamed',
        'Mohamad', 'Muhamed', 'Muhamad', 'Mohammod',
        'Mohammud', 'Muhammet', 'Mahammad', 'Mehmet',
        'Mahomet', 'Mehmed', 'Mukhammed', 'Mokhammad'
    ],
    'John': [
        'Jon', 'Johnny', 'Johnnie', 'Johny', 'Jhon',
        'Johan', 'Johann', 'Johannes', 'João', 'Juan',
        'Giovanni', 'Ivan', 'Ian', 'Jean', 'Jan',
        'Hans', 'Yohann', 'Yahya', 'Yohannes'
    ],
    'Michael': [
        'Mike', 'Mikey', 'Mickey', 'Mick', 'Micheal',
        'Michel', 'Michele', 'Miguel', 'Mikhail', 'Mikael',
        'Mikail', 'Miquel', 'Mihail', 'Michal', 'Mikkel'
    ],
    'David': [
        'Dave', 'Davey', 'Davy', 'Davide', 'Dawid',
        'Dávid', 'Daud', 'Daoud', 'Dawud', 'Dovid'
    ],
    'James': [
        'Jim', 'Jimmy', 'Jimmie', 'Jamie', 'Jaime',
        'Giacomo', 'Jacques', 'Jacobo', 'Yakov', 'Jakob'
    ],
    'Robert': [
        'Bob', 'Bobby', 'Robbie', 'Rob', 'Roberto',
        'Robbert', 'Róbert', 'Robertas', 'Roope'
    ],
    'William': [
        'Will', 'Willie', 'Bill', 'Billy', 'Willem',
        'Guillaume', 'Guillermo', 'Wilhelm', 'Vilhelm'
    ],
    'Joseph': [
        'Joe', 'Joey', 'José', 'Josef', 'Yosef',
        'Giuseppe', 'Yusuf', 'Yousef', 'Jozef'
    ],
    'Charles': [
        'Charlie', 'Chuck', 'Chaz', 'Carlos', 'Karl',
        'Carlo', 'Karel', 'Karol', 'Károly'
    ],
    'Thomas': [
        'Tom', 'Tommy', 'Tomas', 'Tomás', 'Tomasz',
        'Tommaso', 'Toomas', 'Tuomas'
    ],
    'Christopher': [
        'Chris', 'Christy', 'Kit', 'Cristopher', 'Cristobal',
        'Christophe', 'Cristoforo', 'Krzysztof', 'Kristoffer'
    ],
    'Daniel': [
        'Dan', 'Danny', 'Dani', 'Danilo', 'Daniil',
        'Daniele', 'Dániel', 'Danyal'
    ],
    'Matthew': [
        'Matt', 'Matty', 'Mathew', 'Matthieu', 'Mateo',
        'Matteo', 'Mateus', 'Mateusz', 'Máté'
    ],
    'Anthony': [
        'Tony', 'Antonio', 'Antoine', 'Anton', 'Antonius',
        'Antal', 'Antonis', 'Antonino'
    ],
    'Richard': [
        'Rick', 'Ricky', 'Dick', 'Ricardo', 'Riccardo',
        'Rikard', 'Ryszard', 'Richárd'
    ],
    'Peter': [
        'Pete', 'Pedro', 'Pierre', 'Piero', 'Pietro',
        'Petr', 'Pyotr', 'Piotr', 'Péter', 'Pieter'
    ],
    'Paul': [
        'Paulo', 'Pablo', 'Paolo', 'Pavel', 'Paweł',
        'Pál', 'Pavlos', 'Paulus'
    ],
    'Andrew': [
        'Andy', 'Drew', 'Andreas', 'Andres', 'André',
        'Andrea', 'Andrei', 'Andrzej', 'András'
    ],
    'George': [
        'Jorge', 'Giorgio', 'Georg', 'Georges', 'Georgios',
        'Yuri', 'Jurgen', 'György'
    ],
    'Alexander': [
        'Alex', 'Alec', 'Alejandro', 'Alessandro', 'Alexandre',
        'Aleksandr', 'Aleksander', 'Alexandros', 'Sándor'
    ],
    # Female name variations
    'Mary': [
        'Marie', 'Maria', 'Mariam', 'Maryam', 'Miriam',
        'Mária', 'Mariya', 'Mari', 'Merry'
    ],
    'Elizabeth': [
        'Liz', 'Lizzie', 'Beth', 'Betty', 'Eliza',
        'Lisa', 'Elisabeth', 'Elisabetta', 'Isabel',
        'Isabella', 'Isabelle'
    ],
    'Jennifer': [
        'Jen', 'Jenny', 'Jennie', 'Jenna', 'Jenifer'
    ],
    'Sarah': [
        'Sara', 'Zahra', 'Zara', 'Sarai', 'Sára'
    ],
    'Anna': [
        'Anne', 'Ann', 'Ana', 'Anya', 'Hannah',
        'Hanna', 'Annette', 'Anita'
    ],
    'Catherine': [
        'Kate', 'Katie', 'Kathy', 'Katherine', 'Kathryn',
        'Katrina', 'Catalina', 'Ekaterina', 'Caterina'
    ],
    'Margaret': [
        'Maggie', 'Meg', 'Peggy', 'Margot', 'Margarita',
        'Margherita', 'Margareta', 'Margit'
    ],
    'Patricia': [
        'Pat', 'Patty', 'Patsy', 'Tricia', 'Patrizia'
    ],
    'Christine': [
        'Chris', 'Christina', 'Kristine', 'Cristina',
        'Kristina', 'Krisztina'
    ],
    'Susan': [
        'Sue', 'Susie', 'Suzanne', 'Susana', 'Susanna',
        'Zuzana', 'Zsuzsa'
    ]
}

def load_database():
    """Load the current database"""
    db_path = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'

    print(f"Loading database from {db_path}...")
    with open(db_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"✓ Loaded {len(data['names'])} names")
    return data

def merge_name_data(main_entry, variant_entry, variant_name):
    """Merge variant data into main name entry"""
    # Add variant to the list
    if 'variants' not in main_entry:
        main_entry['variants'] = []
    if variant_name not in main_entry['variants']:
        main_entry['variants'].append(variant_name)

    # Preserve abbreviations from both entries
    main_abbrevs = set(main_entry.get('abbreviations', []))
    variant_abbrevs = set(variant_entry.get('abbreviations', []))
    all_abbrevs = main_abbrevs | variant_abbrevs
    if all_abbrevs:
        main_entry['abbreviations'] = sorted(list(all_abbrevs))

    # Merge countries and ranks (keep best rank)
    for country, rank in variant_entry['countries'].items():
        if country not in main_entry['countries']:
            main_entry['countries'][country] = rank
        else:
            # Keep the better (lower) rank
            main_entry['countries'][country] = min(main_entry['countries'][country], rank)

    # Update frequencies
    main_entry['appearances'] = len(main_entry['countries'])
    main_entry['globalFrequency'] = main_entry.get('globalFrequency', 0) + variant_entry.get('globalFrequency', 0)

    # Merge gender data (weighted average)
    total_freq = main_entry.get('globalFrequency', 1)
    if total_freq > 0:
        main_weight = (main_entry.get('globalFrequency', 1) - variant_entry.get('globalFrequency', 0)) / total_freq
        variant_weight = variant_entry.get('globalFrequency', 0) / total_freq

        for gender in ['Male', 'Female']:
            main_val = main_entry['gender'].get(gender, 0) * main_weight
            variant_val = variant_entry['gender'].get(gender, 0) * variant_weight
            main_entry['gender'][gender] = main_val + variant_val

def process_variations(data):
    """Process and merge name variations"""
    names_dict = {entry['name']: entry for entry in data['names']}
    names_to_remove = []
    merge_count = 0

    print("\n" + "=" * 70)
    print("PROCESSING NAME VARIATIONS")
    print("=" * 70)

    # Process each main name and its variations
    for main_name, variations in NAME_VARIATIONS.items():
        if main_name not in names_dict:
            print(f"Main name '{main_name}' not found in database")
            continue

        main_entry = names_dict[main_name]
        merged_variations = []

        for variant in variations:
            if variant in names_dict and variant != main_name:
                print(f"Merging '{variant}' into '{main_name}'")
                merge_name_data(main_entry, names_dict[variant], variant)
                names_to_remove.append(variant)
                merged_variations.append(variant)
                merge_count += 1

        if merged_variations:
            print(f"  → Merged {len(merged_variations)} variations into {main_name}")

    # Remove merged variations from the list
    data['names'] = [entry for entry in data['names'] if entry['name'] not in names_to_remove]

    print(f"\n✓ Merged {merge_count} name variations")
    print(f"✓ Removed {len(names_to_remove)} duplicate entries")
    print(f"✓ Final database has {len(data['names'])} names")

    return data

def recalculate_scores(data):
    """Recalculate popularity scores after merging"""
    print("\n" + "=" * 70)
    print("RECALCULATING POPULARITY SCORES")
    print("=" * 70)

    for entry in data['names']:
        # Enhanced scoring for merged names
        num_countries = len(entry['countries'])
        avg_rank = sum(entry['countries'].values()) / num_countries if num_countries > 0 else 10000
        frequency = entry.get('globalFrequency', 1)

        # Calculate score components
        country_score = num_countries * 5000
        rank_score = max(0, 10000 - avg_rank) * 2
        frequency_score = min(frequency * 100, 10000)

        # Bonus for names with many variations (shows global popularity)
        variation_bonus = len(entry.get('variants', [])) * 1500

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
        variant_text = f" [{len(variants)} variants]" if variants else ""
        abbrev_text = f" ({', '.join(abbrevs[:2])}{'...' if len(abbrevs) > 2 else ''})" if abbrevs else ""
        print(f"  {i+1}. {name['name']}{abbrev_text}{variant_text} - Score: {name['globalPopularityScore']:.0f}")

def save_database(data):
    """Save the updated database"""
    print("\n" + "=" * 70)
    print("SAVING UPDATED DATABASE")
    print("=" * 70)

    # Update metadata
    data['metadata']['lastUpdated'] = datetime.now().isoformat()
    data['metadata']['variationsMerged'] = True
    data['metadata']['variationMergeDate'] = datetime.now().isoformat()
    data['metadata']['description'] = "Enhanced database with merged name variations and abbreviations"

    # Backup existing database
    db_path = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'
    backup_path = f'/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase_before_variations_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'

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
            "description": "Top 10,000 names with merged variations and abbreviations",
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
    print("NAME VARIATION MERGER")
    print("=" * 70)
    print("\nThis will merge variations like Muhammad/Mohammad/Mohammed")
    print("into single entries with all variations tracked")

    # Load database
    data = load_database()

    # Process variations
    data = process_variations(data)

    # Recalculate scores
    recalculate_scores(data)

    # Save updated database
    save_database(data)

    print("\n✅ Name variation merging complete!")
    print("\nThe app will now show:")
    print("  • Muhammad with all its variations (Mohammad, Mohammed, etc.)")
    print("  • Each name shows its variants and abbreviations")
    print("  • Proper global ranking based on combined data")

if __name__ == "__main__":
    main()