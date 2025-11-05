/**
 * ENRICHED NAME PROFILE - V13 Display Component
 *
 * Displays v13 super-enriched name data with beautiful design
 */

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { V13EnrichedData } from '../services/v13Service';

interface EnrichedNameProfileProps {
  data: V13EnrichedData;
  onClose: () => void;
}

const EnrichedNameProfile: React.FC<EnrichedNameProfileProps> = ({ data, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const isExpanded = (section: string) => expandedSections.has(section);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-blue-400/20 backdrop-blur-xl p-8 rounded-t-3xl border-b border-white/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              V13 SUPER ENRICHED
            </div>

            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
              {data.name}
            </h1>

            <p className="text-2xl text-gray-600 italic mb-4">{data.meaning}</p>

            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-white/60 rounded-full text-sm">
                {data.origin}
              </span>
              <span className="px-3 py-1 bg-white/60 rounded-full text-sm capitalize">
                {data.gender}
              </span>
              {data.ranking && (
                <span className="px-3 py-1 bg-white/60 rounded-full text-sm">
                  Rank #{data.ranking.current}
                </span>
              )}
              <span className="px-3 py-1 bg-purple-500/20 rounded-full text-sm">
                {data.versionsIncluded?.join(', ')}
                </span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-6 space-y-4">
          {/* Overview Section */}
          <AccordionSection
            title="Complete Overview"
            icon="📖"
            isExpanded={isExpanded('overview')}
            onToggle={() => toggleSection('overview')}
          >
            <div className="grid gap-4">
              {data.culturalSignificance && (
                <Card title="Cultural Significance">
                  <p className="text-gray-700">{data.culturalSignificance}</p>
                </Card>
              )}

              {data.modernContext && (
                <Card title="Modern Context">
                  <p className="text-gray-700">{data.modernContext}</p>
                </Card>
              )}

              {data.personality && (
                <Card title="Personality Traits">
                  <p className="text-gray-700">{data.personality}</p>
                </Card>
              )}

              {data.symbolism && (
                <Card title="Symbolism">
                  <p className="text-gray-700">{data.symbolism}</p>
                </Card>
              )}

              {data.funFact && (
                <Card title="Fun Fact" className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300">
                  <p className="text-gray-700">{data.funFact}</p>
                </Card>
              )}

              {/* Variations, Similar Names, Nicknames */}
              {data.variations && data.variations.length > 0 && (
                <Card title="Variations">
                  <div className="flex flex-wrap gap-2">
                    {data.variations.slice(0, 9).map((v, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 rounded-full text-sm">
                        {v}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {data.similarNames && data.similarNames.length > 0 && (
                <Card title="Similar Names">
                  <div className="flex flex-wrap gap-2">
                    {data.similarNames.slice(0, 9).map((n, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 rounded-full text-sm">
                        {n}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {data.nicknames && data.nicknames.length > 0 && (
                <Card title="Nicknames">
                  <div className="flex flex-wrap gap-2">
                    {data.nicknames.slice(0, 9).map((n, i) => (
                      <span key={i} className="px-3 py-1 bg-pink-100 rounded-full text-sm">
                        {n}
                      </span>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </AccordionSection>

          {/* Famous People Section */}
          {(data.famousPeople || data.famousAthletes || data.historicFigures) && (
            <AccordionSection
              title="Famous People & Athletes"
              icon="👥"
              isExpanded={isExpanded('famous')}
              onToggle={() => toggleSection('famous')}
            >
              <div className="space-y-4">
                {data.famousPeople && data.famousPeople.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-600 mb-2">Famous People</h4>
                    <div className="space-y-2">
                      {data.famousPeople.map((person, i) => (
                        <div key={i} className="p-3 bg-white/60 rounded-lg">
                          <p className="font-medium">{person.name}</p>
                          <p className="text-sm text-gray-600">{person.profession}</p>
                          {person.awards && <p className="text-xs text-gray-500 mt-1">{person.awards}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.famousAthletes && data.famousAthletes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">Famous Athletes</h4>
                    <div className="space-y-2">
                      {data.famousAthletes.map((athlete, i) => (
                        <div key={i} className="p-3 bg-white/60 rounded-lg">
                          <p className="font-medium">{athlete.name}</p>
                          <p className="text-sm text-gray-600">{athlete.sport} • {athlete.team}</p>
                          {athlete.achievements && <p className="text-xs text-gray-500 mt-1">{athlete.achievements}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.historicFigures && data.historicFigures.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2">Historic Figures</h4>
                    <div className="space-y-2">
                      {data.historicFigures.map((figure, i) => (
                        <div key={i} className="p-3 bg-white/60 rounded-lg">
                          <p className="font-medium">{figure.fullName}</p>
                          <p className="text-sm text-gray-600">{figure.years} • {figure.category}</p>
                          <p className="text-xs text-gray-700 mt-1">{figure.significance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionSection>
          )}

          {/* Pop Culture Section */}
          {(data.moviesAndShows || data.songs || data.booksWithName) && (
            <AccordionSection
              title="Pop Culture & Media"
              icon="🎬"
              isExpanded={isExpanded('popculture')}
              onToggle={() => toggleSection('popculture')}
            >
              <div className="space-y-4">
                {data.moviesAndShows && data.moviesAndShows.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-600 mb-2">Movies & Shows</h4>
                    <div className="space-y-2">
                      {data.moviesAndShows.map((media, i) => (
                        <div key={i} className="p-3 bg-white/60 rounded-lg">
                          <p className="font-medium">{media.title} ({media.year})</p>
                          <p className="text-sm text-gray-600">{media.characterName}</p>
                          <p className="text-xs text-gray-500 mt-1">{media.genre}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.songs && data.songs.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-pink-600 mb-2">Songs</h4>
                    <div className="space-y-2">
                      {data.songs.map((song, i) => (
                        <div key={i} className="p-3 bg-white/60 rounded-lg">
                          <p className="font-medium">{song.title}</p>
                          <p className="text-sm text-gray-600">{song.artist} ({song.year})</p>
                          <p className="text-xs text-gray-700 mt-1">{song.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.booksWithName && data.booksWithName.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">Books</h4>
                    <div className="space-y-2">
                      {data.booksWithName.map((book, i) => (
                        <div key={i} className="p-3 bg-white/60 rounded-lg">
                          <p className="font-medium">{book.title}</p>
                          <p className="text-sm text-gray-600">{book.author} ({book.publishedYear})</p>
                          <p className="text-xs text-gray-700 mt-1">{book.significance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionSection>
          )}

          {/* Celestial Data Section */}
          {data.celestialData && (
            <AccordionSection
              title="Celestial & Numerology"
              icon="✨"
              isExpanded={isExpanded('celestial')}
              onToggle={() => toggleSection('celestial')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <Card title="Lucky Numbers & Colors">
                  <div className="space-y-2">
                    <p><span className="font-medium">Lucky Number:</span> {data.celestialData.luckyNumber}</p>
                    <p><span className="font-medium">Lucky Color:</span> {data.celestialData.luckyColor?.name}</p>
                    <p><span className="font-medium">Lucky Gemstone:</span> {data.celestialData.luckyGemstone}</p>
                    <p><span className="font-medium">Lucky Day:</span> {data.celestialData.luckyDay}</p>
                  </div>
                </Card>

                <Card title="Cosmic Elements">
                  <div className="space-y-2">
                    <p><span className="font-medium">Element:</span> {data.celestialData.dominantElement}</p>
                    <p><span className="font-medium">Moon Phase:</span> {data.celestialData.moonPhase}</p>
                    <p><span className="font-medium">Archetype:</span> {data.celestialData.celestialArchetype}</p>
                  </div>
                </Card>

                {data.celestialData.compatibleSigns && (
                  <Card title="Compatible Signs" className="md:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {data.celestialData.compatibleSigns.map((sign, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-100 rounded-full text-sm">
                          {sign}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </AccordionSection>
          )}

          {/* Blog Content Section */}
          {data.v11BlogContent && (
            <AccordionSection
              title="Expert Analysis"
              icon="📝"
              isExpanded={isExpanded('blog')}
              onToggle={() => toggleSection('blog')}
            >
              <div className="space-y-4">
                <div className="text-sm text-gray-500 mb-4">
                  By {data.v11WriterName} • {data.v11WriterTitle}
                </div>

                {data.v11BlogContent.opening_hook && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">{data.v11BlogContent.opening_hook}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {data.v11BlogContent.etymology_meaning && (
                    <Card title="Etymology & Meaning">
                      <p className="text-sm text-gray-700">{data.v11BlogContent.etymology_meaning}</p>
                    </Card>
                  )}

                  {data.v11BlogContent.personality_profile && (
                    <Card title="Personality Profile">
                      <p className="text-sm text-gray-700">{data.v11BlogContent.personality_profile}</p>
                    </Card>
                  )}
                </div>

                {data.v11BlogContent.final_recommendation && (
                  <Card title="Final Recommendation" className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
                    <p className="text-sm text-gray-700">{data.v11BlogContent.final_recommendation}</p>
                  </Card>
                )}
              </div>
            </AccordionSection>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-b-3xl text-center text-sm text-gray-600">
          <p>Enriched {new Date(data.enrichedAt).toLocaleDateString()} • V13 Super Enriched Profile</p>
        </div>
      </div>
    </div>
  );
};

// Accordion Section Component
const AccordionSection: React.FC<{
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon, isExpanded, onToggle, children }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/40 shadow-lg">
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
    </button>

    {isExpanded && (
      <div className="p-4 pt-0 animate-fadeIn">
        {children}
      </div>
    )}
  </div>
);

// Card Component
const Card: React.FC<{
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = '' }) => (
  <div className={`p-4 bg-white/40 rounded-xl border border-white/40 ${className}`}>
    {title && <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>}
    {children}
  </div>
);

export default EnrichedNameProfile;
