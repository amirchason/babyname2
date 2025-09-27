#!/usr/bin/env python3
"""
Enhanced extraction: 20,000 names from each English-speaking country
Merges with existing database to expand coverage
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

# All English-speaking countries to process
ENGLISH_SPEAKING = [
    # Primary English-speaking countries
    'US', 'GB', 'CA', 'IE', 'AU', 'NZ',
    # Secondary English-speaking countries
    'ZA', 'IN', 'PK', 'NG', 'PH', 'SG', 'MY', 'HK',
    # Caribbean English
    'JM', 'TT', 'BB', 'BS', 'GY', 'BZ',
    # African English
    'KE', 'UG', 'TZ', 'GH', 'ZW', 'BW', 'ZM', 'MW'
]

# Extract 20,000 names per country
NAMES_PER_COUNTRY = 20000

class EnhancedNameExtractor:
    def __init__(self):
        self.nd = None
        self.existing_names = {}
        self.new_names = {}
        self.country_counts = defaultdict(int)
        self.duplicate_count = 0
        self.merge_count = 0
        self.new_count = 0

    def load_existing_database(self):
        """Load the current database"""
        db_path = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'

        if os.path.exists(db_path):
            print(f"Loading existing database from {db_path}...")
            with open(db_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Convert list to dict for faster lookups
            for name_entry in data.get('names', []):
                self.existing_names[name_entry['name']] = name_entry

            print(f"✓ Loaded {len(self.existing_names):,} existing names")
            return data.get('metadata', {})
        else:
            print("No existing database found, starting fresh")
            return {}

    def initialize_dataset(self):
        """Initialize the names dataset"""
        print("=" * 70)
        print("ENHANCED EXTRACTION: 20,000 NAMES PER ENGLISH-SPEAKING COUNTRY")
        print("=" * 70)
        print(f"\nTarget countries ({len(ENGLISH_SPEAKING)}):")
        print(f"  {', '.join(ENGLISH_SPEAKING[:10])}...")
        print(f"\nNames per country: {NAMES_PER_COUNTRY:,}")
        print(f"Maximum potential: {len(ENGLISH_SPEAKING) * NAMES_PER_COUNTRY:,} names")

        print("\n\nLoading names dataset (this may take 1-2 minutes)...")
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

    def merge_name_entries(self, existing, new):
        """Merge new name data with existing entry"""
        # Merge country rankings
        for country, rank in new['countries'].items():
            if country not in existing['countries']:
                existing['countries'][country] = rank
            elif rank < existing['countries'][country]:
                # Update if new rank is better
                existing['countries'][country] = rank

        # Update appearance count
        existing['appearances'] = len(existing['countries'])

        # Update global frequency
        existing['globalFrequency'] = existing.get('globalFrequency', 1) + 1

        return existing

    def process_country(self, country_code):
        """Process a single country"""
        try:
            # Test if country has data
            test = self.nd.get_top_names(n=1, country_alpha2=country_code)
            if not test or country_code not in test:
                print(f"  {country_code}: No data available")
                return 0

            if not test[country_code].get('M') and not test[country_code].get('F'):
                print(f"  {country_code}: No names found")
                return 0

            print(f"  {country_code}: Extracting {NAMES_PER_COUNTRY:,} names...", end='')
            sys.stdout.flush()

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
                    # Create a copy and merge
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
                    # Create a copy and merge
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

            self.country_counts[country_code] = new_names + merged_names
            self.new_count += new_names
            self.merge_count += merged_names

            print(f" ✓ {new_names:,} new, {merged_names:,} updated")
            return new_names + merged_names

        except Exception as e:
            print(f" ✗ Error: {str(e)}")
            return 0

    def extract_enhanced_names(self):
        """Main extraction function"""
        # Load existing database
        existing_metadata = self.load_existing_database()

        # Initialize dataset
        self.initialize_dataset()

        total_start = time.time()

        print("\n" + "=" * 70)
        print(f"EXTRACTING TOP {NAMES_PER_COUNTRY:,} NAMES FROM EACH COUNTRY")
        print("=" * 70 + "\n")

        # Process all English-speaking countries
        for i, country in enumerate(ENGLISH_SPEAKING, 1):
            print(f"[{i}/{len(ENGLISH_SPEAKING)}]", end=" ")
            self.process_country(country)

            # Progress update every 5 countries
            if i % 5 == 0:
                total = len(self.new_names)
                print(f"\n  → Progress: {total:,} total unique names\n")

        # Merge with existing names not yet in new_names
        print("\n" + "=" * 70)
        print("MERGING WITH EXISTING DATABASE")
        print("=" * 70)

        added_from_existing = 0
        for name, data in self.existing_names.items():
            if name not in self.new_names:
                self.new_names[name] = data
                added_from_existing += 1

        print(f"✓ Added {added_from_existing:,} names from existing database")
        print(f"✓ Updated {self.merge_count:,} existing names with new country data")
        print(f"✓ Added {self.new_count:,} completely new names")

        # Calculate global popularity scores
        self.calculate_global_scores()

        # Save the enhanced database
        self.save_database(existing_metadata)

        print(f"\n✓ Total extraction time: {time.time() - total_start:.2f} seconds")

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
        print("SAVING ENHANCED DATABASE")
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
                "description": "Enhanced with 20,000 names per English-speaking country",
                "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "totalNames": len(sorted_names),
                "previousNames": len(self.existing_names),
                "newNamesAdded": self.new_count,
                "namesUpdated": self.merge_count,
                "countries": dict(final_country_counts),
                "englishCountries": ENGLISH_SPEAKING,
                "extractionMethod": "20,000 names per English-speaking country",
                "enhancementDate": datetime.now().isoformat()
            },
            "names": sorted_names
        }

        # Backup existing database
        output_file = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'
        backup_file = f'/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'

        if os.path.exists(output_file):
            print(f"Creating backup at {backup_file}...")
            shutil.copy2(output_file, backup_file)
            print("✓ Backup created")

        # Save main database
        print(f"Saving enhanced database...")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(database, f, ensure_ascii=False, indent=2)

        file_size = os.path.getsize(output_file) / 1024 / 1024
        print(f"✓ Database saved! Size: {file_size:.1f} MB")

        # Update cache file
        cache_file = '/data/data/com.termux/files/home/proj/babyname2/data/popularNames_cache.json'
        top_10k = sorted_names[:10000]

        cache_data = {
            "metadata": {
                "description": "Top 10,000 most popular names (enhanced)",
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
        print("ENHANCEMENT COMPLETE - FINAL SUMMARY")
        print("=" * 70)
        print(f"Previous database: {len(self.existing_names):,} names")
        print(f"Enhanced database: {len(sorted_names):,} names")
        print(f"Net increase: {len(sorted_names) - len(self.existing_names):,} names")
        print(f"New unique names: {self.new_count:,}")
        print(f"Updated names: {self.merge_count:,}")

        print(f"\nTop 10 countries by name count:")
        top_countries = sorted(final_country_counts.items(),
                              key=lambda x: x[1], reverse=True)[:10]
        for country, count in top_countries:
            print(f"  {country}: {count:,} names")

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
        print("\nStarting enhanced extraction for English-speaking countries...")
        print("This will take approximately 10-15 minutes.\n")

        extractor = EnhancedNameExtractor()
        extractor.extract_enhanced_names()

        print("\n✅ Enhancement completed successfully!")
        print("\nNext step: Copy cache to React app:")
        print("  cp data/popularNames_cache.json src/data/")

    except KeyboardInterrupt:
        print("\n\n⚠ Extraction interrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()