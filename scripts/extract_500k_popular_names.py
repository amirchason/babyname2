#!/usr/bin/env python3
"""
Extract 500,000+ MOST POPULAR first names from philipperemy/name-dataset
Focus: 50K from each English country + 100K from Spanish countries
"""

import json
import time
from names_dataset import NameDataset
import gc
from collections import defaultdict

def extract_popular_names():
    print("=" * 60)
    print("EXTRACTING 500,000+ MOST POPULAR NAMES")
    print("=" * 60)
    print("\nLoading names dataset... (3.2GB RAM required)")
    start_time = time.time()

    # Initialize the dataset
    nd = NameDataset()

    print(f"Dataset loaded in {time.time() - start_time:.2f} seconds\n")

    # Prepare the output structure
    database = {
        "metadata": {
            "source": "philipperemy/name-dataset",
            "version": "3.3.1",
            "description": "500K+ most popular first names from English & Spanish speaking countries",
            "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "totalNames": 0,
            "englishCountryNames": 0,
            "spanishCountryNames": 0,
            "otherCountryNames": 0,
            "countries": {}
        },
        "names": []
    }

    # English-speaking countries - 50,000 each
    english_countries = {
        'US': 50000,  # United States
        'GB': 50000,  # Great Britain
        'CA': 50000,  # Canada
        'AU': 50000,  # Australia
    }

    # Spanish-speaking countries - 100,000 total
    spanish_countries = {
        'ES': 20000,  # Spain
        'MX': 20000,  # Mexico
        'AR': 15000,  # Argentina
        'CO': 15000,  # Colombia
        'CL': 10000,  # Chile
        'PE': 10000,  # Peru
        'VE': 2500,   # Venezuela
        'EC': 2500,   # Ecuador
        'GT': 2500,   # Guatemala
        'CU': 2500,   # Cuba
    }

    # Track unique names to avoid duplicates
    unique_names = {}
    country_counts = defaultdict(int)

    def process_country(country_code, target_count, country_type):
        """Extract most popular names from a country"""
        print(f"\nProcessing {country_code} - Target: {target_count:,} most popular names")

        try:
            # Get top names - request more than needed to account for processing
            male_target = target_count // 2 + 1000
            female_target = target_count // 2 + 1000

            top_names = nd.get_top_names(n=max(male_target, female_target),
                                        country_alpha2=country_code)

            processed = 0
            skipped = 0

            # Process male names (most popular first)
            male_names = top_names.get(country_code, {}).get('M', [])
            for rank, name in enumerate(male_names[:male_target], 1):
                if not name:
                    continue

                if name in unique_names:
                    # Update existing entry with this country's data
                    unique_names[name]['countries'][country_code] = rank
                    unique_names[name]['appearances'] += 1
                    skipped += 1
                else:
                    # Search for detailed data
                    name_data = nd.search(name)
                    if name_data and 'first_name' in name_data:
                        entry = {
                            'name': name,
                            'type': 'first',
                            'gender': name_data['first_name'].get('gender', {}),
                            'countries': {country_code: rank},  # Popularity rank
                            'globalCountries': name_data['first_name'].get('country', {}),
                            'primaryCountry': country_code,
                            'countryType': country_type,
                            'appearances': 1,
                            'popularityRank': rank
                        }
                        unique_names[name] = entry
                        processed += 1
                        country_counts[country_code] += 1

            # Process female names (most popular first)
            female_names = top_names.get(country_code, {}).get('F', [])
            for rank, name in enumerate(female_names[:female_target], 1):
                if not name:
                    continue

                if name in unique_names:
                    # Update existing entry with this country's data
                    unique_names[name]['countries'][country_code] = rank
                    unique_names[name]['appearances'] += 1
                    skipped += 1
                else:
                    # Search for detailed data
                    name_data = nd.search(name)
                    if name_data and 'first_name' in name_data:
                        entry = {
                            'name': name,
                            'type': 'first',
                            'gender': name_data['first_name'].get('gender', {}),
                            'countries': {country_code: rank},  # Popularity rank
                            'globalCountries': name_data['first_name'].get('country', {}),
                            'primaryCountry': country_code,
                            'countryType': country_type,
                            'appearances': 1,
                            'popularityRank': rank
                        }
                        unique_names[name] = entry
                        processed += 1
                        country_counts[country_code] += 1

            print(f"  ✓ Processed {processed:,} new names, {skipped:,} duplicates merged")
            return processed

        except Exception as e:
            print(f"  ✗ Error processing {country_code}: {e}")
            return 0

    # Process English-speaking countries
    print("\n" + "=" * 40)
    print("ENGLISH-SPEAKING COUNTRIES")
    print("=" * 40)
    english_total = 0
    for country, target in english_countries.items():
        count = process_country(country, target, 'english')
        english_total += count
        database['metadata']['countries'][country] = country_counts[country]

    # Process Spanish-speaking countries
    print("\n" + "=" * 40)
    print("SPANISH-SPEAKING COUNTRIES")
    print("=" * 40)
    spanish_total = 0
    for country, target in spanish_countries.items():
        count = process_country(country, target, 'spanish')
        spanish_total += count
        database['metadata']['countries'][country] = country_counts[country]

    # Convert unique_names dict to list and sort by global popularity
    print("\n" + "=" * 40)
    print("FINALIZING DATABASE")
    print("=" * 40)

    # Calculate global popularity score
    for name_data in unique_names.values():
        # Score based on: number of countries + inverse of rank
        avg_rank = sum(name_data['countries'].values()) / len(name_data['countries'])
        name_data['globalPopularityScore'] = (
            name_data['appearances'] * 1000 - avg_rank
        )

    # Sort by global popularity score
    sorted_names = sorted(unique_names.values(),
                         key=lambda x: x['globalPopularityScore'],
                         reverse=True)

    database['names'] = sorted_names
    database['metadata']['totalNames'] = len(sorted_names)
    database['metadata']['englishCountryNames'] = english_total
    database['metadata']['spanishCountryNames'] = spanish_total

    # Save to JSON file
    output_file = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'
    print(f"\nSaving to {output_file}...")

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(database, f, ensure_ascii=False, indent=2)

    file_size = len(json.dumps(database)) / 1024 / 1024
    print(f"✓ Database saved successfully! Size: {file_size:.1f} MB")
    print(f"✓ Total processing time: {time.time() - start_time:.2f} seconds")

    # Print summary
    print("\n" + "=" * 60)
    print("EXTRACTION COMPLETE - SUMMARY")
    print("=" * 60)
    print(f"Total unique names: {len(sorted_names):,}")
    print(f"English country names: {english_total:,}")
    print(f"Spanish country names: {spanish_total:,}")
    print(f"\nNames per country:")
    for country, count in sorted(country_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {country}: {count:,}")

    # Show top 10 most popular global names
    print(f"\nTop 10 most popular names globally:")
    for i, name in enumerate(sorted_names[:10], 1):
        countries = list(name['countries'].keys())
        print(f"  {i}. {name['name']} - appears in {name['appearances']} countries: {', '.join(countries)}")

    # Clean up memory
    del nd
    gc.collect()

    return database['metadata']

if __name__ == "__main__":
    try:
        metadata = extract_popular_names()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()