'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ProblemStatusValue } from '@/types';

interface StatusDropdownProps {
  currentStatus?: ProblemStatusValue;
  onStatusChange: (status: ProblemStatusValue) => void;
}

const statusOptions: { value: ProblemStatusValue; label: string; color: string; icon: string }[] = [
  {
    value: 'pass',
    label: 'Pass',
    color: 'text-green-400',
    icon: 'M5 13l4 4L19 7',
  },
  {
    value: 'fail',
    label: 'Fail',
    color: 'text-red-400',
    icon: 'M6 18L18 6M6 6l12 12',
  },
  {
    value: 'completed',
    label: 'Completed',
    color: 'text-blue-400',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

const statusColors: Record<ProblemStatusValue, string> = {
  pass: 'bg-green-500/15 text-green-400 border-green-500/30',
  fail: 'bg-red-500/15 text-red-400 border-red-500/30',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (status: ProblemStatusValue) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
          currentStatus
            ? statusColors[currentStatus]
            : 'bg-secondary-700/50 text-secondary-400 border-secondary-600 hover:border-secondary-500'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {currentStatus
          ? statusOptions.find((s) => s.value === currentStatus)?.label
          : 'Set Status'}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-1 w-36 rounded-xl bg-secondary-800 border border-secondary-700 shadow-xl py-1 dropdown-enter"
          role="listbox"
        >
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium transition-colors duration-150 ${
                currentStatus === option.value
                  ? `${option.color} bg-secondary-700/50`
                  : 'text-secondary-300 hover:bg-secondary-700/50 hover:text-white'
              }`}
              role="option"
              aria-selected={currentStatus === option.value}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
              </svg>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
