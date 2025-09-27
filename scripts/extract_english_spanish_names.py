#!/usr/bin/env python3
"""
Extract TOP 350,000 most popular names from English & Spanish speaking countries
- Captures ALL available data for each name
- Automatic deduplication
- Focuses on most popular names only
"""

import json
import time
import sys
import os
import shutil
from collections import defaultdict, Counter
import gc

try:
    from names_dataset import NameDataset
except ImportError:
    print("Error: names-dataset package not installed")
    print("Please run: pip install names-dataset")
    sys.exit(1)

# Define English and Spanish speaking countries
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

SPANISH_SPEAKING = [
    # Major Spanish-speaking countries
    'ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'EC', 'VE',
    # Central and South America
    'CU', 'BO', 'DO', 'GT', 'HN', 'PY', 'SV', 'NI',
    'CR', 'PA', 'UY', 'PR', 'GQ'
]

# Target: 350,000 most popular names total
TARGET_TOTAL_NAMES = 350000

class PopularNameExtractor:
    def __init__(self):
        self.nd = None
        self.all_names_data = {}
        self.unique_names = {}
        self.country_counts = defaultdict(int)
        self.working_countries = []
        self.name_frequency = Counter()
        self.duplicate_count = 0
        self.total_processed = 0

    def initialize_dataset(self):
        """Initialize the names dataset"""
        print("=" * 70)
        print("EXTRACTING TOP 350,000 MOST POPULAR NAMES")
        print("FROM ENGLISH & SPANISH SPEAKING COUNTRIES")
        print("=" * 70)
        print("\nTarget countries:")
        print(f"  English-speaking ({len(ENGLISH_SPEAKING)}): {', '.join(ENGLISH_SPEAKING[:10])}...")
        print(f"  Spanish-speaking ({len(SPANISH_SPEAKING)}): {', '.join(SPANISH_SPEAKING[:10])}...")
        print("\nLoading names dataset (this may take 1-2 minutes)...")
        start_time = time.time()

        self.nd = NameDataset()

        print(f"✓ Dataset loaded in {time.time() - start_time:.2f} seconds\n")

    def normalize_name(self, name):
        """Normalize name for deduplication"""
        if not name:
            return None
        # Capitalize properly and strip whitespace
        return ' '.join(word.capitalize() for word in name.strip().split())

    def extract_complete_name_data(self, name, country_code, rank, gender):
        """Extract ALL available data for a name"""
        normalized = self.normalize_name(name)
        if not normalized:
            return None

        # Search for complete data using the dataset's search method
        try:
            name_data = self.nd.search(name)
        except:
            name_data = None

        # Build comprehensive name entry
        entry = {
            'name': normalized,
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

        # Extract gender probabilities
        if name_data and 'first_name' in name_data:
            entry['gender'] = name_data['first_name'].get('gender', {})
            entry['globalCountries'] = name_data['first_name'].get('country', {})
        else:
            # Set gender based on which list it came from
            if gender == 'M':
                entry['gender'] = {'Male': 1.0, 'Female': 0.0}
            else:
                entry['gender'] = {'Male': 0.0, 'Female': 1.0}

        return entry

    def process_country(self, country_code, max_names_per_country):
        """Process a single country and extract top names"""
        try:
            # Test if country has data
            test = self.nd.get_top_names(n=1, country_alpha2=country_code)
            if not test or country_code not in test:
                return 0

            if not test[country_code].get('M') and not test[country_code].get('F'):
                return 0

            print(f"  Processing {country_code}...", end='')
            sys.stdout.flush()

            # Get top names from country (limited by max_names_per_country)
            top_names = self.nd.get_top_names(n=max_names_per_country, country_alpha2=country_code)

            if country_code not in self.working_countries:
                self.working_countries.append(country_code)

            processed = 0
            duplicates = 0

            # Process male names
            male_names = top_names.get(country_code, {}).get('M', [])
            for rank, name in enumerate(male_names[:max_names_per_country], 1):
                if not name:
                    continue

                normalized = self.normalize_name(name)
                if not normalized:
                    continue

                # Track in temporary storage with popularity score
                popularity_score = 1000000 - rank  # Higher score for better rank

                if normalized in self.all_names_data:
                    # Update existing entry
                    self.all_names_data[normalized]['countries'][country_code] = rank
                    self.all_names_data[normalized]['appearances'] += 1
                    self.all_names_data[normalized]['globalFrequency'] += 1
                    self.all_names_data[normalized]['popularityScore'] += popularity_score
                    duplicates += 1
                else:
                    # Extract complete data for new name
                    entry = self.extract_complete_name_data(name, country_code, rank, 'M')
                    if entry:
                        entry['popularityScore'] = popularity_score
                        self.all_names_data[normalized] = entry
                        processed += 1

            # Process female names
            female_names = top_names.get(country_code, {}).get('F', [])
            for rank, name in enumerate(female_names[:max_names_per_country], 1):
                if not name:
                    continue

                normalized = self.normalize_name(name)
                if not normalized:
                    continue

                # Track in temporary storage with popularity score
                popularity_score = 1000000 - rank  # Higher score for better rank

                if normalized in self.all_names_data:
                    # Update existing entry
                    self.all_names_data[normalized]['countries'][country_code] = rank
                    self.all_names_data[normalized]['appearances'] += 1
                    self.all_names_data[normalized]['globalFrequency'] += 1
                    self.all_names_data[normalized]['popularityScore'] += popularity_score
                    duplicates += 1
                else:
                    # Extract complete data for new name
                    entry = self.extract_complete_name_data(name, country_code, rank, 'F')
                    if entry:
                        entry['popularityScore'] = popularity_score
                        self.all_names_data[normalized] = entry
                        processed += 1

            self.duplicate_count += duplicates
            print(f" ✓ {processed:,} new, {duplicates:,} merged")

            return processed

        except Exception as e:
            print(f" ✗ Error: {str(e)}")
            return 0

    def extract_top_popular_names(self):
        """Main extraction function focused on most popular names"""
        self.initialize_dataset()

        total_start = time.time()

        # Calculate names per country (start with more, then filter to top 350k)
        # We'll extract more initially to ensure we get the most popular after deduplication
        names_per_country = 15000  # This will give us ~735k names before dedup

        print("\n" + "=" * 70)
        print(f"PHASE 1: EXTRACTING TOP {names_per_country:,} NAMES PER COUNTRY")
        print("=" * 70)

        # Process English-speaking countries
        print("\nEnglish-speaking countries:")
        for country in ENGLISH_SPEAKING:
            self.process_country(country, names_per_country)

        # Process Spanish-speaking countries
        print("\nSpanish-speaking countries:")
        for country in SPANISH_SPEAKING:
            self.process_country(country, names_per_country)

        print("\n" + "=" * 70)
        print("PHASE 2: SELECTING TOP 350,000 MOST POPULAR NAMES")
        print("=" * 70)

        # Sort all names by popularity score (combination of rank and frequency)
        print(f"\nTotal names collected: {len(self.all_names_data):,}")
        print(f"Duplicates merged: {self.duplicate_count:,}")
        print(f"Selecting top {TARGET_TOTAL_NAMES:,} most popular names...")

        # Calculate final popularity scores
        for name_data in self.all_names_data.values():
            # Score based on: frequency across countries + inverse of average rank + popularity score
            avg_rank = sum(name_data['countries'].values()) / len(name_data['countries'])
            name_data['globalPopularityScore'] = (
                name_data['popularityScore'] +  # Sum of (1000000 - rank) for each country
                (name_data['appearances'] * 10000) -  # Bonus for appearing in multiple countries
                avg_rank  # Better average rank = higher score
            )

        # Sort by global popularity and take top 350,000
        sorted_names = sorted(self.all_names_data.values(),
                            key=lambda x: x['globalPopularityScore'],
                            reverse=True)

        # Take only the top 350,000 most popular names
        top_names = sorted_names[:TARGET_TOTAL_NAMES]

        print(f"✓ Selected top {len(top_names):,} most popular names")

        # Update unique names with the top selection
        self.unique_names = {name['name']: name for name in top_names}

        # Update country counts for selected names
        self.country_counts.clear()
        for name_data in top_names:
            for country in name_data['countries']:
                self.country_counts[country] += 1

        # Save the database
        self.save_database(top_names)

        print(f"\n✓ Total extraction time: {time.time() - total_start:.2f} seconds")

    def save_database(self, names_list):
        """Save the database with top 350,000 names"""
        print("\n" + "=" * 70)
        print("SAVING DATABASE")
        print("=" * 70)

        # Create database structure
        database = {
            "metadata": {
                "source": "philipperemy/name-dataset",
                "version": "3.3.1",
                "description": "Top 350,000 most popular names from English & Spanish speaking countries",
                "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "totalNames": len(names_list),
                "totalDuplicatesEliminated": self.duplicate_count,
                "countries": dict(self.country_counts),
                "workingCountries": self.working_countries,
                "targetCountries": {
                    "english": ENGLISH_SPEAKING,
                    "spanish": SPANISH_SPEAKING
                },
                "extractionMethod": "Top ranked names with automatic deduplication"
            },
            "names": names_list
        }

        # Backup existing database if it exists
        output_file = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'
        backup_file = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase_backup.json'

        if os.path.exists(output_file):
            print(f"Creating backup at {backup_file}...")
            shutil.copy2(output_file, backup_file)
            print("✓ Backup created")

        # Save main database
        print(f"Saving to {output_file}...")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(database, f, ensure_ascii=False, indent=2)

        file_size = os.path.getsize(output_file) / 1024 / 1024
        print(f"✓ Database saved! Size: {file_size:.1f} MB")

        # Save top 10k cache for quick access
        cache_file = '/data/data/com.termux/files/home/proj/babyname2/data/popularNames_cache.json'
        top_10k = names_list[:10000] if len(names_list) > 10000 else names_list

        cache_data = {
            "metadata": {
                "description": "Top 10,000 most popular names for quick access",
                "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "totalNames": len(top_10k)
            },
            "names": top_10k
        }

        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)

        print(f"✓ Popular names cache saved")

        # Print summary
        print("\n" + "=" * 70)
        print("EXTRACTION COMPLETE - FINAL SUMMARY")
        print("=" * 70)
        print(f"Total unique names extracted: {len(names_list):,}")
        print(f"Total duplicates eliminated: {self.duplicate_count:,}")
        print(f"Countries with data: {len(self.working_countries)}")

        # Top countries by name count
        print(f"\nTop countries by unique name count:")
        top_countries = sorted(self.country_counts.items(),
                              key=lambda x: x[1], reverse=True)[:10]
        for country, count in top_countries:
            print(f"  {country}: {count:,} unique names")

        # Show top 20 most popular global names
        print(f"\nTop 20 most globally popular names:")
        for i, name_data in enumerate(names_list[:20], 1):
            gender = "M" if name_data['gender'].get('Male', 0) > 0.5 else "F"
            countries = len(name_data['countries'])
            print(f"  {i:2}. {name_data['name']:<15} ({gender}) - {countries} countries")

        # Data completeness stats
        print(f"\nData completeness:")
        names_with_gender = sum(1 for n in names_list if n.get('gender'))
        names_with_countries = sum(1 for n in names_list if n.get('globalCountries'))
        print(f"  Names with gender data: {names_with_gender:,} ({names_with_gender*100/len(names_list):.1f}%)")
        print(f"  Names with country distribution: {names_with_countries:,} ({names_with_countries*100/len(names_list):.1f}%)")

        # Clean up memory
        del self.nd
        gc.collect()

if __name__ == "__main__":
    try:
        print("\nStarting extraction of top 350,000 most popular names...")
        print("This will take approximately 5-10 minutes.\n")

        extractor = PopularNameExtractor()
        extractor.extract_top_popular_names()

        print("\n✅ Extraction completed successfully!")
        print("\nNext steps in todo list:")
        print("  • Add name meanings from behindthename.com API")
        print("  • Add origins from ancestry databases")
        print("  • Add variations from nickname databases")
        print("  • Add historical popularity from SSA data")

    except KeyboardInterrupt:
        print("\n\n⚠ Extraction interrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()