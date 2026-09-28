import { customType, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

// Drizzle's pg-core has no built-in binary column helper, so the raw
// Postgres `bytea` type is declared here. PDFs are stored directly in the
// database (not on disk) so they survive redeploys on hosts whose free web
// service tier has no persistent disk.
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const resourcesTable = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(),
  category: text("category").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  fileData: bytea("file_data").notNull(),
  uploadedById: integer("uploaded_by_id").notNull(),
  uploadedByName: text("uploaded_by_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Resource = typeof resourcesTable.$inferSelect;
// Public listing shape: everything except the file bytes, which are only
// ever served through the dedicated /resources/:id/file endpoint.
export type PublicResource = Omit<Resource, "fileData">;

export const resourceFieldsSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(3).max(600),
  level: z.string().min(1).max(60),
  category: z.string().min(1).max(60),
});
export type ResourceFieldsInput = z.infer<typeof resourceFieldsSchema>;
