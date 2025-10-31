const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const Student = require("./models/Student");
const Classroom = require("./models/Classroom");

const app = express();
const port = process.env.PORT || 5005;

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

// Mongo connection with env override and simple retry
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
      console.error("🚫 Max MongoDB connection retries reached. Check that MongoDB is running and URI is correct.");
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔁 MongoDB reconnected');
});

connectWithRetry();

// ===== Classroom REST API =====
// Create classroom { name, code }
app.post("/classrooms", async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ message: "name and code are required" });
    const exists = await Classroom.findOne({ code });
    if (exists) return res.status(409).json({ message: "Classroom code already exists" });
    const created = await Classroom.create({ name, code });
    res.json(created);
  } catch (err) {
    res.status(500).json({ message: "Failed to create classroom" });
  }
});

// List classrooms
app.get("/classrooms", async (_req, res) => {
  try {
    const list = await Classroom.find().sort({ name: 1 });
    res.json(list);
  } catch (_err) {
    res.status(500).json({ message: "Failed to load classrooms" });
  }
});

// Get classroom by code
app.get("/classrooms/:code", async (req, res) => {
  try {
    const c = await Classroom.findOne({ code: req.params.code });
    if (!c) return res.status(404).json({ message: "Classroom not found" });
    res.json(c);
  } catch (_err) {
    res.status(500).json({ message: "Failed to load classroom" });
  }
});

// ===== Existing Student CRUD =====
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

// ===== Socket.IO Setup =====
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [/localhost:\\d+$/],
    methods: ["GET", "POST"],
  },
});

// simple in-memory message buffer per room (non-persistent)
const roomMessages = new Map(); // key: code, value: [{user, text, ts}]

io.on("connection", (socket) => {
  socket.on("join_room", ({ code, user }) => {
    if (!code) return;
    socket.join(code);
    socket.data.user = user || `User-${socket.id.slice(-4)}`;
    // send recent messages
    const history = roomMessages.get(code) || [];
    socket.emit("room_history", history);
    socket.to(code).emit("system", `${socket.data.user} joined`);
  });

  socket.on("chat_message", ({ code, text }) => {
    if (!code || !text) return;
    const msg = { user: socket.data.user || "Anonymous", text, ts: Date.now() };
    const list = roomMessages.get(code) || [];
    list.push(msg);
    if (list.length > 200) list.shift();
    roomMessages.set(code, list);
    io.to(code).emit("chat_message", msg);
  });

  socket.on("typing", ({ code, typing }) => {
    if (!code) return;
    socket.to(code).emit("typing", { user: socket.data.user || "Anonymous", typing: !!typing });
  });

  socket.on("leave_room", ({ code }) => {
    if (!code) return;
    socket.leave(code);
    socket.to(code).emit("system", `${socket.data.user || "Someone"} left`);
  });

  socket.on("disconnect", () => {
    // no-op
  });
});

server.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
