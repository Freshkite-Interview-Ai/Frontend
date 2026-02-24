import React from 'react';
import { ProblemDifficulty } from '@/types';

interface DifficultyBadgeProps {
  difficulty: ProblemDifficulty;
}

const config: Record<ProblemDifficulty, { label: string; className: string }> = {
  Easy: {
    label: 'Easy',
    className: 'bg-green-500/15 text-green-400 border border-green-500/20',
  },
  Medium: {
    label: 'Medium',
    className: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  },
  Hard: {
    label: 'Hard',
    className: 'bg-red-500/15 text-red-400 border border-red-500/20',
  },
};

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const { label, className } = config[difficulty];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
};

export default DifficultyBadge;
