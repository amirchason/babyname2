#!/usr/bin/env python3
"""
Enhanced extraction including last names from philipperemy/name-dataset
"""

import json
import time
from names_dataset import NameDataset
import gc

def extract_enhanced_database():
    print("Loading names dataset... This may take a few minutes")
    start_time = time.time()

    # Initialize the dataset
    nd = NameDataset()

    print(f"Dataset loaded in {time.time() - start_time:.2f} seconds")
    print("Extracting comprehensive names data...")

    # Prepare the output structure
    database = {
        "metadata": {
            "source": "philipperemy/name-dataset",
            "version": "3.3.1",
            "description": "Global names database from 106 countries",
            "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "totalFirstNames": 0,
            "totalLastNames": 0,
            "totalCombined": 0,
            "countries": []
        },
        "names": []  # Combined list for easier searching
    }

    # Extended country list for better coverage
    countries = ['US', 'GB', 'CA', 'AU', 'NZ',  # English-speaking
                 'FR', 'DE', 'IT', 'ES', 'PT',  # Western Europe
                 'NL', 'BE', 'CH', 'AT', 'IE',  # More Western Europe
                 'SE', 'NO', 'DK', 'FI', 'IS',  # Nordic
                 'PL', 'CZ', 'HU', 'RO', 'BG',  # Eastern Europe
                 'RU', 'UA', 'BY', 'KZ',         # Former Soviet
                 'BR', 'MX', 'AR', 'CO', 'CL',  # Latin America
                 'JP', 'CN', 'KR', 'TH', 'VN',  # Asia
                 'IN', 'PK', 'BD', 'ID', 'PH',  # South/Southeast Asia
                 'TR', 'EG', 'SA', 'AE', 'IL',  # Middle East
                 'ZA', 'NG', 'KE', 'GH', 'ET']  # Africa

    processed_names = set()
    first_name_count = 0
    last_name_count = 0

    for country in countries[:30]:  # Process first 30 countries for manageable size
        print(f"Processing {country}...")
        try:
            # Get top names for this country
            top_names = nd.get_top_names(n=3000, country_alpha2=country)

            # Process first names (male)
            for name in top_names.get(country, {}).get('M', [])[:1500]:
                if name and name not in processed_names:
                    processed_names.add(('first', name))
                    name_data = nd.search(name)
                    if name_data and 'first_name' in name_data:
                        entry = {
                            'name': name,
                            'type': 'first',
                            'gender': name_data['first_name'].get('gender', {}),
                            'countries': name_data['first_name'].get('country', {}),
                            'primaryCountry': country,
                            'popularity': name_data['first_name'].get('rank', {}).get(country, 9999)
                        }
                        database['names'].append(entry)
                        first_name_count += 1

            # Process first names (female)
            for name in top_names.get(country, {}).get('F', [])[:1500]:
                if name and name not in processed_names:
                    processed_names.add(('first', name))
                    name_data = nd.search(name)
                    if name_data and 'first_name' in name_data:
                        entry = {
                            'name': name,
                            'type': 'first',
                            'gender': name_data['first_name'].get('gender', {}),
                            'countries': name_data['first_name'].get('country', {}),
                            'primaryCountry': country,
                            'popularity': name_data['first_name'].get('rank', {}).get(country, 9999)
                        }
                        database['names'].append(entry)
                        first_name_count += 1

            # Process last names
            last_names_list = top_names.get(country, {}).get('last_name', [])
            if not last_names_list:
                # Try alternative approach for last names
                print(f"  No last names found for {country}, skipping...")
            else:
                for name in last_names_list[:1000]:
                    if name and ('last', name) not in processed_names:
                        processed_names.add(('last', name))
                        name_data = nd.search(name)
                        if name_data and 'last_name' in name_data:
                            entry = {
                                'name': name,
                                'type': 'last',
                                'countries': name_data['last_name'].get('country', {}),
                                'primaryCountry': country,
                                'popularity': name_data['last_name'].get('rank', {}).get(country, 9999)
                            }
                            database['names'].append(entry)
                            last_name_count += 1

        except Exception as e:
            print(f"  Error processing {country}: {e}")
            continue

    # Update metadata
    database['metadata']['totalFirstNames'] = first_name_count
    database['metadata']['totalLastNames'] = last_name_count
    database['metadata']['totalCombined'] = len(database['names'])
    database['metadata']['countries'] = countries[:30]

    print(f"\nExtracted {first_name_count} unique first names")
    print(f"Extracted {last_name_count} unique last names")
    print(f"Total unique names: {len(database['names'])}")

    # Save to JSON file
    output_file = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'
    print(f"\nSaving to {output_file}...")

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(database, f, ensure_ascii=False, indent=2)

    print(f"Database saved successfully!")
    print(f"File size: {len(json.dumps(database)) / 1024 / 1024:.1f} MB")
    print(f"Total processing time: {time.time() - start_time:.2f} seconds")

    # Clean up memory
    del nd
    gc.collect()

    return database['metadata']

if __name__ == "__main__":
    try:
        metadata = extract_enhanced_database()
        print("\n=== Enhanced Database Created Successfully ===")
        print(f"First Names: {metadata['totalFirstNames']:,}")
        print(f"Last Names: {metadata['totalLastNames']:,}")
        print(f"Total Names: {metadata['totalCombined']:,}")
        print(f"Countries Processed: {len(metadata['countries'])}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()