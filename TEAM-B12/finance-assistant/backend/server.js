import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes         from "./routes/authRoutes.js";
import categoryRoutes     from "./routes/categoryRoutes.js";
import transactionRoutes  from "./routes/transactionRoutes.js";
import budgetRoutes       from "./routes/budgetRoutes.js";
import dashboardRoutes    from "./routes/dashboardRoutes.js";
import portfolioRoutes    from "./routes/portfolioRoutes.js";
import alertRoutes        from "./routes/alertRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/auth",          authRoutes);
app.use("/api/categories",    categoryRoutes);
app.use("/api/transactions",  transactionRoutes);
app.use("/api/budgets",       budgetRoutes);
app.use("/api/dashboard",     dashboardRoutes);
app.use("/api/portfolio",     portfolioRoutes);
app.use("/api/alerts",        alertRoutes);
app.use("/api/notifications", notificationRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Finance Assistant API running on port ${PORT}`);
  });
});
