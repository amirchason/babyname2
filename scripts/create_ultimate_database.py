#!/usr/bin/env python3
"""
Ultimate Baby Names Database Optimizer
Creates a single, ultra-optimized database with 400K+ names
Includes intelligent categorization, indexing, and compression
"""

import json
import gzip
import re
import math
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Set, Tuple, Any

# Category patterns and lists
BIBLICAL_NAMES = {
    'Noah', 'Mary', 'David', 'Sarah', 'Joshua', 'Ruth', 'Matthew', 'Rebecca',
    'Moses', 'Eve', 'Adam', 'Abraham', 'Isaac', 'Jacob', 'Joseph', 'Daniel',
    'Samuel', 'Benjamin', 'Luke', 'John', 'Peter', 'Paul', 'James', 'Hannah',
    'Rachel', 'Leah', 'Miriam', 'Esther', 'Deborah', 'Martha', 'Elizabeth',
    'Anna', 'Naomi', 'Abigail', 'Judith', 'Solomon', 'Aaron', 'Elijah',
    'Isaiah', 'Jeremiah', 'Ezekiel', 'Caleb', 'Nathan', 'Simon', 'Thomas'
}

NATURE_PATTERNS = {
    'flowers': ['Rose', 'Lily', 'Daisy', 'Jasmine', 'Violet', 'Iris', 'Poppy', 'Flora'],
    'water': ['River', 'Ocean', 'Marina', 'Brook', 'Lake', 'Rain', 'Delta', 'Bay'],
    'sky': ['Sky', 'Aurora', 'Luna', 'Stella', 'Orion', 'Nova', 'Star', 'Cloud'],
    'trees': ['Willow', 'Aspen', 'Cedar', 'Rowan', 'Ash', 'Oak', 'Maple', 'Pine'],
    'animals': ['Leo', 'Felix', 'Wolf', 'Fox', 'Bear', 'Phoenix', 'Raven', 'Robin'],
    'gemstones': ['Ruby', 'Pearl', 'Jade', 'Crystal', 'Diamond', 'Opal', 'Amber', 'Jewel']
}

CLASSIC_NAMES = {
    'Elizabeth', 'James', 'William', 'Catherine', 'Robert', 'Margaret',
    'Charles', 'Anne', 'George', 'Helen', 'Edward', 'Florence', 'Henry',
    'Alice', 'Arthur', 'Dorothy', 'Frederick', 'Edith', 'Albert', 'Emma'
}

VIRTUE_NAMES = {
    'Grace', 'Faith', 'Hope', 'Joy', 'Honor', 'Justice', 'Mercy', 'Glory',
    'Charity', 'Patience', 'Prudence', 'Temperance', 'Verity', 'Felicity'
}

MYTHOLOGICAL_NAMES = {
    'Apollo', 'Athena', 'Zeus', 'Hera', 'Hermes', 'Artemis', 'Diana',
    'Mars', 'Venus', 'Mercury', 'Thor', 'Freya', 'Odin', 'Loki', 'Saga'
}

# Origin mapping
COUNTRY_TO_ORIGIN = {
    'US': 'american', 'GB': 'british', 'FR': 'french', 'ES': 'spanish',
    'IT': 'italian', 'DE': 'german', 'IE': 'irish', 'SC': 'scottish',
    'WL': 'welsh', 'GR': 'greek', 'RU': 'russian', 'PL': 'polish',
    'JP': 'japanese', 'CN': 'chinese', 'KR': 'korean', 'IN': 'indian',
    'SA': 'arabic', 'EG': 'arabic', 'AE': 'arabic', 'IQ': 'arabic',
    'TR': 'turkish', 'IL': 'hebrew', 'NG': 'african', 'GH': 'african',
    'MX': 'spanish', 'BR': 'portuguese', 'PT': 'portuguese'
}

