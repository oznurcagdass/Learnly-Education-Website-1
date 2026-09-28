import { Router, type IRouter } from "express";
import multer from "multer";
import { desc, eq } from "drizzle-orm";
import { db, resourceFieldsSchema, resourcesTable } from "@workspace/db";
import { requireRole } from "../lib/auth";

const router: IRouter = Router();

export class UploadValidationError extends Error {}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB — Postgres free tier has 1GB total
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new UploadValidationError("Yalnızca PDF dosyaları yüklenebilir."));
      return;
    }
    cb(null, true);
  },
});

// GET /resources — metadata only, never the file bytes (kept out of the
// list payload on purpose so it stays small regardless of how many/large
// the uploaded PDFs are).
router.get("/resources", async (_req, res) => {
  const rows = await db
    .select({
      id: resourcesTable.id,
      title: resourcesTable.title,
      description: resourcesTable.description,
      level: resourcesTable.level,
      category: resourcesTable.category,
      fileName: resourcesTable.fileName,
      fileType: resourcesTable.fileType,
      fileSize: resourcesTable.fileSize,
      uploadedById: resourcesTable.uploadedById,
      uploadedByName: resourcesTable.uploadedByName,
      createdAt: resourcesTable.createdAt,
    })
    .from(resourcesTable)
    .orderBy(desc(resourcesTable.createdAt));

  res.json(rows);
});

// POST /resources — teacher-only, multipart/form-data with a "file" field
// plus title/description/level/category text fields.
router.post("/resources", requireRole("teacher"), upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "Bir PDF dosyası seçmelisiniz." });
    return;
  }

  const fields = resourceFieldsSchema.parse({
    title: req.body.title,
    description: req.body.description,
    level: req.body.level,
    category: req.body.category,
  });

  const [resource] = await db
    .insert(resourcesTable)
    .values({
      ...fields,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileData: req.file.buffer,
      uploadedById: req.user!.id,
      uploadedByName: req.user!.name,
    })
    .returning({
      id: resourcesTable.id,
      title: resourcesTable.title,
      description: resourcesTable.description,
      level: resourcesTable.level,
      category: resourcesTable.category,
      fileName: resourcesTable.fileName,
      fileType: resourcesTable.fileType,
      fileSize: resourcesTable.fileSize,
      uploadedById: resourcesTable.uploadedById,
      uploadedByName: resourcesTable.uploadedByName,
      createdAt: resourcesTable.createdAt,
    });

  res.status(201).json(resource);
});

// GET /resources/:id/file — streams the actual PDF bytes.
router.get("/resources/:id/file", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).end();
    return;
  }

  const [resource] = await db.select().from(resourcesTable).where(eq(resourcesTable.id, id));
  if (!resource) {
    res.status(404).end();
    return;
  }

  res.setHeader("Content-Type", resource.fileType);
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(resource.fileName)}"`);
  res.send(resource.fileData);
});

export default router;
