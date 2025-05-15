import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './create.css'; // Styling separated for neatness

function Create() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    age: '',
    gender: ''
  });

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    axios.post('/add_user', values)
      .then(res => {
        console.log(res);
        navigate('/');
      })
      .catch(err => console.log(err));
  }

  return (
    <div className='form-background d-flex justify-content-center align-items-center'>
      <div className='form-container shadow p-4 bg-white rounded'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h3 className='text-primary'>Add Student</h3>
          <Link to='/' className='btn btn-outline-primary'>Home</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <table className='table table-borderless'>
            <tbody>
              <tr>
                <th className='text-secondary align-middle' style={{ width: '25%' }}>Name</th>
                <td>
                  <input
                    type='text'
                    name='name'
                    className='form-control'
                    required
                    onChange={(e) => setValues({ ...values, name: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <th className='text-secondary align-middle'>Email</th>
                <td>
                  <input
                    type='email'
                    name='email'
                    className='form-control'
                    required
                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <th className='text-secondary align-middle'>Gender</th>
                <td>
                  <input
                    type='text'
                    name='gender'
                    className='form-control'
                    required
                    onChange={(e) => setValues({ ...values, gender: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <th className='text-secondary align-middle'>Age</th>
                <td>
                  <input
                    type='number'
                    name='age'
                    className='form-control'
                    required
                    onChange={(e) => setValues({ ...values, age: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan='2' className='text-center'>
                  <button type='submit' className='btn btn-primary px-4'>Save</button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
}

export default Create;
