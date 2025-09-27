#!/usr/bin/env python3
"""
Extract MAXIMUM possible names from philipperemy/name-dataset
Focus on getting as many popular names as possible
"""

import json
import time
from names_dataset import NameDataset
import gc
from collections import defaultdict

def extract_maximum_names():
    print("=" * 60)
    print("EXTRACTING MAXIMUM POPULAR NAMES FROM ALL AVAILABLE COUNTRIES")
    print("=" * 60)
    print("\nLoading names dataset...")
    start_time = time.time()

    # Initialize the dataset
    nd = NameDataset()

    print(f"Dataset loaded in {time.time() - start_time:.2f} seconds\n")

    # Prepare the output structure
    database = {
        "metadata": {
            "source": "philipperemy/name-dataset",
            "version": "3.3.1",
            "description": "Maximum extraction of most popular first names globally",
            "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "totalNames": 0,
            "countries": {}
        },
        "names": []
    }

    # ALL possible country codes (ISO 3166-1 alpha-2)
    all_countries = [
        # Major English-speaking
        'US', 'GB', 'CA', 'IE', 'ZA', 'IN', 'PK', 'NG', 'PH', 'SG', 'MY', 'HK',

        # Spanish-speaking
        'ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'EC', 'GT', 'VE', 'CU', 'BO',
        'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ',

        # Portuguese-speaking
        'BR', 'PT', 'AO', 'MZ', 'GW', 'CV', 'ST', 'TL',

        # French-speaking
        'FR', 'BE', 'CA', 'CH', 'LU', 'MC', 'CD', 'CI', 'CM', 'SN', 'MG',
        'HT', 'BF', 'ML', 'NE', 'TG', 'BJ', 'GA', 'GN', 'RW', 'BI', 'TD',

        # German-speaking
        'DE', 'AT', 'CH', 'LI', 'LU', 'BE',

        # Italian
        'IT', 'SM', 'VA', 'CH',

        # Nordic
        'SE', 'NO', 'DK', 'FI', 'IS', 'FO', 'GL',

        # Eastern Europe
        'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'RS', 'SI', 'BA', 'ME',
        'MK', 'AL', 'XK', 'MD', 'UA', 'BY', 'RU', 'LT', 'LV', 'EE',

        # Middle East
        'TR', 'SA', 'AE', 'EG', 'IL', 'JO', 'LB', 'SY', 'IQ', 'IR', 'KW',
        'QA', 'BH', 'OM', 'YE', 'PS', 'AF',

        # Asia
        'CN', 'JP', 'KR', 'TW', 'HK', 'MO', 'MN', 'KZ', 'UZ', 'TM', 'KG',
        'TJ', 'TH', 'VN', 'LA', 'KH', 'MM', 'ID', 'MY', 'SG', 'BN', 'TL',
        'PH', 'BD', 'IN', 'PK', 'LK', 'NP', 'BT', 'MV',

        # Africa
        'NG', 'ET', 'EG', 'CD', 'ZA', 'TZ', 'KE', 'UG', 'DZ', 'SD', 'MA',
        'AO', 'GH', 'MZ', 'MG', 'CM', 'CI', 'NE', 'BF', 'ML', 'MW', 'ZM',
        'SN', 'SO', 'TD', 'GN', 'RW', 'BJ', 'TN', 'BI', 'SS', 'LY', 'TG',
        'SL', 'LR', 'MR', 'CF', 'ER', 'GM', 'BW', 'NA', 'GA', 'LS', 'GW',
        'GQ', 'MU', 'SZ', 'DJ', 'RE', 'KM', 'CV', 'YT', 'ST', 'SC',

        # Oceania
        'AU', 'NZ', 'PG', 'FJ', 'SB', 'NC', 'PF', 'VU', 'WS', 'GU', 'TO',
        'KI', 'PW', 'MH', 'FM', 'NR', 'TV'
    ]

    # Track unique names to avoid duplicates
    unique_names = {}
    country_counts = defaultdict(int)
    working_countries = []

    def process_country_batch(country_codes, names_per_country=50000):
        """Process a batch of countries"""
        for country_code in country_codes:
            try:
                # Test if country has data
                test = nd.get_top_names(n=1, country_alpha2=country_code)
                if country_code not in test or (not test[country_code].get('M') and not test[country_code].get('F')):
                    continue

                print(f"\nProcessing {country_code}...")
                working_countries.append(country_code)

                # Get maximum available names
                top_names = nd.get_top_names(n=names_per_country, country_alpha2=country_code)

                processed = 0
                skipped = 0

                # Process male names
                male_names = top_names.get(country_code, {}).get('M', [])
                for rank, name in enumerate(male_names, 1):
                    if not name:
                        continue

                    if name in unique_names:
                        # Update existing entry
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
                                'countries': {country_code: rank},
                                'globalCountries': name_data['first_name'].get('country', {}),
                                'primaryCountry': country_code,
                                'appearances': 1,
                                'popularityRank': rank
                            }
                            unique_names[name] = entry
                            processed += 1
                            country_counts[country_code] += 1

                # Process female names
                female_names = top_names.get(country_code, {}).get('F', [])
                for rank, name in enumerate(female_names, 1):
                    if not name:
                        continue

                    if name in unique_names:
                        # Update existing entry
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
                                'countries': {country_code: rank},
                                'globalCountries': name_data['first_name'].get('country', {}),
                                'primaryCountry': country_code,
                                'appearances': 1,
                                'popularityRank': rank
                            }
                            unique_names[name] = entry
                            processed += 1
                            country_counts[country_code] += 1

                print(f"  ✓ {country_code}: {processed:,} new, {skipped:,} merged")

            except Exception as e:
                # Silently skip countries with no data
                continue

    print("\nProcessing all available countries...")
    print("=" * 40)

    # Process in batches for better performance
    batch_size = 10
    for i in range(0, len(all_countries), batch_size):
        batch = all_countries[i:i+batch_size]
        process_country_batch(batch)

        # Print progress
        if len(unique_names) > 0 and i % 50 == 0:
            print(f"\nProgress: {len(unique_names):,} unique names collected...")

    # Calculate global popularity score
    print("\n" + "=" * 40)
    print("FINALIZING DATABASE")
    print("=" * 40)

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
    database['metadata']['countries'] = dict(country_counts)
    database['metadata']['workingCountries'] = working_countries

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
    print("EXTRACTION COMPLETE - FINAL SUMMARY")
    print("=" * 60)
    print(f"Total unique names extracted: {len(sorted_names):,}")
    print(f"Countries with data: {len(working_countries)}")
    print(f"\nTop countries by name count:")

    top_countries = sorted(country_counts.items(), key=lambda x: x[1], reverse=True)[:15]
    for country, count in top_countries:
        print(f"  {country}: {count:,} names")

    # Show top 10 most popular global names
    print(f"\nTop 10 most globally popular names:")
    for i, name in enumerate(sorted_names[:10], 1):
        gender = "M" if name['gender'].get('Male', 0) > 0.5 else "F"
        countries = len(name['countries'])
        print(f"  {i}. {name['name']} ({gender}) - appears in {countries} countries")

    # Clean up memory
    del nd
    gc.collect()

    return database['metadata']

if __name__ == "__main__":
    try:
        metadata = extract_maximum_names()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()