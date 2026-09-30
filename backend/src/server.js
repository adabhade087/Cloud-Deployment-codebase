const express = require("express");
const cors = require("cors");
require("dotenv").config();
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables");
}

const db = require("../config/db");
const repositoryRoutes = require("../routes/repositoryRoutes");
const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const errorMiddleware = require("../middleware/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));

// Repository routes
app.use("/api/repositories", repositoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Health test
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "NexusCloud backend is running!",
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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`NexusCloud backend running on port ${PORT}`);
});
