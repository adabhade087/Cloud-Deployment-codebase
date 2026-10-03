const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

// Multi-cloud pricing matrix
const pricingMatrix = {
  aws: {
    compute: { small: 3500, medium: 7200, large: 14500 },
    storage: 800,
    database: 4500,
    network: 1200,
  },
  gcp: {
    compute: { small: 3200, medium: 6800, large: 13800 },
    storage: 750,
    database: 4200,
    network: 1100,
  },
  azure: {
    compute: { small: 3400, medium: 7000, large: 14200 },
    storage: 780,
    database: 4400,
    network: 1150,
  },
};

const regionMultipliers = {
  "ap-south-1": 1.0,
  "us-east-1": 0.95,
  "eu-west-1": 1.05,
  "ap-southeast-1": 1.02,
};

// GET cost overview and summary
router.get("/overview", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT budget, current, estimated, previous, daily, trend FROM cost_budgets LIMIT 1"
    );

    const costData = rows.length > 0 ? rows[0] : {
      budget: 50000,
      current: 42580,
      estimated: 48200,
      previous: 45100,
      daily: 1420,
      trend: -5.2,
    };

    const costByService = [
      { name: "Compute", value: 18500 },
      { name: "Storage", value: 8200 },
      { name: "Database", value: 6800 },
      { name: "Network", value: 4100 },
      { name: "Kubernetes", value: 4980 },
    ];

    const costTrend = [
      { month: "Mar", cost: 38200 },
      { month: "Apr", cost: 40100 },
      { month: "May", cost: 42800 },
      { month: "Jun", cost: 41500 },
      { month: "Jul", cost: 45100 },
      { month: "Aug", cost: 42580 },
    ];

    res.status(200).json({
      success: true,
      cloudCostData: costData,
      costByService,
      costTrend,
    });
  } catch (error) {
    console.error("GET cost overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cost overview",
    });
  }
});

// CALCULATE cost based on configuration
router.post("/calculate", (req, res) => {
  try {
    const {
      provider = "aws",
      region = "ap-south-1",
      compute = true,
      storage = false,
      database = false,
      network = false,
      instanceSize = "medium",
    } = req.body;

    const p = pricingMatrix[provider.toLowerCase()] || pricingMatrix.aws;
    const mult = regionMultipliers[region] || 1.0;

    let total = 0;
    if (compute) total += p.compute[instanceSize.toLowerCase()] || p.compute.medium;
    if (storage) total += p.storage;
    if (database) total += p.database;
    if (network) total += p.network;

    const finalCost = Math.round(total * mult);

    res.status(200).json({
      success: true,
      provider,
      region,
      estimatedCost: finalCost,
      currency: "INR",
    });
  } catch (error) {
    console.error("POST calculate cost error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate cost",
    });
  }
});

// GET current budget
router.get("/budget", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT budget, current, estimated FROM cost_budgets LIMIT 1"
    );

    const budget = rows.length > 0 ? rows[0].budget : 50000;
    const current = rows.length > 0 ? rows[0].current : 42580;
    const percentage = Math.round((current / budget) * 100);

    res.status(200).json({
      success: true,
      budget,
      currentSpend: current,
      usagePercentage: percentage,
    });
  } catch (error) {
    console.error("GET budget error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch budget",
    });
  }
});

// SET / UPDATE budget limit
router.post("/budget", async (req, res) => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid positive budget amount is required",
      });
    }

    const [rows] = await db.query("SELECT id FROM cost_budgets LIMIT 1");
    if (rows.length > 0) {
      await db.query(
        "UPDATE cost_budgets SET budget = ? WHERE id = ?",
        [numAmount, rows[0].id]
      );
    } else {
      await db.query(
        "INSERT INTO cost_budgets (budget) VALUES (?)",
        [numAmount]
      );
    }

    res.status(200).json({
      success: true,
      budget: numAmount,
      message: "Budget updated successfully",
    });
  } catch (error) {
    console.error("POST budget error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update budget",
    });
  }
});

// GET optimization recommendations
router.get("/recommendations", async (req, res) => {
  try {
    const [recommendations] = await db.query(
      "SELECT id, title, description, savings, priority, status FROM optimization_recommendations ORDER BY savings DESC"
    );

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("GET recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch optimization recommendations",
    });
  }
});

module.exports = router;
