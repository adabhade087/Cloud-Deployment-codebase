const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

// GET all pipelines
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, status, last_run AS lastRun, duration, stages FROM pipelines ORDER BY id ASC"
    );

    const pipelines = rows.map((p) => ({
      ...p,
      stages: typeof p.stages === "string" ? JSON.parse(p.stages) : p.stages,
    }));

    res.status(200).json({
      success: true,
      count: pipelines.length,
      pipelines,
    });
  } catch (error) {
    console.error("GET pipelines error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pipelines",
    });
  }
});

// GET pipeline runs history
router.get("/runs", async (req, res) => {
  try {
    const [runs] = await db.query(
      `SELECT id, pipeline_name AS pipeline, status, branch, commit_hash AS commit, duration, date
       FROM pipeline_runs
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      count: runs.length,
      runs,
    });
  } catch (error) {
    console.error("GET pipeline runs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pipeline runs",
    });
  }
});

// GET build history
router.get("/builds", async (req, res) => {
  try {
    const [builds] = await db.query(
      `SELECT id, commit_hash AS commit, branch, status, duration, date
       FROM build_history
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      count: builds.length,
      builds,
    });
  } catch (error) {
    console.error("GET build history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch build history",
    });
  }
});

// TRIGGER a new build
router.post("/builds", async (req, res) => {
  try {
    const { branch = "main", commit } = req.body;
    const commitHash = commit || Math.random().toString(36).substring(2, 9);
    const buildId = `build-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    await db.query(
      `INSERT INTO build_history (id, commit_hash, branch, status, duration, date)
       VALUES (?, ?, ?, 'running', '0m 45s', ?)`,
      [buildId, commitHash, branch, nowStr]
    );

    res.status(201).json({
      success: true,
      message: "Build initiated successfully",
      build: {
        id: buildId,
        commit: commitHash,
        branch,
        status: "running",
        duration: "0m 45s",
        date: nowStr,
      },
    });
  } catch (error) {
    console.error("POST build error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger build",
    });
  }
});

// GET build logs
router.get("/builds/:id/logs", async (req, res) => {
  const { id } = req.params;
  const mockLogs = [
    `[INFO] Build worker assigned for ${id}`,
    `[INFO] Checking out commit on branch`,
    `[INFO] Installing dependencies using npm ci...`,
    `[INFO] Compiling TypeScript / bundling assets with Vite`,
    `[INFO] Running test suite: 42 passed, 0 failed`,
    `[SUCCESS] Build finished with exit code 0`,
  ];

  res.status(200).json({
    success: true,
    buildId: id,
    logs: mockLogs,
  });
});

// GET specific pipeline
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT id, name, status, last_run AS lastRun, duration, stages FROM pipelines WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pipeline not found",
      });
    }

    const pipeline = {
      ...rows[0],
      stages: typeof rows[0].stages === "string" ? JSON.parse(rows[0].stages) : rows[0].stages,
    };

    res.status(200).json({
      success: true,
      pipeline,
    });
  } catch (error) {
    console.error("GET pipeline by id error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pipeline details",
    });
  }
});

// TRIGGER a pipeline run
router.post("/:id/run", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM pipelines WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pipeline not found",
      });
    }

    const pipeline = rows[0];
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const runId = `run-${Date.now()}`;
    const commitHash = Math.random().toString(36).substring(2, 9);

    // Update pipeline status
    await db.query(
      "UPDATE pipelines SET status = 'running', last_run = ? WHERE id = ?",
      [nowStr, id]
    );

    // Insert pipeline run
    await db.query(
      `INSERT INTO pipeline_runs (id, pipeline_name, status, branch, commit_hash, duration, date)
       VALUES (?, ?, 'running', 'main', ?, '1m 20s', ?)`,
      [runId, pipeline.name, commitHash, nowStr]
    );

    res.status(200).json({
      success: true,
      message: `Pipeline ${pipeline.name} started`,
      pipelineId: id,
      runId,
      status: "running",
    });
  } catch (error) {
    console.error("POST run pipeline error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to run pipeline",
    });
  }
});

// ADVANCE pipeline stage
router.post("/:id/stages/:stageIndex/advance", async (req, res) => {
  try {
    const { id, stageIndex } = req.params;
    const idx = parseInt(stageIndex, 10);

    const [rows] = await db.query("SELECT * FROM pipelines WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pipeline not found",
      });
    }

    const pipeline = rows[0];
    const stages = typeof pipeline.stages === "string" ? JSON.parse(pipeline.stages) : pipeline.stages;

    if (idx >= 0 && idx < stages.length) {
      stages[idx].status = "success";
      if (idx + 1 < stages.length && stages[idx + 1].status === "queued") {
        stages[idx + 1].status = "running";
      }

      await db.query(
        "UPDATE pipelines SET stages = ? WHERE id = ?",
        [JSON.stringify(stages), id]
      );
    }

    res.status(200).json({
      success: true,
      stageIndex: idx,
      status: "success",
    });
  } catch (error) {
    console.error("POST advance pipeline stage error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to advance pipeline stage",
    });
  }
});

module.exports = router;
