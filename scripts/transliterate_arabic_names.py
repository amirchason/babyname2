#!/usr/bin/env python3
"""
Arabic to English Name Transliteration Script
Transliterates Arabic names to English letters in the names database
"""

import json
import re
import os
import logging
from typing import Dict, List, Set

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ArabicTransliterator:
    def __init__(self):
        # Common Arabic name translations
        self.arabic_to_english = {
            # Direct translations of common Arabic names
            'محمد': 'Mohammed',
            'أحمد': 'Ahmed',
            'احمد': 'Ahmed',
            'علي': 'Ali',
            'عبدالله': 'Abdullah',
            'عبد الله': 'Abdullah',
            'حسن': 'Hassan',
            'حسين': 'Hussein',
            'عمر': 'Omar',
            'خالد': 'Khalid',
            'يوسف': 'Youssef',
            'إبراهيم': 'Ibrahim',
            'ابراهيم': 'Ibrahim',
            'موسى': 'Musa',
            'موسي': 'Musa',
            'عيسى': 'Isa',
            'عيسي': 'Isa',
            'داود': 'David',
            'داوود': 'David',
            'سليمان': 'Suleiman',
            'يحيى': 'Yahya',
            'يحيي': 'Yahya',
            'يحي': 'Yahya',
            'زكريا': 'Zakariya',
            'عثمان': 'Othman',
            'طارق': 'Tariq',
            'فهد': 'Fahd',
            'سعد': 'Saad',
            'نور': 'Nour',
            'فاطمة': 'Fatima',
            'فاطمه': 'Fatima',
            'عائشة': 'Aisha',
            'عائشه': 'Aisha',
            'خديجة': 'Khadija',
            'خديجه': 'Khadija',
            'مريم': 'Maryam',
            'زينب': 'Zeinab',
            'سارة': 'Sara',
            'ساره': 'Sara',
            'ليلى': 'Layla',
            'ليلي': 'Layla',
            'آمنة': 'Amina',
            'أمينة': 'Amina',
            'امينة': 'Amina',
            'امينه': 'Amina',
            'رقية': 'Ruqayya',
            'رقيه': 'Ruqayya',
            'حفصة': 'Hafsa',
            'أم كلثوم': 'Umm Kulthum',
            'صفية': 'Safiya',
            'جويرية': 'Juwayriya',
            'ميمونة': 'Maymuna',
            'سودة': 'Sawda',
            'حبيبة': 'Habiba',
            'حبيبه': 'Habiba',
            'ياسمين': 'Yasmin',
            'ياسمينة': 'Yasmin',
            'دعاء': 'Doaa',
            'إسراء': 'Israa',
            'اسراء': 'Israa',
            'رحمة': 'Rahma',
            'رحمه': 'Rahma',
            'سلمى': 'Salma',
            'سلمي': 'Salma',
            'هبة': 'Heba',
            'هبه': 'Heba',
            'منال': 'Manal',
            'منى': 'Mona',
            'مني': 'Mona',
            'هدى': 'Hoda',
            'هدي': 'Hoda',
            'نهى': 'Noha',
            'ندى': 'Nada',
            'ندي': 'Nada',
            'رنا': 'Rana',
            'دنيا': 'Donia',
            'أميرة': 'Amira',
            'اميرة': 'Amira',
            'اميره': 'Amira',
            'ملكة': 'Malaka',
            'جميلة': 'Jamila',
            'جميله': 'Jamila',
            'كريمة': 'Karima',
            'كريمه': 'Karima',
            'حنان': 'Hanan',
            'أمل': 'Amal',
            'امل': 'Amal',
            'رجاء': 'Raja',
            'رضا': 'Reda',
            'فرح': 'Farah',
            'سعاد': 'Souad',
            'وداد': 'Wedad',
            'إيمان': 'Iman',
            'ايمان': 'Iman',
            'إسلام': 'Islam',
            'اسلام': 'Islam',
            'إنعام': 'Inaam',
            'انعام': 'Inaam',
            'إحسان': 'Ihsan',
            'احسان': 'Ihsan',
            'أنس': 'Anas',
            'انس': 'Anas',
            'أيمن': 'Ayman',
            'ايمن': 'Ayman',
            'بشار': 'Bashar',
            'بسام': 'Bassam',
            'تامر': 'Tamer',
            'جمال': 'Jamal',
            'حسام': 'Hossam',
            'رامي': 'Rami',
            'سامي': 'Sami',
            'شادي': 'Shadi',
            'عادل': 'Adel',
            'فادي': 'Fadi',
            'ماجد': 'Majed',
            'ماهر': 'Maher',
            'ناصر': 'Nasser',
            'وائل': 'Wael',
            'ياسر': 'Yasser',
            'عماد': 'Emad',
            'عمار': 'Ammar',
            'فيصل': 'Faisal',
            'مشعل': 'Mishaal',
            'نايف': 'Naif',
            'وليد': 'Waleed',
            'زياد': 'Ziad',
            'رياض': 'Riyadh',
            'سالم': 'Salem',
            'صالح': 'Saleh',
            'عامر': 'Amer',
            'غازي': 'Ghazi',
            'فارس': 'Fares',
            'قاسم': 'Qasem',
            'كامل': 'Kamel',
            'لؤي': 'Louay',
            'مازن': 'Mazen',
            'نادر': 'Nader',
            'هاني': 'Hani',
            'يزن': 'Yazan',

            # Compound names with "Abu" (Father of)
            'أبو': 'Abu',
            'ابو': 'Abu',
            'أم': 'Um',
            'ام': 'Um',

            # Religious and traditional titles
            'عبد': 'Abd',
            'عبدالرحمن': 'Abdul Rahman',
            'عبد الرحمن': 'Abdul Rahman',
            'عبدالعزيز': 'Abdul Aziz',
            'عبد العزيز': 'Abdul Aziz',
            'عبدالحليم': 'Abdul Haleem',
            'عبد الحليم': 'Abdul Haleem',
            'عبدالكريم': 'Abdul Kareem',
            'عبد الكريم': 'Abdul Kareem',
            'عبدالوهاب': 'Abdul Wahab',
            'عبد الوهاب': 'Abdul Wahab',
            'عبدالقادر': 'Abdul Qader',
            'عبد القادر': 'Abdul Qader',
            'عبدالمجيد': 'Abdul Majeed',
            'عبد المجيد': 'Abdul Majeed',
            'عبدالرزاق': 'Abdul Razzaq',
            'عبد الرزاق': 'Abdul Razzaq',
            'عبدالفتاح': 'Abdul Fattah',
            'عبد الفتاح': 'Abdul Fattah',
            'عبدالحكيم': 'Abdul Hakeem',
            'عبد الحكيم': 'Abdul Hakeem',
            'عبدالسلام': 'Abdul Salam',
            'عبد السلام': 'Abdul Salam',
            'عبداللطيف': 'Abdul Latif',
            'عبد اللطيف': 'Abdul Latif',
            'عبدالباسط': 'Abdul Basit',
            'عبد الباسط': 'Abdul Basit',
            'عبدالحميد': 'Abdul Hameed',
            'عبد الحميد': 'Abdul Hameed',
            'عبدالغني': 'Abdul Ghani',
            'عبد الغني': 'Abdul Ghani',
            'عبدالهادي': 'Abdul Hadi',
            'عبد الهادي': 'Abdul Hadi',
            'عبدالناصر': 'Abdul Nasser',
            'عبدالملك': 'Abdul Malik',
            'عبدالمنعم': 'Abdul Moneim',
            'عبد المنعم': 'Abdul Moneim',
        }

        # Character-by-character transliteration map
        self.char_map = {
            'ا': 'a',
            'أ': 'a',
            'إ': 'i',
            'آ': 'aa',
            'ب': 'b',
            'ت': 't',
            'ث': 'th',
            'ج': 'j',
            'ح': 'h',
            'خ': 'kh',
            'د': 'd',
            'ذ': 'th',
            'ر': 'r',
            'ز': 'z',
            'س': 's',
            'ش': 'sh',
            'ص': 's',
            'ض': 'd',
            'ط': 't',
            'ظ': 'th',
            'ع': 'a',
            'غ': 'gh',
            'ف': 'f',
            'ق': 'q',
            'ك': 'k',
            'ل': 'l',
            'م': 'm',
            'ن': 'n',
            'ه': 'h',
            'و': 'w',
            'ي': 'y',
            'ة': 'a',
            'ى': 'a',
            'ء': '',
            'ئ': 'i',
            'ؤ': 'u',
            'لا': 'la',
            'ال': 'al',
        }

    def has_arabic_letters(self, text: str) -> bool:
        """Check if text contains Arabic letters"""
        arabic_pattern = r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]'
        return bool(re.search(arabic_pattern, text))

    def transliterate_name(self, arabic_name: str) -> str:
        """Transliterate Arabic name to English"""
        # Clean the name
        name = arabic_name.strip()

        # Check if it's a known name first
        if name in self.arabic_to_english:
            return self.arabic_to_english[name]

        # Handle compound names (Abu/Um + name)
        if name.startswith(('أبو ', 'ابو ', 'أم ', 'ام ')):
            parts = name.split(' ', 1)
            if len(parts) == 2:
                prefix = 'Abu' if parts[0] in ['أبو', 'ابو'] else 'Um'
                suffix_transliterated = self.transliterate_name(parts[1])
                return f"{prefix} {suffix_transliterated}"

        # Handle "Abdul" compounds
        if name.startswith(('عبد ', 'عبدال')):
            if name.startswith('عبدال'):
                # Remove 'عبدال' and transliterate the rest
                remainder = name[5:]
                if remainder:
                    return f"Abdul {self.char_transliterate(remainder).title()}"
            elif name.startswith('عبد '):
                # Remove 'عبد ' and transliterate the rest
                remainder = name[4:]
                if remainder:
                    return f"Abd {self.char_transliterate(remainder).title()}"

        # Handle "Al" prefix
        if name.startswith('ال'):
            remainder = name[2:]
            if remainder:
                return f"Al {self.char_transliterate(remainder).title()}"

        # Character-by-character transliteration
        return self.char_transliterate(name)

    def char_transliterate(self, text: str) -> str:
        """Character-by-character transliteration"""
        result = ''
        for char in text:
            if char in self.char_map:
                result += self.char_map[char]
            elif char == ' ':
                result += ' '
            elif char.isalpha():
                result += char  # Keep non-Arabic letters as-is
            # Skip other characters (punctuation, numbers, etc.)

        # Clean up and capitalize
        result = ' '.join(result.split())  # Normalize whitespace
        return result.title() if result else text

    def update_names_database(self, names_file: str):
        """Update names database by transliterating Arabic names"""
        try:
            # Load names database
            with open(names_file, 'r', encoding='utf-8') as f:
                database = json.load(f)

            if 'names' not in database:
                logger.error("Invalid database format")
                return

            updated_count = 0
            total_names = len(database['names'])

            logger.info(f"Processing {total_names} names for Arabic transliteration...")

            for i, name_entry in enumerate(database['names']):
                original_name = name_entry['name']

                # Check if name contains Arabic letters
                if self.has_arabic_letters(original_name):
                    # Transliterate to English
                    english_name = self.transliterate_name(original_name)

                    # Update the name entry
                    name_entry['originalName'] = original_name  # Keep original for reference
                    name_entry['name'] = english_name

                    updated_count += 1
                    logger.info(f"[{i+1}/{total_names}] Transliterated: '{original_name}' -> '{english_name}'")

                # Progress update every 1000 names
                if (i + 1) % 1000 == 0:
                    logger.info(f"Progress: {i+1}/{total_names} names processed")

            # Save updated database
            with open(names_file, 'w', encoding='utf-8') as f:
                json.dump(database, f, indent=2, ensure_ascii=False)

            logger.info(f"Completed! Transliterated {updated_count} Arabic names to English")
            logger.info(f"Updated database saved to: {names_file}")

        except Exception as e:
            logger.error(f"Error updating database: {e}")

def main():
    """Main function to transliterate Arabic names"""
    import sys

    # Path to names database
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    names_file = os.path.join(project_root, 'public', 'data', 'popularNames_cache.json')

    if not os.path.exists(names_file):
        logger.error(f"Names file not found: {names_file}")
        return

    # Create backup first
    backup_file = names_file + '.backup'
    logger.info(f"Creating backup: {backup_file}")

    try:
        with open(names_file, 'r', encoding='utf-8') as src:
            with open(backup_file, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
        logger.info("Backup created successfully")
    except Exception as e:
        logger.error(f"Failed to create backup: {e}")
        return

    # Run transliteration
    transliterator = ArabicTransliterator()
    transliterator.update_names_database(names_file)

if __name__ == '__main__':
    main()