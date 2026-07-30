'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { companyTestService } from '@/services/companyTestService';

interface QuestionInput {
  type: 'MCQ' | 'SHORT' | 'CODE';
  question: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  testCases?: { input: string; output: string }[];
  languageSupport?: string[];
}

interface TestFormData {
  title: string;
  description: string;
  passMark?: number;
  duration: number;
  startTime: string;
  endTime: string;
  eligibility?: {
    skills?: string[];
    degrees?: string[];
    tags?: string[];
  };
  questions: QuestionInput[];
}

const SAMPLE_JSON: TestFormData = {
  title: "Full Stack Developer Assessment",
  description: "A comprehensive test covering full stack development skills",
  duration: 60,
  startTime: new Date(Date.now() + 86400000).toISOString(),
  endTime: new Date(Date.now() + 7 * 86400000).toISOString(),
  eligibility: {
    skills: ["javascript", "react", "node.js"],
    degrees: ["B.Tech", "B.E.", "MCA"],
    tags: ["Computer Science", "Information Technology"]
  },
  questions: [
    {
      type: "MCQ",
      question: "Which hook is used for side effects in React?",
      options: ["useState", "useEffect", "useRef", "useMemo"],
      correctAnswer: "useEffect",
      marks: 2,
      difficulty: "EASY"
    },
    {
      type: "SHORT",
      question: "Explain the difference between SQL and NoSQL databases in 2-3 sentences.",
      correctAnswer: "SQL databases are relational with structured schemas and use SQL for queries. NoSQL databases are non-relational, schema-flexible, and designed for unstructured data at scale.",
      marks: 5,
      difficulty: "MEDIUM"
    },
    {
      type: "CODE",
      question: "Write a function that returns the sum of all even numbers in an array.",
      marks: 10,
      difficulty: "MEDIUM",
      testCases: [
        { input: "[1,2,3,4,5,6]", output: "12" },
        { input: "[2,4,6]", output: "12" },
        { input: "[1,3,5]", output: "0" }
      ],
      languageSupport: ["javascript", "python"]
    }
  ]
};

