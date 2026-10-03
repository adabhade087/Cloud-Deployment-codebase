const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

// GET monitoring metrics & charts
router.get("/metrics", (req, res) => {
  const monitoringMetrics = {
    system: { cpu: 62, memory: 74, disk: 45, network: 38, uptime: 99.97 },
    application: { requests: 12400, errorRate: 0.12, responseTime: 142, throughput: 850 },
  };

  const metricCharts = {
    cpu: [
      { time: "00:00", value: 45 }, { time: "04:00", value: 38 }, { time: "08:00", value: 62 },
      { time: "12:00", value: 71 }, { time: "16:00", value: 58 }, { time: "20:00", value: 52 },
    ],
    memory: [
      { time: "00:00", value: 60 }, { time: "04:00", value: 55 }, { time: "08:00", value: 68 },
      { time: "12:00", value: 74 }, { time: "16:00", value: 70 }, { time: "20:00", value: 65 },
    ],
    network: [
      { time: "00:00", value: 20 }, { time: "04:00", value: 15 }, { time: "08:00", value: 35 },
      { time: "12:00", value: 42 }, { time: "16:00", value: 38 }, { time: "20:00", value: 30 },
    ],
    disk: [
      { time: "00:00", value: 40 }, { time: "04:00", value: 41 }, { time: "08:00", value: 43 },
      { time: "12:00", value: 44 }, { time: "16:00", value: 45 }, { time: "20:00", value: 45 },
    ],
  };

  res.status(200).json({
    success: true,
    metrics: monitoringMetrics,
    charts: metricCharts,
  });
});

// GET centralized logs
router.get("/logs", async (req, res) => {
  try {
    const { service, level } = req.query;
    let query = "SELECT id, timestamp, service, level, message FROM system_logs WHERE 1=1";
    const params = [];

    if (service) {
      query += " AND service = ?";
      params.push(service);
    }
    if (level) {
      query += " AND level = ?";
      params.push(level);
    }

    query += " ORDER BY id DESC LIMIT 50";

    const [logs] = await db.query(query, params);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("GET logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
    });
  }
});

// INGEST log entry
router.post("/logs", async (req, res) => {
  try {
    const { service, level = "INFO", message } = req.body;
    if (!service || !message) {
      return res.status(400).json({
        success: false,
        message: "Service name and log message are required",
      });
    }

    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

    const [result] = await db.query(
      "INSERT INTO system_logs (timestamp, service, level, message) VALUES (?, ?, ?, ?)",
      [nowStr, service, level, message]
    );

    res.status(201).json({
      success: true,
      logId: result.insertId,
      message: "Log entry saved",
    });
  } catch (error) {
    console.error("POST log error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create log entry",
    });
  }
});

// GET alerts
router.get("/alerts", async (req, res) => {
  try {
    const [alerts] = await db.query(
      "SELECT id, severity, service, message, time, status FROM alerts ORDER BY created_at DESC"
    );

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("GET alerts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
    });
  }
});

// ACKNOWLEDGE an alert
router.put("/alerts/:id/acknowledge", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE alerts SET status = 'acknowledged' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      alertId: id,
      status: "acknowledged",
      message: `Alert ${id} acknowledged successfully`,
    });
  } catch (error) {
    console.error("PUT acknowledge alert error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to acknowledge alert",
    });
  }
});

// GET health checks
router.get("/health", (req, res) => {
  const healthChecks = [
    { name: "Applications", status: "healthy", uptime: 99.98, items: 8 },
    { name: "Servers", status: "healthy", uptime: 99.95, items: 6 },
    { name: "Containers", status: "warning", uptime: 99.82, items: 48 },
    { name: "Kubernetes", status: "healthy", uptime: 99.97, items: 2 },
    { name: "APIs", status: "healthy", uptime: 99.99, items: 12 },
  ];

  res.status(200).json({
    success: true,
    healthChecks,
  });
});

module.exports = router;
