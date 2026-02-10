import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-secondary-800/30 border border-secondary-700/50 overflow-hidden"
        >
          {/* Category header skeleton */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-secondary-700 rounded" />
              <div className="h-5 w-32 bg-secondary-700 rounded" />
              <div className="h-4 w-8 bg-secondary-700 rounded" />
            </div>
            <div className="w-24 h-1.5 bg-secondary-700 rounded-full" />
          </div>

          {/* Problem rows skeleton */}
          <div className="px-4 pb-4 space-y-2">
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary-700 rounded-full" />
                  <div className="h-4 w-36 bg-secondary-700 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-14 bg-secondary-700 rounded-full" />
                  <div className="h-7 w-20 bg-secondary-700 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
