const express = require("express");
const cors = require("cors");
require("dotenv").config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables");
}

const db = require("../config/db");
const initDb = require("../config/initDb");
const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const repositoryRoutes = require("../routes/repositoryRoutes");
const deploymentRoutes = require("../routes/deploymentRoutes");
const pipelineRoutes = require("../routes/pipelineRoutes");
const infrastructureRoutes = require("../routes/infrastructureRoutes");
const costRoutes = require("../routes/costRoutes");
const monitoringRoutes = require("../routes/monitoringRoutes");
const dashboardRoutes = require("../routes/dashboardRoutes");
const errorMiddleware = require("../middleware/errorMiddleware");

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));

// Route Mounts
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/pipelines", pipelineRoutes);
app.use("/api/infrastructure", infrastructureRoutes);
app.use("/api/cost", costRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health test
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "NexusCloud backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// MySQL connection test
app.get("/api/db-test", async (req, res) => {
  try {
    const [result] = await db.query("SELECT 1 AS connected");

    res.json({
      success: true,
      message: "MySQL connected successfully!",
      result,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`NexusCloud backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to initialize database on startup:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
