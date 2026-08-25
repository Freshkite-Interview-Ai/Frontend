'use client';

import React from 'react';
import { SpeakingGuidance } from '@/types';

interface SpeakingGuidanceSectionProps {
  guidance?: SpeakingGuidance | null;
  className?: string;
}

/** True when the guidance object has anything worth rendering. */
export function hasSpeakingGuidance(guidance?: SpeakingGuidance | null): boolean {
  if (!guidance) return false;
  return (
    guidance.speakingStructure?.length > 0 ||
    guidance.keyPointsMissed?.length > 0 ||
    guidance.whatYouShouldSay?.length > 0 ||
    Boolean(guidance.interviewReadyVersion) ||
    guidance.speakingTips?.length > 0
  );
}

const SubHeading: React.FC<{ step: number; title: string; children?: React.ReactNode }> = ({
  step,
  title,
  children,
}) => (
  <div className="flex items-center gap-3 mb-3">
    <span className="w-7 h-7 flex-shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold flex items-center justify-center">
      {step}
    </span>
    <h4 className="font-semibold text-secondary-900 dark:text-white">{title}</h4>
    {children}
  </div>
);

export const SpeakingGuidanceSection: React.FC<SpeakingGuidanceSectionProps> = ({
  guidance,
  className = '',
}) => {
  if (!hasSpeakingGuidance(guidance)) return null;

  const g = guidance as SpeakingGuidance;

  return (
    <section
      className={`rounded-2xl border border-indigo-100 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 ${className}`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-4a3 3 0 003-3V5a3 3 0 10-6 0v10a3 3 0 003 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
            How You Should Explain This Concept
          </h3>
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            A better way to say it next time
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Speaking Structure */}
        {g.speakingStructure?.length > 0 && (
          <div>
            <SubHeading step={1} title="Speaking Structure" />
            <ol className="space-y-2">
              {g.speakingStructure.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-secondary-700 dark:text-secondary-300"
                >
                  <span className="text-indigo-500 dark:text-indigo-400 font-medium flex-shrink-0">
                    {index + 1}.
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 2. Key Points You Missed */}
        {g.keyPointsMissed?.length > 0 && (
          <div>
            <SubHeading step={2} title="Key Points You Missed" />
            <ul className="space-y-2">
              {g.keyPointsMissed.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-secondary-700 dark:text-secondary-300"
                >
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. What You Should Say */}
        {g.whatYouShouldSay?.length > 0 && (
          <div>
            <SubHeading step={3} title="What You Should Say" />
            <div className="space-y-3">
              {g.whatYouShouldSay.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm leading-relaxed text-secondary-700 dark:text-secondary-300"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 4. Interview-Ready Version */}
        {g.interviewReadyVersion && (
          <div>
            <SubHeading step={4} title="Interview-Ready Version" />
            <blockquote className="border-l-4 border-indigo-400 dark:border-indigo-500 bg-white dark:bg-secondary-800/60 rounded-r-xl p-4 text-sm leading-relaxed text-secondary-800 dark:text-secondary-200 italic">
              {g.interviewReadyVersion}
            </blockquote>
          </div>
        )}

        {/* 5. Speaking Tips */}
        {g.speakingTips?.length > 0 && (
          <div>
            <SubHeading step={5} title="Speaking Tips" />
            <ul className="space-y-2">
              {g.speakingTips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-secondary-700 dark:text-secondary-300"
                >
                  <span className="text-indigo-500 mt-0.5 flex-shrink-0">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
