import express, { Application, Request, Response } from "express";
import pinoHttp from "pino-http";
import moviesRoutes from "./routes/moviesRoutes";
import logger from "./config/logger";
import { register } from "./config/metrics";
import { metricsMiddleware } from "./middleware/metricsMiddleware";

const app: Application = express();

app.use(pinoHttp({ logger }));
app.use(metricsMiddleware);

app.use(express.json());

app.get("/metrics", async (req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/", moviesRoutes);

export default app;
