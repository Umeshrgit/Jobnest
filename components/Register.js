import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const Register = () => {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Please select a role.');
      return;
    }

    try {
      // Step 1: Register with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Step 2: Save user data to Firestore
      await setDoc(doc(db, 'users', uid), {
        email,
        role,
        createdAt: new Date(),
      });

      // ✅ Step 3: Set login flag in localStorage
      localStorage.setItem('isLoggedIn', 'true');

      // ✅ Step 4: Redirect based on role
      if (role === 'employee') {
        navigate('/employee');
      } else if (role === 'creator') {
        navigate('/creator');
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Register</h2>

        {error && <p className="error">{error}</p>}

        <div className="role-select">
          <button
            className={role === 'employee' ? 'active' : ''}
            onClick={() => setRole('employee')}
            type="button"
          >
            Job Employee
          </button>
          <button
            className={role === 'creator' ? 'active' : ''}
            onClick={() => setRole('creator')}
            type="button"
          >
            Job Creator
          </button>
        </div>

        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Register</button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
