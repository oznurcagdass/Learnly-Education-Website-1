import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, learningContentTable, notificationsTable } from "@workspace/db";
import {
  ListLearningContentResponse,
  CreateLearningContentBody,
  CreateLearningContentResponse,
  ListNotificationsResponse,
  MarkNotificationReadParams,
  MarkNotificationReadResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const contentTypeLabels: Record<string, string> = {
  lesson: "Lesson",
  practice: "Practice",
  resource: "Resource",
  announcement: "Announcement",
};

// GET /learning-content — the shared feed the student panel polls.
router.get("/learning-content", async (_req, res) => {
  const rows = await db
    .select()
    .from(learningContentTable)
    .orderBy(desc(learningContentTable.createdAt));

  res.json(ListLearningContentResponse.parse(rows));
});

// POST /learning-content — the teacher panel publishes here. Publishing
// also writes a notification row so the parent panel picks it up on its
// next poll.
router.post("/learning-content", async (req, res) => {
  const body = CreateLearningContentBody.parse(req.body);

  const [content] = await db
    .insert(learningContentTable)
    .values(body)
    .returning();

  const typeLabel = contentTypeLabels[body.contentType] ?? body.contentType;

  await db.insert(notificationsTable).values({
    title: "New content published",
    message: `${body.authorName} published "${body.title}" (${typeLabel}, ${body.level}).`,
    contentId: content.id,
  });

  res.status(201).json(CreateLearningContentResponse.parse(content));
});

// GET /notifications — the parent panel poll target.
router.get("/notifications", async (_req, res) => {
  const rows = await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt));

  res.json(ListNotificationsResponse.parse(rows));
});

// PATCH /notifications/:id/read
router.patch("/notifications/:id/read", async (req, res) => {
  const { id } = MarkNotificationReadParams.parse(req.params);

  const [updated] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).end();
    return;
  }

  res.json(MarkNotificationReadResponse.parse(updated));
});

export default router;
