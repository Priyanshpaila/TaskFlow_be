// controllers/divisionController.js
const Division = require("../models/divisionModel");

exports.getDivisions = async (req, res) => {
  try {
    const divisions = await Division.find().sort({ name: 1 }); // alphabetically
    res.status(200).json(divisions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch divisions", error });
  }
};

exports.addDivision = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Division name is required" });

    // Prevent duplicates
    const exists = await Division.findOne({ name });
    if (exists) return res.status(409).json({ message: "Division already exists" });

    const newDivision = new Division({ name });
    await newDivision.save();
    res.status(201).json(newDivision);
  } catch (error) {
    res.status(500).json({ message: "Failed to add division", error });
  }
};
