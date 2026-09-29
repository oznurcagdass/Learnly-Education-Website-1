import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { MulterError } from "multer";
import router from "./routes";
import { logger } from "./lib/logger";
import { attachUser } from "./lib/auth";
import { UploadValidationError } from "./routes/resources";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachUser);

app.use("/api", router);

// Different route files validate with schemas built from "zod" and some
// (the ones re-exported through @workspace/db) from "zod/v4" — under zod
// 3.25's dual export these produce distinct ZodError classes, so an
// `instanceof` check only catches one of them. Duck-typing on the `issues`
// array works for either.
function isZodLikeError(err: unknown): err is { issues: Array<{ path: PropertyKey[]; message: string }> } {
  return (
    typeof err === "object" &&
    err !== null &&
    "issues" in err &&
    Array.isArray((err as { issues: unknown }).issues)
  );
}

// Central error handler: turns request-validation failures (bad body,
// bad params, bad upload) into 400s instead of letting them fall through as
// 500s.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (isZodLikeError(err)) {
    res.status(400).json({
      message: "Invalid request",
      issues: err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
    return;
  }

  if (err instanceof UploadValidationError) {
    res.status(400).json({ message: err.message });
    return;
  }

  if (err instanceof MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Dosya çok büyük (en fazla 15MB)." : err.message;
    res.status(400).json({ message });
    return;
  }

  req.log?.error({ err }, "Unhandled error");
  res.status(500).json({ message: "Internal server error" });
});

export default app;
