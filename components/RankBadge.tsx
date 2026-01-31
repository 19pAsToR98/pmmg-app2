
import React from 'react';
import { UserRank } from '../types';

interface RankBadgeProps {
  rank: UserRank;
  size?: 'sm' | 'md' | 'lg';
}

const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 'md' }) => {
  const scale = size === 'sm' ? 0.6 : size === 'lg' ? 1.2 : 1;
  const width = rank === 'Subtenente' ? 40 * scale : 60 * scale;
  const height = rank === 'Subtenente' ? 80 * scale : 60 * scale;

  const renderChevrons = () => {
    const count = rank === 'Soldado' ? 1 : 
                 rank === 'Cabo' ? 2 : 
                 rank === '3º Sargento' ? 3 : 
                 rank === '2º Sargento' ? 4 : 
                 rank === '1º Sargento' ? 5 : 0;
    
    return Array.from({ length: count }).map((_, i) => (
      <path
        key={i}
        d={`M 10 ${25 - i * 4} L 30 ${15 - i * 4} L 50 ${25 - i * 4}`}
        fill="none"
        stroke="#ffcc00"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ));
  };

  if (rank === 'Subtenente') {
    return (
      <svg width={width} height={height} viewBox="0 0 40 80" className="drop-shadow-md">
        <rect x="2" y="5" width="36" height="70" rx="2" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        <circle cx="20" cy="15" r="4" fill="#d4af37" />
        <path d="M 20 40 L 32 60 L 8 60 Z" fill="none" stroke="#ffcc00" strokeWidth="2.5" />
      </svg>
    );
  }

  return (
    <svg width={width} height={height} viewBox="0 0 60 60" className="drop-shadow-md">
      {/* Background shape */}
      <path 
        d="M 5 20 L 30 5 L 55 20 L 55 50 Q 55 55 50 55 L 10 55 Q 5 55 5 50 Z" 
        fill="#1a1a1a" 
        stroke="#333" 
        strokeWidth="1" 
      />
      {/* Chevrons */}
      {renderChevrons()}
      {/* Crossed Pistols Symbol (Simplified) */}
      <g transform="translate(30, 45) scale(0.6)" opacity="0.8">
        <path d="M -10 -5 L 10 5 M -10 5 L 10 -5" stroke="#ffcc00" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="2" fill="#ffcc00" />
      </g>
    </svg>
  );
};

export default RankBadge;
