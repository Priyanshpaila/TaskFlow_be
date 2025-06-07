const express = require("express");
const { registerUser, loginUser, getProfile } = require("../controllers/authController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getProfile);
router.get("/admin", protect, adminOnly, (req, res) => res.send("Admin content"));

module.exports = router;
