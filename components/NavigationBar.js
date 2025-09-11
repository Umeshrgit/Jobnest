import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Avatar, Dropdown, Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import '../styles/NavigationBar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // Fetch user and role from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setRole(userDocSnap.data().role);
          } else {
            console.warn('User document not found in Firestore.');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        navigate('/'); // redirect to login if not logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  // Dropdown menu for avatar
  const menu = (
    <Menu>
      <Menu.Item key="logout" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to={role === 'creator' ? "/creator" : "/employee"} className="logo">Jobnest</Link>
      </div>

      <div className="navbar-links">
        {role === 'creator' && (
          <>
            <Link to="/creator">Home</Link>
            <Link to="/creator/create">Create Job</Link>
            <Link to="/creator/review">Review Applications</Link>
          </>
        )}
        {role === 'employee' && (
          <>
            <Link to="/employee">Home</Link>
            <Link to="/jobs">Jobs</Link>
            <Link to="/myapplications">My Applications</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {user && (
          <>
            <span className="user-name">{user.displayName || user.email}</span>
            <Dropdown overlay={menu} placement="bottomRight">
              <Avatar
                icon={<UserOutlined />}
                style={{
                  cursor: 'pointer',
                  backgroundColor: '#2575fc',
                  marginLeft: '10px'
                }}
              />
            </Dropdown>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
