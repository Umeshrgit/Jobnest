import React, { useState, useEffect } from 'react';
import {
  Tabs, Button, Modal, Form, Input, InputNumber, Dropdown, Menu, Badge
} from 'antd';
import { toast, ToastContainer } from 'react-toastify';
import Cookies from './Cookies';
import 'react-toastify/dist/ReactToastify.css';
import { EllipsisOutlined } from '@ant-design/icons';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import '../styles/Creator.css';
import Navbar from './NavigationBar';
import ChatBox from '../components/ChatBox'; // ✅ ChatBox imported

const { TabPane } = Tabs;

const Creator = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [editingJobId, setEditingJobId] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              if (userData.role === 'creator') {
                const creatorId = currentUser.uid;
                const querySnapshot = await getDocs(collection(db, 'jobs'));
                const jobList = querySnapshot.docs
                  .map(doc => ({ id: doc.id, ...doc.data() }))
                  .filter(job => job.creatorId === creatorId);

                setJobs(jobList);
                fetchApplications(jobList);
                return;
              } else {
                await signOut(auth);
                toast.error("Access denied: Not a creator.");
                window.location.href = '/Unauthorized';
              }
            } else {
              await signOut(auth);
              toast.error("User profile not found.");
              window.location.href = '/';
            }
          } catch (error) {
            console.error("Error checking role:", error);
            toast.error("Error validating role.");
          }
        } else {
          window.location.href = '/';
        }
      });

      return () => unsubscribe();
    };

    checkAuthAndRole();
  }, []);

  const fetchJobs = async (creatorId) => {
    const querySnapshot = await getDocs(collection(db, 'jobs'));
    const jobList = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(job => job.creatorId === creatorId);

    setJobs(jobList);
    fetchApplications(jobList);
  };

  const fetchApplications = async (creatorJobs = []) => {
    if (creatorJobs.length === 0) {
      setApplications([]);
      setPendingCount(0);
      return;
    }

    const jobIds = creatorJobs.map(job => job.id);
    const querySnapshot = await getDocs(collection(db, 'jobApplications'));

    const appList = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(app => jobIds.includes(app.jobId));

    setApplications(appList);

    const pending = appList.filter(app => app.status === 'pending').length;
    setPendingCount(pending);
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    setEditingJobId(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingJobId(null);
  };

  const handlePostJob = async (values) => {
    try {
      const currentUser = auth.currentUser;

      if (editingJobId) {
        await updateDoc(doc(db, 'jobs', editingJobId), values);
        toast.success('Job updated!');
      } else {
        await addDoc(collection(db, 'jobs'), {
          ...values,
          creatorId: currentUser.uid,
        });
        toast.success('Job posted!');
      }
      fetchJobs(currentUser.uid);
      handleCancel();
    } catch (error) {
      toast.error('Error saving job.');
      console.error(error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      toast.success('Job deleted!');
      const currentUser = auth.currentUser;
      fetchJobs(currentUser.uid);
    } catch (error) {
      toast.error('Failed to delete job.');
      console.error(error);
    }
  };

  const handleEditJob = (job) => {
    form.setFieldsValue(job);
    setEditingJobId(job.id);
    setIsModalVisible(true);
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'jobApplications', id), { status });
      toast.success(`Application ${status}`);
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update status.');
      console.error(error);
    }
  };

  const jobMenu = (job) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => handleEditJob(job)}>Edit</Menu.Item>
      <Menu.Item key="delete" danger onClick={() => handleDeleteJob(job.id)}>Delete</Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Navbar />
      <div className="creator-container">
        <ToastContainer />
        <div className="creator-header">
          <h2 className="creator-title">Creator Dashboard</h2>
          <Button type="primary" onClick={showModal}>Post a Job</Button>
        </div>

        <Tabs defaultActiveKey="1" className="creator-tabs">
          <TabPane tab="Posted Jobs" key="1">
            <div className="job-list">
              {jobs.length ? jobs.map(job => (
                <div className="job-card" key={job.id}>
                  <div className="job-card-header">
                    <h3>{job.title}</h3>
                    <Dropdown overlay={jobMenu(job)} trigger={['click']}>
                      <EllipsisOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
                    </Dropdown>
                  </div>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Salary:</strong> ₹{job.salary}</p>
                  <p>{job.description}</p>
                </div>
              )) : <p>No jobs posted.</p>}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                Review Applications{' '}
                {pendingCount > 0 && (
                  <Badge count={pendingCount} size="small" style={{ backgroundColor: '#f5222d', marginLeft: 8 }} />
                )}
              </span>
            }
            key="2"
          >
            <div className="application-list">
              {applications.length ? applications.map(app => (
                <div className="application-card" key={app.id}>
                  <h3>{app.fullName} applied for <strong>{app.jobTitle}</strong></h3>
                  <p><strong>Contact:</strong> {app.contact}</p>
                  <p><strong>Status:</strong> {app.status}</p>

                  {app.status === 'pending' && (
                    <div style={{ marginTop: '10px' }}>
                      <Button type="primary" onClick={() => updateApplicationStatus(app.id, 'accepted')} style={{ marginRight: 8 }}>Accept</Button>
                      <Button danger onClick={() => updateApplicationStatus(app.id, 'rejected')}>Reject</Button>
                    </div>
                  )}

                  {/* ✅ Chat shows if accepted */}
                  {app.status === 'accepted' && (
                    <div style={{ marginTop: 10 }}>
                      <h4>Chat with Applicant:</h4>
                      <ChatBox chatId={`${app.jobId}_${auth.currentUser.uid}_${app.applicantId}`} />
                    </div>
                  )}
                </div>
              )) : <p>No applications yet.</p>}
            </div>
          </TabPane>
        </Tabs>

        <Modal
          title={editingJobId ? "Edit Job" : "Post a New Job"}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form layout="vertical" form={form} onFinish={handlePostJob}>
            <Form.Item name="title" label="Job Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="location" label="Location" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="salary" label="Salary (₹)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="description" label="Job Description" rules={[{ required: true }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {editingJobId ? "Update Job" : "Submit Job"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <Cookies />
    </div>
  );
};

export default Creator;
