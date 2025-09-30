#!/usr/bin/env python3
"""
Script to split incorrectly grouped name variants into separate entries.
Uses simple string comparison without external libraries.
"""

import json
import os
from datetime import datetime

# Define rules for what should stay together as variants
KEEP_TOGETHER = {
    # Arabic names with spelling variations
    'muhammad': ['mohammed', 'mohammad', 'mohamed', 'muhammed', 'mohamad', 'md'],
    'ahmed': ['ahmad', 'ahmet'],
    'ali': ['aly'],

    # Simple spelling variations
    'catherine': ['katherine', 'kathryn', 'catharine'],
    'stephen': ['steven'],
    'geoffrey': ['jeffrey', 'jeffery'],
    'philip': ['phillip'],
    'teresa': ['theresa'],
    'sara': ['sarah'],
    'marc': ['mark'],
    'eric': ['erik'],
    'carl': ['karl'],
    'christina': ['kristina', 'cristina'],
    'rebecca': ['rebekah'],
    'bryan': ['brian'],
}

# Names that should DEFINITELY be separated
MUST_SEPARATE = {
    'elizabeth': ['betty', 'elsie', 'liz', 'beth', 'elise', 'eliza', 'lizzy'],
    'larry': ['lorenzo', 'enzo', 'lawrence', 'lenny', 'len', 'león'],
    'susan': ['susana', 'suzanne', 'sue', 'suzy', 'susie'],
    'manuel': ['max', 'emmanuel', 'maxim', 'maxwell', 'manny', 'maximilian'],
    'katie': ['kate', 'kathy', 'kathleen', 'kitty', 'kit', 'kath'],
    'abby': ['abigail', 'ab', 'abbie', 'gail', 'abbey'],
    'jackie': ['jack', 'jacqueline', 'jill', 'jacqui', 'jac'],
    'william': ['guillermo', 'willy', 'will', 'billy', 'bill'],
    'james': ['jaime', 'jimmy', 'jamie', 'jim'],
    'mary': ['maria', 'marie', 'mia', 'mar'],
    'richard': ['ricardo', 'rick', 'dick', 'rich'],
    'carol': ['caroline', 'carrie', 'carolyn', 'carly', 'car'],
    'veronica': ['vera', 'vero', 'ron', 'ronnie'],
    'victoria': ['vicky', 'vicki', 'vic', 'tori'],
    'linda': ['lynn', 'lyn', 'lin', 'lynda', 'linn', 'lynne'],
    'janet': ['jane', 'jean', 'janice', 'jeanne', 'jeannie'],
    'luis': ['lucas', 'louis', 'luca', 'luke', 'lucía', 'louie'],
    'john': ['juan', 'johnny', 'jon', 'jonny'],
    'jesus': ['isa'],
    'robert': ['roberto', 'bob', 'robbie', 'rob', 'bert'],
    'michael': ['miguel', 'mike', 'mickey', 'mick'],
    'david': ['dave', 'davey'],
    'joseph': ['jose', 'joe', 'joey'],
    'thomas': ['tom', 'tommy'],
    'charles': ['charlie', 'chuck', 'carlos'],
    'christopher': ['chris', 'cristobal'],
    'daniel': ['dan', 'danny'],
    'matthew': ['matt', 'mateo'],
    'anthony': ['tony', 'antonio'],
    'donald': ['don', 'donnie'],
    'steven': ['steve', 'esteban'],
    'andrew': ['andy', 'drew', 'andres'],
    'paul': ['pablo'],
    'joshua': ['josh'],
    'kenneth': ['ken', 'kenny'],
    'kevin': ['kev'],
    'edward': ['ed', 'eddie', 'eduardo'],
    'brian': ['bryan'],
    'george': ['jorge'],
    'ronald': ['ron', 'ronnie'],
    'timothy': ['tim', 'timmy'],
    'jason': ['jay'],
    'jeffrey': ['jeff'],
    'ryan': ['ry'],
    'jacob': ['jake', 'jaime'],
    'gary': ['gar'],
    'nicholas': ['nick', 'nicolas', 'nico'],
    'eric': ['ricky'],
    'jonathan': ['jon', 'jonny'],
    'patrick': ['pat', 'patty', 'patricio'],
    'alexander': ['alex', 'alejandro', 'xander'],
    'raymond': ['ray', 'ramon'],
    'gregory': ['greg'],
    'samuel': ['sam', 'sammy'],
    'benjamin': ['ben', 'benny', 'benito'],
    'dennis': ['denny'],
    'jerry': ['gerald', 'geraldo'],
    'tyler': ['ty'],
    'aaron': ['aron'],
    'nathan': ['nate', 'nat'],
    'douglas': ['doug'],
    'zachary': ['zach', 'zack'],
    'peter': ['pete', 'pedro'],
    'adam': ['adan'],
    'walter': ['walt', 'wally'],
    'ethan': ['eth'],
    'harold': ['harry', 'hal'],
    'henry': ['hank', 'enrique'],
    'austin': ['austy'],
    'jordan': ['jordy'],
    'albert': ['al', 'alberto', 'bert'],
    'arthur': ['art', 'arturo'],
    'francisco': ['frank', 'fran', 'pancho', 'paco'],
    'eugene': ['gene'],
    'ralph': ['raf'],
    'roy': ['roi'],
    'russell': ['russ'],
    'louis': ['lou', 'luis'],
    'philip': ['phil', 'felipe'],
    'johnny': ['juan'],
    'vincent': ['vince', 'vinny', 'vicente'],
    'ernest': ['ernie', 'ernesto'],
    'martin': ['marty'],
    'leonard': ['leo', 'len', 'lenny', 'leonardo'],
    'stanley': ['stan'],
    'alfred': ['al', 'alfredo', 'fred', 'freddy'],
    'howard': ['howie'],
    'edwin': ['ed', 'eddie'],
    'edgar': ['ed'],
    'chester': ['chet'],
    'lawrence': ['larry', 'lars'],
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
        if name1_lower == main_name:
            return name2_lower in variants
        if name2_lower == main_name:
            return name1_lower in variants
        # Check if both are in the variants list
        if name1_lower in variants and name2_lower in variants:
            return True

    # Check if explicitly marked for separation
    for main_name, to_separate in MUST_SEPARATE.items():
        if name1_lower == main_name and name2_lower in to_separate:
            return False
        if name2_lower == main_name and name1_lower in to_separate:
            return False

    # Simple similarity checks
    # 1. If names are very similar (differ by 1-2 chars)
    if abs(len(name1) - len(name2)) <= 2:
        # Check if one is contained in the other
        if name1_lower in name2_lower or name2_lower in name1_lower:
            # But not if they're common nicknames
            if len(name1) >= 4 and len(name2) >= 4:  # Both reasonably long
                return True

    # 2. Check for common spelling variations (ending with 'y' vs 'ie')
    if name1_lower.endswith('y') and name2_lower.endswith('ie'):
        if name1_lower[:-1] == name2_lower[:-2]:
            return True
    if name1_lower.endswith('ie') and name2_lower.endswith('y'):
        if name1_lower[:-2] == name2_lower[:-1]:
            return True

    # 3. Check for 'c' vs 'k' variations
    if 'c' in name1_lower or 'k' in name1_lower:
        test1 = name1_lower.replace('c', 'k')
        test2 = name2_lower.replace('c', 'k')
        if test1 == test2:
            return True

    return False

def split_variants(database: dict) -> dict:
    """
    Split variants into separate name entries where appropriate.
    """
    new_names = []
    total_split = 0
    seen_names = set()  # Track names we've already added

    for entry in database['names']:
        name = entry['name']
        variants = entry.get('variants', [])

        # Skip if we've already processed this name
        if name.lower() in seen_names:
            continue

        if not variants:
            new_names.append(entry)
            seen_names.add(name.lower())
            continue

        # Separate variants into keep and split
        keep_variants = []
        split_variants = []

        for variant in variants:
            if variant and variant.lower() != name.lower():  # Skip empty or same name
                if should_keep_together(name, variant):
                    keep_variants.append(variant)
                else:
                    split_variants.append(variant)

        # Update main entry with only kept variants
        entry['variants'] = keep_variants
        new_names.append(entry)
        seen_names.add(name.lower())

        # Create new entries for split variants
        for split_name in split_variants:
            if split_name and split_name.lower() not in seen_names:  # Don't create duplicates
                # Create a new entry for this variant
                new_entry = {
                    'name': split_name,
                    'originalName': split_name,
                    'type': entry.get('type', 'first'),
                    'gender': entry.get('gender', {'Male': 0.5, 'Female': 0.5}),
                    'popularityRank': 99999,  # Will be recalculated
                    'popularityScore': entry.get('popularityScore', 0) * 0.8,  # Slightly lower score
                    'globalPopularityScore': entry.get('globalPopularityScore', 0) * 0.8,
                    'globalFrequency': max(1, entry.get('globalFrequency', 1) // 2),
                    'primaryCountry': entry.get('primaryCountry', 'US'),
                    'countries': entry.get('countries', {}),
                    'globalCountries': entry.get('globalCountries', {}),
                    'appearances': max(1, entry.get('appearances', 1) // 2),
                    'variants': []  # Start with no variants
                }
                new_names.append(new_entry)
                seen_names.add(split_name.lower())
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
    database['metadata']['description'] = database['metadata'].get('description', '') + ' (Variants split)'

    return database

def process_databases():
    """Process both popular and full databases."""

    # Process popular names database
    popular_path = '/data/data/com.termux/files/home/proj/babyname2/public/data/popularNames_cache.json'
    print(f"\nProcessing popular names database...")

    with open(popular_path, 'r') as f:
        popular_db = json.load(f)

    popular_db = split_variants(popular_db)

    # Backup original
    backup_path = popular_path + '.backup_before_split'
    os.rename(popular_path, backup_path)
    print(f"Backed up original to {backup_path}")

    # Save updated popular database
    with open(popular_path, 'w') as f:
        json.dump(popular_db, f, separators=(',', ':'))

    print(f"Saved updated popular database to {popular_path}")
    print(f"  Total names: {len(popular_db['names'])}")

    # Process full database
    full_path = '/data/data/com.termux/files/home/proj/babyname2/public/data/fullNames_cache.json'
    if os.path.exists(full_path):
        print(f"\nProcessing full names database...")

        with open(full_path, 'r') as f:
            full_db = json.load(f)

        full_db = split_variants(full_db)

        # Backup original
        backup_path = full_path + '.backup_before_split'
        os.rename(full_path, backup_path)
        print(f"Backed up original to {backup_path}")

        # Save updated full database
        with open(full_path, 'w') as f:
            json.dump(full_db, f, separators=(',', ':'))

        print(f"Saved updated full database to {full_path}")
        print(f"  Total names: {len(full_db['names'])}")

if __name__ == '__main__':
    process_databases()