const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);
const isValidGitHubUrl = (url) => {
  try {
    const parsedUrl = new URL(url);

    return (
      parsedUrl.protocol === "https:" &&
      parsedUrl.hostname === "github.com" &&
      parsedUrl.pathname.split("/").filter(Boolean).length >= 2
    );
  } catch {
    return false;
  }
};

const checkGitHubRepository = async (url) => {
  try {
    const parsedUrl = new URL(url);
    const parts = parsedUrl.pathname
      .split("/")
      .filter(Boolean);

    const owner = parts[0];
    const repo = parts[1];

    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10",
        },
      },
    );

    if (!response.ok) {
      return {
        exists: false,
        status: response.status,
      };
    }

    const data = await response.json();

    return {
      exists: true,
      repository: data,
    };
  } catch (error) {
    console.error("GitHub API error:", error);

    return {
      exists: false,
      status: 500,
    };
  }
};

const checkGitHubBranch = async (url, branch) => {
  try {
    const parsedUrl = new URL(url);

    const parts = parsedUrl.pathname
      .split("/")
      .filter(Boolean);

    const owner = parts[0];
    const repo = parts[1];

    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches/${encodeURIComponent(branch)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10",
        },
      },
    );

    return {
      exists: response.ok,
      status: response.status,
    };
  } catch (error) {
    console.error("GitHub branch API error:", error);

    return {
      exists: false,
      status: 500,
    };
  }
};

router.use(authMiddleware);

// GET all repositories
router.get("/", async (req, res) => {
  try {
    const [repositories] = await db.query(
  "SELECT * FROM repositories WHERE user_id = ? ORDER BY id DESC",
  [req.user.id],
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
    if (!isValidGitHubUrl(url)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid GitHub repository URL",
      });
    }

    const githubCheck = await checkGitHubRepository(url);

if (!githubCheck.exists) {
  if (githubCheck.status === 404) {
    return res.status(404).json({
      success: false,
      message: "GitHub repository not found",
    });
  }

  return res.status(503).json({
    success: false,
    message: "Unable to verify GitHub repository",
  });
}
    const [existingRepository] = await db.query(
  "SELECT id FROM repositories WHERE user_id = ? AND url = ?",
  [req.user.id, url],
);

if (existingRepository.length > 0) {
  return res.status(409).json({
    success: false,
    message: "Repository already added",
  });
}

const isValidBranch = /^[a-zA-Z0-9._/-]+$/.test(branch);

if (!isValidBranch) {
  return res.status(400).json({
    success: false,
    message: "Invalid branch name",
  });
}

const branchCheck = await checkGitHubBranch(url, branch);

if (!branchCheck.exists) {
  if (branchCheck.status === 404) {
    return res.status(404).json({
      success: false,
      message: "GitHub branch not found",
    });
  }

  return res.status(503).json({
    success: false,
    message: "Unable to verify GitHub branch",
  });
}

    const [result] = await db.query(
  "INSERT INTO repositories (user_id, url, branch) VALUES (?, ?, ?)",
  [req.user.id, url, branch],
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
  "UPDATE repositories SET url = ?, branch = ? WHERE id = ? AND user_id = ?",
  [url, branch, id, req.user.id],
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

    const [result] = await db.query(
  "DELETE FROM repositories WHERE id = ? AND user_id = ?",
  [id, req.user.id],
);

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
