import "dotenv/config";
import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { ordersRouter } from "./routes/orders.js";
import { housekeeperRouter } from "./routes/housekeeper.js";
import { lightBillRouter } from "./routes/lightBill.js";

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = Number(process.env.PORT) || 5000;
/** Listen on all interfaces so LAN/mobile can reach the API (default). Set HOST=127.0.0.1 to bind loopback only. */
const HOST = process.env.HOST || "0.0.0.0";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

const app = express();

function isAllowedCorsOrigin(origin: string | undefined) {
  // Allow all origins (as requested).
  return true;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, origin ?? true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/housekeeper", housekeeperRouter);
app.use("/api/light-bill", lightBillRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
app.use(errorHandler);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, HOST, () => {
      const where =
        HOST === "0.0.0.0" || HOST === "::"
          ? `http://localhost:${PORT} (all interfaces)`
          : `http://${HOST}:${PORT}`;
      console.log(`API listening on ${where}`);
      console.log("Connected to MongoDB");
    });
  })
  .catch((err: unknown) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
