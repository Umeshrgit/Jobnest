import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Login
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const uid = userCredential.user.uid;

      // Fetch role from Firestore
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role;

        toast.success(`Login successful as ${role}`);

        // Navigate based on role
        if (role === 'employee') {
          navigate('/employee');
        } else if (role === 'creator') {
          navigate('/creator');
        } else {
          toast.error('Role not assigned.');
        }
      } else {
        toast.error('User profile not found in Firestore.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <Card title="Login to Jobnest" className="login-card">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
          </Form.Item>

          <div className="login-links">
            <Link to="/ForgotPassword">Forgot Password?</Link><br />
            <span>Don't have an account? <Link to="/Register">Register</Link></span>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
