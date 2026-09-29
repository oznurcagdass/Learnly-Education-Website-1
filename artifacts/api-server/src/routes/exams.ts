import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import {
  createExamAttemptSchema,
  db,
  examAttemptsTable,
  YKS_SUBJECTS,
  type ExamSubjectResult,
} from "@workspace/db";
import { requireAuth, requireRole } from "../lib/auth";

const router: IRouter = Router();

router.get("/exam-attempts", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(examAttemptsTable)
    .where(eq(examAttemptsTable.userId, req.user!.id))
    .orderBy(asc(examAttemptsTable.examDate));

  res.json(rows);
});

router.post("/exam-attempts", requireRole("student"), async (req, res) => {
  const body = createExamAttemptSchema.parse(req.body);

  // Net her zaman sunucuda hesaplanır (istemciden gelen değere güvenilmez):
  // net = doğru - yanlış/4, YKS'nin standart puanlama formülü. totalQuestions
  // da branş tanımından alınır, istemcinin göndermesine gerek yok.
  const expected = YKS_SUBJECTS[body.examType];
  const subjects: ExamSubjectResult[] = body.subjects.map((entry, index) => ({
    ...entry,
    totalQuestions: expected[index].totalQuestions,
    net: Math.max(0, entry.correct - entry.wrong / 4),
  }));
  const totalNet = subjects.reduce((sum, entry) => sum + entry.net, 0);

  const [attempt] = await db
    .insert(examAttemptsTable)
    .values({
      userId: req.user!.id,
      examType: body.examType,
      examDate: new Date(body.examDate),
      examName: body.examName ?? "",
      subjects,
      totalNet,
    })
    .returning();

  res.status(201).json(attempt);
});

router.delete("/exam-attempts/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).end();
    return;
  }

  const [deleted] = await db
    .delete(examAttemptsTable)
    .where(and(eq(examAttemptsTable.id, id), eq(examAttemptsTable.userId, req.user!.id)))
    .returning({ id: examAttemptsTable.id });

  if (!deleted) {
    res.status(404).json({ message: "Kayıt bulunamadı." });
    return;
  }

  res.status(204).end();
});

export default router;
