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
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const navigate = useNavigate();

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
    setSubmitError('');
    if (Object.keys(vErrors).length > 0) return;

    setSubmitting(true);
    axios.post('/add_user', { ...values, age: Number(values.age) })
      .then(() => {
        navigate('/');
      })
      .catch(() => setSubmitError('Failed to save student'))
      .finally(() => setSubmitting(false));
  }

  return (
    <div className='form-background d-flex justify-content-center align-items-center'>
      <div className='form-container shadow p-4 bg-white rounded'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h3 className='text-primary'>Add Student</h3>
          <Link to='/' className='btn btn-outline-primary'>Home</Link>
        </div>

        {submitError && (
          <div className='alert alert-danger py-2' role='alert'>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <table className='table table-borderless'>
            <tbody>
              <tr>
                <th className='text-secondary align-middle' style={{ width: '25%' }}>Name</th>
                <td>
                  <input
                    type='text'
                    name='name'
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    required
                    onChange={(e) => setValues({ ...values, name: e.target.value })}
                  />
                  {errors.name && <div className='invalid-feedback'>{errors.name}</div>}
                </td>
              </tr>
              <tr>
                <th className='text-secondary align-middle'>Email</th>
                <td>
                  <input
                    type='email'
                    name='email'
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    required
                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                  />
                  {errors.email && <div className='invalid-feedback'>{errors.email}</div>}
                </td>
              </tr>
              <tr>
                <th className='text-secondary align-middle'>Gender</th>
                <td>
                  <input
                    type='text'
                    name='gender'
                    className={`form-control ${errors.gender ? 'is-invalid' : ''}`}
                    required
                    onChange={(e) => setValues({ ...values, gender: e.target.value })}
                  />
                  {errors.gender && <div className='invalid-feedback'>{errors.gender}</div>}
                </td>
              </tr>
              <tr>
                <th className='text-secondary align-middle'>Age</th>
                <td>
                  <input
                    type='number'
                    name='age'
                    className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                    required
                    onChange={(e) => setValues({ ...values, age: e.target.value })}
                  />
                  {errors.age && <div className='invalid-feedback'>{errors.age}</div>}
                </td>
              </tr>
              <tr>
                <td colSpan='2' className='text-center'>
                  <button type='submit' className='btn btn-primary px-4' disabled={submitting}>
                    {submitting ? 'Saving…' : 'Save'}
                  </button>
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
