import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import homeImg from './home.png'; 

function Home() {
  const [data, setData] = useState([]);
  const [deleted, setDeleted] = useState(true);

  useEffect(() => {
    if (deleted) {
      setDeleted(false);
      axios
        .get('/students')
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [deleted]);

  function handleDelete(id) {
    axios
      .delete(`/delete/${id}`)
      .then((res) => {
        setDeleted(true);
      })
      .catch((err) => console.log(err));
  }

  return (
    <div
      className="container-fluid bg-light min-vh-100 py-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${homeImg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="card p-4 mx-auto shadow-lg" style={{ maxWidth: '1000px', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="text-primary">Student Records</h3>
          <div className="d-flex gap-2">
            <Link className="btn btn-outline-secondary" to="/classrooms">
              Classrooms
            </Link>
            <Link className="btn btn-success" to="/create">
              ➕ Add Student
            </Link>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover">
            <thead className="table-dark text-center">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((student) => (
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
