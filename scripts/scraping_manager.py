#!/usr/bin/env python3
"""
Scraping Manager for BabyNames App
Manages scraping flags to prevent redundant data collection
"""

import json
import os
from datetime import datetime, timezone
from typing import Dict, List, Set, Optional, Any
from dataclasses import dataclass
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class ScrapingFlag:
    scraped: bool
    timestamp: str
    source: Optional[str] = None

class ScrapingManager:
    """
    Manages scraping flags for efficient data collection
    """

    # Data types that can be scraped
    DATA_TYPES = {
        'basic_info': 'Basic name information',
        'meaning_scraped': 'Name meaning and etymology',
        'popularity_data': 'Popularity rankings and trends',
        'pronunciation': 'Pronunciation data and audio',
        'cultural_info': 'Cultural significance and history',
        'variations': 'Name variations and alternatives',
        'wikipedia': 'Wikipedia articles and information',
        'social_media': 'Social media trends and mentions',
        'celebrity_data': 'Celebrity associations',
        'religious_data': 'Religious/spiritual significance'
    }

    def __init__(self, flags_file: str = None):
        """
        Initialize scraping manager

        Args:
            flags_file: Path to scraping flags JSON file
        """
        if flags_file is None:
            # Default to project data directory
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.flags_file = os.path.join(project_root, 'data', 'scraping_flags.json')
        else:
            self.flags_file = flags_file

        self.flags: Dict[str, Dict[str, Any]] = {}
        self.load_flags()

    def load_flags(self) -> None:
        """Load scraping flags from JSON file"""
        try:
            if os.path.exists(self.flags_file):
                with open(self.flags_file, 'r', encoding='utf-8') as f:
                    self.flags = json.load(f)
                logger.info(f"Loaded flags for {len(self.flags)} names")
            else:
                logger.info("No flags file found, starting fresh")
                self.flags = {}
        except Exception as e:
            logger.error(f"Error loading flags: {e}")
            self.flags = {}

    def save_flags(self) -> None:
        """Save scraping flags to JSON file"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.flags_file), exist_ok=True)

            with open(self.flags_file, 'w', encoding='utf-8') as f:
                json.dump(self.flags, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved flags for {len(self.flags)} names")
        except Exception as e:
            logger.error(f"Error saving flags: {e}")

    def has_been_scraped(self, name: str, data_type: str) -> bool:
        """
        Check if a specific data type has been scraped for a name

        Args:
            name: Name to check
            data_type: Type of data to check

        Returns:
            True if data has been scraped, False otherwise
        """
        name_lower = name.lower()

        if name_lower not in self.flags:
            return False

        name_flags = self.flags[name_lower]

        if data_type not in name_flags:
            return False

        return name_flags[data_type].get('scraped', False)

    def mark_as_scraped(self, name: str, data_type: str, source: str = None) -> None:
        """
        Mark a data type as scraped for a name

        Args:
            name: Name that was scraped
            data_type: Type of data that was scraped
            source: Source of the data (optional)
        """
        name_lower = name.lower()

        if name_lower not in self.flags:
            self.flags[name_lower] = {}

        self.flags[name_lower][data_type] = {
            'scraped': True,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'source': source
        }

        logger.debug(f"Marked {name} - {data_type} as scraped")

    def get_names_needing_scraping(
        self,
        all_names: List[str],
        data_type: str,
        max_names: int = None
    ) -> List[str]:
        """
        Get list of names that need scraping for a specific data type

        Args:
            all_names: List of all names to consider
            data_type: Data type to check
            max_names: Maximum number of names to return

        Returns:
            List of names that need scraping
        """
        names_needed = [
            name for name in all_names
            if not self.has_been_scraped(name, data_type)
        ]

        if max_names:
            names_needed = names_needed[:max_names]

        logger.info(f"Found {len(names_needed)} names needing {data_type} scraping")
        return names_needed

    def get_scraping_stats(self) -> Dict[str, Any]:
        """
        Get scraping statistics

        Returns:
            Dictionary with scraping statistics
        """
        total_names = len(self.flags)
        stats = {
            'total_names': total_names,
            'data_types': {}
        }

        for data_type in self.DATA_TYPES:
            scraped_count = sum(
                1 for name_flags in self.flags.values()
                if name_flags.get(data_type, {}).get('scraped', False)
            )

            percentage = (scraped_count / total_names * 100) if total_names > 0 else 0

            stats['data_types'][data_type] = {
                'scraped_count': scraped_count,
                'percentage': round(percentage, 1),
                'description': self.DATA_TYPES[data_type]
            }

        return stats

    def print_stats(self) -> None:
        """Print scraping statistics to console"""
        stats = self.get_scraping_stats()

        print(f"\n{'='*50}")
        print(f"SCRAPING STATISTICS")
        print(f"{'='*50}")
        print(f"Total names tracked: {stats['total_names']}")
        print()

        for data_type, type_stats in stats['data_types'].items():
            print(f"{type_stats['description']:30} "
                  f"{type_stats['scraped_count']:>6} "
                  f"({type_stats['percentage']:>5.1f}%)")
        print()

    def reset_flags(self, name: str = None, data_type: str = None) -> None:
        """
        Reset scraping flags

        Args:
            name: Specific name to reset (if None, resets all)
            data_type: Specific data type to reset (if None, resets all types)
        """
        if name is None:
            # Reset all flags
            self.flags = {}
            logger.info("Reset all scraping flags")
        else:
            name_lower = name.lower()
            if name_lower in self.flags:
                if data_type is None:
                    # Reset all data types for this name
                    del self.flags[name_lower]
                    logger.info(f"Reset all flags for {name}")
                else:
                    # Reset specific data type for this name
                    if data_type in self.flags[name_lower]:
                        del self.flags[name_lower][data_type]
                        logger.info(f"Reset {data_type} flag for {name}")

                        # Remove name entry if no flags left
                        if not self.flags[name_lower]:
                            del self.flags[name_lower]

    def get_name_progress(self, name: str) -> Dict[str, Any]:
        """
        Get scraping progress for a specific name

        Args:
            name: Name to check

        Returns:
            Dictionary with progress information
        """
        name_lower = name.lower()
        name_flags = self.flags.get(name_lower, {})

        core_data_types = ['basic_info', 'meaning_scraped', 'popularity_data', 'pronunciation']
        optional_data_types = ['cultural_info', 'variations', 'wikipedia', 'social_media']

        scraped_core = sum(
            1 for dt in core_data_types
            if name_flags.get(dt, {}).get('scraped', False)
        )

        scraped_optional = sum(
            1 for dt in optional_data_types
            if name_flags.get(dt, {}).get('scraped', False)
        )

        total_scraped = scraped_core + scraped_optional
        total_possible = len(core_data_types) + len(optional_data_types)

        return {
            'name': name,
            'core_complete': scraped_core,
            'core_total': len(core_data_types),
            'optional_complete': scraped_optional,
            'optional_total': len(optional_data_types),
            'total_complete': total_scraped,
            'total_possible': total_possible,
            'percentage': round((total_scraped / total_possible) * 100, 1),
            'is_core_complete': scraped_core == len(core_data_types),
            'scraped_types': [
                dt for dt in self.DATA_TYPES
                if name_flags.get(dt, {}).get('scraped', False)
            ],
            'missing_types': [
                dt for dt in self.DATA_TYPES
                if not name_flags.get(dt, {}).get('scraped', False)
            ]
        }

    def export_for_frontend(self) -> str:
        """
        Export flags in format suitable for frontend import

        Returns:
            JSON string compatible with frontend ScrapingFlagsService
        """
        return json.dumps(self.flags, indent=2)

    def import_from_frontend(self, json_data: str) -> None:
        """
        Import flags from frontend format

        Args:
            json_data: JSON string from frontend
        """
        try:
            imported_flags = json.loads(json_data)

            # Merge with existing flags
            for name, name_flags in imported_flags.items():
                if name not in self.flags:
                    self.flags[name] = {}

                self.flags[name].update(name_flags)

            logger.info(f"Imported flags for {len(imported_flags)} names")

        except Exception as e:
            logger.error(f"Error importing flags: {e}")

# Example usage functions
def load_names_from_json(file_path: str) -> List[str]:
    """Load names from a JSON database file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if 'names' in data and isinstance(data['names'], list):
            return [entry['name'] for entry in data['names'] if 'name' in entry]
        else:
            logger.error("Invalid JSON format - expected 'names' array")
            return []

    except Exception as e:
        logger.error(f"Error loading names: {e}")
        return []

def main():
    """Example usage of ScrapingManager"""
    manager = ScrapingManager()

    # Print current statistics
    manager.print_stats()

    # Example: Mark some names as scraped
    example_names = ['Emma', 'Liam', 'Olivia', 'Noah']

    for name in example_names:
        manager.mark_as_scraped(name, 'basic_info', 'example_scraper')
        manager.mark_as_scraped(name, 'meaning_scraped', 'etymology_api')

    # Save the flags
    manager.save_flags()

    # Show progress for a specific name
    progress = manager.get_name_progress('Emma')
    print(f"\nProgress for Emma: {progress['percentage']}% complete")
    print(f"Missing: {', '.join(progress['missing_types'])}")

if __name__ == '__main__':
    main()