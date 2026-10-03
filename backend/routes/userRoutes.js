const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const crypto = require("crypto");
const router = express.Router();
// Start GitHub OAuth
router.get("/github/connect", authMiddleware, async (req, res) => {
const state = crypto.randomBytes(32).toString("hex");
  await db.query(
  `INSERT INTO github_oauth_states (state, user_id, expires_at)
    VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
  [state, req.user.id],
);
  

  const githubAuthUrl = new URL(
    "https://github.com/login/oauth/authorize",
  );

  githubAuthUrl.searchParams.set(
    "client_id",
    process.env.GITHUB_CLIENT_ID,
  );

  githubAuthUrl.searchParams.set(
    "redirect_uri",
    "http://localhost:5000/api/users/github/callback",
  );

  githubAuthUrl.searchParams.set(
    "scope",
    "read:user user:email",
  );

  githubAuthUrl.searchParams.set("state", state);

  res.json({
  success: true,
  url: githubAuthUrl.toString(),
});
});
// GitHub OAuth callback
router.get("/github/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
  return res.status(400).json({
    success: false,
    message: "GitHub authorization code or state is missing",
  });
}

const [stateRows] = await db.query(
  `SELECT user_id
    FROM github_oauth_states
    WHERE state = ?
      AND expires_at > NOW()`,
  [state],
);

if (stateRows.length === 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid or expired GitHub OAuth state",
  });
}

const userId = stateRows[0].user_id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "GitHub authorization code is missing",
      });
    }

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(400).json({
        success: false,
        message: "Failed to obtain GitHub access token",
      });
    }

    const githubResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    const githubUser = await githubResponse.json();

    if (!githubResponse.ok) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch GitHub user",
      });
    }
    await db.query(
  `INSERT INTO user_github_connections
    (user_id, github_username, github_access_token)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
    github_username = VALUES(github_username),
    github_access_token = VALUES(github_access_token),
    updated_at = CURRENT_TIMESTAMP`,
  [
    userId,
    githubUser.login,
    tokenData.access_token,
  ],
);
await db.query(
  "DELETE FROM github_oauth_states WHERE state = ?",
  [state],
);

    res.redirect(
  "http://localhost:5173/settings?github=connected",
);
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);

    res.status(500).json({
      success: false,
      message: "GitHub OAuth failed",
    });
  }
});

router.use(authMiddleware);

// GET logged-in user's profile
router.get("/me", async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("GET profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
});

// UPDATE logged-in user's profile
router.put("/me", async (req, res) => {
  try {
    const { name, email } = req.body;

if (!name || !email) {
  return res.status(400).json({
    success: false,
    message: "Name and email are required",
  });
}

const trimmedName = name.trim();
const normalizedEmail = email.trim().toLowerCase();

if (trimmedName.length < 2 || trimmedName.length > 100) {
  return res.status(400).json({
    success: false,
    message: "Name must be between 2 and 100 characters",
  });
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(normalizedEmail)) {
  return res.status(400).json({
    success: false,
    message: "Please provide a valid email address",
  });
}

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [normalizedEmail, req.user.id],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered by another user",
      });
    }

    const [result] = await db.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [trimmedName, normalizedEmail, req.user.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [users] = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [req.user.id],
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: users[0],
    });
  } catch (error) {
    console.error("UPDATE profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});
// Change password
router.put("/me/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const [users] = await db.query(
      "SELECT id, password_hash FROM users WHERE id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [newPasswordHash, req.user.id],
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
});
// Get user preferences
router.get("/preferences", async (req, res) => {
  try {
    const [preferences] = await db.query(
      `SELECT theme, language, timezone, default_landing_page
       FROM user_preferences
       WHERE user_id = ?`,
      [req.user.id],
    );

    if (preferences.length === 0) {
      const [result] = await db.query(
        `INSERT INTO user_preferences (user_id)
         VALUES (?)`,
        [req.user.id],
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: "Failed to create user preferences",
        });
      }

      const [newPreferences] = await db.query(
        `SELECT theme, language, timezone, default_landing_page
         FROM user_preferences
         WHERE user_id = ?`,
        [req.user.id],
      );

      return res.status(200).json({
        success: true,
        preferences: newPreferences[0],
      });
    }

    res.status(200).json({
      success: true,
      preferences: preferences[0],
    });
  } catch (error) {
    console.error("GET preferences error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch preferences",
    });
  }
});

// Update user preferences
router.put("/preferences", async (req, res) => {
  try {
    const {
      theme,
      language,
      timezone,
      defaultLandingPage,
    } = req.body;

    const allowedThemes = ["dark", "light"];
    const allowedLanguages = ["en"];
    const allowedLandingPages = [
      "dashboard",
      "repositories",
    ];

    if (!allowedThemes.includes(theme)) {
      return res.status(400).json({
        success: false,
        message: "Invalid theme",
      });
    }

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language",
      });
    }

    if (!timezone || timezone.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid timezone",
      });
    }

    if (!allowedLandingPages.includes(defaultLandingPage)) {
      return res.status(400).json({
        success: false,
        message: "Invalid default landing page",
      });
    }

    await db.query(
      `INSERT INTO user_preferences
        (user_id, theme, language, timezone, default_landing_page)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        theme = VALUES(theme),
        language = VALUES(language),
        timezone = VALUES(timezone),
        default_landing_page = VALUES(default_landing_page)`,
      [
        req.user.id,
        theme,
        language,
        timezone,
        defaultLandingPage,
      ],
    );

    const [preferences] = await db.query(
      `SELECT theme, language, timezone, default_landing_page
        FROM user_preferences
        WHERE user_id = ?`,
      [req.user.id],
    );

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: preferences[0],
    });
  } catch (error) {
    console.error("UPDATE preferences error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update preferences",
    });
  }
});
// Get user notification preferences
router.get("/notifications", async (req, res) => {
  try {
    const [preferences] = await db.query(
      `SELECT
        deployment_notifications,
        pipeline_notifications,
        security_notifications,
        system_notifications,
        email_notifications
       FROM user_notification_preferences
       WHERE user_id = ?`,
      [req.user.id],
    );

    if (preferences.length === 0) {
      await db.query(
        `INSERT INTO user_notification_preferences (user_id)
         VALUES (?)`,
        [req.user.id],
      );

      const [newPreferences] = await db.query(
        `SELECT
          deployment_notifications,
          pipeline_notifications,
          security_notifications,
          system_notifications,
          email_notifications
          FROM user_notification_preferences
          WHERE user_id = ?`,
        [req.user.id],
      );

      return res.status(200).json({
        success: true,
        notifications: newPreferences[0],
      });
    }

    res.status(200).json({
      success: true,
      notifications: preferences[0],
    });
  } catch (error) {
    console.error("GET notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notification preferences",
    });
  }
});

// Update user notification preferences
router.put("/notifications", async (req, res) => {
  try {
    const {
      deploymentNotifications,
      pipelineNotifications,
      securityNotifications,
      systemNotifications,
      emailNotifications,
    } = req.body;

    const values = [
      deploymentNotifications,
      pipelineNotifications,
      securityNotifications,
      systemNotifications,
      emailNotifications,
    ];

    if (values.some((value) => typeof value !== "boolean")) {
      return res.status(400).json({
        success: false,
        message: "Notification preferences must be boolean values",
      });
    }

    await db.query(
      `INSERT INTO user_notification_preferences
        (
          user_id,
          deployment_notifications,
          pipeline_notifications,
          security_notifications,
          system_notifications,
          email_notifications
        )
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        deployment_notifications = VALUES(deployment_notifications),
        pipeline_notifications = VALUES(pipeline_notifications),
        security_notifications = VALUES(security_notifications),
        system_notifications = VALUES(system_notifications),
        email_notifications = VALUES(email_notifications)`,
      [
        req.user.id,
        deploymentNotifications,
        pipelineNotifications,
        securityNotifications,
        systemNotifications,
        emailNotifications,
      ],
    );

    const [preferences] = await db.query(
      `SELECT
        deployment_notifications,
        pipeline_notifications,
        security_notifications,
        system_notifications,
        email_notifications
        FROM user_notification_preferences
        WHERE user_id = ?`,
      [req.user.id],
    );

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      notifications: preferences[0],
    });
  } catch (error) {
    console.error("UPDATE notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
    });
  }
});

// Get GitHub connection
router.get("/github", async (req, res) => {
  try {
    const [connections] = await db.query(
      `SELECT
        github_username,
        connected_at,
        updated_at
       FROM user_github_connections
       WHERE user_id = ?`,
      [req.user.id],
    );

    if (connections.length === 0) {
      return res.status(200).json({
        success: true,
        connected: false,
        github: null,
      });
    }

    res.status(200).json({
      success: true,
      connected: true,
      github: connections[0],
    });
  } catch (error) {
    console.error("GET GitHub connection error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch GitHub connection",
    });
  }
});

// Save GitHub connection
router.put("/github", async (req, res) => {
  try {
    const { githubUsername, githubAccessToken } = req.body;

    if (!githubUsername || !githubAccessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub username and access token are required",
      });
    }

    const username = githubUsername.trim();

    if (username.length < 1 || username.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid GitHub username",
      });
    }

    await db.query(
      `INSERT INTO user_github_connections
        (user_id, github_username, github_access_token)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        github_username = VALUES(github_username),
        github_access_token = VALUES(github_access_token)`,
      [req.user.id, username, githubAccessToken],
    );

    res.status(200).json({
      success: true,
      message: "GitHub connection saved successfully",
    });
  } catch (error) {
    console.error("UPDATE GitHub connection error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save GitHub connection",
    });
  }
});

// Disconnect GitHub
router.delete("/github", async (req, res) => {
  try {
    await db.query(
      "DELETE FROM user_github_connections WHERE user_id = ?",
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      message: "GitHub account disconnected successfully",
    });
  } catch (error) {
    console.error("DELETE GitHub connection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to disconnect GitHub account",
    });
  }
});

// GET user API tokens
router.get("/api-tokens", async (req, res) => {
  try {
    const [tokens] = await db.query(
      "SELECT id, name, token, created_at FROM user_api_tokens WHERE user_id = ? ORDER BY id DESC",
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      tokens,
    });
  } catch (error) {
    console.error("GET api tokens error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch API tokens",
    });
  }
});

// CREATE a new API token
router.post("/api-tokens", async (req, res) => {
  try {
    const { name = "Default API Token" } = req.body;
    const rawToken = `cf_live_${crypto.randomBytes(24).toString("hex")}`;

    const [result] = await db.query(
      "INSERT INTO user_api_tokens (user_id, name, token) VALUES (?, ?, ?)",
      [req.user.id, name.trim(), rawToken]
    );

    res.status(201).json({
      success: true,
      message: "API token generated successfully",
      token: {
        id: result.insertId,
        name: name.trim(),
        token: rawToken,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("POST api token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate API token",
    });
  }
});

// REVOKE an API token
router.delete("/api-tokens/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "DELETE FROM user_api_tokens WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "API token not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "API token revoked successfully",
    });
  } catch (error) {
    console.error("DELETE api token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to revoke API token",
    });
  }
});

// DANGER ZONE: Delete User Account
router.delete("/me", async (req, res) => {
  try {
    const userId = req.user.id;

    // Clean up all related records
    await db.query("DELETE FROM user_api_tokens WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM user_github_connections WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM user_preferences WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM user_notification_preferences WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM repositories WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM deployments WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    res.status(200).json({
      success: true,
      message: "Account and associated data deleted successfully",
    });
  } catch (error) {
    console.error("DELETE user account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
});

module.exports = router;