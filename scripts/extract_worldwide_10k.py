#!/usr/bin/env python3
"""
Extract 10,000 names from all other countries worldwide
(excluding English and Spanish speaking countries already processed)
"""

import json
import time
import sys
import os
import shutil
from collections import defaultdict, Counter
import gc
from datetime import datetime

try:
    from names_dataset import NameDataset
except ImportError:
    print("Error: names-dataset package not installed")
    print("Please run: pip install names-dataset")
    sys.exit(1)

# Countries already processed (English and Spanish speaking)
ALREADY_PROCESSED = [
    # English
    'US', 'GB', 'CA', 'IE', 'AU', 'NZ', 'ZA', 'IN', 'PK', 'NG', 'PH', 'SG', 'MY', 'HK',
    'JM', 'TT', 'BB', 'BS', 'GY', 'BZ', 'KE', 'UG', 'TZ', 'GH', 'ZW', 'BW', 'ZM', 'MW',
    # Spanish
    'ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'EC', 'VE', 'CU', 'BO', 'DO', 'GT', 'HN', 'PY',
    'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ'
]

# All possible country codes to try (excluding already processed)
WORLDWIDE_COUNTRIES = [
    # European countries
    'FR', 'DE', 'IT', 'PT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IS',
    'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'RS', 'SI', 'BA', 'ME', 'MK', 'AL',
    'GR', 'CY', 'LU', 'MC', 'AD', 'SM', 'VA', 'LI', 'MT', 'EE', 'LV', 'LT',
    'BY', 'UA', 'MD', 'RU', 'GE', 'AM', 'AZ', 'KZ', 'UZ', 'TM', 'KG', 'TJ',

    # Asian countries
    'CN', 'JP', 'KR', 'TW', 'MO', 'MN', 'VN', 'TH', 'LA', 'KH', 'MM', 'ID', 'BN',
    'TL', 'BD', 'LK', 'NP', 'BT', 'MV', 'AF', 'IR', 'IQ', 'SY', 'LB', 'JO', 'IL',
    'PS', 'SA', 'YE', 'OM', 'AE', 'QA', 'BH', 'KW', 'TR',

    # African countries
    'EG', 'LY', 'TN', 'DZ', 'MA', 'EH', 'MR', 'ML', 'BF', 'NE', 'TD', 'SD', 'SS',
    'ET', 'ER', 'DJ', 'SO', 'RW', 'BI', 'CD', 'CG', 'GA', 'GQ', 'CM', 'CF', 'ST',
    'AO', 'NA', 'LS', 'SZ', 'MZ', 'MG', 'MU', 'KM', 'SC', 'RE', 'YT', 'CI', 'GN',
    'LR', 'SL', 'TG', 'BJ', 'GW', 'CV', 'SN', 'GM',

    # Oceania countries
    'PG', 'FJ', 'SB', 'VU', 'NC', 'PF', 'WS', 'GU', 'TO', 'KI', 'PW', 'MH', 'FM',
    'NR', 'TV', 'PN', 'TK', 'WF', 'NU', 'CK',

    # Americas (non-English/Spanish)
    'BR', 'SR', 'GF', 'HT', 'MQ', 'GP', 'BL', 'MF',

    # Others
    'GL', 'FO', 'AX', 'SJ'
]

# Extract 10,000 names per country
NAMES_PER_COUNTRY = 10000

