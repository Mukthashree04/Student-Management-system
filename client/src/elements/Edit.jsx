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
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

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
      .catch(() => setLoadError('Failed to load student'));
  }, [id]);

  function validate(v) {
    const next = {};
    if (!v.name || v.name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRe.test(v.email)) next.email = 'Enter a valid email';
    const ageNum = Number(v.age);
    if (!Number.isFinite(ageNum) || ageNum <= 0) next.age = 'Age must be a positive number';
    if (!v.gender) next.gender = 'Gender is required';
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const vErrors = validate(values);
    setErrors(vErrors);
    if (Object.keys(vErrors).length > 0) return;

    setSubmitting(true);
    axios
      .post(`/edit_user/${id}`, { ...values, age: Number(values.age) })
      .then(() => {
        navigate("/");
      })
      .catch(() => {})
      .finally(() => setSubmitting(false));
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
        {loadError && (
          <div className="alert alert-danger py-2" role="alert">{loadError}</div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group my-2">
            <label htmlFor="name">Name</label>
            <input
              value={values.name}
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              name="name"
              required
              onChange={(e) =>
                setValues({ ...values, name: e.target.value })
              }
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          <div className="form-group my-2">
            <label htmlFor="email">Email</label>
            <input
              value={values.email}
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              name="email"
              required
              onChange={(e) =>
                setValues({ ...values, email: e.target.value })
              }
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          <div className="form-group my-2">
            <label htmlFor="gender">Gender</label>
            <input
              value={values.gender}
              type="text"
              className={`form-control ${errors.gender ? 'is-invalid' : ''}`}
              name="gender"
              required
              onChange={(e) =>
                setValues({ ...values, gender: e.target.value })
              }
            />
            {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
          </div>
          <div className="form-group my-2">
            <label htmlFor="age">Age</label>
            <input
              value={values.age}
              type="number"
              className={`form-control ${errors.age ? 'is-invalid' : ''}`}
              name="age"
              required
              onChange={(e) =>
                setValues({ ...values, age: e.target.value })
              }
            />
            {errors.age && <div className="invalid-feedback">{errors.age}</div>}
          </div>
          <div className="form-group text-center my-3">
            <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Edit;
