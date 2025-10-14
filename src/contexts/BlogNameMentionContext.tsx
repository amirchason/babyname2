/**
 * Blog Name Mention Context
 * Tracks which names have been mentioned in a blog post to show heart button only on first mention
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BlogNameMentionContextType {
  mentionedNames: Set<string>;
  markAsMentioned: (name: string) => boolean; // Returns true if this is the first mention
  clearMentions: () => void;
}

const BlogNameMentionContext = createContext<BlogNameMentionContextType | undefined>(undefined);

export const BlogNameMentionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mentionedNames, setMentionedNames] = useState<Set<string>>(new Set());

  const markAsMentioned = (name: string): boolean => {
    const normalizedName = name.toLowerCase().trim();
    const isFirstMention = !mentionedNames.has(normalizedName);

    if (isFirstMention) {
      setMentionedNames(prev => new Set(prev).add(normalizedName));
    }

    return isFirstMention;
  };

  const clearMentions = () => {
    setMentionedNames(new Set());
  };

  return (
    <BlogNameMentionContext.Provider value={{ mentionedNames, markAsMentioned, clearMentions }}>
      {children}
    </BlogNameMentionContext.Provider>
  );
};

export const useBlogNameMention = () => {
  const context = useContext(BlogNameMentionContext);
  if (context === undefined) {
    throw new Error('useBlogNameMention must be used within a BlogNameMentionProvider');
  }
  return context;
};
