import { integer, jsonb, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

// ÖSYM'nin 2026 YKS branş/soru sayısı yapısı (TYT sabit, AYT alana göre değişir).
export const YKS_EXAM_TYPES = ["TYT", "AYT_SAY", "AYT_EA", "AYT_SOZ", "AYT_DIL"] as const;
export type YksExamType = (typeof YKS_EXAM_TYPES)[number];

export interface YksSubjectDef {
  subject: string;
  totalQuestions: number;
}

export const YKS_SUBJECTS: Record<YksExamType, YksSubjectDef[]> = {
  TYT: [
    { subject: "Türkçe", totalQuestions: 40 },
    { subject: "Sosyal Bilimler", totalQuestions: 20 },
    { subject: "Temel Matematik", totalQuestions: 40 },
    { subject: "Fen Bilimleri", totalQuestions: 20 },
  ],
  AYT_SAY: [
    { subject: "Matematik", totalQuestions: 40 },
    { subject: "Fizik", totalQuestions: 14 },
    { subject: "Kimya", totalQuestions: 13 },
    { subject: "Biyoloji", totalQuestions: 13 },
  ],
  AYT_EA: [
    { subject: "Matematik", totalQuestions: 40 },
    { subject: "Türk Dili ve Edebiyatı-Sosyal Bilimler-1", totalQuestions: 40 },
  ],
  AYT_SOZ: [
    { subject: "Türk Dili ve Edebiyatı-Sosyal Bilimler-1", totalQuestions: 40 },
    { subject: "Sosyal Bilimler-2", totalQuestions: 40 },
  ],
  AYT_DIL: [{ subject: "Yabancı Dil", totalQuestions: 80 }],
};

export interface ExamSubjectResult extends YksSubjectDef {
  correct: number;
  wrong: number;
  blank: number;
  net: number;
}

export const examSubjectEntrySchema = z.object({
  subject: z.string(),
  correct: z.number().int().min(0),
  wrong: z.number().int().min(0),
  blank: z.number().int().min(0),
});

export const createExamAttemptSchema = z
  .object({
    examType: z.enum(YKS_EXAM_TYPES),
    examDate: z.string().min(1),
    examName: z.string().max(120).optional().default(""),
    subjects: z.array(examSubjectEntrySchema).min(1),
  })
  .superRefine((data, ctx) => {
    const expected = YKS_SUBJECTS[data.examType];
    if (data.subjects.length !== expected.length) {
      ctx.addIssue({ code: "custom", message: "Branş listesi seçilen sınav türüyle uyuşmuyor." });
      return;
    }
    data.subjects.forEach((entry, index) => {
      const def = expected[index];
      if (entry.subject !== def.subject) {
        ctx.addIssue({
          code: "custom",
          message: `Branş sırası hatalı: "${def.subject}" bekleniyor.`,
          path: ["subjects", index, "subject"],
        });
      }
      if (entry.correct + entry.wrong + entry.blank > def.totalQuestions) {
        ctx.addIssue({
          code: "custom",
          message: `${def.subject}: toplam işaretleme, soru sayısını (${def.totalQuestions}) aşamaz.`,
          path: ["subjects", index],
        });
      }
    });
  });
export type CreateExamAttemptInput = z.infer<typeof createExamAttemptSchema>;

export const examAttemptsTable = pgTable("exam_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  examType: text("exam_type").notNull(),
  examDate: timestamp("exam_date", { withTimezone: true }).notNull(),
  examName: text("exam_name").notNull().default(""),
  // Branş bazlı sonuçlar tek satırda tutulur (ayrı bir tabloya gerek
  // duymadan): her denemenin branş sayısı sabit ve küçük olduğu için bu,
  // gereksiz join'ler olmadan tüm geçmişi tek sorguda okumayı sağlar.
  subjects: jsonb("subjects").notNull().$type<ExamSubjectResult[]>(),
  totalNet: real("total_net").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ExamAttempt = typeof examAttemptsTable.$inferSelect;
