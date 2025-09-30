#!/usr/bin/env python3
"""
Remove Non-English Names from Database
Removes all names containing non-English characters from all database files.
Only keeps names with: A-Z, a-z, spaces, hyphens, apostrophes
"""

import json
import os
import re
from pathlib import Path

# Pattern for valid English names: only basic Latin letters, spaces, hyphens, apostrophes
ENGLISH_NAME_PATTERN = re.compile(r"^[A-Za-z\s\-']+$")

def is_english_name(name: str) -> bool:
    """
    Check if a name contains only English characters.

    Args:
        name: The name to check

    Returns:
        True if name is English-only, False otherwise
    """
    if not name or not isinstance(name, str):
        return False

    # Remove extra whitespace
    name = name.strip()

    # Check if name matches English pattern
    return bool(ENGLISH_NAME_PATTERN.match(name))


def clean_database_file(file_path: str, backup: bool = True) -> dict:
    """
    Clean a single database file, removing non-English names.

    Args:
        file_path: Path to the JSON database file
        backup: Whether to create a backup before cleaning

    Returns:
        Dictionary with statistics
    """
    print(f"\n{'='*60}")
    print(f"Processing: {os.path.basename(file_path)}")
    print(f"{'='*60}")

    # Load the file
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error loading file: {e}")
        return {'error': str(e)}

    # Determine structure
    if isinstance(data, dict) and 'names' in data:
        names_list = data['names']
        has_wrapper = True
    elif isinstance(data, list):
        names_list = data
        has_wrapper = False
    else:
        print(f"⚠️  Unknown structure, skipping")
        return {'skipped': True}

    original_count = len(names_list)
    print(f"📊 Original count: {original_count:,} names")

    # Filter out non-English names
    english_names = []
    removed_samples = []

    for entry in names_list:
        if isinstance(entry, dict):
            name = entry.get('name', '')
        else:
            name = entry

        if is_english_name(name):
            english_names.append(entry)
        else:
            if len(removed_samples) < 20:
                removed_samples.append(name)

    cleaned_count = len(english_names)
    removed_count = original_count - cleaned_count

    print(f"✅ English names: {cleaned_count:,}")
    print(f"🗑️  Removed: {removed_count:,} ({removed_count/original_count*100:.1f}%)")

    if removed_samples:
        print(f"\n📋 Sample of removed names:")
        for name in removed_samples[:10]:
            print(f"   - {name}")

    # Create backup if requested
    if backup and removed_count > 0:
        backup_path = file_path + '.backup_before_english_filter'
        if not os.path.exists(backup_path):
            try:
                with open(backup_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False)
                print(f"💾 Backup created: {os.path.basename(backup_path)}")
            except Exception as e:
                print(f"⚠️  Backup failed: {e}")

    # Save cleaned data
    if removed_count > 0:
        try:
            if has_wrapper:
                data['names'] = english_names
                # Update metadata if present
                if 'totalNames' in data:
                    data['totalNames'] = cleaned_count
            else:
                data = english_names

            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=None)
            print(f"✅ File updated successfully")
        except Exception as e:
            print(f"❌ Error saving file: {e}")
            return {'error': str(e)}
    else:
        print(f"✨ No changes needed - all names are English")

    return {
        'file': os.path.basename(file_path),
        'original': original_count,
        'cleaned': cleaned_count,
        'removed': removed_count,
        'removed_pct': round(removed_count/original_count*100, 2) if original_count > 0 else 0
    }


def main():
    """Main function to clean all database files."""

    print("🧹 CLEANING NON-ENGLISH NAMES FROM ALL DATABASES")
    print("=" * 60)
    print("Keeping only: A-Z, a-z, spaces, hyphens ('), apostrophes (')")
    print("Removing: Arabic, Chinese, accented characters (é, ñ, etc.)")
    print("=" * 60)

    # Database files to clean
    base_path = Path('/data/data/com.termux/files/home/proj/babyname2/public/data')

    files_to_clean = [
        'popularNames_cache.json',      # Main 10k database
        'names-core.json',               # Core chunk
        'names-chunk1.json',             # Chunk 1
        'names-chunk2.json',             # Chunk 2
        'names-chunk3.json',             # Chunk 3
        'names-chunk4.json',             # Chunk 4
        'fullNames_cache.json',          # Full names cache
        'top100k_names.json',            # Top 100k
    ]

    results = []

    for filename in files_to_clean:
        file_path = base_path / filename
        if file_path.exists():
            result = clean_database_file(str(file_path), backup=True)
            if result and 'error' not in result and 'skipped' not in result:
                results.append(result)
        else:
            print(f"\n⚠️  File not found: {filename}")

    # Print summary
    print(f"\n\n{'='*60}")
    print("📊 SUMMARY")
    print(f"{'='*60}")

    total_original = sum(r['original'] for r in results)
    total_cleaned = sum(r['cleaned'] for r in results)
    total_removed = sum(r['removed'] for r in results)

    print(f"\nTotal across all files:")
    print(f"  Original names: {total_original:,}")
    print(f"  English names:  {total_cleaned:,}")
    print(f"  Removed:        {total_removed:,} ({total_removed/total_original*100:.1f}%)")

    print(f"\nPer-file breakdown:")
    for result in results:
        print(f"  {result['file']:30s} | "
              f"Original: {result['original']:7,} | "
              f"Kept: {result['cleaned']:7,} | "
              f"Removed: {result['removed']:7,} ({result['removed_pct']:5.1f}%)")

    print(f"\n{'='*60}")
    print("✅ CLEANING COMPLETE!")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()