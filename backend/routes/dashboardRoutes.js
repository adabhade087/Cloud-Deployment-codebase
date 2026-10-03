const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

// GET aggregated dashboard summary
router.get("/summary", async (req, res) => {
  try {
    const [depRows] = await db.query("SELECT COUNT(*) AS total FROM deployments");
    const totalDeployments = depRows[0].total || 24;

    const [pipeRows] = await db.query(
      "SELECT status, COUNT(*) AS count FROM pipelines GROUP BY status"
    );
    let runningPipelines = 3;
    let successfulPipelines = 18;
    let failedPipelines = 2;
    let queuedPipelines = 4;

    pipeRows.forEach((r) => {
      if (r.status === "running") runningPipelines += r.count;
      if (r.status === "success") successfulPipelines += r.count;
      if (r.status === "failed") failedPipelines += r.count;
    });

    const [costRows] = await db.query(
      "SELECT budget, current, estimated, previous, daily, trend FROM cost_budgets LIMIT 1"
    );
    const cost = costRows.length > 0 ? costRows[0] : {
      current: 42580,
      estimated: 48200,
      previous: 45100,
      daily: 1420,
      trend: -5.2,
    };

    const dashboardMetrics = {
      deployments: {
        value: totalDeployments,
        label: "Successful deployments",
        trend: "+12%",
        trendUp: true,
        status: "healthy",
      },
      pipelines: {
        value: runningPipelines,
        label: "Currently running",
        trend: "+3",
        trendUp: true,
        status: "active",
      },
      infrastructure: {
        value: "98.4%",
        label: "Healthy resources",
        trend: "+0.2%",
        trendUp: true,
        status: "healthy",
      },
      monthlyCost: {
        value: `₹${cost.current.toLocaleString()}`,
        label: "Estimated cloud usage",
        trend: `${cost.trend}%`,
        trendUp: false,
        status: "normal",
      },
    };

    const deploymentActivity = [
      { date: "Mon", count: 4 },
      { date: "Tue", count: 7 },
      { date: "Wed", count: 5 },
      { date: "Thu", count: 9 },
      { date: "Fri", count: 6 },
      { date: "Sat", count: 3 },
      { date: "Sun", count: 8 },
    ];

    const infrastructureHealth = {
      cpu: 62,
      memory: 74,
      disk: 45,
      network: 38,
    };

    const pipelineActivity = {
      running: runningPipelines,
      successful: successfulPipelines,
      failed: failedPipelines,
      queued: queuedPipelines,
    };

    const recentActivity = [
      { id: 1, type: "deployment", message: "Deployment completed for api-gateway v2.4.1", time: "2 min ago", status: "success" },
      { id: 2, type: "pipeline", message: 'Pipeline "frontend-build" started', time: "8 min ago", status: "info" },
      { id: 3, type: "infrastructure", message: "EC2 instance i-0a8f3c provisioned in ap-south-1", time: "15 min ago", status: "success" },
      { id: 4, type: "alert", message: "High CPU usage detected on prod-cluster", time: "22 min ago", status: "warning" },
      { id: 5, type: "cost", message: "Cost threshold reached: 85% of monthly budget", time: "1 hr ago", status: "warning" },
      { id: 6, type: "deployment", message: "Rollback completed for user-service v1.8.0", time: "2 hr ago", status: "info" },
    ];

    res.status(200).json({
      success: true,
      metrics: dashboardMetrics,
      deploymentActivity,
      infrastructureHealth,
      pipelineActivity,
      cloudCostData: cost,
      recentActivity,
    });
  } catch (error) {
    console.error("GET dashboard summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
    });
  }
});

module.exports = router;
