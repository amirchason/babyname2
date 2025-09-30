#!/usr/bin/env python3
"""
Comprehensive Database Cleaner for Baby Names App
Removes multi-word names, non-English characters, duplicates
Maintains real popularity rankings
"""

import json
import os
import re
from datetime import datetime
from collections import defaultdict
from pathlib import Path

class ComprehensiveDatabaseCleaner:
    def __init__(self):
        self.source_file = 'public/data/ultimateNamesDatabase.json'
        self.output_file = 'public/data/ultimateNamesDatabase_cleaned.json'
        self.stats = {
            'original_count': 0,
            'multi_word_removed': 0,
            'non_english_removed': 0,
            'duplicates_merged': 0,
            'final_count': 0
        }

    def is_valid_english_name(self, name: str) -> bool:
        """
        Check if name contains only English letters (A-Z, a-z)
        No spaces, no special characters, no numbers
        """
        # Only allow English letters
        return bool(re.match(r'^[A-Za-z]+$', name))

    def clean_name(self, name: str) -> str:
        """
        Clean and normalize a name
        """
        # Strip whitespace
        name = name.strip()

        # Take only first word if multiple words
        if ' ' in name:
            name = name.split()[0]

        # Capitalize first letter, lowercase rest
        if name:
            name = name[0].upper() + name[1:].lower() if len(name) > 1 else name.upper()

        return name

    def merge_name_entries(self, entries: list) -> dict:
        """
        Merge multiple entries for the same name, preserving best data
        """
        if len(entries) == 1:
            return entries[0]

        # Use the entry with highest popularity score as base
        base_entry = max(entries, key=lambda x: x.get('p', 0))

        # Merge data from all entries
        merged = base_entry.copy()

        # Keep the best popularity and rank
        merged['p'] = max(entry.get('p', 0) for entry in entries)
        merged['r'] = min(entry.get('r', 999999) for entry in entries if entry.get('r', 0) > 0)

        # Keep highest tier
        merged['t'] = max(entry.get('t', 0) for entry in entries)

        # Merge meanings (keep the longest one)
        meanings = [entry.get('meaning_short', '') for entry in entries if entry.get('meaning_short')]
        if meanings:
            merged['meaning_short'] = max(meanings, key=len)

        # Merge categories
        all_categories = []
        for entry in entries:
            if entry.get('categories'):
                all_categories.extend(entry['categories'])
        if all_categories:
            merged['categories'] = list(set(all_categories))

        return merged

    def clean_database(self):
        """
        Main cleaning function
        """
        print("🧹 Starting comprehensive database cleaning...")

        # Load source database
        print("📚 Loading source database...")
        if not os.path.exists(self.source_file):
            print(f"❌ Source file not found: {self.source_file}")
            return False

        with open(self.source_file, 'r', encoding='utf-8') as f:
            database = json.load(f)

        self.stats['original_count'] = len(database['names'])
        print(f"  ✓ Loaded {self.stats['original_count']} names")

        # Clean and group names
        print("🔍 Cleaning names...")
        name_groups = defaultdict(list)

        for entry in database['names']:
            original_name = entry.get('n', '')

            # Skip empty names
            if not original_name:
                continue

            # Check for multi-word names
            if ' ' in original_name:
                self.stats['multi_word_removed'] += 1
                print(f"  Removing multi-word: {original_name}")
                continue

            # Clean the name
            cleaned_name = self.clean_name(original_name)

            # Check if it's valid English
            if not self.is_valid_english_name(cleaned_name):
                self.stats['non_english_removed'] += 1
                print(f"  Removing non-English: {original_name} -> {cleaned_name}")
                continue

            # Update the entry with cleaned name
            entry['n'] = cleaned_name

            # Group by cleaned name for duplicate detection
            name_groups[cleaned_name].append(entry)

        print(f"  ✓ Multi-word names removed: {self.stats['multi_word_removed']}")
        print(f"  ✓ Non-English names removed: {self.stats['non_english_removed']}")

        # Merge duplicates
        print("🔗 Merging duplicates...")
        cleaned_names = []

        for name, entries in name_groups.items():
            if len(entries) > 1:
                self.stats['duplicates_merged'] += len(entries) - 1
                print(f"  Merging {len(entries)} entries for: {name}")

            merged_entry = self.merge_name_entries(entries)
            cleaned_names.append(merged_entry)

        print(f"  ✓ Duplicates merged: {self.stats['duplicates_merged']}")

        # Sort by popularity (highest first)
        print("📊 Re-ranking names by popularity...")
        cleaned_names.sort(key=lambda x: x.get('p', 0), reverse=True)

        # Update rankings
        for i, entry in enumerate(cleaned_names):
            entry['r'] = i + 1
            entry['id'] = i  # Update ID to be sequential

        self.stats['final_count'] = len(cleaned_names)

        # Create cleaned database
        cleaned_database = {
            'metadata': {
                'source': 'ultimateNamesDatabase_cleaned',
                'version': '8.0.0',
                'description': 'Cleaned baby names database - English single names only',
                'lastUpdated': datetime.now().isoformat(),
                'totalNames': self.stats['final_count'],
                'cleaningStats': self.stats,
                'countries': database['metadata'].get('countries', {}),
                'workingCountries': database['metadata'].get('workingCountries', [])
            },
            'names': cleaned_names
        }

        # Save cleaned database
        print(f"💾 Saving cleaned database...")
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(cleaned_database, f, ensure_ascii=False, separators=(',', ':'))

        # Print final stats
        print("\n📈 Cleaning Complete!")
        print(f"  Original names: {self.stats['original_count']:,}")
        print(f"  Multi-word removed: {self.stats['multi_word_removed']:,}")
        print(f"  Non-English removed: {self.stats['non_english_removed']:,}")
        print(f"  Duplicates merged: {self.stats['duplicates_merged']:,}")
        print(f"  Final clean names: {self.stats['final_count']:,}")
        print(f"  Reduction: {((self.stats['original_count'] - self.stats['final_count']) / self.stats['original_count'] * 100):.1f}%")

        return True

def main():
    cleaner = ComprehensiveDatabaseCleaner()
    success = cleaner.clean_database()

    if success:
        print("\n✅ Database cleaning completed successfully!")
        print(f"📁 Cleaned database saved to: {cleaner.output_file}")
    else:
        print("\n❌ Database cleaning failed!")
        exit(1)

if __name__ == '__main__':
    main()