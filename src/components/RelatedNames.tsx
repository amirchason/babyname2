import React, { useEffect, useState } from 'react';
import { Link2 } from 'lucide-react';
import { NameEntry } from '../services/nameService';
import nameService from '../services/nameService';

interface RelatedNamesProps {
  currentName: NameEntry;
  onNameClick?: (name: NameEntry) => void;
}

/**
 * RelatedNames Component
 *
 * Displays related baby names based on:
 * - Same origin
 * - Same gender
 * - Similar popularity
 * - Same meaning keywords
 *
 * CRITICAL for SEO: Creates internal links between name pages,
 * reducing orphaned pages and improving crawlability.
 */
const RelatedNames: React.FC<RelatedNamesProps> = ({ currentName, onNameClick }) => {
  const [relatedNames, setRelatedNames] = useState<NameEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    findRelatedNames();
  }, [currentName]);

  const findRelatedNames = async () => {
    setLoading(true);

    try {
      const allNames = nameService.getAllNames();

      // Find names with same origin
      const sameOrigin = allNames.filter(
        (name) =>
          name.name !== currentName.name &&
          name.origin === currentName.origin &&
          name.gender === currentName.gender
      );

      // Find names with similar meaning (check for common keywords)
      const similarMeaning = allNames.filter((name) => {
        if (name.name === currentName.name) return false;
        if (!name.meaning || !currentName.meaning) return false;

        const currentWords = currentName.meaning.toLowerCase().split(' ');
        const nameWords = name.meaning.toLowerCase().split(' ');

        // Check if they share at least 2 meaningful words
        const sharedWords = currentWords.filter(
          (word) => word.length > 4 && nameWords.includes(word)
        );

        return sharedWords.length >= 2;
      });

      // Find names with same gender but different origin
      const sameGender = allNames.filter(
        (name) =>
          name.name !== currentName.name &&
          name.gender === currentName.gender &&
          name.origin !== currentName.origin
      );

      // Combine and deduplicate
      const combined = [...sameOrigin, ...similarMeaning, ...sameGender];
      const unique = Array.from(new Set(combined.map((n) => n.name))).map((name) =>
        combined.find((n) => n.name === name)!
      );

      // Take top 6 related names
      setRelatedNames(unique.slice(0, 6));
    } catch (error) {
      console.error('Error finding related names:', error);
      setRelatedNames([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-3 px-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
        <div className="flex items-center gap-1.5 text-gray-600 mb-2">
          <Link2 className="w-4 h-4" />
          <h3 className="font-semibold text-sm">Related Names</h3>
        </div>
        <div className="text-gray-500 text-xs">Finding similar names...</div>
      </div>
    );
  }

  if (relatedNames.length === 0) {
    return null; // Don't show if no related names found
  }

  return (
    <div className="py-3 px-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
      <div className="flex items-center gap-1.5 text-gray-700 mb-2">
        <Link2 className="w-4 h-4" />
        <h3 className="font-semibold text-sm">You Might Also Like</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {relatedNames.map((name) => (
          <button
            key={name.name}
            onClick={() => onNameClick?.(name)}
            className="p-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow text-left group"
          >
            <div className="font-semibold text-sm text-gray-800 group-hover:text-purple-600 transition-colors truncate">
              {name.name}
            </div>
            <div className="text-[10px] text-gray-500 truncate">{name.origin}</div>
          </button>
        ))}
      </div>

      {/* SEO enhancement: Add text links for better crawlability */}
      <div className="sr-only">
        <p>Related baby names similar to {currentName.name}:</p>
        <ul>
          {relatedNames.map((name) => (
            <li key={name.name}>
              <a href={`#${name.name}`} onClick={() => onNameClick?.(name)}>
                {name.name} - {name.origin} name meaning {name.meaning}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RelatedNames;
