const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

const port = 5005;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Manish@20",
  database: "students",
});

// Route: Add user
app.post("/add_user", (req, res) => {
  const sql =
    "INSERT INTO student_details (`name`,`email`,`age`,`gender`) VALUES (?, ?, ?, ?)";
  const values = [req.body.name, req.body.email, req.body.age, req.body.gender];
  db.query(sql, values, (err, result) => {
    if (err) return res.json({ message: "Something unexpected has occurred: " + err });
    return res.json({ success: "Student added successfully" });
  });
});

// Route: Get all students
app.get("/students", (req, res) => {
  const sql = "SELECT * FROM student_details";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    return res.json(result);
  });
});

// Route: Get student by ID
app.get("/get_student/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM student_details WHERE `id`= ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    return res.json(result);
  });
});

// Route: Edit user
app.post("/edit_user/:id", (req, res) => {
  const id = req.params.id;
  const sql =
    "UPDATE student_details SET `name`=?, `email`=?, `age`=?, `gender`=? WHERE id=?";
  const values = [
    req.body.name,
    req.body.email,
    req.body.age,
    req.body.gender,
    id,
  ];
  db.query(sql, values, (err, result) => {
    if (err) return res.json({ message: "Something unexpected has occurred: " + err });
    return res.json({ success: "Student updated successfully" });
  });
});

// Route: Delete user
app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM student_details WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.json({ message: "Something unexpected has occurred: " + err });
    return res.json({ success: "Student deleted successfully" }); // fixed message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
