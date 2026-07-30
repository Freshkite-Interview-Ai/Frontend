import React from 'react';

interface TokenCostBadgeProps {
  /** Number of tokens the action costs */
  cost: number;
  /** Leading label, e.g. "AI Cost" */
  label?: string;
  className?: string;
}

/**
 * Compact, visually lightweight badge for showing an action's token cost.
 * Intentionally small - it informs without dominating the page.
 */
export const TokenCostBadge: React.FC<TokenCostBadgeProps> = ({
  cost,
  label = 'AI Cost',
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-900/25 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200 ${className}`}
    title={`${label}: ${cost} tokens per analysis`}
  >
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
    </svg>
    <span className="text-amber-700/80 dark:text-amber-300/80">{label}</span>
    <span className="font-semibold tabular-nums">{cost} Tokens</span>
  </span>
);

export default TokenCostBadge;
