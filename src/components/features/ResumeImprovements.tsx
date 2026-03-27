'use client';

import React, { useState } from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import { Improvement, ImprovementPriority, ImprovementType } from '@/types';

interface ResumeImprovementsProps {
  improvements: Improvement[];
}

const PRIORITY_CONFIG: Record<ImprovementPriority, { label: string; color: string; bgColor: string; borderColor: string; dotColor: string }> = {
  high: {
    label: 'High Priority',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-l-red-500',
    dotColor: 'bg-red-500',
  },
  medium: {
    label: 'Medium Priority',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-l-amber-500',
    dotColor: 'bg-amber-500',
  },
  low: {
    label: 'Low Priority',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-l-green-500',
    dotColor: 'bg-green-500',
  },
};

const TYPE_CONFIG: Record<ImprovementType, { label: string; icon: string; variant: 'primary' | 'success' | 'warning' | 'danger' }> = {
  keyword: { label: 'Keywords', icon: '🔑', variant: 'primary' },
  format: { label: 'Formatting', icon: '📐', variant: 'warning' },
  impact: { label: 'Impact', icon: '📈', variant: 'success' },
  ats: { label: 'ATS', icon: '🤖', variant: 'danger' },
};

export const ResumeImprovements: React.FC<ResumeImprovementsProps> = ({ improvements }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<ImprovementType | 'all'>('all');

  if (!improvements || improvements.length === 0) return null;

  const filtered = activeFilter === 'all'
    ? improvements
    : improvements.filter((i) => i.type === activeFilter);

  const grouped = {
    high: filtered.filter((i) => i.priority === 'high'),
    medium: filtered.filter((i) => i.priority === 'medium'),
    low: filtered.filter((i) => i.priority === 'low'),
  };

  const typeCounts = {
    keyword: improvements.filter((i) => i.type === 'keyword').length,
    format: improvements.filter((i) => i.type === 'format').length,
    impact: improvements.filter((i) => i.type === 'impact').length,
    ats: improvements.filter((i) => i.type === 'ats').length,
  };

  const priorityCounts = {
    high: improvements.filter((i) => i.priority === 'high').length,
    medium: improvements.filter((i) => i.priority === 'medium').length,
    low: improvements.filter((i) => i.priority === 'low').length,
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  let globalIndex = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
              AI Improvement Suggestions
            </h3>
          </div>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
            {improvements.length} suggestion{improvements.length !== 1 ? 's' : ''} to strengthen your resume
          </p>
        </div>
        {/* Summary pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {priorityCounts.high > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {priorityCounts.high}
            </span>
          )}
          {priorityCounts.medium > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {priorityCounts.medium}
            </span>
          )}
          {priorityCounts.low > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {priorityCounts.low}
            </span>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            activeFilter === 'all'
              ? 'bg-secondary-900 dark:bg-white text-white dark:text-secondary-900'
              : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
          }`}
        >
          All ({improvements.length})
        </button>
        {(['keyword', 'format', 'impact', 'ats'] as ImprovementType[]).map((type) => {
          if (typeCounts[type] === 0) return null;
          const config = TYPE_CONFIG[type];
          return (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                activeFilter === type
                  ? 'bg-secondary-900 dark:bg-white text-white dark:text-secondary-900'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
              }`}
            >
              {config.icon} {config.label} ({typeCounts[type]})
            </button>
          );
        })}
      </div>

      {/* Grouped suggestions */}
      {(['high', 'medium', 'low'] as ImprovementPriority[]).map((priority) => {
        const items = grouped[priority];
        if (items.length === 0) return null;
        const config = PRIORITY_CONFIG[priority];

        return (
          <div key={priority}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
              <h4 className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                {config.label} ({items.length})
              </h4>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => {
                const currentGlobalIndex = globalIndex++;
                const isExpanded = expandedIndex === currentGlobalIndex;
                const typeConfig = TYPE_CONFIG[item.type];

                return (
                  <div
                    key={`${priority}-${index}`}
                    className={`border-l-4 ${config.borderColor} rounded-lg bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 overflow-hidden transition-all`}
                  >
                    {/* Collapsed header - always visible */}
                    <button
                      onClick={() => toggleExpand(currentGlobalIndex)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary-50 dark:hover:bg-secondary-750 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{typeConfig.icon}</span>
                          <Badge variant={typeConfig.variant}>
                            {typeConfig.label}
                          </Badge>
                          <span className="text-xs text-secondary-400 dark:text-secondary-500">
                            {item.section}
                          </span>
                        </div>
                        <p className="text-sm text-secondary-700 dark:text-secondary-300 truncate">
                          {item.reason}
                        </p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-secondary-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-secondary-100 dark:border-secondary-700">
                        <div className="pt-3">
                          {item.currentText && (
                            <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-xs font-medium text-red-600 dark:text-red-400">Current</span>
                              </div>
                              <p className="text-sm text-red-800 dark:text-red-300 line-through">{item.currentText}</p>
                            </div>
                          )}

                          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                {item.currentText ? 'Suggested' : 'Add this'}
                              </span>
                            </div>
                            <p className="text-sm text-green-800 dark:text-green-300">{item.suggestedText}</p>
                          </div>
                        </div>

                        <p className="text-xs text-secondary-500 dark:text-secondary-400 italic">
                          {item.reason}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResumeImprovements;
