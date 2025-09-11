// src/pages/Job.js
import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { Modal, Input as AntInput, Form, Button as AntButton, Select, DatePicker, Checkbox } from 'antd';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import '../styles/Jobs.css';
import Navbar from './NavigationBar';

const { Option } = Select;

const Job = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form] = Form.useForm();
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [scannedAadhaar, setScannedAadhaar] = useState('');
  const webcamRef = useRef(null);

  const fetchJobs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'jobs'));
      const jobsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          category: data.category || '',
          location: data.location || '',
          salary: data.salary || 0,
          creatorUid: data.creatorUid || '', // ✅ for chat support
          ...data
        };
      });
      setJobs(jobsList);
      setFilteredJobs(jobsList);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('Please log in to apply.');
        return;
      }

      await addDoc(collection(db, 'applications'), {
        ...values,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        creatorUid: selectedJob.creatorUid || '', // ✅ Fix undefined error
        userId: user.uid,
        status: 'Pending',
        appliedAt: new Date(),
      });

      toast.success('Application submitted!');
      form.resetFields();
      setIsApplyModalVisible(false);
    } catch (err) {
      console.error(err);
      toast.error('Error submitting application.');
    }
  };

  const handleScan = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    toast.info('Scanning Aadhaar...');
    try {
      const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng');
      const match = text.match(/\d{4}\s?\d{4}\s?\d{4}/);
      if (match) {
        const clean = match[0].replace(/\s/g, '');
        setScannedAadhaar(clean);
        form.setFieldsValue({ aadharNumber: clean });
        toast.success('Aadhaar scanned successfully!');
      } else {
        toast.error('Could not detect Aadhaar number');
      }
    } catch (err) {
      console.error(err);
      toast.error('OCR failed');
    }
    setIsScannerVisible(false);
  };

  useEffect(() => {
    let filtered = jobs;
    const term = search.toLowerCase();

    filtered = filtered.filter(job => {
      const title = (job.title || '').toLowerCase();
      const category = (job.category || '').toLowerCase();
      const location = (job.location || '').toLowerCase();
      return (
        title.includes(term) ||
        category.includes(term) ||
        location.includes(term)
      );
    });

    if (minSalary) filtered = filtered.filter(job => Number(job.salary) >= Number(minSalary));
    if (maxSalary) filtered = filtered.filter(job => Number(job.salary) <= Number(maxSalary));

    setFilteredJobs(filtered);
  }, [search, minSalary, maxSalary, jobs]);

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className='nav'><Navbar />
      <div className="jobs-page">
        <h1 className="page-heading">Find Jobs Near You</h1>

        <div className="jobs-filters">
          <input
            type="text"
            placeholder="Search by title, sector, or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="number"
            placeholder="Min Salary"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Salary"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
          />
        </div>

        <div className="jobs-grid">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <h2>{job.title}</h2>
                <p>Sector: {job.category}</p>
                <p>Location: {job.location}</p>
                <p>Salary: ₹{job.salary}/month</p>
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setIsApplyModalVisible(true);
                  }}
                >
                  Apply Now
                </button>
              </div>
            ))
          ) : (
            <p className="no-jobs-message">No jobs match your search or filter.</p>
          )}
        </div>

        {/* Apply Modal */}
        <Modal
          title={`Apply for ${selectedJob?.title}`}
          open={isApplyModalVisible}
          onCancel={() => setIsApplyModalVisible(false)}
          footer={null}
        >
          <Form layout="vertical" onFinish={handleSubmit} form={form}>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}><AntInput /></Form.Item>
            <Form.Item name="fatherName" label="Father's Name" rules={[{ required: true }]}><AntInput /></Form.Item>
            <Form.Item name="dob" label="Date of Birth" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="nativePlace" label="Native Place" rules={[{ required: true }]}><AntInput /></Form.Item>
            <Form.Item name="aadharNumber" label="Aadhaar Number" rules={[{ required: true, len: 12, message: '12 digits required' }]}>
              <AntInput
                value={scannedAadhaar}
                onChange={e => setScannedAadhaar(e.target.value)}
                addonAfter={<AntButton onClick={() => setIsScannerVisible(true)}>Scan</AntButton>}
              />
            </Form.Item>
            <Form.Item name="confirmAadhar" valuePropName="checked" rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('Confirm Aadhaar') }]}> <Checkbox>I confirm this Aadhaar is mine</Checkbox></Form.Item>
            <Form.Item name="contact" label="Contact" rules={[{ required: true }]}><AntInput /></Form.Item>
            <Form.Item name="age" label="Age" rules={[{ required: true }]}><AntInput /></Form.Item>
            <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
              <Select>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item name="experience" label="Experience (yrs)" rules={[{ required: true }]}><AntInput /></Form.Item>
            <Form.Item name="skills" label="Skills" rules={[{ required: true }]}><AntInput /></Form.Item>
            <Form.Item><AntButton type="primary" htmlType="submit" block>Submit Application</AntButton></Form.Item>
          </Form>
        </Modal>

        {/* Aadhaar Scanner Modal */}
        <Modal
          title="Scan Aadhaar Card"
          open={isScannerVisible}
          onCancel={() => setIsScannerVisible(false)}
          footer={[
            <AntButton key="cancel" onClick={() => setIsScannerVisible(false)}>Cancel</AntButton>,
            <AntButton key="scan" type="primary" onClick={handleScan}>Capture & Scan</AntButton>
          ]}
        >
          <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" width="100%" videoConstraints={{ facingMode: 'environment' }} />
        </Modal>
      </div>
    </div>
  );
};

export default Job;