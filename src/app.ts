import express, { Application, Request, Response } from "express";
import pinoHttp from "pino-http";
import moviesRoutes from "./routes/moviesRoutes";
import healthRoutes from "./routes/healthRoutes";
import logger from "./config/logger";
import { register } from "./config/metrics";
import { metricsMiddleware } from "./middleware/metricsMiddleware";
import { errorHandler } from "./middleware/errorHandler";
import cors from "cors";

const app: Application = express();

app.use(pinoHttp({ logger }));
app.use(metricsMiddleware);

app.use(express.json());
app.use(cors());

app.get("/metrics", async (req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/", moviesRoutes);
app.use("/health", healthRoutes);

app.use(errorHandler);

export default app;
