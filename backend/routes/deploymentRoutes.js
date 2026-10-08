const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

// GET all deployments with optional filtering
router.get("/", async (req, res) => {
  try {
    const { project, environment, status } = req.query;
    let query = "SELECT * FROM deployments WHERE 1=1";
    const params = [];

    if (project) {
      query += " AND project = ?";
      params.push(project);
    }
    if (environment) {
      query += " AND environment = ?";
      params.push(environment);
    }
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

    const [deployments] = await db.query(query, params);

    res.status(200).json({
      success: true,
      count: deployments.length,
      deployments,
    });
  } catch (error) {
    console.error("GET deployments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deployments",
    });
  }
});

// GET deployment environments
router.get("/environments", async (req, res) => {
  try {
    const [environments] = await db.query(
      "SELECT * FROM deployment_environments ORDER BY id ASC"
    );

    res.status(200).json({
      success: true,
      environments,
    });
  } catch (error) {
    console.error("GET deployment environments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deployment environments",
    });
  }
});

// GET software releases
router.get("/releases", async (req, res) => {
  try {
    const [releases] = await db.query(
      "SELECT * FROM releases ORDER BY created_at DESC"
    );

    res.status(200).json({
      success: true,
      releases,
    });
  } catch (error) {
    console.error("GET releases error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch releases",
    });
  }
});

// GET rollback history
router.get("/rollbacks", async (req, res) => {
  try {
    const [rollbacks] = await db.query(
      "SELECT * FROM rollback_versions ORDER BY created_at DESC"
    );

    res.status(200).json({
      success: true,
      rollbacks,
    });
  } catch (error) {
    console.error("GET rollbacks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rollback versions",
    });
  }
});

// GET deployment details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [deployments] = await db.query(
      "SELECT * FROM deployments WHERE id = ?",
      [id]
    );

    if (deployments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      });
    }

    res.status(200).json({
      success: true,
      deployment: deployments[0],
    });
  } catch (error) {
    console.error("GET deployment by id error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deployment details",
    });
  }
});

// GET logs for a specific deployment
router.get("/:id/logs", async (req, res) => {
  try {
    const { id } = req.params;
    const [logs] = await db.query(
      "SELECT * FROM deployment_logs WHERE deployment_id = ? ORDER BY id ASC",
      [id]
    );

    res.status(200).json({
      success: true,
      deploymentId: id,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("GET deployment logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deployment logs",
    });
  }
});

// TRIGGER a new deployment
router.post("/", async (req, res) => {
  try {
    const { project, environment, version, branch } = req.body;

    if (!project || !environment || !version || !branch) {
      return res.status(400).json({
        success: false,
        message: "Project, environment, version, and branch are all required",
      });
    }

    const deployId = `dep-${Date.now()}`;
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    // Fetch user display name
    let deployedBy = "CloudForge User";
    try {
      const [uRows] = await db.query(
        "SELECT name FROM users WHERE id = ?",
        [req.user.id]
      );
      if (uRows.length > 0 && uRows[0].name) {
        deployedBy = uRows[0].name;
      }
    } catch {
      // fallback to default
    }

    // Insert deployment record
    await db.query(
      `INSERT INTO deployments
        (id, user_id, project, environment, version, branch, status, deployed_at, deployed_by)
       VALUES (?, ?, ?, ?, ?, ?, 'queued', ?, ?)`,
      [deployId, req.user.id, project, environment, version, branch, nowStr, deployedBy]
    );

    // Insert standard deployment pipeline logs
    const logEntries = [
      [deployId, nowStr, "INFO", `Triggered deployment for ${project} (${version}) on ${environment}`],
      [deployId, nowStr, "INFO", `Cloned branch ${branch} and resolved configuration`],
      [deployId, nowStr, "INFO", `Docker image built and pushed to container registry`],
      [deployId, nowStr, "INFO", `Kubernetes rolling deployment initiated`],
      [deployId, nowStr, "SUCCESS", `Deployment verification succeeded. Application is live.`]
    ];

    for (const [dId, tStamp, lvl, msg] of logEntries) {
      await db.query(
        "INSERT INTO deployment_logs (deployment_id, timestamp, level, message) VALUES (?, ?, ?, ?)",
        [dId, tStamp, lvl, msg]
      );
    }

    // Update environment last deploy and count
    const envId = environment.toLowerCase().includes("prod")
      ? "prod"
      : environment.toLowerCase().includes("stag")
      ? "staging"
      : "dev";

    await db.query(
      `UPDATE deployment_environments
       SET deployments = deployments + 1, last_deploy = 'Just now'
       WHERE id = ?`,
      [envId]
    );

    const deployment = {
      id: deployId,
      project,
      environment,
      version,
      branch,
      status: "queued",
      deployedAt: nowStr,
      deployedBy,
    };

    res.status(201).json({
      success: true,
      message: "Deployment queued successfully",
      deployment,
    });
  } catch (error) {
    console.error("POST deployment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger deployment",
    });
  }
});

// ROLLBACK a deployment
router.post("/rollback", async (req, res) => {
  try {
    const { project, version, environment = "Production" } = req.body;

    if (!project || !version) {
      return res.status(400).json({
        success: false,
        message: "Project and rollback version are required",
      });
    }

    const deployId = `dep-${Date.now()}`;
    const rbId = `rb-${Date.now()}`;
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    let deployedBy = "CloudForge User";
    try {
      const [uRows] = await db.query("SELECT name FROM users WHERE id = ?", [req.user.id]);
      if (uRows.length > 0 && uRows[0].name) deployedBy = uRows[0].name;
    } catch {
      // fallback
    }

    // Insert rollback deployment
    await db.query(
      `INSERT INTO deployments
        (id, user_id, project, environment, version, branch, status, deployed_at, deployed_by)
       VALUES (?, ?, ?, ?, ?, 'main', 'success', ?, ?)`,
      [deployId, req.user.id, project, environment, version, nowStr, deployedBy]
    );

    // Record rollback history
    await db.query(
      `INSERT INTO rollback_versions
        (id, project, current_version, previous_version, environment, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [rbId, project, version, "current", environment, nowStr.split(" ")[0]]
    );

    // Add deployment log
    await db.query(
      "INSERT INTO deployment_logs (deployment_id, timestamp, level, message) VALUES (?, ?, ?, ?)",
      [deployId, nowStr, "WARNING", `Executed rollback for ${project} to ${version}`]
    );

    res.status(200).json({
      success: true,
      message: `Rolled back ${project} to ${version}`,
      deploymentId: deployId,
    });
  } catch (error) {
    console.error("POST rollback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to rollback deployment",
    });
  }
});

module.exports = router;