export default function CreateTestPage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [parsedData, setParsedData] = useState<TestFormData | null>(null);

  const validateJson = useCallback((input: string): { valid: boolean; data?: TestFormData; errors: string[] } => {
    const errors: string[] = [];

    let parsed: TestFormData;
    try {
      parsed = JSON.parse(input);
    } catch {
      return { valid: false, errors: ['Invalid JSON format. Please check your syntax.'] };
    }

    if (!parsed.title || typeof parsed.title !== 'string' || parsed.title.trim().length < 3) {
      errors.push('Title is required and must be at least 3 characters.');
    }
    if (!parsed.description || typeof parsed.description !== 'string') {
      errors.push('Description is required.');
    }
    if (!parsed.duration || typeof parsed.duration !== 'number' || parsed.duration < 5 || parsed.duration > 300) {
      errors.push('Duration must be a number between 5 and 300 minutes.');
    }
    if (!parsed.startTime || isNaN(Date.parse(parsed.startTime))) {
      errors.push('startTime must be a valid ISO date string.');
    }
    if (!parsed.endTime || isNaN(Date.parse(parsed.endTime))) {
      errors.push('endTime must be a valid ISO date string.');
    }
    if (parsed.startTime && parsed.endTime && new Date(parsed.startTime) >= new Date(parsed.endTime)) {
      errors.push('endTime must be after startTime.');
    }

    if (parsed.eligibility === undefined || parsed.eligibility === null) {
      parsed.eligibility = { skills: [], degrees: [], tags: [] };
    } else if (typeof parsed.eligibility !== 'object' || Array.isArray(parsed.eligibility)) {
      errors.push('Eligibility must be an object with skills, degrees, and tags arrays.');
    } else {
      const validateList = (value: unknown, field: string): string[] => {
        if (value === undefined) {
          return [];
        }
        if (!Array.isArray(value)) {
          errors.push(`${field} must be an array.`);
          return [];
        }
        const invalid = value.filter((item) => typeof item !== 'string' || item.trim().length === 0);
        if (invalid.length > 0) {
          errors.push(`${field} must contain non-empty strings.`);
        }
        return value as string[];
      };

      parsed.eligibility.skills = validateList(parsed.eligibility.skills, 'eligibility.skills');
      parsed.eligibility.degrees = validateList(parsed.eligibility.degrees, 'eligibility.degrees');
      parsed.eligibility.tags = validateList(parsed.eligibility.tags, 'eligibility.tags');
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      errors.push('At least one question is required.');
    } else {
      parsed.questions.forEach((q, i) => {
        const prefix = `Question ${i + 1}:`;
        if (!['MCQ', 'SHORT', 'CODE'].includes(q.type)) {
          errors.push(`${prefix} type must be MCQ, SHORT, or CODE.`);
        }
        if (!q.question || q.question.trim().length < 5) {
          errors.push(`${prefix} question text must be at least 5 characters.`);
        }
        if (typeof q.marks !== 'number' || q.marks < 1) {
          errors.push(`${prefix} marks must be a positive number.`);
        }
        if (!['EASY', 'MEDIUM', 'HARD'].includes(q.difficulty)) {
          errors.push(`${prefix} difficulty must be EASY, MEDIUM, or HARD.`);
        }

        if (q.type === 'MCQ') {
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            errors.push(`${prefix} MCQ must have exactly 4 options.`);
          }
          if (!q.correctAnswer || (q.options && !q.options.includes(q.correctAnswer))) {
            errors.push(`${prefix} correctAnswer must match one of the options.`);
          }
        }
        if (q.type === 'SHORT') {
          if (!q.correctAnswer || q.correctAnswer.trim().length === 0) {
            errors.push(`${prefix} SHORT must include a correctAnswer.`);
          }
        }
        if (q.type === 'CODE') {
          if (!Array.isArray(q.testCases) || q.testCases.length === 0) {
            errors.push(`${prefix} CODE must include at least one testCase.`);
          } else {
            q.testCases.forEach((tc, j) => {
              if (typeof tc.input !== 'string' || typeof tc.output !== 'string') {
                errors.push(`${prefix} testCase ${j + 1} must have input and output strings.`);
              }
            });
          }
          if (!Array.isArray(q.languageSupport) || q.languageSupport.length === 0) {
            errors.push(`${prefix} CODE must include at least one supported language.`);
          }
        }
      });
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }
    return { valid: true, data: parsed, errors: [] };
  }, []);

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      setValidationErrors(['Please paste your test JSON data.']);
      setParsedData(null);
      return;
    }
    const result = validateJson(jsonInput);
    setValidationErrors(result.errors);
    setParsedData(result.data || null);
  };

  const handleSubmit = async () => {
    if (!parsedData) {
      handleValidate();
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await companyTestService.createTest(parsedData);
      router.push('/company/tests');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { code?: string; message?: string; details?: Record<string, string[]> } } } };
      const apiError = error.response?.data?.error;

      if (apiError?.details) {
        const flattened = Object.entries(apiError.details).flatMap(([field, messages]) =>
          messages.map((message) => `${field}: ${message}`)
        );
        setValidationErrors(flattened);
        setSubmitError('');
      } else if (apiError?.code === 'VALIDATION_ERROR' && apiError.message) {
        setValidationErrors([apiError.message]);
        setSubmitError('');
      } else {
        setSubmitError(apiError?.message || 'Failed to create test. Please check your data and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadSample = () => {
    setJsonInput(JSON.stringify(SAMPLE_JSON, null, 2));
    setValidationErrors([]);
    setParsedData(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setValidationErrors(['Only .json files are accepted.']);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      setValidationErrors([]);
      setParsedData(null);
    };
    reader.readAsText(file);
  };

  const totalMarks = parsedData?.questions.reduce((sum, q) => sum + q.marks, 0) || 0;
  const questionBreakdown = parsedData ? {
    MCQ: parsedData.questions.filter(q => q.type === 'MCQ').length,
    SHORT: parsedData.questions.filter(q => q.type === 'SHORT').length,
    CODE: parsedData.questions.filter(q => q.type === 'CODE').length,
  } : null;
  const eligibilityBadges = parsedData ? [
    ...(parsedData.eligibility?.skills || []).map((value) => `Skill: ${value}`),
    ...(parsedData.eligibility?.degrees || []).map((value) => `Degree: ${value}`),
    ...(parsedData.eligibility?.tags || []).map((value) => `Tag: ${value}`),
  ] : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <PageHeader title="Create Recruitment Test" description="Upload test data as strict JSON format" />
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">Test JSON Data</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadSample}>Load Sample</Button>
                <label className="cursor-pointer">
                  <Button size="sm" variant="secondary" onClick={() => document.getElementById('json-file-input')?.click()}>
                    Upload .json
                  </Button>
                  <input
                    id="json-file-input"
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setValidationErrors([]);
                setParsedData(null);
              }}
              placeholder='Paste your test JSON here...'
              rows={20}
              className="w-full font-mono text-sm p-4 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
              spellCheck={false}
            />

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleValidate}>Validate JSON</Button>
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!parsedData || isSubmitting}
              >
                Create Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {validationErrors.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">
              Validation Errors ({validationErrors.length})
            </h3>
            <ul className="space-y-1.5">
              {validationErrors.map((err, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                  <span className="mt-0.5">✕</span>
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm">
          {submitError}
        </div>
      )}

      {parsedData && validationErrors.length === 0 && (
        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-4">
              ✓ JSON Valid — Test Preview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Title:</span>
                <p className="font-medium text-secondary-900 dark:text-white">{parsedData.title}</p>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Duration:</span>
                <p className="font-medium text-secondary-900 dark:text-white">{parsedData.duration} minutes</p>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Total marks:</span>
                <p className="font-medium text-secondary-900 dark:text-white">{totalMarks}</p>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Questions:</span>
                <p className="font-medium text-secondary-900 dark:text-white">
                  {parsedData.questions.length} total
                  {questionBreakdown && (
                    <span className="text-secondary-400 ml-1">
                      ({questionBreakdown.MCQ} MCQ, {questionBreakdown.SHORT} Short, {questionBreakdown.CODE} Code)
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Window:</span>
                <p className="font-medium text-secondary-900 dark:text-white text-xs">
                  {new Date(parsedData.startTime).toLocaleString()} — {new Date(parsedData.endTime).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Eligibility:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {eligibilityBadges.length > 0 ? (
                    eligibilityBadges.map((label) => (
                      <span key={label} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                        {label}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-secondary-400">Open to all candidates</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-secondary-100 dark:border-secondary-700 pt-4">
              <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Questions:</h4>
              <div className="space-y-2">
                {parsedData.questions.map((q, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm py-1.5 px-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                    <span className="text-xs font-mono text-secondary-400 w-6">#{i + 1}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      q.type === 'MCQ' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                      q.type === 'SHORT' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                    }`}>
                      {q.type}
                    </span>
                    <span className="flex-1 truncate text-secondary-700 dark:text-secondary-300">{q.question}</span>
                    <span className="text-secondary-400 text-xs">{q.marks} marks • {q.difficulty}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
