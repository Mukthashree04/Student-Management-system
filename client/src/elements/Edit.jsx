import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./edit.css"; // Link to external CSS

function Edit() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    gender: "",
    age: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/get_student/${id}`)
      .then((res) => {
        const student = Array.isArray(res.data) ? res.data[0] : res.data;
        setValues({
          name: student.name,
          email: student.email,
          gender: student.gender,
          age: student.age,
        });
      })
      .catch((err) => console.log(err));
  }, [id]);

  function handleSubmit(e) {
    e.preventDefault();
    axios
      .post(`/edit_user/${id}`, values)
      .then((res) => {
        navigate("/");
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="edit-page">
      <div className="card shadow-lg p-4 edit-card bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="text-primary">Edit Student</h3>
          <Link to="/" className="btn btn-success">
            Home
          </Link>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group my-2">
            <label htmlFor="name">Name</label>
            <input
              value={values.name}
              type="text"
              className="form-control"
              name="name"
              required
              onChange={(e) =>
                setValues({ ...values, name: e.target.value })
              }
            />
          </div>
          <div className="form-group my-2">
            <label htmlFor="email">Email</label>
            <input
              value={values.email}
              type="email"
              className="form-control"
              name="email"
              required
              onChange={(e) =>
                setValues({ ...values, email: e.target.value })
              }
            />
          </div>
          <div className="form-group my-2">
            <label htmlFor="gender">Gender</label>
            <input
              value={values.gender}
              type="text"
              className="form-control"
              name="gender"
              required
              onChange={(e) =>
                setValues({ ...values, gender: e.target.value })
              }
            />
          </div>
          <div className="form-group my-2">
            <label htmlFor="age">Age</label>
            <input
              value={values.age}
              type="number"
              className="form-control"
              name="age"
              required
              onChange={(e) =>
                setValues({ ...values, age: e.target.value })
              }
            />
          </div>
          <div className="form-group text-center my-3">
            <button type="submit" className="btn btn-primary px-4">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Edit;
