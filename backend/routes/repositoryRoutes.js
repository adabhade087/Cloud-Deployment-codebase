const express = require("express");
const router = express.Router();

const db = require("../config/db");

// GET all repositories
router.get("/", async (req, res) => {
  try {
    const [repositories] = await db.query(
      "SELECT * FROM repositories ORDER BY id DESC",
    );

    res.status(200).json({
      success: true,
      repositories,
    });
  } catch (error) {
    console.error("GET repositories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch repositories",
    });
  }
});

// ADD repository
router.post("/", async (req, res) => {
  try {
    const { url, branch } = req.body;

    if (!url || !branch) {
      return res.status(400).json({
        success: false,
        message: "Repository URL and branch are required",
      });
    }

    const [result] = await db.query(
      "INSERT INTO repositories (url, branch) VALUES (?, ?)",
      [url, branch],
    );

    res.status(201).json({
      success: true,
      message: "Repository added successfully",
      repositoryId: result.insertId,
    });
  } catch (error) {
    console.error("POST repository error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add repository",
    });
  }
});
// UPDATE repository
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { url, branch } = req.body;

    if (!url || !branch) {
      return res.status(400).json({
        success: false,
        message: "Repository URL and branch are required",
      });
    }

    const [result] = await db.query(
      "UPDATE repositories SET url = ?, branch = ? WHERE id = ?",
      [url, branch, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Repository not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Repository updated successfully",
    });
  } catch (error) {
    console.error("PUT repository error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update repository",
    });
  }
});

// DELETE repository
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM repositories WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Repository not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Repository deleted successfully",
    });
  } catch (error) {
    console.error("DELETE repository error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete repository",
    });
  }
});

module.exports = router;
