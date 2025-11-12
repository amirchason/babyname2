import React, { useState, useEffect } from 'react';
import { NameEntry } from '../services/nameService';
import NameProfile from './NameProfile';
import EnrichedNameProfile from './EnrichedNameProfile';
import v13Service, { V13EnrichedData } from '../services/v13Service';

interface NameDetailModalProps {
  name: NameEntry | null;
  onClose: () => void;
  contextualRank?: number;
}

const NameDetailModal: React.FC<NameDetailModalProps> = ({ name, onClose, contextualRank }) => {
  const [v13Data, setV13Data] = useState<V13EnrichedData | null>(null);
  const [isLoadingV13, setIsLoadingV13] = useState(false);

  useEffect(() => {
    if (!name) {
      setV13Data(null);
      return;
    }

    // Check if this name has v13 enriched data
    if (v13Service.isEnriched(name.name)) {
      setIsLoadingV13(true);
      v13Service.load(name.name)
        .then(data => {
          setV13Data(data);
          setIsLoadingV13(false);
        })
        .catch(error => {
          console.error('Failed to load v13 data:', error);
          setIsLoadingV13(false);
        });
    } else {
      setV13Data(null);
    }
  }, [name]);

  if (!name) return null;

  // Show v13 enriched profile if available
  if (v13Data) {
    return <EnrichedNameProfile data={v13Data} onClose={onClose} />;
  }

  // Show loading state while v13 data is being fetched
  if (isLoadingV13) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading enriched profile...</p>
        </div>
      </div>
    );
  }

  // Fall back to regular profile
  return <NameProfile name={name} onClose={onClose} contextualRank={contextualRank} />;
};

export default NameDetailModal;
