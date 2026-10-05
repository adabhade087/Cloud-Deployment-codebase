const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/db");
const authRateLimiter = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// Register user
router.post("/register", authRateLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

// Check required fields
if (!name || !email || !password) {
  return res.status(400).json({
    success: false,
    message: "Name, email and password are required",
  });
}

const trimmedName = name.trim();
const normalizedEmail = email.trim().toLowerCase();

// Check name
if (trimmedName.length < 2 || trimmedName.length > 100) {
  return res.status(400).json({
    success: false,
    message: "Name must be between 2 and 100 characters",
  });
}

// Check email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(normalizedEmail)) {
  return res.status(400).json({
    success: false,
    message: "Please provide a valid email address",
  });
}

// Check password
if (password.length < 8) {
  return res.status(400).json({
    success: false,
    message: "Password must be at least 8 characters",
  });
}

// Check if email already exists
const [existingUsers] = await db.query(
  "SELECT id FROM users WHERE email = ?",
  [normalizedEmail],
);

if (existingUsers.length > 0) {
  return res.status(409).json({
    success: false,
    message: "Email already registered",
  });
}

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = ["admin", "developer", "viewer"].includes(req.body.role)
      ? req.body.role
      : "developer";

    // Save user
    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [trimmedName, normalizedEmail, passwordHash, userRole],
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("REGISTER error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
});

// Login user
router.post("/login", authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

if (!email || !password) {
  return res.status(400).json({
    success: false,
    message: "Email and password are required",
  });
}

const normalizedEmail = email.trim().toLowerCase();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(normalizedEmail)) {
  return res.status(400).json({
    success: false,
    message: "Please provide a valid email address",
  });
}

    // Find user
    const [users] = await db.query(
  "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
  [normalizedEmail],
);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const userRole = user.role || "developer";

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: userRole,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("LOGIN error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
});

// Logout user
router.post("/logout", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// =============================================================
// GITHUB OAUTH LOGIN
// =============================================================
router.get("/github", async (req, res) => {
  try {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.redirect(
        "http://localhost:5173/login?error=" +
          encodeURIComponent("GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env")
      );
    }

    const crypto = require("crypto");
    const state = crypto.randomBytes(32).toString("hex");
    await db.query(
      "INSERT INTO github_oauth_states (state, user_id, expires_at) VALUES (?, NULL, DATE_ADD(NOW(), INTERVAL 15 MINUTE))",
      [state]
    );

    const redirectUri =
      "https://github.com/login/oauth/authorize?client_id=" +
      encodeURIComponent(process.env.GITHUB_CLIENT_ID) +
      "&scope=read:user,user:email&state=" +
      encodeURIComponent(state);

    res.redirect(redirectUri);
  } catch (error) {
    console.error("GET /api/auth/github error:", error);
    res.redirect("http://localhost:5173/login?error=" + encodeURIComponent("Failed to initialize GitHub login"));
  }
});

