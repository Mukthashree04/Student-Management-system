const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Student = require("./models/Student");

const app = express();
const port = 5005;

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/students", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

// Add a new student
app.post("/add_user", async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.json({ success: "Student added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something unexpected occurred: " + err });
  }
});

// Get all students
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single student by ID
app.get("/get_student/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a student
app.post("/edit_user/:id", async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: "Student updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something unexpected occurred: " + err });
  }
});

// Delete a student
app.delete("/delete/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something unexpected occurred: " + err });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
