import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Classrooms() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function load() {
    setLoading(true);
    setError('');
    axios.get('/classrooms')
      .then((res) => setList(res.data))
      .catch(() => setError('Failed to load classrooms'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function handleCreate(e) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !code.trim()) {
      setError('Name and Code are required');
      return;
    }
    axios.post('/classrooms', { name: name.trim(), code: code.trim() })
      .then(() => {
        setName('');
        setCode('');
        load();
      })
      .catch((err) => {
        if (err?.response?.status === 409) setError('Code already exists');
        else setError('Failed to create classroom');
      });
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary mb-0">Classrooms</h3>
        <Link to="/" className="btn btn-outline-primary">Home</Link>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="card p-3 mb-4">
        <form onSubmit={handleCreate} className="row g-2 align-items-end">
          <div className="col-md-5">
            <label className="form-label">Name</label>
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Math 101" />
          </div>
          <div className="col-md-5">
            <label className="form-label">Code</label>
            <input className="form-control" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g., MATH101" />
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-success" type="submit">Create</button>
          </div>
        </form>
      </div>

      <div className="card p-3">
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center text-muted">Loading…</td></tr>
              ) : list.length ? (
                list.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.code}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-primary" onClick={() => navigate(`/room/${c.code}`)}>Open Chat</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/classrooms/${c.code}/students`)}>Manage Students</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center text-muted">No classrooms yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Classrooms;


