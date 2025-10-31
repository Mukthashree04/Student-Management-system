const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const Student = require("./models/Student");
const Classroom = require("./models/Classroom");
const Message = require("./models/Message");

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

// ===== Classrooms =====
app.post("/classrooms", async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ message: "name and code are required" });
    const exists = await Classroom.findOne({ code: String(code).toUpperCase() });
    if (exists) return res.status(409).json({ message: "Classroom code already exists" });
    const created = await Classroom.create({ name, code: String(code).toUpperCase() });
    res.json(created);
  } catch (err) {
    res.status(500).json({ message: `Failed to create classroom: ${err.message}` });
  }
});

app.get("/classrooms", async (_req, res) => {
  try {
    const list = await Classroom.find().sort({ name: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: `Failed to load classrooms: ${err.message}` });
  }
});

app.get("/classrooms/:code", async (req, res) => {
  try {
    const c = await Classroom.findOne({ code: req.params.code.toUpperCase() });
    if (!c) return res.status(404).json({ message: "Classroom not found" });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: `Failed to load classroom: ${err.message}` });
  }
});

// List students in a classroom
app.get("/classrooms/:code/students", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const students = await Student.find({ classroomCode: code }).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: `Failed to load classroom students: ${err.message}` });
  }
});

// List unassigned students
app.get("/students", async (req, res) => {
  try {
    if (req.query.unassigned === 'true') {
      const students = await Student.find({ $or: [ { classroomCode: null }, { classroomCode: { $exists: false } } ] }).sort({ name: 1 });
      return res.json(students);
    }
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Assign a student to a classroom
app.post("/classrooms/:code/assign", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { studentId } = req.body;
    const classroom = await Classroom.findOne({ code });
    if (!classroom) return res.status(404).json({ message: "Classroom not found" });
    const student = await Student.findByIdAndUpdate(studentId, { classroomCode: code }, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: `Failed to assign student: ${err.message}` });
  }
});

// Unassign a student from a classroom
app.post("/classrooms/:code/unassign", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { studentId } = req.body;
    const classroom = await Classroom.findOne({ code });
    if (!classroom) return res.status(404).json({ message: "Classroom not found" });
    const student = await Student.findByIdAndUpdate(studentId, { classroomCode: null }, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: `Failed to unassign student: ${err.message}` });
  }
});

// ===== Existing Student CRUD =====
// Add a new student
app.post("/add_user", async (req, res) => {
  try {
    const body = req.body || {};
    if (body.classroomCode) body.classroomCode = String(body.classroomCode).toUpperCase();
    const newStudent = new Student(body);
    await newStudent.save();
    res.json({ success: "Student added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something unexpected occurred: " + err });
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
    const body = req.body || {};
    if (body.classroomCode) body.classroomCode = String(body.classroomCode).toUpperCase();
    await Student.findByIdAndUpdate(req.params.id, body);
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

// ===== Socket.IO with persistence =====
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [/localhost:\\d+$/],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_room", async ({ code, user }) => {
    if (!code) return;
    const roomCode = String(code).toUpperCase();
    const exists = await Classroom.findOne({ code: roomCode });
    if (!exists) return;
    socket.join(roomCode);
    socket.data.user = user || `User-${socket.id.slice(-4)}`;
    try {
      const history = await Message.find({ classroomCode: roomCode }).sort({ ts: -1 }).limit(50).lean();
      socket.emit("room_history", history.reverse());
      socket.to(roomCode).emit("system", `${socket.data.user} joined`);
    } catch (_err) {}
  });

  socket.on("chat_message", async ({ code, text }) => {
    if (!code || !text) return;
    const roomCode = String(code).toUpperCase();
    const exists = await Classroom.findOne({ code: roomCode });
    if (!exists) return;
    const msg = { classroomCode: roomCode, user: socket.data.user || "Anonymous", text: String(text), ts: new Date() };
    try {
      const saved = await Message.create(msg);
      io.to(roomCode).emit("chat_message", { user: saved.user, text: saved.text, ts: saved.ts });
    } catch (_err) {}
  });

  socket.on("typing", ({ code, typing }) => {
    if (!code) return;
    const roomCode = String(code).toUpperCase();
    socket.to(roomCode).emit("typing", { user: socket.data.user || "Anonymous", typing: !!typing });
  });

  socket.on("leave_room", ({ code }) => {
    if (!code) return;
    const roomCode = String(code).toUpperCase();
    socket.leave(roomCode);
    socket.to(roomCode).emit("system", `${socket.data.user || "Someone"} left`);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
