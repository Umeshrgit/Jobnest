import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Tabs, Modal, Button, Form, Input, Tag, Select, DatePicker, Checkbox,Spin
} from 'antd';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import '../styles/Employee.css';
import Navbar from './NavigationBar';
import Cookies from './Cookies';

const { Option } = Select;

const isValidAadhaarNumber = (number) => /^[2-9]{1}[0-9]{11}$/.test(number);

const Employee = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [isJobDetailModalVisible, setIsJobDetailModalVisible] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scannedAadhaar, setScannedAadhaar] = useState('');

  const form = Form.useForm()[0];
  const webcamRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return void (window.location.href = '/');
      try {
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userSnap.exists() || userSnap.data().role !== 'employee') {
          toast.error('Access denied');
          await signOut(auth);
          return void (window.location.href = '/Unauthorized');
        }
        setUser(currentUser);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error('Error validating user');
        await signOut(auth);
        window.location.href = '/';
      }
    });
    return unsubscribe;
  }, []);

  const fetchJobs = async () => {
    const qs = await getDocs(collection(db, 'jobs'));
    setJobs(qs.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchMyApplications = useCallback(async () => {
    if (!user) return;
    const qs = await getDocs(collection(db, 'jobApplications'));
    setApplications(qs.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(a => a.applicantId === user.uid));
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchMyApplications();
    }
  }, [user, fetchMyApplications]);

  const handleScan = async () => {
    const img = webcamRef.current.getScreenshot();
    toast.info('Scanning Aadhaar...');
    try {
      const { data: { text } } = await Tesseract.recognize(img, 'eng');
      const m = text.match(/\d{4}\s?\d{4}\s?\d{4}/);
      if (m) {
        const num = m[0].replace(/\s/g, '');
        setScannedAadhaar(num);
        form.setFieldsValue({ aadharNumber: num });
        toast.success('Scanned!');
      } else toast.error('Aadhaar not detected');
    } catch {
      toast.error('OCR failed');
    }
    setIsScannerVisible(false);
  };

  const handleApply = async (values) => {
    if (!isValidAadhaarNumber(values.aadharNumber)) {
      return toast.error('Invalid Aadhaar number');
    }
    try {
      await addDoc(collection(db, 'jobApplications'), {
        ...values,
        dob: values.dob.toDate(),
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        applicantId: user.uid,
        creatorUid: auth.currentUser.uid,
          
        timestamp: new Date(),
        status: 'pending',
      });
      toast.success('Applied!');
      fetchMyApplications();
      setIsApplyModalVisible(false);
    } catch (err) {
      console.error(err);
      toast.error('Submission failed');
    }
  };

  const renderTag = (s) => {
    const map = { accepted: 'green', rejected: 'red' };
    return <Tag color={map[s] || 'gold'}>{s}</Tag>;
  };

  if (loading) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <Spin size="large" tip="Loading ..." />
    </div>
  );
}


  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="employee-container">
        <h2>Employee Dashboard</h2>
        <Tabs items={[
          {
            key: '1', label: 'Available Jobs',
            children: jobs.length ? jobs.map(job => (
              <div key={job.id} className="job-card">
                <h3>{job.title}</h3>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Salary:</strong> ₹{job.salary}</p>
                <p>{job.description}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button type="primary" onClick={() => { setSelectedJob(job); setIsApplyModalVisible(true); }}>Apply</Button>
                  <Button onClick={() => { setSelectedJob(job); setIsJobDetailModalVisible(true); }}>View</Button>
                </div>
              </div>
            )) : <p>No jobs</p>
          },
          {
            key: '2', label: 'My Applications',
            children: applications.length ? applications.map(app => (
              <div key={app.id} className="application-card">
                <h3>{app.jobTitle}</h3>
                <p><strong>Status:</strong> {renderTag(app.status)}</p>
                <p><strong>Name:</strong> {app.fullName}</p>
                <p><strong>Father:</strong> {app.fatherName}</p>
                <p><strong>DOB:</strong> {app.dob ? new Date(app.dob.seconds ? app.dob.seconds * 1000 : app.dob).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Native:</strong> {app.nativePlace}</p>
                <p><strong>Aadhaar:</strong> {app.aadharNumber}</p>
                <p><strong>Contact:</strong> {app.contact}</p>
                <p><strong>Experience:</strong> {app.experience} yrs</p>
                <p><strong>Skills:</strong> {app.skills}</p>
              </div>
            )) : <p>No applications</p>
          }
        ]} />

        {/* Apply Modal */}
        <Modal
          title={`Apply for ${selectedJob?.title}`}
          open={isApplyModalVisible}
          onCancel={() => setIsApplyModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleApply}>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="fatherName" label="Father's Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="dob" label="Date of Birth" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="nativePlace" label="Native Place" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="aadharNumber" label="Aadhaar Number" rules={[{ required: true, len: 12, message: '12 digits required' }]}>
              <Input
                value={scannedAadhaar}
                onChange={e => setScannedAadhaar(e.target.value)}
                addonAfter={<Button onClick={() => setIsScannerVisible(true)}>Scan</Button>}
              />
            </Form.Item>
            <Form.Item name="confirmAadhar" valuePropName="checked" rules={[{
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject('Confirm Aadhaar'),
            }]}>
              <Checkbox>I confirm this Aadhaar is mine</Checkbox>
            </Form.Item>
            <Form.Item name="contact" label="Contact" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="age" label="Age" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
              <Select>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item name="experience" label="Experience (yrs)" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="skills" label="Skills" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>Submit</Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Aadhaar Scanner */}
        <Modal
          title="Scan Aadhaar Card"
          open={isScannerVisible}
          onCancel={() => setIsScannerVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsScannerVisible(false)}>Cancel</Button>,
            <Button key="scan" type="primary" onClick={handleScan}>Capture & Scan</Button>
          ]}
        >
          <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" width="100%" videoConstraints={{ facingMode: 'environment' }} />
        </Modal>

        {/* Job Details Modal */}
        <Modal
          title={`Details: ${selectedJob?.title}`}
          open={isJobDetailModalVisible}
          onCancel={() => setIsJobDetailModalVisible(false)}
          footer={[<Button key="close" onClick={() => setIsJobDetailModalVisible(false)}>Close</Button>]}
        >
          {selectedJob && (
            <div>
              <p><strong>Location:</strong> {selectedJob.location}</p>
              <p><strong>Salary:</strong> ₹{selectedJob.salary}</p>
              <p><strong>Description:</strong> {selectedJob.description}</p>
            </div>
          )}
        </Modal>

        <Cookies />
      </div>
    </>
  );
};

export default Employee;

