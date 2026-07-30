'use client';

import { useCallback, useEffect, useRef } from 'react';
import { recruitmentTestService } from '@/services/recruitmentTestService';

interface UseAutoSaveOptions {
  attemptId: string;
  enabled: boolean;
  intervalMs?: number;
}

interface PendingAnswer {
  questionId: string;
  answer: string;
  language?: string;
  isCode?: boolean;
}

export function useAutoSave({ attemptId, enabled, intervalMs = 10000 }: UseAutoSaveOptions) {
  const pendingRef = useRef<Map<string, PendingAnswer>>(new Map());
  const isSavingRef = useRef(false);

  const markDirty = useCallback((questionId: string, answer: string, language?: string, isCode = false) => {
    pendingRef.current.set(questionId, { questionId, answer, language, isCode });
  }, []);

  const flushNow = useCallback(async () => {
    if (isSavingRef.current) return;
    const pending = Array.from(pendingRef.current.values());
    if (pending.length === 0) return;

    isSavingRef.current = true;
    // Clear pending before sending to avoid re-sending on next tick
    pendingRef.current.clear();

    try {
      const payload = pending.map((item) =>
        item.isCode
          ? {
              questionId: item.questionId,
              codeSubmission: item.answer,
              language: item.language,
            }
          : {
              questionId: item.questionId,
              answer: item.answer,
            }
      );

      if (pending.length === 1) {
        await recruitmentTestService.saveAnswer(attemptId, payload[0]);
      } else {
        await recruitmentTestService.bulkSaveAnswers(attemptId, payload);
      }
    } catch {
      // Re-add failed items to pending for next cycle
      for (const item of pending) {
        pendingRef.current.set(item.questionId, item);
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [attemptId]);

  // Auto-save interval
  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(flushNow, intervalMs);
    return () => clearInterval(timer);
  }, [enabled, intervalMs, flushNow]);

  // Flush on unmount / page unload
  useEffect(() => {
    if (!enabled) return;
    const handleBeforeUnload = () => {
      const pending = Array.from(pendingRef.current.values());
      if (pending.length > 0) {
        const payload = pending.map((item) =>
          item.isCode
            ? {
                questionId: item.questionId,
                codeSubmission: item.answer,
                language: item.language,
              }
            : {
                questionId: item.questionId,
                answer: item.answer,
              }
        );

        // Use sendBeacon for reliable delivery during unload
        const blob = new Blob([JSON.stringify({ answers: payload })], { type: 'application/json' });
        navigator.sendBeacon(`/api/v1/recruitment-tests/attempts/${attemptId}/answers/bulk`, blob);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushNow();
    };
  }, [enabled, attemptId, flushNow]);

  return { markDirty, flushNow };
}
