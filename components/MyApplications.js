// src/components/MyApplications.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Tag,
  Spin,
  Typography,
  Avatar,
  Dropdown,
  Menu,
  Pagination,
  Badge,
} from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { toast, ToastContainer } from 'react-toastify';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import Navbar from './NavigationBar';
import ChatBox from '../components/ChatBox';
import '../styles/MyApplications.css';

const { Title, Paragraph } = Typography;

const renderStatusTag = (status) => {
  if (status === 'accepted') return <Tag color="green">Accepted</Tag>;
  if (status === 'rejected') return <Tag color="red">Rejected</Tag>;
  return <Tag color="gold" className="pulse-tag">Pending</Tag>;
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [unreadChats, setUnreadChats] = useState({});
  const pageSize = 4;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userSnap.exists() ? userSnap.data() : null;

          if (userData?.role === 'employee') {
            setUser(currentUser);
          } else {
            toast.error('Access denied: Not an employee');
            await signOut(auth);
            window.location.href = '/Unauthorized';
          }
        } catch (err) {
          console.error(err);
          toast.error('Error validating user');
          await signOut(auth);
          window.location.href = '/';
        } finally {
          setLoading(false);
        }
      } else {
        window.location.href = '/';
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      try {
        const snapshot = await getDocs(collection(db, 'jobApplications'));
        const userApps = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((app) => app.applicantId === user.uid);
        setApplications(userApps);
      } catch (err) {
        toast.error('Failed to fetch applications');
      }
    };

    if (user) fetchApplications();
  }, [user]);

  useEffect(() => {
    if (!user || applications.length === 0) return;

    const unsubscribes = [];

    applications.forEach((app) => {
      if (app.status === 'accepted' && app.creatorUid && app.jobId) {
        const chatId = `${app.jobId}_${app.creatorUid}_${user.uid}`;
        const chatRef = doc(db, 'chats', chatId);

        const unsubscribe = onSnapshot(chatRef, (chatSnap) => {
          const data = chatSnap.data();
          if (!data) return;

          const lastMessage = data.messages?.[data.messages.length - 1];
          if (lastMessage?.senderId === app.creatorUid) {
            setUnreadChats((prev) => ({ ...prev, [chatId]: true }));
          } else {
            setUnreadChats((prev) => ({ ...prev, [chatId]: false }));
          }
        });

        unsubscribes.push(unsubscribe);
      }
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [applications, user]);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  const paginatedApps = applications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const menu = (
    <Menu>
      <Menu.Item key="email" disabled>
        {user?.email}
      </Menu.Item>
      <Menu.Item key="messages">
  <Link to="/messages">My Messages</Link>
</Menu.Item>

      <Menu.Item key="logout" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  if (loading) return <Spin fullscreen />;

  return (
    <div className="my-applications-page">
      <Navbar />
      <ToastContainer />

      <div className="profile-container">
        <Dropdown overlay={menu} placement="bottomRight">
          <div className="profile-info">
            <Avatar style={{ backgroundColor: '#1890ff', marginRight: 8 }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <span className="profile-email">{user?.email}</span>
          </div>
        </Dropdown>
      </div>

      <div className="my-applications-container">
        <Title level={2}>My Job Applications</Title>
        {applications.length === 0 ? (
          <Paragraph>No applications found.</Paragraph>
        ) : (
          <>
            {paginatedApps.map((app) => {
              const chatId = `${app.jobId}_${app.creatorUid}_${user.uid}`;
              return (
                <Card
                  key={app.id}
                  title={app.jobTitle}
                  className="application-card"
                  extra={renderStatusTag(app.status)}
                >
                  <p><strong>Full Name:</strong> {app.fullName}</p>
                  <p><strong>Gender:</strong> {app.gender}</p>
                  <p><strong>Age:</strong> {app.age}</p>
                  <p><strong>Father's Name:</strong> {app.fatherName}</p>
                  <p><strong>Native Place:</strong> {app.nativePlace}</p>
                  <p><strong>Contact:</strong> {app.contact}</p>
                  <p><strong>Aadhaar Number:</strong> {app.aadhaarNumber}</p>
                  <p><strong>DOB:</strong> {
                    app.dob
                      ? new Date(app.dob.seconds ? app.dob.seconds * 1000 : app.dob).toLocaleDateString()
                      : 'N/A'
                  }</p>
                  <p><strong>Experience:</strong> {app.experience} years</p>
                  <p><strong>Skills:</strong> {app.skills}</p>

                  {app.status === 'accepted' && (
                    <div style={{ marginTop: 20 }}>
                      <h4>
                        Chat with Job Creator:{' '}
                        <Badge dot={unreadChats[chatId]}>
                          <MessageOutlined style={{ fontSize: '18px', marginLeft: 10 }} />
                        </Badge>
                      </h4>
                      <ChatBox chatId={chatId} />
                    </div>
                  )}
                </Card>
              );
            })}
            <div className="pagination-wrapper">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={applications.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
