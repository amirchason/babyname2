#!/usr/bin/env python3
"""
Ultra Database Cleaner for Baby Names App
Removes ALL non-English characters, translates names, removes duplicates
Ensures 100% clean English-only names database
"""

import json
import os
import re
import unicodedata
from datetime import datetime
from collections import defaultdict
from pathlib import Path

class UltraDatabaseCleaner:
    def __init__(self):
        self.source_file = 'public/data/ultimateNamesDatabase.json'
        self.output_file = 'public/data/ultimateNamesDatabase_ultra_clean.json'

        # Statistics
        self.stats = {
            'original_count': 0,
            'unicode_accent_removed': 0,
            'asian_characters_removed': 0,
            'arabic_characters_removed': 0,
            'multi_word_removed': 0,
            'hyphen_removed': 0,
            'special_chars_removed': 0,
            'translated_names': 0,
            'duplicates_merged': 0,
            'final_count': 0
        }

        # Name translation dictionary
        self.name_translations = {
            # Spanish/Portuguese names
            'José': 'Jose',
            'María': 'Maria',
            'Jesús': 'Jesus',
            'Sebastián': 'Sebastian',
            'Andrés': 'Andre',
            'Víctor': 'Victor',
            'Héctor': 'Hector',
            'Raúl': 'Raul',
            'Ángel': 'Angel',
            'Sofía': 'Sofia',
            'Lucía': 'Lucy',
            'León': 'Leon',
            'Nicolás': 'Nicholas',
            'Martín': 'Martin',
            'Rubén': 'Ruben',
            'Iván': 'Ivan',
            'Adrián': 'Adrian',
            'Ramón': 'Ramon',
            'Joaquín': 'Joaquin',
            'Fabián': 'Fabian',
            'Julián': 'Julian',
            'Cristián': 'Christian',
            'Damián': 'Damian',
            'Elías': 'Elias',
            'Benjamín': 'Benjamin',
            'Néstor': 'Nestor',
            'Salomé': 'Salome',
            'Inés': 'Ines',
            'Mónica': 'Monica',
            'Verónica': 'Veronica',
            'Angélica': 'Angelica',
            'Yasmín': 'Yasmin',
            'Jazmín': 'Jasmin',
            'René': 'Rene',
            'Moisés': 'Moses',
            'Tomás': 'Thomas',
            'Álvaro': 'Alvaro',
            'Félix': 'Felix',
            'Josué': 'Joshua',
            'Isaías': 'Isaiah',
            'Jonás': 'Jonas',

            # French names
            'André': 'Andre',
            'François': 'Francis',
            'José': 'Jose',
            'René': 'Rene',
            'Stéphane': 'Stephen',
            'Céline': 'Celine',
            'Hélène': 'Helen',
            'Noël': 'Noel',
            'Zoé': 'Zoe',
            'Renée': 'Renee',
            'Aimée': 'Amy',
            'Andrée': 'Andrea',
            'Désirée': 'Desiree',

            # Other European
            'João': 'John',
            'José': 'Jose',
            'António': 'Anthony',
            'Óscar': 'Oscar',
            'Vítor': 'Victor',
            'Rúben': 'Ruben',
            'Luís': 'Luis',
            'Luísa': 'Louisa',
            'José': 'Jose',
            'María': 'Maria',
            'Niña': 'Nina',

            # Names with common patterns
            'Pía': 'Pia',
            'Elí': 'Eli',
            'Saraí': 'Sarah',
            'Ayelén': 'Ayelen',
            'Begoña': 'Begona',
            'Marité': 'Marite',
            'Iñigo': 'Inigo',
            'Cándida': 'Candida'
        }

    def remove_accents(self, text: str) -> str:
        """
        Remove all accent marks and diacritics from text
        """
        # Normalize to NFD (decomposed form)
        nfd = unicodedata.normalize('NFD', text)
        # Remove all combining characters (accents)
        without_accents = ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')
        return without_accents

    def is_latin_script(self, char: str) -> bool:
        """
        Check if character is basic Latin (English) A-Z, a-z
        """
        return 'a' <= char <= 'z' or 'A' <= char <= 'Z'

    def contains_only_english_letters(self, name: str) -> bool:
        """
        Ultra strict check: only A-Z and a-z allowed
        """
        return bool(re.match(r'^[A-Za-z]+$', name))

    def is_asian_script(self, char: str) -> bool:
        """
        Detect Asian scripts: Chinese, Japanese, Korean, Thai, etc.
        """
        unicode_categories = [
            'CJK_UNIFIED_IDEOGRAPHS',
            'CJK_COMPATIBILITY_IDEOGRAPHS',
            'HIRAGANA',
            'KATAKANA',
            'HANGUL_SYLLABLES',
            'THAI',
            'LAO',
            'MYANMAR',
            'KHMER'
        ]

        try:
            script_name = unicodedata.name(char, '').upper()
            return any(category in script_name for category in unicode_categories)
        except ValueError:
            # Check Unicode blocks for CJK
            code_point = ord(char)
            # CJK Unified Ideographs: U+4E00–U+9FFF
            # CJK Extension A: U+3400–U+4DBF
            # Hiragana: U+3040–U+309F
            # Katakana: U+30A0–U+30FF
            # Hangul: U+AC00–U+D7AF
            if (0x4E00 <= code_point <= 0x9FFF or    # CJK Unified
                0x3400 <= code_point <= 0x4DBF or    # CJK Extension A
                0x3040 <= code_point <= 0x309F or    # Hiragana
                0x30A0 <= code_point <= 0x30FF or    # Katakana
                0xAC00 <= code_point <= 0xD7AF):     # Hangul
                return True
        return False

    def is_arabic_script(self, char: str) -> bool:
        """
        Detect Arabic, Hebrew, Persian scripts
        """
        try:
            script_name = unicodedata.name(char, '').upper()
            arabic_patterns = ['ARABIC', 'HEBREW', 'PERSIAN']
            return any(pattern in script_name for pattern in arabic_patterns)
        except ValueError:
            # Check Unicode blocks
            code_point = ord(char)
            # Arabic: U+0600–U+06FF
            # Hebrew: U+0590–U+05FF
            if (0x0600 <= code_point <= 0x06FF or    # Arabic
                0x0590 <= code_point <= 0x05FF):     # Hebrew
                return True
        return False

    def classify_name_issues(self, name: str) -> list:
        """
        Classify what issues a name has
        """
        issues = []

        # Check for spaces (multi-word)
        if ' ' in name:
            issues.append('multi_word')

        # Check for hyphens
        if '-' in name:
            issues.append('hyphen')

        # Check for other special characters
        if re.search(r'[^A-Za-z\s\-]', name):
            # Check each character
            for char in name:
                if not self.is_latin_script(char) and char not in [' ', '-']:
                    if self.is_asian_script(char):
                        issues.append('asian_script')
                    elif self.is_arabic_script(char):
                        issues.append('arabic_script')
                    elif unicodedata.category(char) == 'Mn':  # Combining marks
                        issues.append('unicode_accent')
                    else:
                        issues.append('special_char')

        return list(set(issues))  # Remove duplicates

    def translate_name(self, name: str) -> str:
        """
        Try to translate name to English equivalent
        """
        # Direct translation
        if name in self.name_translations:
            self.stats['translated_names'] += 1
            return self.name_translations[name]

        # Remove accents and try again
        deaccented = self.remove_accents(name)
        if deaccented != name and self.contains_only_english_letters(deaccented):
            self.stats['translated_names'] += 1
            return deaccented

        return name

    def clean_name(self, name: str) -> tuple:
        """
        Clean a single name and return (cleaned_name, should_keep)
        """
        original_name = name

        # Classify issues
        issues = self.classify_name_issues(name)

        # Count issues
        if 'multi_word' in issues:
            self.stats['multi_word_removed'] += 1
            return None, False

        if 'hyphen' in issues:
            self.stats['hyphen_removed'] += 1
            return None, False

        if 'asian_script' in issues:
            self.stats['asian_characters_removed'] += 1
            return None, False

        if 'arabic_script' in issues:
            self.stats['arabic_characters_removed'] += 1
            return None, False

        if 'special_char' in issues:
            self.stats['special_chars_removed'] += 1
            return None, False

        # Try translation if it has accents
        if 'unicode_accent' in issues:
            translated = self.translate_name(name)
            if self.contains_only_english_letters(translated):
                self.stats['unicode_accent_removed'] += 1
                name = translated
            else:
                self.stats['unicode_accent_removed'] += 1
                return None, False
        else:
            # Try translation anyway
            translated = self.translate_name(name)
            if translated != name:
                name = translated

        # Final validation: must be pure English letters
        if not self.contains_only_english_letters(name):
            return None, False

        # Normalize case
        name = name.strip()
        if name:
            name = name[0].upper() + name[1:].lower() if len(name) > 1 else name.upper()

        return name, True

    def merge_duplicates(self, name_groups: dict) -> list:
        """
        Merge duplicate entries, keeping best data
        """
        cleaned_names = []

        for name, entries in name_groups.items():
            if len(entries) > 1:
                self.stats['duplicates_merged'] += len(entries) - 1
                print(f"  Merging {len(entries)} entries for: {name}")

            # Use entry with highest popularity score as base
            base_entry = max(entries, key=lambda x: x.get('p', 0))
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

            # Update name to cleaned version
            merged['n'] = name

            cleaned_names.append(merged)

        return cleaned_names

    def recalculate_rankings(self, names: list) -> list:
        """
        Recalculate all rankings after cleaning
        """
        print("📊 Recalculating popularity rankings...")

        # Sort by popularity score (highest first)
        names.sort(key=lambda x: x.get('p', 0), reverse=True)

        # Assign new rankings
        for i, entry in enumerate(names):
            entry['r'] = i + 1
            entry['id'] = i

        print(f"  ✓ Rankings recalculated for {len(names)} names")
        return names

    def ultra_clean_database(self):
        """
        Main ultra cleaning function
        """
        print("🚀 Starting ULTRA database cleaning...")
        print("="*50)

        # Load source database
        print("📚 Loading source database...")
        if not os.path.exists(self.source_file):
            print(f"❌ Source file not found: {self.source_file}")
            return False

        with open(self.source_file, 'r', encoding='utf-8') as f:
            database = json.load(f)

        self.stats['original_count'] = len(database['names'])
        print(f"  ✓ Loaded {self.stats['original_count']:,} names")

        # Ultra clean names
        print("🧹 Ultra cleaning names...")
        name_groups = defaultdict(list)
        removed_count = 0

        for i, entry in enumerate(database['names']):
            if i % 10000 == 0 and i > 0:
                print(f"  Processed {i:,} names...")

            original_name = entry.get('n', '')
            if not original_name:
                continue

            cleaned_name, should_keep = self.clean_name(original_name)

            if should_keep and cleaned_name:
                # Update entry with cleaned name
                entry['n'] = cleaned_name
                name_groups[cleaned_name].append(entry)
            else:
                removed_count += 1
                if removed_count <= 20:  # Show first 20 removed names
                    print(f"    Removed: {original_name}")

        print(f"  ✓ Removed {removed_count:,} problematic names")
        print(f"  ✓ Kept {len(name_groups):,} unique names")

        # Merge duplicates
        print("🔗 Merging duplicates...")
        cleaned_names = self.merge_duplicates(name_groups)

        # Recalculate rankings
        cleaned_names = self.recalculate_rankings(cleaned_names)

        self.stats['final_count'] = len(cleaned_names)

        # Create ultra-clean database
        cleaned_database = {
            'metadata': {
                'source': 'ultimateNamesDatabase_ultra_clean',
                'version': '9.0.0',
                'description': 'Ultra-clean baby names database - 100% English letters only',
                'lastUpdated': datetime.now().isoformat(),
                'totalNames': self.stats['final_count'],
                'cleaningStats': self.stats,
                'countries': database['metadata'].get('countries', {}),
                'workingCountries': database['metadata'].get('workingCountries', [])
            },
            'names': cleaned_names
        }

        # Save ultra-clean database
        print(f"💾 Saving ultra-clean database...")
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(cleaned_database, f, ensure_ascii=False, separators=(',', ':'))

        # Print final statistics
        print("\n📈 Ultra Cleaning Complete!")
        print("="*50)
        print(f"  Original names: {self.stats['original_count']:,}")
        print(f"  Multi-word removed: {self.stats['multi_word_removed']:,}")
        print(f"  Hyphenated removed: {self.stats['hyphen_removed']:,}")
        print(f"  Unicode accents removed: {self.stats['unicode_accent_removed']:,}")
        print(f"  Asian characters removed: {self.stats['asian_characters_removed']:,}")
        print(f"  Arabic characters removed: {self.stats['arabic_characters_removed']:,}")
        print(f"  Special chars removed: {self.stats['special_chars_removed']:,}")
        print(f"  Names translated: {self.stats['translated_names']:,}")
        print(f"  Duplicates merged: {self.stats['duplicates_merged']:,}")
        print(f"  Final clean names: {self.stats['final_count']:,}")

        reduction_percent = ((self.stats['original_count'] - self.stats['final_count']) / self.stats['original_count'] * 100)
        print(f"  Total reduction: {reduction_percent:.1f}%")
        print(f"  Database purity: 100% English letters only ✅")

        return True

def main():
    cleaner = UltraDatabaseCleaner()
    success = cleaner.ultra_clean_database()

    if success:
        print("\n✅ Ultra database cleaning completed successfully!")
        print(f"📁 Ultra-clean database saved to: {cleaner.output_file}")
        print("🎯 Ready for chunk generation with 100% English names!")
    else:
        print("\n❌ Ultra database cleaning failed!")
        exit(1)

if __name__ == '__main__':
    main()