class WorldwideNameExtractor:
    def __init__(self):
        self.nd = None
        self.existing_names = {}
        self.new_names = {}
        self.country_counts = defaultdict(int)
        self.countries_with_data = []
        self.new_unique_count = 0
        self.merge_count = 0

    def load_existing_database(self):
        """Load the current database"""
        db_path = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'

        if os.path.exists(db_path):
            print(f"Loading existing database...")
            with open(db_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Convert list to dict for faster lookups
            for name_entry in data.get('names', []):
                self.existing_names[name_entry['name']] = name_entry

            print(f"✓ Loaded {len(self.existing_names):,} existing names")

            # Get list of countries already in database
            existing_countries = set()
            for name in self.existing_names.values():
                existing_countries.update(name.get('countries', {}).keys())

            return data.get('metadata', {}), existing_countries
        else:
            print("No existing database found")
            return {}, set()

    def initialize_dataset(self):
        """Initialize the names dataset"""
        print("=" * 70)
        print("WORLDWIDE EXTRACTION: 10,000 NAMES PER COUNTRY")
        print("=" * 70)
        print(f"\nCountries to process: All available (excluding English/Spanish)")
        print(f"Names per country: {NAMES_PER_COUNTRY:,}")

        print("\nLoading names dataset (this may take 1-2 minutes)...")
        start_time = time.time()

        self.nd = NameDataset()

        print(f"✓ Dataset loaded in {time.time() - start_time:.2f} seconds\n")

    def normalize_name(self, name):
        """Normalize name for consistency"""
        if not name:
            return None
        return ' '.join(word.capitalize() for word in name.strip().split())

    def extract_name_data(self, name, country_code, rank, gender):
        """Extract complete data for a name"""
        try:
            name_data = self.nd.search(name)
        except:
            name_data = None

        entry = {
            'name': self.normalize_name(name),
            'originalName': name,
            'type': 'first',
            'gender': {},
            'countries': {country_code: rank},
            'globalCountries': {},
            'primaryCountry': country_code,
            'appearances': 1,
            'popularityRank': rank,
            'globalFrequency': 1
        }

        if name_data and 'first_name' in name_data:
            entry['gender'] = name_data['first_name'].get('gender', {})
            entry['globalCountries'] = name_data['first_name'].get('country', {})
        else:
            if gender == 'M':
                entry['gender'] = {'Male': 1.0, 'Female': 0.0}
            else:
                entry['gender'] = {'Male': 0.0, 'Female': 1.0}

        return entry

    def process_country(self, country_code):
        """Process a single country"""
        try:
            # Test if country has data
            test = self.nd.get_top_names(n=1, country_alpha2=country_code)
            if not test or country_code not in test:
                return 0

            if not test[country_code].get('M') and not test[country_code].get('F'):
                return 0

            # Country has data
            self.countries_with_data.append(country_code)

            # Get names from country
            top_names = self.nd.get_top_names(n=NAMES_PER_COUNTRY, country_alpha2=country_code)

            new_names = 0
            merged_names = 0

            # Process male names
            male_names = top_names.get(country_code, {}).get('M', [])
            for rank, name in enumerate(male_names[:NAMES_PER_COUNTRY], 1):
                if not name:
                    continue

                normalized = self.normalize_name(name)
                if not normalized:
                    continue

                # Check if name exists in current extraction
                if normalized in self.new_names:
                    self.new_names[normalized]['countries'][country_code] = rank
                    self.new_names[normalized]['appearances'] += 1
                    merged_names += 1
                # Check if name exists in original database
                elif normalized in self.existing_names:
                    if normalized not in self.new_names:
                        self.new_names[normalized] = self.existing_names[normalized].copy()
                    self.new_names[normalized]['countries'][country_code] = rank
                    self.new_names[normalized]['appearances'] = len(self.new_names[normalized]['countries'])
                    merged_names += 1
                else:
                    # Completely new name
                    entry = self.extract_name_data(name, country_code, rank, 'M')
                    if entry:
                        self.new_names[normalized] = entry
                        new_names += 1
                        self.new_unique_count += 1

            # Process female names
            female_names = top_names.get(country_code, {}).get('F', [])
            for rank, name in enumerate(female_names[:NAMES_PER_COUNTRY], 1):
                if not name:
                    continue

                normalized = self.normalize_name(name)
                if not normalized:
                    continue

                # Check if name exists in current extraction
                if normalized in self.new_names:
                    self.new_names[normalized]['countries'][country_code] = rank
                    self.new_names[normalized]['appearances'] += 1
                    merged_names += 1
                # Check if name exists in original database
                elif normalized in self.existing_names:
                    if normalized not in self.new_names:
                        self.new_names[normalized] = self.existing_names[normalized].copy()
                    self.new_names[normalized]['countries'][country_code] = rank
                    self.new_names[normalized]['appearances'] = len(self.new_names[normalized]['countries'])
                    merged_names += 1
                else:
                    # Completely new name
                    entry = self.extract_name_data(name, country_code, rank, 'F')
                    if entry:
                        self.new_names[normalized] = entry
                        new_names += 1
                        self.new_unique_count += 1

            self.country_counts[country_code] = new_names + merged_names
            self.merge_count += merged_names

            return new_names + merged_names

        except Exception as e:
            return 0

    def extract_worldwide_names(self):
        """Main extraction function"""
        # Load existing database
        existing_metadata, existing_countries = self.load_existing_database()
        print(f"Countries already in database: {len(existing_countries)}")

        # Initialize dataset
        self.initialize_dataset()

        total_start = time.time()

        print("\n" + "=" * 70)
        print("DISCOVERING AVAILABLE COUNTRIES")
        print("=" * 70)

        # First, discover which countries have data
        print("\nChecking all worldwide countries for available data...")
        countries_to_process = []

        for country in WORLDWIDE_COUNTRIES:
            if country not in ALREADY_PROCESSED:
                try:
                    test = self.nd.get_top_names(n=1, country_alpha2=country)
                    if test and country in test and (test[country].get('M') or test[country].get('F')):
                        countries_to_process.append(country)
                except:
                    pass

        print(f"✓ Found {len(countries_to_process)} countries with data")
        print(f"  Countries: {', '.join(countries_to_process[:20])}{'...' if len(countries_to_process) > 20 else ''}")

        print("\n" + "=" * 70)
        print(f"EXTRACTING TOP {NAMES_PER_COUNTRY:,} NAMES FROM {len(countries_to_process)} COUNTRIES")
        print("=" * 70 + "\n")

        # Process all countries with data
        for i, country in enumerate(countries_to_process, 1):
            names_added = self.process_country(country)
            if names_added > 0:
                print(f"[{i}/{len(countries_to_process)}] {country}: ✓ {names_added:,} names ({self.new_unique_count:,} new unique)")

            # Progress update every 10 countries
            if i % 10 == 0:
                total = len(self.new_names)
                print(f"  → Progress: {total:,} total unique names, {self.new_unique_count:,} completely new\n")

        # Merge with existing names not yet in new_names
        print("\n" + "=" * 70)
        print("MERGING WITH EXISTING DATABASE")
        print("=" * 70)

        added_from_existing = 0
        for name, data in self.existing_names.items():
            if name not in self.new_names:
                self.new_names[name] = data
                added_from_existing += 1

        print(f"✓ Preserved {added_from_existing:,} names from existing database")
        print(f"✓ Added {self.new_unique_count:,} completely new unique names")
        print(f"✓ Updated {self.merge_count:,} existing names with new country data")

        # Calculate global popularity scores
        self.calculate_global_scores()

        # Save the enhanced database
        self.save_database(existing_metadata)

        print(f"\n✓ Total extraction time: {(time.time() - total_start)/60:.2f} minutes")

    def calculate_global_scores(self):
        """Calculate global popularity scores"""
        print("\n" + "=" * 70)
        print("CALCULATING GLOBAL POPULARITY SCORES")
        print("=" * 70)

        for name_data in self.new_names.values():
            # Score based on frequency and average rank
            avg_rank = sum(name_data['countries'].values()) / len(name_data['countries'])
            frequency_score = len(name_data['countries']) * 10000

            name_data['globalPopularityScore'] = frequency_score - avg_rank
            name_data['globalFrequency'] = len(name_data['countries'])

        print(f"✓ Calculated scores for {len(self.new_names):,} names")

    def save_database(self, existing_metadata):
        """Save the enhanced database"""
        print("\n" + "=" * 70)
        print("SAVING WORLDWIDE DATABASE")
        print("=" * 70)

        # Sort by global popularity
        sorted_names = sorted(self.new_names.values(),
                            key=lambda x: x.get('globalPopularityScore', 0),
                            reverse=True)

        # Update country counts
        final_country_counts = defaultdict(int)
        for name_data in sorted_names:
            for country in name_data['countries']:
                final_country_counts[country] += 1

        # Create database structure
        database = {
            "metadata": {
                "source": "philipperemy/name-dataset",
                "version": "3.3.1",
                "description": "Worldwide names: English, Spanish + 10k from all other countries",
                "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "totalNames": len(sorted_names),
                "previousNames": len(self.existing_names),
                "newNamesAdded": self.new_unique_count,
                "namesUpdated": self.merge_count,
                "countries": dict(final_country_counts),
                "totalCountries": len(final_country_counts),
                "worldwideCountries": self.countries_with_data,
                "extractionMethod": "English/Spanish full + 10k per other country",
                "worldwideExtractionDate": datetime.now().isoformat()
            },
            "names": sorted_names
        }

        # Backup existing database
        output_file = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'
        backup_file = f'/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'

        if os.path.exists(output_file):
            print(f"Creating backup...")
            shutil.copy2(output_file, backup_file)
            print("✓ Backup created")

        # Save main database
        print(f"Saving worldwide database...")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(database, f, ensure_ascii=False, indent=2)

        file_size = os.path.getsize(output_file) / 1024 / 1024
        print(f"✓ Database saved! Size: {file_size:.1f} MB")

        # Update cache file
        cache_file = '/data/data/com.termux/files/home/proj/babyname2/data/popularNames_cache.json'
        top_10k = sorted_names[:10000]

        cache_data = {
            "metadata": {
                "description": "Top 10,000 most popular names (worldwide)",
                "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "totalNames": len(top_10k)
            },
            "names": top_10k
        }

        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)

        print(f"✓ Cache updated with top 10,000 names")

        # Print summary
        print("\n" + "=" * 70)
        print("WORLDWIDE EXTRACTION COMPLETE - FINAL SUMMARY")
        print("=" * 70)
        print(f"Previous database: {len(self.existing_names):,} names")
        print(f"New database: {len(sorted_names):,} names")
        print(f"Net increase: {len(sorted_names) - len(self.existing_names):,} names")
        print(f"Completely new unique names: {self.new_unique_count:,}")
        print(f"Updated existing names: {self.merge_count:,}")
        print(f"Total countries: {len(final_country_counts)}")

        # Group countries by region
        print(f"\nNew countries added from:")
        new_countries = [c for c in self.countries_with_data if c not in ALREADY_PROCESSED]
        if new_countries:
            europe = [c for c in new_countries if c in ['FR', 'DE', 'IT', 'PT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'RO', 'BG', 'HR', 'RS', 'GR', 'RU', 'UA']]
            asia = [c for c in new_countries if c in ['CN', 'JP', 'KR', 'TW', 'VN', 'TH', 'ID', 'BD', 'TR', 'IL', 'AE', 'SA']]
            africa = [c for c in new_countries if c in ['EG', 'LY', 'TN', 'DZ', 'MA', 'ET', 'AO', 'CM', 'CI', 'SN']]
            americas = [c for c in new_countries if c in ['BR', 'SR', 'HT']]

            if europe:
                print(f"  Europe ({len(europe)}): {', '.join(europe)}")
            if asia:
                print(f"  Asia ({len(asia)}): {', '.join(asia)}")
            if africa:
                print(f"  Africa ({len(africa)}): {', '.join(africa)}")
            if americas:
                print(f"  Americas ({len(americas)}): {', '.join(americas)}")

        print(f"\nTop 15 countries by name count:")
        top_countries = sorted(final_country_counts.items(),
                              key=lambda x: x[1], reverse=True)[:15]
        for country, count in top_countries:
            new_tag = " (NEW)" if country in new_countries else ""
            print(f"  {country}: {count:,} names{new_tag}")

        print(f"\nTop 10 most globally popular names:")
        for i, name_data in enumerate(sorted_names[:10], 1):
            gender = "M" if name_data['gender'].get('Male', 0) > 0.5 else "F"
            countries = len(name_data['countries'])
            print(f"  {i:2}. {name_data['name']:<15} ({gender}) - {countries} countries")

        # Clean up memory
        del self.nd
        gc.collect()

if __name__ == "__main__":
    try:
        print("\nStarting worldwide names extraction...")
        print("This will extract 10,000 names from each available country.")
        print("Estimated time: 15-20 minutes\n")

        extractor = WorldwideNameExtractor()
        extractor.extract_worldwide_names()

        print("\n✅ Worldwide extraction completed successfully!")
        print("\nNext step: Copy cache to React app:")
        print("  cp data/popularNames_cache.json src/data/")

    except KeyboardInterrupt:
        print("\n\n⚠ Extraction interrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()