'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { recruitmentTestService } from '@/services/recruitmentTestService';

interface UseAntiCheatOptions {
  attemptId: string;
  enabled: boolean;
  onTerminated?: () => void;
}

export function useAntiCheat({ attemptId, enabled, onTerminated }: UseAntiCheatOptions) {
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const violationRef = useRef(0);

  const reportViolation = useCallback(async (type: string) => {
    if (!enabled) return;
    try {
      const res = await recruitmentTestService.reportViolation(attemptId, type);
      const newCount = res.data?.violations ?? violationRef.current + 1;
      violationRef.current = newCount;
      setViolations(newCount);
      if (res.data?.terminated) {
        onTerminated?.();
      }
    } catch {
      // Silently fail - don't block the user
    }
  }, [attemptId, enabled, onTerminated]);

  // Tab visibility change detection
  useEffect(() => {
    if (!enabled) return;
    const handleVisibility = () => {
      if (document.hidden) {
        reportViolation('tab_switch');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, reportViolation]);

  // Focus/blur detection
  useEffect(() => {
    if (!enabled) return;
    const handleBlur = () => {
      reportViolation('tab_switch');
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [enabled, reportViolation]);

  // Fullscreen management
  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch {
      // Fullscreen might not be available
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs) {
        reportViolation('fullscreen_exit');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [enabled, reportViolation]);

  // Copy/paste prevention
  useEffect(() => {
    if (!enabled) return;
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportViolation('copy_paste');
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      reportViolation('copy_paste');
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [enabled, reportViolation]);

  return {
    violations,
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
  };
}
