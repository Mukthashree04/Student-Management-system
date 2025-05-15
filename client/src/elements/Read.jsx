import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "./read.css";           // ← external styles

function Read() {
  const [student, setStudent] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`/get_student/${id}`)
      .then((res) => setStudent(res.data))      // backend already returns one object
      .catch((err) => console.log(err));
  }, [id]);

  return (
    <div className="read-page">
      <div className="card shadow-lg p-4 read-card bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="text-primary mb-0">Student Details</h3>
          <Link to="/" className="btn btn-success btn-sm">
            Home
          </Link>
        </div>

        {student ? (
          <ul className="list-group">
            <li className="list-group-item">
              <strong>ID:</strong> {student._id}
            </li>
            <li className="list-group-item">
              <strong>Name:</strong> {student.name}
            </li>
            <li className="list-group-item">
              <strong>Email:</strong> {student.email}
            </li>
            <li className="list-group-item">
              <strong>Age:</strong> {student.age}
            </li>
            <li className="list-group-item">
              <strong>Gender:</strong> {student.gender}
            </li>
          </ul>
        ) : (
          <div className="text-muted text-center">Loading…</div>
        )}
      </div>
    </div>
  );
}

export default Read;
