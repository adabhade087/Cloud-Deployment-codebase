const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

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

module.exports = router;