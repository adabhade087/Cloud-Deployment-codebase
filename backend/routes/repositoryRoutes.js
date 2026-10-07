const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const repositoryAnalyzer = require("../services/repositoryAnalyzer");

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

// GET all repositories
router.get("/", async (req, res) => {
  try {
    const [repositories] = await db.query(
      "SELECT * FROM repositories WHERE user_id = ? ORDER BY created_at DESC",
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
// GET single repository by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [userRepo] = await db.query(
      "SELECT * FROM repositories WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (userRepo.length === 0) {
      const [anyRepo] = await db.query(
        "SELECT id FROM repositories WHERE id = ?",
        [id]
      );

      if (anyRepo.length > 0) {
        return res.status(403).json({
          success: false,
          error: "ACCESS_DENIED",
          message: "You do not have permission to access this repository",
        });
      }

      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Repository not found",
      });
    }

    return res.status(200).json({
      success: true,
      repository: userRepo[0],
    });
  } catch (error) {
    console.error("GET repository by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch repository",
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
      const [anyRepo] = await db.query(
        "SELECT id FROM repositories WHERE id = ?",
        [id]
      );

      if (anyRepo.length > 0) {
        return res.status(403).json({
          success: false,
          error: "ACCESS_DENIED",
          message: "You do not have permission to update this repository",
        });
      }

      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
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
      const [anyRepo] = await db.query(
        "SELECT id FROM repositories WHERE id = ?",
        [id]
      );

      if (anyRepo.length > 0) {
        return res.status(403).json({
          success: false,
          error: "ACCESS_DENIED",
          message: "You do not have permission to delete this repository",
        });
      }

      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
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

// ANALYZE repository
router.post("/:id/analyze", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verify repository exists and belongs to the authenticated user
    const [userRepo] = await db.query(
      "SELECT * FROM repositories WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (userRepo.length === 0) {
      // Check if it belongs to another user
      const [anyRepo] = await db.query(
        "SELECT id FROM repositories WHERE id = ?",
        [id]
      );

      if (anyRepo.length > 0) {
        return res.status(403).json({
          success: false,
          error: "ACCESS_DENIED",
          message: "You do not have permission to analyze this repository",
        });
      }

      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Repository not found",
      });
    }

    const repository = userRepo[0];

    // 2. Verify user has connected GitHub account
    const [connections] = await db.query(
      "SELECT github_access_token FROM user_github_connections WHERE user_id = ?",
      [req.user.id]
    );

    if (connections.length === 0 || !connections[0].github_access_token) {
      return res.status(400).json({
        success: false,
        error: "GITHUB_NOT_CONNECTED",
        message:
          "GitHub connection is required. Please connect your GitHub account in Settings to analyze repositories.",
      });
    }

    const accessToken = connections[0].github_access_token;

    // 3. Perform analysis via repositoryAnalyzer service
    const result = await repositoryAnalyzer.analyzeGitHubRepository({
      url: repository.url,
      branch: repository.branch || "main",
      accessToken,
    });

    if (!result.success) {
      let status = 500;
      if (result.error === "REPOSITORY_NOT_FOUND") status = 404;
      else if (result.error === "REPOSITORY_ACCESS_DENIED") status = 403;
      else if (result.error === "GITHUB_RATE_LIMIT") status = 429;
      else if (result.error === "GITHUB_NOT_CONNECTED") status = 400;
      else if (result.error === "GITHUB_API_FAILURE") status = 502;

      return res.status(status).json({
        success: false,
        error: result.error,
        message: result.message,
      });
    }

    const { analysis } = result;

    // 4. Persist analysis results to repository record
    await db.query(
      `UPDATE repositories SET
        detected_language = ?,
        detected_framework = ?,
        project_type = ?,
        package_manager = ?,
        install_command = ?,
        build_command = ?,
        start_command = ?,
        output_directory = ?,
        has_dockerfile = ?,
        deployable = ?,
        analysis_status = ?,
        analyzed_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [
        analysis.language,
        analysis.framework,
        analysis.projectType,
        analysis.packageManager,
        analysis.installCommand,
        analysis.buildCommand,
        analysis.startCommand,
        analysis.outputDirectory,
        analysis.hasDockerfile ? 1 : 0,
        analysis.deployable ? 1 : 0,
        analysis.deployable ? "analyzed" : "unsupported",
        id,
        req.user.id,
      ]
    );

    // 5. Return structured result
    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("POST repository analyze error:", error);

    return res.status(500).json({
      success: false,
      error: "ANALYSIS_FAILURE",
      message: error.message || "Failed to analyze repository",
    });
  }
});

module.exports = router;
