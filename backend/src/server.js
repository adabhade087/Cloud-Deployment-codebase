const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const repositoryRoutes = require("../routes/repositoryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Repository routes
app.use("/api/repositories", repositoryRoutes);

// Health test
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CloudForge backend is running!",
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CloudForge backend running on port ${PORT}`);
});
