import { customFetch } from '@workspace/api-client-react';

// ÖSYM'nin 2026 YKS branş/soru sayısı yapısı. Sunucu tarafında da aynı
// tanım var (lib/db/src/schema/exams.ts); burada ayrıca tutuluyor çünkü
// @workspace/db bir Postgres istemcisi içerir ve tarayıcıda çalışamaz —
// bu küçük, durağan referans verisini kopyalamak paylaşılan bir paket
// eklemekten daha basit.
export const YKS_EXAM_TYPES = ['TYT', 'AYT_SAY', 'AYT_EA', 'AYT_SOZ', 'AYT_DIL'] as const;
export type YksExamType = (typeof YKS_EXAM_TYPES)[number];

export interface YksSubjectDef {
  subject: string;
  totalQuestions: number;
}

export const YKS_SUBJECTS: Record<YksExamType, YksSubjectDef[]> = {
  TYT: [
    { subject: 'Türkçe', totalQuestions: 40 },
    { subject: 'Sosyal Bilimler', totalQuestions: 20 },
    { subject: 'Temel Matematik', totalQuestions: 40 },
    { subject: 'Fen Bilimleri', totalQuestions: 20 },
  ],
  AYT_SAY: [
    { subject: 'Matematik', totalQuestions: 40 },
    { subject: 'Fizik', totalQuestions: 14 },
    { subject: 'Kimya', totalQuestions: 13 },
    { subject: 'Biyoloji', totalQuestions: 13 },
  ],
  AYT_EA: [
    { subject: 'Matematik', totalQuestions: 40 },
    { subject: 'Türk Dili ve Edebiyatı-Sosyal Bilimler-1', totalQuestions: 40 },
  ],
  AYT_SOZ: [
    { subject: 'Türk Dili ve Edebiyatı-Sosyal Bilimler-1', totalQuestions: 40 },
    { subject: 'Sosyal Bilimler-2', totalQuestions: 40 },
  ],
  AYT_DIL: [{ subject: 'Yabancı Dil', totalQuestions: 80 }],
};

export interface ExamSubjectResult extends YksSubjectDef {
  correct: number;
  wrong: number;
  blank: number;
  net: number;
}

export interface ExamAttempt {
  id: number;
  userId: number;
  examType: YksExamType;
  examDate: string;
  examName: string;
  subjects: ExamSubjectResult[];
  totalNet: number;
  createdAt: string;
}

export interface ExamSubjectInput {
  subject: string;
  correct: number;
  wrong: number;
  blank: number;
}

export function listExamAttempts(): Promise<ExamAttempt[]> {
  return customFetch<ExamAttempt[]>('/api/exam-attempts', { responseType: 'json' });
}

export function createExamAttempt(input: {
  examType: YksExamType;
  examDate: string;
  examName?: string;
  subjects: ExamSubjectInput[];
}): Promise<ExamAttempt> {
  return customFetch<ExamAttempt>('/api/exam-attempts', {
    method: 'POST',
    body: JSON.stringify(input),
    responseType: 'json',
  });
}

export function deleteExamAttempt(id: number): Promise<void> {
  return customFetch<void>(`/api/exam-attempts/${id}`, { method: 'DELETE' });
}
