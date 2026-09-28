import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, loginSchema, registerSchema, usersTable } from "@workspace/db";
import { createSession, destroySession, hashPassword, requireAuth, toPublicUser, verifyPassword } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  const body = registerSchema.parse(req.body);

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, body.email));
  if (existing) {
    res.status(409).json({ message: "Bu e-posta adresiyle zaten bir hesap var." });
    return;
  }

  const passwordHash = await hashPassword(body.password);
  const [user] = await db
    .insert(usersTable)
    .values({ name: body.name, email: body.email, passwordHash, role: body.role })
    .returning();

  const token = await createSession(user.id);
  res.status(201).json({ user: toPublicUser(user), token });
});

router.post("/auth/login", async (req, res) => {
  const body = loginSchema.parse(req.body);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, body.email));
  const valid = user ? await verifyPassword(body.password, user.passwordHash) : false;

  if (!user || !valid) {
    res.status(401).json({ message: "E-posta veya şifre hatalı." });
    return;
  }

  const token = await createSession(user.id);
  res.json({ user: toPublicUser(user), token });
});

router.post("/auth/logout", requireAuth, async (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
  if (token) await destroySession(token);
  res.status(204).end();
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user!) });
});

export default router;
