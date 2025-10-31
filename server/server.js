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
const port = process.env.PORT || 5005;

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

// Mongo connection with env override and retry
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/students";
const MAX_RETRIES = 5;
let connectAttempts = 0;

async function connectWithRetry() {
  try {
    connectAttempts += 1;
    console.log(`🔌 Connecting to MongoDB (${connectAttempts}/${MAX_RETRIES}) -> ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    if (connectAttempts < MAX_RETRIES) {
      const backoffMs = Math.min(3000 * connectAttempts, 15000);
      console.log(`⏳ Retry in ${backoffMs}ms...`);
      setTimeout(connectWithRetry, backoffMs);
    } else {
      console.error("🚫 Max MongoDB connection retries reached. Check MongoDB connection.");
    }
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔁 MongoDB reconnected");
});

connectWithRetry();


// ===================== CLASSROOMS API =====================

// Create a new classroom
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

// List all classrooms
app.get("/classrooms", async (_req, res) => {
  try {
    const list = await Classroom.find().sort({ name: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: `Failed to load classrooms: ${err.message}` });
  }
});

// Get classroom by code
app.get("/classrooms/:code", async (req, res) => {
  try {
    const c = await Classroom.findOne({ code: req.params.code.toUpperCase() });
    if (!c) return res.status(404).json({ message: "Classroom not found" });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: `Failed to load classroom: ${err.message}` });
  }
});

// Get students of a classroom
app.get("/classrooms/:code/students", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const students = await Student.find({ classroomCode: code }).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: `Failed to load classroom students: ${err.message}` });
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

// Unassign a student from classroom
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


// ===================== STUDENT CRUD =====================

// Add new student
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

// Get student by ID
app.get("/get_student/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update student
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

// Delete student
app.delete("/delete/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something unexpected occurred: " + err });
  }
});


// ===================== SOCKET.IO CHAT =====================

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [/localhost:\d+$/],
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
      const history = await Message.find({ classroomCode: roomCode })
        .sort({ ts: -1 })
        .limit(50)
        .lean();
      socket.emit("room_history", history.reverse());
      socket.to(roomCode).emit("system", `${socket.data.user} joined`);
    } catch (_err) {}
  });

  socket.on("chat_message", async ({ code, text }) => {
    if (!code || !text) return;
    const roomCode = String(code).toUpperCase();
    const exists = await Classroom.findOne({ code: roomCode });
    if (!exists) return;

    const msg = {
      classroomCode: roomCode,
      user: socket.data.user || "Anonymous",
      text: String(text),
      ts: new Date(),
    };
    try {
      const saved = await Message.create(msg);
      io.to(roomCode).emit("chat_message", {
        user: saved.user,
        text: saved.text,
        ts: saved.ts,
      });
    } catch (_err) {}
  });

  socket.on("typing", ({ code, typing }) => {
    if (!code) return;
    const roomCode = String(code).toUpperCase();
    socket.to(roomCode).emit("typing", {
      user: socket.data.user || "Anonymous",
      typing: !!typing,
    });
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
