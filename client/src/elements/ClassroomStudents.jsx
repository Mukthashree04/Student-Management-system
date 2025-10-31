import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function ClassroomStudents() {
  const { code } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [assigned, setAssigned] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', gender: '', age: '' });

  function load() {
    setError('');
    axios.get(`/classrooms/${code}`).then((res) => setClassroom(res.data)).catch(() => setError('Failed to load classroom'));
    axios.get(`/classrooms/${code}/students`).then((res) => setAssigned(res.data)).catch(() => setAssigned([]));
    axios.get(`/students?unassigned=true`).then((res) => setUnassigned(res.data)).catch(() => setUnassigned([]));
  }

  useEffect(() => { load(); }, [code]);

  function assign(studentId) {
    axios.post(`/classrooms/${code}/assign`, { studentId }).then(load).catch(() => setError('Failed to assign student'));
  }

  function unassign(studentId) {
    axios.post(`/classrooms/${code}/unassign`, { studentId }).then(load).catch(() => setError('Failed to remove student'));
  }

  function createStudent(e) {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      email: form.email,
      gender: form.gender,
      age: Number(form.age),
      classroomCode: code,
    };
    if (!payload.name || !payload.email || !payload.gender || !payload.age) {
      setError('All fields are required');
      return;
    }
    setCreating(true);
    axios.post('/add_user', payload)
      .then(() => {
        setForm({ name: '', email: '', gender: '', age: '' });
        load();
      })
      .catch(() => setError('Failed to create student'))
      .finally(() => setCreating(false));
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary mb-0">Manage Students: {classroom ? `${classroom.name} (${classroom.code})` : code}</h3>
        <div className="d-flex gap-2">
          <Link to={`/room/${code}`} className="btn btn-primary">Open Chat</Link>
          <Link to="/classrooms" className="btn btn-outline-primary">Back</Link>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="card p-3 mb-3">
        <h5 className="mb-3">Create Student in this Classroom</h5>
        <form onSubmit={createStudent} className="row g-2">
          <div className="col-md-3">
            <input className="form-control" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="col-md-3">
            <input className="form-control" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="col-md-2">
            <input className="form-control" placeholder="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
          </div>
          <div className="col-md-2">
            <input className="form-control" type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-success" type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Unassigned Students</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead><tr><th>Name</th><th>Email</th><th>Action</th></tr></thead>
                <tbody>
                  {unassigned.length ? unassigned.map(s => (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td><button className="btn btn-sm btn-success" onClick={() => assign(s._id)}>Assign</button></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="text-muted text-center">No unassigned students</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Assigned to {code}</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead><tr><th>Name</th><th>Email</th><th>Action</th></tr></thead>
                <tbody>
                  {assigned.length ? assigned.map(s => (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td><button className="btn btn-sm btn-outline-danger" onClick={() => unassign(s._id)}>Remove</button></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="text-muted text-center">No students in this classroom</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassroomStudents;


