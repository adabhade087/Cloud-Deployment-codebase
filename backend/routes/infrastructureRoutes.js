const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

// GET all infrastructure resources
router.get("/resources", async (req, res) => {
  try {
    const [resources] = await db.query(
      "SELECT id, name, type, status, region, cpu, memory, cost FROM infrastructure_resources ORDER BY created_at DESC"
    );

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("GET resources error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch infrastructure resources",
    });
  }
});

// PROVISION a new resource
router.post("/resources", async (req, res) => {
  try {
    const { type, region = "ap-south-1", environment = "Production" } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Resource type is required",
      });
    }

    const resId = `res-${Date.now()}`;
    const name = `${environment.toLowerCase()}-${type.toLowerCase().replace(/\s/g, "-")}`;
    const cpu = Math.floor(Math.random() * 40) + 10;
    const memory = Math.floor(Math.random() * 50) + 20;
    const cost = Math.floor(Math.random() * 5000) + 1000;

    await db.query(
      `INSERT INTO infrastructure_resources (id, user_id, name, type, status, region, cpu, memory, cost)
       VALUES (?, ?, ?, ?, 'running', ?, ?, ?, ?)`,
      [resId, req.user.id, name, type, region, cpu, memory, cost]
    );

    const resource = {
      id: resId,
      name,
      type,
      status: "running",
      region,
      cpu,
      memory,
      cost,
    };

    res.status(201).json({
      success: true,
      message: "Infrastructure resource provisioned successfully",
      resource,
    });
  } catch (error) {
    console.error("POST provision resource error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to provision infrastructure resource",
    });
  }
});

// DELETE / Deprovision resource
router.delete("/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "DELETE FROM infrastructure_resources WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resource deprovisioned successfully",
    });
  } catch (error) {
    console.error("DELETE resource error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete resource",
    });
  }
});

// GET infrastructure environments
router.get("/environments", async (req, res) => {
  try {
    const envs = [
      { name: "Development", resources: 8, status: "healthy", cost: 8200 },
      { name: "Staging", resources: 14, status: "healthy", cost: 15800 },
      { name: "Production", resources: 22, status: "healthy", cost: 18580 },
    ];

    res.status(200).json({
      success: true,
      environments: envs,
    });
  } catch (error) {
    console.error("GET infra environments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch infrastructure environments",
    });
  }
});

// GET Terraform configurations
router.get("/terraform", async (req, res) => {
  try {
    const [configs] = await db.query(
      "SELECT id, name, status, last_plan AS lastPlan, resources, plan_output AS planOutput FROM terraform_configs ORDER BY id ASC"
    );

    res.status(200).json({
      success: true,
      configs,
    });
  } catch (error) {
    console.error("GET terraform configs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Terraform configurations",
    });
  }
});

// RUN Terraform Plan
router.post("/terraform/plan", async (req, res) => {
  try {
    const { configName } = req.body;
    if (!configName) {
      return res.status(400).json({
        success: false,
        message: "Configuration name is required",
      });
    }

    const output = `Terraform will perform the following actions:\n\n  # ${configName}\n  ~ aws_instance.main\n      ~ instance_type: "t3.small" -> "t3.medium"\n\nPlan: 0 to add, 1 to change, 0 to destroy.`;

    await db.query(
      "UPDATE terraform_configs SET plan_output = ?, last_plan = CURDATE() WHERE name = ?",
      [output, configName]
    );

    res.status(200).json({
      success: true,
      output,
    });
  } catch (error) {
    console.error("POST terraform plan error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to execute Terraform plan",
    });
  }
});

// RUN Terraform Apply
router.post("/terraform/apply", async (req, res) => {
  try {
    const { configName } = req.body;
    if (!configName) {
      return res.status(400).json({
        success: false,
        message: "Configuration name is required",
      });
    }

    await db.query(
      "UPDATE terraform_configs SET status = 'applied', last_plan = CURDATE() WHERE name = ?",
      [configName]
    );

    res.status(200).json({
      success: true,
      message: `Terraform apply completed for ${configName}`,
    });
  } catch (error) {
    console.error("POST terraform apply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to execute Terraform apply",
    });
  }
});

// GET Kubernetes Clusters
router.get("/kubernetes/clusters", async (req, res) => {
  try {
    const [clusters] = await db.query(
      "SELECT id, name, nodes, pods, services, status FROM kubernetes_clusters ORDER BY id ASC"
    );

    res.status(200).json({
      success: true,
      clusters,
    });
  } catch (error) {
    console.error("GET kubernetes clusters error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Kubernetes clusters",
    });
  }
});

// GET Kubernetes Nodes
router.get("/kubernetes/nodes", async (req, res) => {
  try {
    const [nodes] = await db.query(
      "SELECT id, cluster_id, name, status, cpu, memory, pods FROM kubernetes_nodes ORDER BY id ASC"
    );

    res.status(200).json({
      success: true,
      nodes,
    });
  } catch (error) {
    console.error("GET kubernetes nodes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Kubernetes nodes",
    });
  }
});

// GET Kubernetes Pods
router.get("/kubernetes/pods", (req, res) => {
  const pods = [
    { name: "api-gateway-7f89d4", namespace: "default", status: "Running", restarts: 0, age: "4d" },
    { name: "frontend-app-5c91b2", namespace: "default", status: "Running", restarts: 1, age: "6d" },
    { name: "user-service-6e34a1", namespace: "default", status: "Running", restarts: 0, age: "2d" },
    { name: "postgres-primary-0", namespace: "database", status: "Running", restarts: 0, age: "14d" },
    { name: "redis-cache-4a29cf", namespace: "cache", status: "Running", restarts: 0, age: "14d" },
  ];

  res.status(200).json({
    success: true,
    pods,
  });
});

module.exports = router;
