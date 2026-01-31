'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  maxDuration?: number; // in seconds
  disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  maxDuration = 300, // 5 minutes default
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Format seconds to mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob, duration);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Reset recording
  const resetRecording = () => {
    cleanup();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioUrl(null);
    chunksRef.current = [];
  };

  return (
    <div className="bg-white rounded-xl border border-secondary-200 p-6">
      {/* Recording visualization */}
      <div className="flex flex-col items-center mb-6">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
            isRecording && !isPaused
              ? 'bg-red-100 animate-pulse'
              : isPaused
              ? 'bg-yellow-100'
              : audioUrl
              ? 'bg-green-100'
              : 'bg-secondary-100'
          }`}
        >
          {isRecording && !isPaused ? (
            <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse" />
          ) : isPaused ? (
            <svg className="w-10 h-10 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : audioUrl ? (
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </div>

        {/* Duration display */}
        <div className="text-3xl font-mono font-bold text-secondary-900">
          {formatDuration(duration)}
        </div>
        <div className="text-sm text-secondary-500 mt-1">
          {isRecording
            ? isPaused
              ? 'Paused'
              : 'Recording...'
            : audioUrl
            ? 'Recording complete'
            : 'Ready to record'}
        </div>
        <div className="text-xs text-secondary-400 mt-1">
          Max duration: {formatDuration(maxDuration)}
        </div>
      </div>

      {/* Audio preview */}
      {audioUrl && !isRecording && (
        <div className="mb-6">
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!isRecording && !audioUrl && (
          <Button
            onClick={startRecording}
            disabled={disabled}
            size="lg"
            leftIcon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="6" />
              </svg>
            }
          >
            Start Recording
          </Button>
        )}

        {isRecording && !isPaused && (
          <>
            <Button variant="secondary" onClick={pauseRecording} size="lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </Button>
            <Button variant="danger" onClick={stopRecording} size="lg">
              Stop
            </Button>
          </>
        )}

        {isRecording && isPaused && (
          <>
            <Button onClick={resumeRecording} size="lg">
              Resume
            </Button>
            <Button variant="danger" onClick={stopRecording} size="lg">
              Stop
            </Button>
          </>
        )}

        {audioUrl && !isRecording && (
          <Button variant="outline" onClick={resetRecording} size="lg">
            Record Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
