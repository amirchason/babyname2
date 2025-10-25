import React from 'react';
import { NameEntry } from '../services/nameService';
import NameProfile from './NameProfile';

interface NameDetailModalProps {
  name: NameEntry | null;
  onClose: () => void;
  contextualRank?: number;
}

const NameDetailModal: React.FC<NameDetailModalProps> = ({ name, onClose, contextualRank }) => {
  if (!name) return null;

  return <NameProfile name={name} onClose={onClose} contextualRank={contextualRank} />;
};

export default NameDetailModal;
