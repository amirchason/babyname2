#!/usr/bin/env python3
"""
Extract ALL available names from USA, UK, and Australia
No limits - get everything available from these countries
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

# Target countries for complete extraction
TARGET_COUNTRIES = ['US', 'GB', 'AU']

class CompleteNameExtractor:
    def __init__(self):
        self.nd = None
        self.existing_names = {}
        self.new_names = {}
        self.country_counts = defaultdict(int)
        self.new_unique_count = 0
        self.merge_count = 0
        self.country_totals = {}

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

            # Get current counts for target countries
            for country in TARGET_COUNTRIES:
                country_count = sum(1 for name in self.existing_names.values()
                                   if country in name.get('countries', {}))
                print(f"  Current {country} names in database: {country_count:,}")

            return data.get('metadata', {})
        else:
            print("No existing database found")
            return {}

    def initialize_dataset(self):
        """Initialize the names dataset"""
        print("\n" + "=" * 70)
        print("COMPLETE EXTRACTION: ALL NAMES FROM USA, UK, AND AUSTRALIA")
        print("=" * 70)
        print(f"\nTarget countries: {', '.join(TARGET_COUNTRIES)}")
        print("Extraction limit: UNLIMITED (all available names)")

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

    def discover_max_names(self, country_code):
        """Discover the maximum number of names available for a country"""
        print(f"\nDiscovering maximum names for {country_code}...")

        # Try progressively larger numbers to find the limit
        test_sizes = [1000, 5000, 10000, 20000, 30000, 40000, 50000, 75000, 100000, 150000, 200000, 300000, 500000]
        max_found = 0

        for size in test_sizes:
            try:
                result = self.nd.get_top_names(n=size, country_alpha2=country_code)
                if result and country_code in result:
                    male_count = len(result[country_code].get('M', []))
                    female_count = len(result[country_code].get('F', []))
                    total = male_count + female_count

                    if total > max_found:
                        max_found = total
                        print(f"  Testing {size:,}: Found {male_count:,} male + {female_count:,} female = {total:,} names")

                    # If we got less than requested, we've hit the limit
                    if male_count < size and female_count < size:
                        print(f"  ✓ Maximum available: {male_count:,} male, {female_count:,} female")
                        return male_count, female_count
            except Exception as e:
                print(f"  Error at {size:,}: {str(e)}")
                break

        # Return the maximum we found
        return max_found // 2, max_found // 2

    def process_country_complete(self, country_code):
        """Process a country and extract ALL available names"""

        # First discover the maximum available
        max_male, max_female = self.discover_max_names(country_code)

        if max_male == 0 and max_female == 0:
            if country_code == 'AU':
                print(f"\n{country_code}: No data available in dataset")
                print("  Note: Australia (AU) data may not be included in philipperemy/name-dataset")
            else:
                print(f"\n{country_code}: No data available")
            return 0

        # Now extract all available names
        max_to_extract = max(max_male, max_female) + 1000  # Add buffer

        print(f"\nExtracting ALL {country_code} names (up to {max_to_extract:,})...")

        try:
            top_names = self.nd.get_top_names(n=max_to_extract, country_alpha2=country_code)

            if not top_names or country_code not in top_names:
                return 0

            new_names = 0
            merged_names = 0

            # Process male names
            male_names = top_names.get(country_code, {}).get('M', [])
            print(f"  Processing {len(male_names):,} male names...")

            for rank, name in enumerate(male_names, 1):
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
            print(f"  Processing {len(female_names):,} female names...")

            for rank, name in enumerate(female_names, 1):
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

            total_processed = len(male_names) + len(female_names)
            self.country_totals[country_code] = {
                'male': len(male_names),
                'female': len(female_names),
                'total': total_processed,
                'new': new_names,
                'merged': merged_names
            }

            self.country_counts[country_code] = new_names + merged_names
            self.merge_count += merged_names

            print(f"  ✓ {country_code} complete: {total_processed:,} names processed")
            print(f"     • {new_names:,} completely new")
            print(f"     • {merged_names:,} merged with existing")

            return new_names + merged_names

        except Exception as e:
            print(f"  ✗ Error processing {country_code}: {str(e)}")
            return 0

    def extract_complete_names(self):
        """Main extraction function"""
        # Load existing database
        existing_metadata = self.load_existing_database()

        # Initialize dataset
        self.initialize_dataset()

        total_start = time.time()

        print("\n" + "=" * 70)
        print("EXTRACTING ALL AVAILABLE NAMES")
        print("=" * 70)

        # Process each target country
        for i, country in enumerate(TARGET_COUNTRIES, 1):
            print(f"\n[{i}/{len(TARGET_COUNTRIES)}] Processing {country}")
            print("-" * 40)
            names_added = self.process_country_complete(country)

            if names_added > 0:
                print(f"\n→ Total unique names so far: {len(self.new_names):,}")

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
        print(f"✓ Updated {self.merge_count:,} existing names with new data")

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
                "description": "Complete US/UK/AU extraction + worldwide database",
                "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "totalNames": len(sorted_names),
                "previousNames": len(self.existing_names),
                "newNamesAdded": self.new_unique_count,
                "namesUpdated": self.merge_count,
                "countries": dict(final_country_counts),
                "totalCountries": len(final_country_counts),
                "completeExtractionCountries": self.country_totals,
                "extractionMethod": "Complete US/UK/AU + worldwide 10k per country",
                "completeExtractionDate": datetime.now().isoformat()
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
                "description": "Top 10,000 most popular names (with complete US/UK/AU)",
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
        print("COMPLETE EXTRACTION SUMMARY")
        print("=" * 70)
        print(f"Previous database: {len(self.existing_names):,} names")
        print(f"New database: {len(sorted_names):,} names")
        print(f"Net increase: {len(sorted_names) - len(self.existing_names):,} names")
        print(f"Completely new unique names: {self.new_unique_count:,}")
        print(f"Updated existing names: {self.merge_count:,}")
        print(f"Total countries: {len(final_country_counts)}")

        # Country extraction details
        if self.country_totals:
            print(f"\nExtraction Details by Country:")
            for country, stats in self.country_totals.items():
                print(f"\n  {country}:")
                print(f"    • Male names: {stats['male']:,}")
                print(f"    • Female names: {stats['female']:,}")
                print(f"    • Total processed: {stats['total']:,}")
                print(f"    • New unique: {stats['new']:,}")
                print(f"    • Updated: {stats['merged']:,}")

        print(f"\nTop 15 countries by name count:")
        top_countries = sorted(final_country_counts.items(),
                              key=lambda x: x[1], reverse=True)[:15]
        for country, count in top_countries:
            complete = " (COMPLETE)" if country in TARGET_COUNTRIES else ""
            print(f"  {country}: {count:,} names{complete}")

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
        print("\n" + "=" * 70)
        print("COMPLETE NAME EXTRACTION FOR USA, UK, AND AUSTRALIA")
        print("=" * 70)
        print("\nThis will extract ALL available names from these countries.")
        print("No limits - getting everything available in the dataset.")
        print("Estimated time: 5-10 minutes\n")

        extractor = CompleteNameExtractor()
        extractor.extract_complete_names()

        print("\n✅ Complete extraction finished successfully!")
        print("\nNext steps:")
        print("  1. Copy cache to React app: cp data/popularNames_cache.json src/data/")
        print("  2. Restart the app if needed")

    except KeyboardInterrupt:
        print("\n\n⚠ Extraction interrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()