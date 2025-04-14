import express, { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { DbConncect } from "./database/database";
import bodyParser from "body-parser";
import ErrorMiddleware from "./middleware/ErrorMiddleware";
config({
  path: "./.env",
});
// ----Using-Middleware------
const corsOptions = {
  origin: [
    `http://localhost:3000`,
    `https://lms-website-frontend-tau.vercel.app`,
  ],
  credentials: true,
};
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors(corsOptions));

// ------Import-Routing------
import userRouter from "./routes/user.routes";
import courseRouter from "./routes/course.routes";
import orderRouter from "./routes/order.routes";
import notifactionRouter from "./routes/notifaction.routes";
import analyticsRouter from "./routes/analytics.routes";
import layoutRouter from "./routes/layout.routes";

app.use(`/api/v1/user`, userRouter);
app.use(`/api/v1/course`, courseRouter);
app.use(`/api/v1/order`, orderRouter);
app.use(`/api/v1/notifaction`, notifactionRouter);
app.use(`/api/v1/analytics`, analyticsRouter);
app.use(`/api/v1/layout`, layoutRouter);
// --Test-Route---
app.get(`/test`, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Test Route",
  });
});

// --unknown-Route---
app.all(`/*`, (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} Not Found`) as any;
  err.statusCode = 404;
  next(err);
});
// // it's for ErrorHandling

app.use(ErrorMiddleware);