class UltimateDatabaseBuilder:
    def __init__(self):
        self.all_names = {}
        self.indexes = defaultdict(lambda: defaultdict(list))
        self.lookup = {}
        self.extended_data = {}
        self.categories_cache = {}

        # Define the three filter types as requested
        self.filter_definitions = {
            'categories': {
                'traditional': {'id': 'traditional', 'name': 'Traditional', 'description': 'Classic, time-honored names'},
                'modern': {'id': 'modern', 'name': 'Modern', 'description': 'Contemporary and current names'},
                'biblical': {'id': 'biblical', 'name': 'Biblical', 'description': 'Names from religious texts'},
                'nature_inspired': {'id': 'nature_inspired', 'name': 'Nature-inspired', 'description': 'Names inspired by nature'},
                'mythological': {'id': 'mythological', 'name': 'Mythological', 'description': 'Names from myths and legends'},
                'royal': {'id': 'royal', 'name': 'Royal', 'description': 'Names with royal connections'},
                'celebrity_inspired': {'id': 'celebrity_inspired', 'name': 'Celebrity-inspired', 'description': 'Names from celebrities'},
                'historical': {'id': 'historical', 'name': 'Historical', 'description': 'Names from historical figures'},
                'place_based': {'id': 'place_based', 'name': 'Place-based', 'description': 'Names inspired by locations'},
                'literary': {'id': 'literary', 'name': 'Literary', 'description': 'Names from literature'},
                'pop_culture': {'id': 'pop_culture', 'name': 'Pop culture', 'description': 'Names from movies, TV, games'},
                'artistic': {'id': 'artistic', 'name': 'Artistic', 'description': 'Names from artists and art'},
                'spiritual': {'id': 'spiritual', 'name': 'Spiritual', 'description': 'Names with spiritual meaning'},
                'flower_names': {'id': 'flower_names', 'name': 'Flower names', 'description': 'Names of flowers'},
                'animal_names': {'id': 'animal_names', 'name': 'Animal names', 'description': 'Names inspired by animals'}
            },
            'styles': {
                'vintage': {'id': 'vintage', 'name': 'Vintage', 'description': 'Old-fashioned names making a comeback'},
                'trendy': {'id': 'trendy', 'name': 'Trendy', 'description': 'Currently popular and fashionable'},
                'unique_rare': {'id': 'unique_rare', 'name': 'Unique/Rare', 'description': 'Uncommon and distinctive names'},
                'minimalist_short': {'id': 'minimalist_short', 'name': 'Minimalist/Short', 'description': 'Simple, short names'},
                'elaborate_ornate': {'id': 'elaborate_ornate', 'name': 'Elaborate/Ornate', 'description': 'Long, complex names'},
                'international_foreign': {'id': 'international_foreign', 'name': 'International/Foreign', 'description': 'Names from other cultures'},
                'retro': {'id': 'retro', 'name': 'Retro', 'description': 'Names from past decades'},
                'classic': {'id': 'classic', 'name': 'Classic', 'description': 'Timeless, traditional names'},
                'old_fashioned': {'id': 'old_fashioned', 'name': 'Old-fashioned', 'description': 'Names from previous generations'},
                'futuristic': {'id': 'futuristic', 'name': 'Futuristic', 'description': 'Modern, forward-looking names'},
                'edgy_alternative': {'id': 'edgy_alternative', 'name': 'Edgy/Alternative', 'description': 'Unconventional, bold names'},
                'elegant': {'id': 'elegant', 'name': 'Elegant', 'description': 'Sophisticated, refined names'},
                'cute_kawaii': {'id': 'cute_kawaii', 'name': 'Cute/Kawaii', 'description': 'Adorable, sweet names'},
                'strong_powerful': {'id': 'strong_powerful', 'name': 'Strong/Powerful', 'description': 'Names conveying strength'},
                'nature_style': {'id': 'nature_style', 'name': 'Nature Style', 'description': 'Flower and animal inspired'}
            },
            'lists': {
                'top_100_general': {'id': 'top_100_general', 'name': 'Top 100 Baby Names', 'description': 'Most popular names overall'},
                'top_boys': {'id': 'top_boys', 'name': "Top Boys' Names", 'description': 'Most popular boys names'},
                'top_girls': {'id': 'top_girls', 'name': "Top Girls' Names", 'description': 'Most popular girls names'},
                'unisex': {'id': 'unisex', 'name': 'Unisex Names', 'description': 'Gender-neutral names'},
                'short_one_syllable': {'id': 'short_one_syllable', 'name': 'Short One-Syllable Names', 'description': 'Single syllable names'},
                'long_multi_syllable': {'id': 'long_multi_syllable', 'name': 'Long Multi-Syllable Names', 'description': 'Names with many syllables'},
                'rare_uncommon': {'id': 'rare_uncommon', 'name': 'Rare & Uncommon Names', 'description': 'Unique, rarely used names'},
                'trending_year': {'id': 'trending_year', 'name': 'Trending Names of the Year', 'description': 'Rising in popularity'},
                'celebrity_baby': {'id': 'celebrity_baby', 'name': 'Celebrity Baby Names', 'description': 'Names chosen by celebrities'},
                'royal_baby': {'id': 'royal_baby', 'name': 'Royal Baby Names', 'description': 'Names from royal families'},
                'vintage_revival': {'id': 'vintage_revival', 'name': 'Vintage Revival Names', 'description': 'Old names becoming popular again'},
                'international_global': {'id': 'international_global', 'name': 'International/Global Top Lists', 'description': 'Popular worldwide'},
                'literary_book': {'id': 'literary_book', 'name': 'Literary & Book-Inspired Names', 'description': 'Names from literature'},
                'flower_inspired': {'id': 'flower_inspired', 'name': 'Flower-Inspired Names List', 'description': 'Names of flowers'},
                'animal_inspired': {'id': 'animal_inspired', 'name': 'Animal-Inspired Names List', 'description': 'Names from animals'}
            }
        }

    def load_databases(self):
        """Load and merge all database files"""
        print("📚 Loading databases...")

        # Load popular names (174K)
        try:
            with open('public/data/popularNames_cache.json', 'r', encoding='utf-8') as f:
                pop_data = json.load(f)
                print(f"  ✓ Loaded {len(pop_data['names'])} popular names")
                for name_entry in pop_data['names']:
                    key = name_entry['name'].lower()
                    if key not in self.all_names or name_entry.get('popularityRank', 999999) < self.all_names[key].get('popularityRank', 999999):
                        self.all_names[key] = name_entry
        except Exception as e:
            print(f"  ⚠ Error loading popular names: {e}")

        # Load consolidated database (228K)
        try:
            with open('public/data/consolidatedNamesDatabase.json', 'r', encoding='utf-8') as f:
                cons_data = json.load(f)
                print(f"  ✓ Loaded {len(cons_data['names'])} consolidated names")
                for name_entry in cons_data['names']:
                    key = name_entry['name'].lower()
                    if key not in self.all_names:
                        self.all_names[key] = name_entry
        except Exception as e:
            print(f"  ⚠ Error loading consolidated database: {e}")

        print(f"📊 Total unique names: {len(self.all_names)}")

    def calculate_syllables(self, name: str) -> int:
        """Estimate syllable count for a name"""
        # Simple syllable estimation based on vowel groups
        vowels = 'aeiouAEIOU'
        syllables = 0
        prev_was_vowel = False

        for char in name:
            is_vowel = char in vowels
            if is_vowel and not prev_was_vowel:
                syllables += 1
            prev_was_vowel = is_vowel

        # Minimum 1 syllable
        return max(1, syllables)

    def detect_origin_from_name(self, name: str) -> str:
        """Detect likely origin based on name patterns"""
        # Irish patterns
        if name.startswith('Mc') or name.startswith("O'"):
            return 'irish'
        # Scottish patterns
        if name.startswith('Mac'):
            return 'scottish'
        # Italian patterns
        if name.endswith('ini') or name.endswith('ino') or name.endswith('elli'):
            return 'italian'
        # Spanish patterns
        if name.endswith('ez') or name.endswith('os') or name.endswith('ita'):
            return 'spanish'
        # French patterns
        if name.endswith('ette') or name.endswith('elle') or name.endswith('aine'):
            return 'french'
        # German patterns
        if name.endswith('stein') or name.endswith('berg') or name.endswith('mann'):
            return 'german'
        # Japanese patterns
        if name.endswith('ko') or name.endswith('ki') or name.endswith('shi'):
            return 'japanese'
        # Arabic patterns
        if name.startswith('Al-') or name.startswith('Abd'):
            return 'arabic'

        return None

    def categorize_name(self, name_entry: Dict) -> List[str]:
        """Intelligently categorize a name based on multiple factors"""
        categories = []
        name = name_entry.get('name', '')

        # Cache check
        if name in self.categories_cache:
            return self.categories_cache[name]

        # 1. STYLE Categories
        rank = name_entry.get('popularityRank', 999999)
        if rank <= 100:
            categories.append('trendy')
        if rank > 10000:
            categories.append('unique')
        if name in CLASSIC_NAMES:
            categories.append('classic')

        # Check for vintage (names that were popular 50+ years ago but not recently)
        appearances = name_entry.get('appearances', 0)
        if appearances > 50 and rank > 1000:
            categories.append('vintage')

        # 2. ORIGIN Categories
        # First check primary country
        primary_country = name_entry.get('primaryCountry', '')
        if primary_country in COUNTRY_TO_ORIGIN:
            categories.append(COUNTRY_TO_ORIGIN[primary_country])

        # Then check name patterns
        detected_origin = self.detect_origin_from_name(name)
        if detected_origin and detected_origin not in categories:
            categories.append(detected_origin)

        # 3. THEME Categories
        # Biblical
        if name in BIBLICAL_NAMES:
            categories.append('biblical')
            categories.append('religious')

        # Nature
        for nature_type, patterns in NATURE_PATTERNS.items():
            if any(pattern.lower() in name.lower() for pattern in patterns):
                categories.append('nature')
                categories.append(f'nature_{nature_type}')
                break

        # Virtue
        if name in VIRTUE_NAMES:
            categories.append('virtue')

        # Mythological
        if name in MYTHOLOGICAL_NAMES:
            categories.append('mythological')

        # 4. LENGTH Categories
        length = len(name)
        if length <= 4:
            categories.append('short')
            categories.append('short_sweet')
        elif length >= 8:
            categories.append('long')
            categories.append('long_elegant')
        else:
            categories.append('medium')

        # 5. SYLLABLE Categories
        syllables = self.calculate_syllables(name)
        categories.append(f'syllables_{syllables}')
        if syllables == 1:
            categories.append('one_syllable')
        elif syllables >= 4:
            categories.append('multi_syllable')

        # 6. ENDING Categories
        if name.endswith('a') or name.endswith('ah'):
            categories.append('ends_a')
        elif name.endswith('n'):
            categories.append('ends_n')
        elif name.endswith('y') or name.endswith('ie'):
            categories.append('ends_y')
            categories.append('cute_ending')
        elif name.endswith('er'):
            categories.append('ends_er')
        elif name.endswith('lyn') or name.endswith('lynn'):
            categories.append('ends_lyn')
        elif name.endswith('son'):
            categories.append('ends_son')
            categories.append('occupational')

        # 7. STARTING Letter Categories
        if name:
            first_letter = name[0].upper()
            categories.append(f'starts_{first_letter}')
            if first_letter in 'AEIOU':
                categories.append('starts_vowel')
            else:
                categories.append('starts_consonant')
            if first_letter in 'AJMSCL':
                categories.append('popular_initial')

        # 8. GENDER Categories
        gender = name_entry.get('gender', {})
        if isinstance(gender, dict):
            male_score = gender.get('Male', 0)
            female_score = gender.get('Female', 0)
            if male_score > 0 and female_score > 0:
                categories.append('unisex')
                categories.append('gender_neutral')
            elif male_score > female_score * 2:
                categories.append('masculine')
            elif female_score > male_score * 2:
                categories.append('feminine')

        # 9. POPULARITY Tiers
        if rank <= 10:
            categories.append('top10')
            categories.append('most_popular')
        elif rank <= 100:
            categories.append('top100')
        elif rank <= 1000:
            categories.append('top1000')
        elif rank <= 10000:
            categories.append('common')
        else:
            categories.append('rare')

        # 10. SPECIAL Categories
        # Check for nickname potential
        if length >= 7:
            categories.append('nickname_friendly')

        # Check for international appeal
        countries = name_entry.get('globalCountries', {})
        if len(countries) >= 10:
            categories.append('international')
            categories.append('multicultural')

        # Modern vs Traditional
        if rank <= 1000 and appearances <= 20:
            categories.append('modern')
        elif appearances >= 50:
            categories.append('traditional')

        # Celebrity style
        if length <= 4 and rank > 5000:
            categories.append('celebrity_style')

        # Remove duplicates and cache
        categories = list(set(categories))
        self.categories_cache[name] = categories
        return categories

    def compress_name_data(self, name_entry: Dict, idx: int) -> Tuple[Dict, Dict]:
        """Split name data into core and extended parts with compression"""
        # Core data (minimal, always loaded)
        gender = name_entry.get('gender', {})
        if isinstance(gender, dict):
            male = gender.get('Male', 0)
            female = gender.get('Female', 0)
            if male > female * 2:
                gender_code = 'M'
            elif female > male * 2:
                gender_code = 'F'
            else:
                gender_code = 'U'  # Unisex
        else:
            gender_code = 'U'

        # Calculate tier
        rank = name_entry.get('popularityRank', 999999)
        if rank <= 1000:
            tier = 1
        elif rank <= 10000:
            tier = 2
        elif rank <= 50000:
            tier = 3
        elif rank <= 100000:
            tier = 4
        else:
            tier = 5

        core = {
            'id': idx,
            'n': name_entry['name'],  # name
            'g': gender_code,  # gender
            'r': rank,  # rank
            'categories': [],  # Empty for now - will be populated later
            'styles': [],  # Empty for now - will be populated later
            'lists': [],  # Empty for now - will be populated later
            'meaning_short': '',  # Empty for now - will hold meaning up to 4 words
            'unprocessed_meaning_elaborated': '',  # Empty for now - will hold detailed meaning
            'o': COUNTRY_TO_ORIGIN.get(name_entry.get('primaryCountry', ''), 'unknown'),  # origin
            'l': len(name_entry['name']),  # length
            's': self.calculate_syllables(name_entry['name']),  # syllables
            'p': name_entry.get('popularityScore', 0),  # popularity score
            't': tier  # tier
        }

        # Extended data (loaded on demand)
        extended = {
            'countries': name_entry.get('countries', {}),
            'globalCountries': name_entry.get('globalCountries', {}),
            'variants': name_entry.get('variants', []),
            'originalName': name_entry.get('originalName', name_entry['name']),
            'appearances': name_entry.get('appearances', 0),
            'globalFrequency': name_entry.get('globalFrequency', 0),
            'globalPopularityScore': name_entry.get('globalPopularityScore', 0)
        }

        return core, extended

    def build_indexes(self, names_list: List[Dict]):
        """Build comprehensive indexes for fast lookup"""
        print("🔍 Building indexes...")

        for name_data in names_list:
            idx = name_data['id']

            # Category index (will be populated when categories are assigned)
            for category in name_data.get('categories', []):
                self.indexes['byCategory'][category].append(idx)

            # Style index (will be populated when styles are assigned)
            for style in name_data.get('styles', []):
                self.indexes['byStyle'][style].append(idx)

            # List index (will be populated when lists are assigned)
            for list_name in name_data.get('lists', []):
                self.indexes['byList'][list_name].append(idx)

            # Tier index
            tier = name_data.get('t', 5)
            self.indexes['byTier'][str(tier)].append(idx)

            # Letter index
            if name_data.get('n'):
                first_letter = name_data['n'][0].upper()
                self.indexes['byLetter'][first_letter].append(idx)

            # Length index
            length = name_data.get('l', 0)
            if length <= 4:
                self.indexes['byLength']['short'].append(idx)
            elif length <= 7:
                self.indexes['byLength']['medium'].append(idx)
            else:
                self.indexes['byLength']['long'].append(idx)

            # Gender index
            gender = name_data.get('g', 'U')
            self.indexes['byGender'][gender].append(idx)

            # Origin index
            origin = name_data.get('o', 'unknown')
            self.indexes['byOrigin'][origin].append(idx)

            # Syllable index
            syllables = name_data.get('s', 0)
            self.indexes['bySyllables'][str(syllables)].append(idx)

            # Popularity range index
            rank = name_data.get('r', 999999)
            if rank <= 100:
                self.indexes['byPopularity']['top100'].append(idx)
            elif rank <= 1000:
                self.indexes['byPopularity']['top1000'].append(idx)
            elif rank <= 10000:
                self.indexes['byPopularity']['top10000'].append(idx)

            # Name lookup
            self.lookup[name_data['n'].lower()] = idx

        # Convert defaultdicts to regular dicts for JSON serialization
        self.indexes = {k: dict(v) for k, v in self.indexes.items()}

        # Print statistics
        total_indexes = sum(len(v) for idx_type in self.indexes.values() for v in idx_type.values())
        print(f"  ✓ Created {len(self.indexes)} index types")
        print(f"  ✓ Total index entries: {total_indexes:,}")
        print(f"  ✓ Categories indexed: {len(self.indexes.get('byCategory', {}))}")

    def generate_output(self):
        """Generate the optimized database files"""
        print("🔨 Building ultimate database...")

        # Convert to list and process
        names_list = []
        idx = 0

        # Sort by popularity rank for optimal tier distribution
        sorted_names = sorted(
            self.all_names.values(),
            key=lambda x: (x.get('popularityRank', 999999), x.get('name', ''))
        )

        for name_entry in sorted_names:
            core, extended = self.compress_name_data(name_entry, idx)
            names_list.append(core)
            if any(v for v in extended.values() if v):  # Only store if has data
                self.extended_data[str(idx)] = extended
            idx += 1

        print(f"  ✓ Processed {len(names_list)} names")

        # Build indexes
        self.build_indexes(names_list)

        # Split into tiers
        tier1 = [n for n in names_list if n['t'] == 1]
        tier2 = [n for n in names_list if n['t'] == 2]
        tier3 = [n for n in names_list if n['t'] >= 3]

        print(f"  ✓ Tier 1 (instant): {len(tier1)} names")
        print(f"  ✓ Tier 2 (fast): {len(tier2)} names")
        print(f"  ✓ Tier 3 (lazy): {len(tier3)} names")

        # Create final structure
        ultimate_db = {
            'version': '6.0.0',
            'metadata': {
                'totalNames': len(names_list),
                'buildDate': datetime.now().isoformat(),
                'compressed': True,
                'tiers': {
                    '1': len(tier1),
                    '2': len(tier2),
                    '3': len(tier3)
                },
                'filterDefinitions': self.filter_definitions,
                'categoriesCount': len(self.filter_definitions['categories']),
                'stylesCount': len(self.filter_definitions['styles']),
                'listsCount': len(self.filter_definitions['lists']),
                'indexes': list(self.indexes.keys()),
                'note': 'Categories, styles, lists, and meanings are defined but not yet populated for individual names',
                'fieldsReady': ['categories', 'styles', 'lists', 'meaning_short', 'unprocessed_meaning_elaborated']
            },
            'names': names_list,
            'extended': self.extended_data,
            'indexes': self.indexes,
            'lookup': self.lookup
        }

        # Save uncompressed version for debugging
        print("💾 Saving files...")
        with open('public/data/ultimateNamesDatabase.json', 'w', encoding='utf-8') as f:
            json.dump(ultimate_db, f, separators=(',', ':'))
        print(f"  ✓ Saved ultimateNamesDatabase.json")

        # Save compressed version
        compressed_data = json.dumps(ultimate_db, separators=(',', ':')).encode('utf-8')
        with gzip.open('public/data/ultimateNamesDatabase.json.gz', 'wb', compresslevel=9) as f:
            f.write(compressed_data)
        print(f"  ✓ Saved ultimateNamesDatabase.json.gz")

        # Save tiered versions
        tier1_db = {
            'version': '6.0.0',
            'tier': 1,
            'names': tier1,
            'lookup': {k: v for k, v in self.lookup.items() if v < len(tier1)}
        }
        with open('public/data/ultimateNames_tier1.json', 'w', encoding='utf-8') as f:
            json.dump(tier1_db, f, separators=(',', ':'))
        print(f"  ✓ Saved ultimateNames_tier1.json")

        # Calculate sizes
        import os
        uncompressed_size = os.path.getsize('public/data/ultimateNamesDatabase.json')
        compressed_size = os.path.getsize('public/data/ultimateNamesDatabase.json.gz')
        tier1_size = os.path.getsize('public/data/ultimateNames_tier1.json')

        print(f"\n📊 Final Statistics:")
        print(f"  • Total names: {len(names_list):,}")
        print(f"  • Categories defined: {len(self.filter_definitions['categories'])}")
        print(f"  • Styles defined: {len(self.filter_definitions['styles'])}")
        print(f"  • Lists defined: {len(self.filter_definitions['lists'])}")
        print(f"  • Uncompressed size: {uncompressed_size / 1024 / 1024:.1f} MB")
        print(f"  • Compressed size: {compressed_size / 1024 / 1024:.1f} MB")
        print(f"  • Compression ratio: {compressed_size / uncompressed_size * 100:.1f}%")
        print(f"  • Tier 1 size: {tier1_size / 1024:.1f} KB")

        # Update the app database with ALL names
        print("\n📦 Creating FULL database for app (all 228K names)...")
        optimized_db = {
            'metadata': ultimate_db['metadata'],
            'filterDefinitions': self.filter_definitions,
            'names': names_list,  # ALL 228,088 names!
            'indexes': self.indexes,  # Full indexes
            'lookup': self.lookup,  # Full lookup table
            'extended': self.extended_data  # Include extended data
        }

        # Update the file that nameService.ts uses
        with open('src/data/consolidatedNamesDatabase.json', 'w', encoding='utf-8') as f:
            json.dump(optimized_db, f, separators=(',', ':'))
        print(f"  ✓ Updated src/data/consolidatedNamesDatabase.json")

        print("\n✅ Ultimate database creation complete!")

        # Print filter definitions summary
        print("\n📋 Filter Types Ready for Assignment:")
        print(f"  • Categories: {', '.join(list(self.filter_definitions['categories'].keys())[:5])}... ({len(self.filter_definitions['categories'])} total)")
        print(f"  • Styles: {', '.join(list(self.filter_definitions['styles'].keys())[:5])}... ({len(self.filter_definitions['styles'])} total)")
        print(f"  • Lists: {', '.join(list(self.filter_definitions['lists'].keys())[:5])}... ({len(self.filter_definitions['lists'])} total)")
        print("\n  Note: Individual names have not been categorized yet - ready for future assignment")


def main():
    builder = UltimateDatabaseBuilder()
    builder.load_databases()
    builder.generate_output()


if __name__ == '__main__':
    main()