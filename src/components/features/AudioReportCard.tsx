'use client';

import React from 'react';
import { AudioReport } from '@/types';
import { Card, CardContent, Badge } from '@/components/ui';

interface AudioReportCardProps {
  report: AudioReport;
  className?: string;
}

export const AudioReportCard: React.FC<AudioReportCardProps> = ({
  report,
  className = '',
}) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'success';
    if (rating >= 6) return 'warning';
    if (rating >= 4) return 'info';
    return 'danger';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 8) return 'Excellent';
    if (rating >= 6) return 'Good';
    if (rating >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <Card className={className}>
      <CardContent>
        {/* Header with Rating */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-secondary-900">Analysis Report</h2>
            <p className="text-sm text-secondary-500">
              Generated on {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary-900">{report.overallRating}/10</div>
            <Badge variant={getRatingColor(report.overallRating)}>
              {getRatingLabel(report.overallRating)}
            </Badge>
          </div>
        </div>

        {/* Strengths */}
        {report.strengths.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 font-semibold text-secondary-900 mb-3">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Strengths
            </h3>
            <ul className="space-y-2">
              {report.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-secondary-700">
                  <span className="text-green-500 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missed Points */}
        {report.missedPoints.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 font-semibold text-secondary-900 mb-3">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Missed Points
            </h3>
            <ul className="space-y-2">
              {report.missedPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-secondary-700">
                  <span className="text-amber-500 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {report.improvements.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 font-semibold text-secondary-900 mb-3">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Suggestions for Improvement
            </h3>
            <ul className="space-y-2">
              {report.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-secondary-700">
                  <span className="text-blue-500 mt-1">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Communication Feedback */}
        {report.communicationFeedback && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 font-semibold text-secondary-900 mb-3">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              Communication Feedback
            </h3>
            <p className="text-secondary-700 bg-purple-50 p-4 rounded-lg">
              {report.communicationFeedback}
            </p>
          </div>
        )}

        {/* Transcript */}
        {report.transcript && (
          <div className="border-t border-secondary-100 pt-6">
            <details className="group">
              <summary className="flex items-center gap-2 font-semibold text-secondary-900 cursor-pointer">
                <svg className="w-5 h-5 text-secondary-500 group-open:rotate-90 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                View Transcript
              </summary>
              <div className="mt-3 p-4 bg-secondary-50 rounded-lg text-secondary-700 text-sm leading-relaxed">
                {report.transcript}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
