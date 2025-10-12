import React from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Admin Badge Component
 * Displays an admin badge for users with admin privileges
 */
const AdminBadge: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full shadow-sm">
      <Shield className="w-3 h-3" strokeWidth={2.5} />
      <span>ADMIN</span>
    </div>
  );
};

export default AdminBadge;
