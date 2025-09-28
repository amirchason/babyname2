#!/usr/bin/env python3
"""
Name Meanings Scraper for Top 1000 Popular Names
Scrapes short meanings (up to 4 words) for names and uses scraping flags
"""

import json
import time
import re
from typing import Dict, List, Optional
import requests
from bs4 import BeautifulSoup
import logging
from scraping_manager import ScrapingManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class NameMeaningScraper:
    """
    Scraper for name meanings using multiple sources
    """

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.scraping_manager = ScrapingManager()

        # Common name meanings for quick lookup (to reduce API calls)
        self.common_meanings = {
            # Popular names with known meanings
            'Emma': 'Universal, whole',
            'Liam': 'Strong-willed warrior',
            'Olivia': 'Olive tree',
            'Noah': 'Rest, comfort',
            'Ava': 'Life, bird',
            'Isabella': 'God is oath',
            'Sophia': 'Wisdom',
            'Charlotte': 'Free man',
            'Mia': 'Mine, beloved',
            'Amelia': 'Work, industrious',
            'Harper': 'Harp player',
            'Evelyn': 'Wished for child',
            'Abigail': 'Father\'s joy',
            'Emily': 'Rival, eager',
            'Elizabeth': 'God is oath',
            'Mila': 'Gracious, dear',
            'Ella': 'Light, beautiful',
            'Avery': 'Elf ruler',
            'Sofia': 'Wisdom',
            'Camila': 'Young attendant',
            'James': 'Supplanter',
            'William': 'Resolute protector',
            'Benjamin': 'Son of right',
            'Lucas': 'Light giving',
            'Henry': 'House ruler',
            'Alexander': 'Defender of men',
            'Mason': 'Stone worker',
            'Michael': 'Who like God',
            'Ethan': 'Strong, firm',
            'Daniel': 'God is judge',
            'Jacob': 'Supplanter',
            'Logan': 'Little hollow',
            'Jackson': 'Son of Jack',
            'Levi': 'Joined, attached',
            'Sebastian': 'Venerable',
            'Mateo': 'Gift of God',
            'Jack': 'God is gracious',
            'Owen': 'Noble warrior',
            'Theodore': 'God\'s gift',
            'Aiden': 'Little fire',
            'Samuel': 'God has heard',
            'Joseph': 'God will add',
            'John': 'God is gracious',
            'David': 'Beloved',
            'Wyatt': 'Brave in war',
            'Matthew': 'Gift of God',
            'Luke': 'Light giving',
            'Asher': 'Happy, blessed',
            'Carter': 'Cart driver',
            'Julian': 'Youthful',
            'Grayson': 'Son of gray',
            'Leo': 'Lion',
            'Jayden': 'Thankful',
            'Gabriel': 'God is strength',
            'Isaac': 'Laughter',
            'Lincoln': 'Lake colony',
            'Anthony': 'Priceless',
            'Hudson': 'Hugh\'s son',
            'Dylan': 'Great tide',
            'Ezra': 'Helper',
            'Thomas': 'Twin',
            'Charles': 'Free man',
            'Christopher': 'Christ bearer',
            'Jaxon': 'God is gracious',
            'Maverick': 'Independent',
            'Josiah': 'God supports',
            'Isaiah': 'God is salvation',
            'Andrew': 'Manly',
            'Elias': 'Yahweh is God',
            'Joshua': 'God is salvation',
            'Nathan': 'Gift from God',
            'Caleb': 'Bold, brave',
            'Ryan': 'Little king',
            'Adrian': 'Dark one',
            'Miles': 'Soldier',
            'Eli': 'Ascended, uplifted',
            'Nolan': 'Noble',
            'Christian': 'Follower of Christ',
            'Aaron': 'High mountain',
            'Cameron': 'Crooked nose',
            'Ezekiel': 'God strengthens',
            'Colton': 'Coal town',
            'Luca': 'Light giving',
            'Landon': 'Long hill',
            'Hunter': 'Hunter',
            'Jonathan': 'God has given',
            'Santiago': 'Saint James',
            'Axel': 'Father is peace',
            'Easton': 'East town',
            'Cooper': 'Barrel maker',
            'Jeremiah': 'God will exalt',
            'Angel': 'Messenger',
            'Roman': 'Citizen of Rome',
            'Connor': 'Lover of hounds',
            'Jameson': 'Son of James',
            'Robert': 'Bright fame',
            'Greyson': 'Son of grey',
            'Jordan': 'Flowing down',
            'Ian': 'God is gracious',
            'Carson': 'Son of Carr',
            'Jaxson': 'God is gracious',
            'Leonardo': 'Lion strength',
            'Nicholas': 'Victory of people',
            'Dominic': 'Belonging to Lord',
            'Austin': 'Great, magnificent',
            'Everett': 'Brave, strong',
            'Brooks': 'Stream',
            'Xavier': 'New house',
            'Kai': 'Ocean',
            'Jose': 'God will add',
            'Parker': 'Park keeper',
            'Adam': 'Earth',
            'Jace': 'Healer',
            'Wesley': 'Western meadow',
            'Kayden': 'Fighter',
            'Silas': 'Wood, forest'
        }

    def clean_meaning(self, meaning: str) -> str:
        """
        Clean and shorten meaning to 4 words max
        """
        if not meaning:
            return ""

        # Remove HTML tags
        meaning = re.sub(r'<[^>]+>', '', meaning)

        # Remove extra whitespace
        meaning = ' '.join(meaning.split())

        # Remove common prefixes
        prefixes_to_remove = [
            'The name', 'This name', 'Meaning:', 'Origin:', 'Definition:',
            'From', 'Derived from', 'A name', 'The meaning'
        ]

        for prefix in prefixes_to_remove:
            if meaning.lower().startswith(prefix.lower()):
                meaning = meaning[len(prefix):].strip()

        # Remove quotes and parentheses
        meaning = re.sub(r'["\'\(\)]', '', meaning)

        # Split into words and take first 4
        words = meaning.split()[:4]

        # Capitalize first word
        if words:
            words[0] = words[0].capitalize()

        return ' '.join(words)

    def scrape_nameberry_meaning(self, name: str) -> Optional[str]:
        """
        Scrape meaning from Nameberry
        """
        try:
            url = f"https://nameberry.com/babyname/{name.lower()}"
            response = self.session.get(url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # Look for meaning in various selectors
                selectors = [
                    '.meaning-section',
                    '.name-meaning',
                    '.definition',
                    '[data-testid="meaning"]',
                    '.meaning'
                ]

                for selector in selectors:
                    element = soup.select_one(selector)
                    if element:
                        meaning = element.get_text().strip()
                        if meaning:
                            return self.clean_meaning(meaning)

        except Exception as e:
            logger.debug(f"Error scraping Nameberry for {name}: {e}")

        return None

    def scrape_behindthename_meaning(self, name: str) -> Optional[str]:
        """
        Scrape meaning from Behind the Name
        """
        try:
            url = f"https://www.behindthename.com/name/{name.lower()}"
            response = self.session.get(url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # Look for meaning
                meaning_div = soup.select_one('.meaning')
                if meaning_div:
                    meaning = meaning_div.get_text().strip()
                    if meaning:
                        return self.clean_meaning(meaning)

        except Exception as e:
            logger.debug(f"Error scraping Behind the Name for {name}: {e}")

        return None

    def get_name_meaning(self, name: str) -> Optional[str]:
        """
        Get meaning for a name using multiple sources
        """
        # Check if already scraped
        if self.scraping_manager.has_been_scraped(name, 'meaning_scraped'):
            logger.debug(f"Skipping {name} - already scraped")
            return None

        # Check common meanings first
        if name in self.common_meanings:
            meaning = self.common_meanings[name]
            logger.info(f"Found common meaning for {name}: {meaning}")
            self.scraping_manager.mark_as_scraped(name, 'meaning_scraped', 'common_meanings')
            return meaning

        # Try scraping from web sources
        meaning = None

        # Try Nameberry first
        meaning = self.scrape_nameberry_meaning(name)
        if meaning:
            logger.info(f"Found Nameberry meaning for {name}: {meaning}")
            self.scraping_manager.mark_as_scraped(name, 'meaning_scraped', 'nameberry')
            return meaning

        # Try Behind the Name
        time.sleep(1)  # Rate limiting
        meaning = self.scrape_behindthename_meaning(name)
        if meaning:
            logger.info(f"Found Behind the Name meaning for {name}: {meaning}")
            self.scraping_manager.mark_as_scraped(name, 'meaning_scraped', 'behindthename')
            return meaning

        # Mark as attempted even if no meaning found
        self.scraping_manager.mark_as_scraped(name, 'meaning_scraped', 'attempted')
        logger.warning(f"No meaning found for {name}")

        return None

    def update_names_database(self, names_file: str, max_names: int = 1000):
        """
        Update names database with meanings for top N names
        """
        try:
            # Load names database
            with open(names_file, 'r', encoding='utf-8') as f:
                database = json.load(f)

            if 'names' not in database:
                logger.error("Invalid database format")
                return

            names_to_process = database['names'][:max_names]
            updated_count = 0

            logger.info(f"Processing meanings for top {len(names_to_process)} names...")

            for i, name_entry in enumerate(names_to_process):
                name = name_entry['name']

                # Skip if already has meaning
                if name_entry.get('meaning'):
                    continue

                logger.info(f"[{i+1}/{len(names_to_process)}] Processing: {name}")

                meaning = self.get_name_meaning(name)
                if meaning:
                    name_entry['meaning'] = meaning
                    updated_count += 1
                    logger.info(f"Added meaning for {name}: {meaning}")

                # Rate limiting
                time.sleep(0.5)

                # Save progress every 50 names
                if (i + 1) % 50 == 0:
                    logger.info(f"Saving progress... ({i+1} names processed)")
                    with open(names_file, 'w', encoding='utf-8') as f:
                        json.dump(database, f, indent=2, ensure_ascii=False)
                    self.scraping_manager.save_flags()

            # Final save
            with open(names_file, 'w', encoding='utf-8') as f:
                json.dump(database, f, indent=2, ensure_ascii=False)

            self.scraping_manager.save_flags()

            logger.info(f"Completed! Updated {updated_count} names with meanings")

        except Exception as e:
            logger.error(f"Error updating database: {e}")

def main():
    """
    Main function to scrape meanings for top 1000 names
    """
    import os

    # Path to names database
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    names_file = os.path.join(project_root, 'public', 'data', 'popularNames_cache.json')

    if not os.path.exists(names_file):
        logger.error(f"Names file not found: {names_file}")
        return

    scraper = NameMeaningScraper()
    scraper.update_names_database(names_file, max_names=1000)

if __name__ == '__main__':
    main()