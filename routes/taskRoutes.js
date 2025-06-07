const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasksForUser,
  getAllTasks,
  updateTaskStatus,
  getDashboardStats,
  uploadAttachment,
} = require("../controllers/taskController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Admin creates task
router.post("/", protect, adminOnly, createTask);

// Admin gets all tasks
router.get("/", protect, adminOnly, getAllTasks);

// User gets their tasks
router.get("/my", protect, getTasksForUser);

// User updates task status
router.patch("/:id", protect, updateTaskStatus);

// Admin dashboard overview
router.get("/stats/dashboard", protect, adminOnly, getDashboardStats);

//file upload
router.post("/:id/upload", protect, upload.single("file"), uploadAttachment);

module.exports = router;
