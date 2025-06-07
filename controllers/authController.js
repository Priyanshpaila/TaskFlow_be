const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

// Register a new user
exports.registerUser = async (req, res) => {
  const { username, email, password, confirmPassword, division } = req.body;

  if (!username || !email || !password || !confirmPassword || !division) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ username, email, password, division });

  res.status(201).json({
    id: user._id,
    username: user.username,
    email: user.email,
    division: user.division,
    role: user.role,
    token: generateToken(user._id),
  });
};

// Login existing user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && await user.matchPassword(password)) {
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      division: user.division,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

// Get logged-in user's profile
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};
