import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ForgotPassword.css'; // Optional

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ email }) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Reset email sent! Check your inbox.');
    } catch (error) {
      console.error(error);
      toast.error('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="forgot-container">
      <ToastContainer />
      <Card title="Reset Your Password" className="forgot-card">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your registered email!' },
              { type: 'email', message: 'Enter a valid email address!' },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
