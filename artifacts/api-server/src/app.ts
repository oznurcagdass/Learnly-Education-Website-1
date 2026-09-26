import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { ZodError } from "zod";
import router from "./routes";
import { logger } from "./lib/logger";

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

app.use("/api", router);

// Central error handler: turns request-validation failures (bad body,
// bad params) into 400s instead of letting them fall through as 500s.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Invalid request",
      issues: err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
    return;
  }

  req.log?.error({ err }, "Unhandled error");
  res.status(500).json({ message: "Internal server error" });
});

export default app;