router.get("/github/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect("http://localhost:5173/login?error=" + encodeURIComponent("Missing authorization code or state from GitHub"));
    }

    const [stateRows] = await db.query(
      "SELECT state FROM github_oauth_states WHERE state = ? AND expires_at > NOW()",
      [state]
    );

    if (stateRows.length === 0) {
      return res.redirect("http://localhost:5173/login?error=" + encodeURIComponent("Invalid or expired GitHub OAuth session"));
    }

    await db.query("DELETE FROM github_oauth_states WHERE state = ?", [state]);

    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return res.redirect("http://localhost:5173/login?error=" + encodeURIComponent("Failed to obtain access token from GitHub"));
    }

    // Fetch user profile
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const githubUser = await userRes.json();

    if (!userRes.ok || !githubUser.login) {
      return res.redirect("http://localhost:5173/login?error=" + encodeURIComponent("Failed to fetch user profile from GitHub"));
    }

    // Fetch user emails to get primary verified email
    let userEmail = githubUser.email;
    if (!userEmail) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/vnd.github+json",
        },
      });
      const emails = await emailsRes.json();
      if (Array.isArray(emails)) {
        const primary = emails.find((e) => e.primary && e.verified) || emails[0];
        if (primary) userEmail = primary.email;
      }
    }

    if (!userEmail) {
      userEmail = `${githubUser.login}@users.noreply.github.com`;
    }

    const normalizedEmail = userEmail.toLowerCase().trim();
    const displayName = githubUser.name || githubUser.login;

    // Find or create user in MySQL
    let [users] = await db.query("SELECT id, name, email, role FROM users WHERE email = ?", [normalizedEmail]);
    let userId;
    let userRole = "developer";

    if (users.length === 0) {
      const crypto = require("crypto");
      const dummyPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
      const [insertRes] = await db.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'developer')",
        [displayName, normalizedEmail, dummyPasswordHash]
      );
      userId = insertRes.insertId;
    } else {
      userId = users[0].id;
      userRole = users[0].role || "developer";
    }

    // Link GitHub connection
    await db.query(
      `INSERT INTO user_github_connections (user_id, github_username, github_access_token)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
       github_username = VALUES(github_username),
       github_access_token = VALUES(github_access_token),
       updated_at = CURRENT_TIMESTAMP`,
      [userId, githubUser.login, tokenData.access_token]
    );

    // Create JWT
    const jwtToken = jwt.sign(
      { id: userId, email: normalizedEmail, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userPayload = {
      id: userId,
      name: displayName,
      email: normalizedEmail,
      role: userRole,
    };

    res.redirect(
      `http://localhost:5173/login?oauth=github&token=${jwtToken}&user=${encodeURIComponent(JSON.stringify(userPayload))}`
    );
  } catch (error) {
    console.error("GET /api/auth/github/callback error:", error);
    res.redirect("http://localhost:5173/login?error=" + encodeURIComponent("GitHub authentication encountered an unexpected error"));
  }
});

// =============================================================
// GOOGLE OAUTH LOGIN
// =============================================================
router.get("/google", async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(
        "http://localhost:5173/login?error=" +
          encodeURIComponent("Google OAuth is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env to enable it.")
      );
    }

    const crypto = require("crypto");
    const state = crypto.randomBytes(32).toString("hex");
    const redirectUri = "http://localhost:5000/api/auth/google/callback";
    const googleAuthUrl =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid profile email",
        state,
        access_type: "offline",
        prompt: "select_account",
      }).toString();

    res.redirect(googleAuthUrl);
  } catch (error) {
    console.error("GET /api/auth/google error:", error);
    res.redirect("http://localhost:5173/login?error=" + encodeURIComponent("Failed to initialize Google login"));
  }
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code, error: googleError } = req.query;

    if (googleError) {
      return res.redirect("http://localhost:5173/login?error=" + encodeURIComponent("Google access denied: " + googleError));
    }

    if (!code) {
      return res.redirect("http://localhost:5173/login?error=" + encodeURIComponent("Missing authorization code from Google"));
    }

    const redirectUri = "http://localhost:5000/api/auth/google/callback";

    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return res.redirect("http://localhost:5173/login?error=" + encodeURIComponent(tokenData.error_description || "Failed to retrieve Google token"));
    }

    // Fetch user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await profileRes.json();
    if (!profileRes.ok || !googleUser.email) {
      return res.redirect("http://localhost:5173/login?error=" + encodeURIComponent("Failed to retrieve Google user profile"));
    }

    const normalizedEmail = googleUser.email.toLowerCase().trim();
    const displayName = googleUser.name || googleUser.given_name || "Google User";

    // Find or create user in MySQL
    let [users] = await db.query("SELECT id, name, email, role FROM users WHERE email = ?", [normalizedEmail]);
    let userId;
    let userRole = "developer";

    if (users.length === 0) {
      const crypto = require("crypto");
      const dummyPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
      const [insertRes] = await db.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'developer')",
        [displayName, normalizedEmail, dummyPasswordHash]
      );
      userId = insertRes.insertId;
    } else {
      userId = users[0].id;
      userRole = users[0].role || "developer";
    }

    // Create JWT
    const jwtToken = jwt.sign(
      { id: userId, email: normalizedEmail, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userPayload = {
      id: userId,
      name: displayName,
      email: normalizedEmail,
      role: userRole,
    };

    res.redirect(
      `http://localhost:5173/login?oauth=google&token=${jwtToken}&user=${encodeURIComponent(JSON.stringify(userPayload))}`
    );
  } catch (error) {
    console.error("GET /api/auth/google/callback error:", error);
    res.redirect("http://localhost:5173/login?error=" + encodeURIComponent("Google authentication encountered an error"));
  }
});

module.exports = router;
