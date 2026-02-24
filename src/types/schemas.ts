import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Resume Upload Schema
export const resumeUploadSchema = z.object({
  file: z
    .custom<File>()
    .refine((file) => file instanceof File, 'Please select a file')
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      'File size must be less than 10MB'
    )
    .refine(
      (file) => file.type === 'application/pdf',
      'Only PDF files are allowed'
    ),
});

export type ResumeUploadFormData = z.infer<typeof resumeUploadSchema>;

// Concept Answer Schema
export const conceptAnswerSchema = z.object({
  conceptId: z.string().uuid('Invalid concept ID'),
  audioBlob: z.custom<Blob>().refine((blob) => blob instanceof Blob, 'Audio recording is required'),
  duration: z.number().min(1, 'Recording must be at least 1 second'),
});

export type ConceptAnswerFormData = z.infer<typeof conceptAnswerSchema>;

// Interview Start Schema
export const interviewStartSchema = z.object({
  resumeId: z.string().uuid('Please upload your resume first').optional(),
  questionCount: z.coerce.number().int().min(1, 'Select at least 1 question').max(20, 'Select up to 20 questions'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
});

export type InterviewStartFormData = z.infer<typeof interviewStartSchema>;
