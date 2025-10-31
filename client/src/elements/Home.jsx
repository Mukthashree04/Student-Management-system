import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import homeImg from './home.png';

function Home() {
  const [data, setData] = useState([]);
  const [deleted, setDeleted] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    if (deleted) {
      setDeleted(false);
      setLoading(true);
      setError(null);
      axios
        .get('/students')
        .then((res) => setData(res.data))
        .catch(() => setError('Failed to load students'))
        .finally(() => setLoading(false));
    }
  }, [deleted]);

  function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    axios
      .delete(`/delete/${id}`)
      .then(() => {
        // Optimistically update UI without a full refetch
        setData((prev) => prev.filter((s) => s._id !== id));
      })
      .catch(() => setError('Failed to delete student'));
  }

  function requestSort(key) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const normalized = (s) => (s || '').toString().toLowerCase();
  const filteredData = data.filter((student) => {
    const q = normalized(search);
    return (
      normalized(student.name).includes(q) ||
      normalized(student.email).includes(q) ||
      normalized(student.gender).includes(q) ||
      normalized(student.age).includes(q)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    const aStr = normalized(aVal);
    const bStr = normalized(bVal);
    if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const sortIndicator = (key) =>
    sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <div
      className="container-fluid bg-light min-vh-100 py-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${homeImg})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="card p-4 mx-auto shadow-lg"
        style={{
          maxWidth: '1000px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
        }}
      >
        {/* Header with search + buttons */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
          <h3 className="text-primary mb-0">Student Records</h3>
          <div className="d-flex gap-2 w-100 w-md-auto">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, gender, age"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link className="btn btn-outline-secondary" to="/classrooms">
              Classrooms
            </Link>
            <Link className="btn btn-success" to="/create">
              ➕ Add Student
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover">
            <thead className="table-dark text-center">
              <tr>
                <th
                  role="button"
                  onClick={() => requestSort('name')}
                  title="Sort by name"
                >
                  Name{sortIndicator('name')}
                </th>
                <th>Email</th>
                <th
                  role="button"
                  onClick={() => requestSort('age')}
                  title="Sort by age"
                >
                  Age{sortIndicator('age')}
                </th>
                <th>Gender</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    Loading…
                  </td>
                </tr>
              ) : sortedData.length > 0 ? (
                sortedData.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.age}</td>
                    <td>{student.gender}</td>
                    <td>
                      <Link
                        className="btn btn-sm btn-primary mx-1"
                        to={`/read/${student._id}`}
                      >
                        Read
                      </Link>
                      <Link
                        className="btn btn-sm btn-warning mx-1"
                        to={`/edit/${student._id}`}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="btn btn-sm btn-danger mx-1"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Home;
