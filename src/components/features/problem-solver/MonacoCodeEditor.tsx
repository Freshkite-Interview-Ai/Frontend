'use client';

import React, { useCallback } from 'react';
import Editor from '@monaco-editor/react';

interface MonacoCodeEditorProps {
  code: string;
  language: string;
  availableLanguages: string[];
  onCodeChange: (value: string) => void;
  onLanguageChange: (lang: string) => void;
  readOnly?: boolean;
}

const LANG_DISPLAY: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
};

const MONACO_LANG_MAP: Record<string, string> = {
  javascript: 'javascript',
  python: 'python',
};

export function MonacoCodeEditor({
  code,
  language,
  availableLanguages,
  onCodeChange,
  onLanguageChange,
  readOnly = false,
}: MonacoCodeEditorProps) {
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      onCodeChange(value || '');
    },
    [onCodeChange]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="text-sm bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 rounded px-2 py-1 text-secondary-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            disabled={readOnly}
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {LANG_DISPLAY[lang] || lang}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs text-secondary-400">
          <span>Tab = 2 spaces</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={MONACO_LANG_MAP[language] || language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            tabSize: 2,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly,
            padding: { top: 12 },
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
            fontLigatures: true,
          }}
        />
      </div>
    </div>
  );
}
