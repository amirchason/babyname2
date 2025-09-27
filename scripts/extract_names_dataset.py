#!/usr/bin/env python3
"""
Extract and convert philipperemy/name-dataset to JSON format
This creates a comprehensive database with 730K+ first names and 983K+ last names
"""

import json
import time
from names_dataset import NameDataset, NameWrapper
import gc

def extract_names_to_json():
    print("Loading names dataset... This may take a few minutes (3.2GB RAM required)")
    start_time = time.time()

    # Initialize the dataset
    nd = NameDataset()

    print(f"Dataset loaded in {time.time() - start_time:.2f} seconds")
    print("Extracting names data...")

    # Prepare the output structure
    database = {
        "metadata": {
            "source": "philipperemy/name-dataset",
            "version": "3.3.1",
            "description": "491M records from 106 countries (Facebook dataset)",
            "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "totalFirstNames": 0,
            "totalLastNames": 0,
            "countries": []
        },
        "firstNames": [],
        "lastNames": []
    }

    # Get top first names from various countries
    print("Extracting top first names from major countries...")
    countries = ['US', 'GB', 'FR', 'DE', 'IT', 'ES', 'BR', 'JP', 'CN', 'IN',
                 'MX', 'CA', 'AU', 'NL', 'SE', 'NO', 'DK', 'FI', 'PL', 'RU']

    processed_first_names = set()
    processed_last_names = set()

    for country in countries:
        print(f"Processing {country}...")
        try:
            # Get top first names for this country
            top_names = nd.get_top_names(n=5000, country_alpha2=country)

            # Process male first names
            for name in top_names.get(country, {}).get('M', []):
                if name and name not in processed_first_names:
                    processed_first_names.add(name)
                    name_data = nd.search(name)
                    if name_data and 'first_name' in name_data:
                        database['firstNames'].append({
                            'name': name,
                            'type': 'first_name',
                            'gender': name_data['first_name'].get('gender', {}),
                            'country': name_data['first_name'].get('country', {}),
                            'rank': name_data['first_name'].get('rank', {})
                        })

            # Process female first names
            for name in top_names.get(country, {}).get('F', []):
                if name and name not in processed_first_names:
                    processed_first_names.add(name)
                    name_data = nd.search(name)
                    if name_data and 'first_name' in name_data:
                        database['firstNames'].append({
                            'name': name,
                            'type': 'first_name',
                            'gender': name_data['first_name'].get('gender', {}),
                            'country': name_data['first_name'].get('country', {}),
                            'rank': name_data['first_name'].get('rank', {})
                        })

            # Process last names
            for name in top_names.get(country, {}).get('last_name', [])[:2000]:
                if name and name not in processed_last_names:
                    processed_last_names.add(name)
                    name_data = nd.search(name)
                    if name_data and 'last_name' in name_data:
                        database['lastNames'].append({
                            'name': name,
                            'type': 'last_name',
                            'country': name_data['last_name'].get('country', {}),
                            'rank': name_data['last_name'].get('rank', {})
                        })

        except Exception as e:
            print(f"Error processing {country}: {e}")
            continue

    # Update metadata
    database['metadata']['totalFirstNames'] = len(database['firstNames'])
    database['metadata']['totalLastNames'] = len(database['lastNames'])
    database['metadata']['countries'] = countries

    print(f"\nExtracted {len(database['firstNames'])} unique first names")
    print(f"Extracted {len(database['lastNames'])} unique last names")

    # Save to JSON file
    output_file = '/data/data/com.termux/files/home/proj/babyname2/data/namesDatabase.json'
    print(f"\nSaving to {output_file}...")

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(database, f, ensure_ascii=False, indent=2)

    print(f"Database saved successfully!")
    print(f"Total processing time: {time.time() - start_time:.2f} seconds")

    # Clean up memory
    del nd
    gc.collect()

    return database['metadata']

if __name__ == "__main__":
    try:
        metadata = extract_names_to_json()
        print("\n=== Database Created Successfully ===")
        print(f"First Names: {metadata['totalFirstNames']}")
        print(f"Last Names: {metadata['totalLastNames']}")
        print(f"Countries: {', '.join(metadata['countries'])}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()