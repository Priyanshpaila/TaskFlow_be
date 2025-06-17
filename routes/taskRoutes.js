const express = require("express");
const router = express.Router();
const {
  createTask,
  createTaskByAnyUser, // <-- Add this
  getTasksForUser,
  getAllTasks,
  updateTaskStatus,
  getDashboardStats,
  uploadAttachment,
  editTask,
} = require("../controllers/taskController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Admin creates task
router.post("/", protect, adminOnly, createTask);

// ✅ New route: Any logged-in user creates task
router.post("/public", protect, createTaskByAnyUser); // <-- Added line

// Admin gets all tasks
router.get("/", protect, adminOnly, getAllTasks);

// User gets their tasks
router.get("/my", protect, getTasksForUser);

// User updates task status
router.patch("/:id", protect, updateTaskStatus);

// Admin dashboard overview
router.get("/stats/dashboard", protect, adminOnly, getDashboardStats);

// File upload
router.post("/:id/upload", protect, upload.single("file"), uploadAttachment);

//Edit task
router.patch("/:id/edit", protect, editTask);


module.exports = router;
