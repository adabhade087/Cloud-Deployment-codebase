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

module.exports = router;
