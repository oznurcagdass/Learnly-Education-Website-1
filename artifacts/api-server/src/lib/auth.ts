import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, sessionsTable, usersTable, type PublicUser, type User } from "@workspace/db";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 gün

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessionsTable).values({ token, userId, expiresAt });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
}

async function getUserForToken(token: string): Promise<User | null> {
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.token, token));
  if (!session || session.expiresAt.getTime() < Date.now()) {
    return null;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
  return user ?? null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

// Attaches req.user when a valid Bearer token is present; never rejects the
// request itself, so routes can decide whether auth is required.
export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    const user = await getUserForToken(token);
    if (user) req.user = user;
  } catch {
    // Bad/expired token: treat the same as no token.
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ message: "Giriş yapmanız gerekiyor." });
    return;
  }
  next();
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Giriş yapmanız gerekiyor." });
      return;
    }
    if (req.user.role !== role) {
      res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
      return;
    }
    next();
  };
}
