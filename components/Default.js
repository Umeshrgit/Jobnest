import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Default.css';
import saloonImg from '..//Assests/saloon.png'


const Default = () => {
  return (
    <div className="page-wrapper">

      {/* Hero Section */}
      <section className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Jobnest</h1>
          <p className="hero-subtitle">
            <strong>A nest of jobs, nearby and safe. Feels like home.</strong><br />
            <span className="highlight-line">Where hands find work, and families find hope.</span>
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn primary-btn">Login</Link>
            <Link to="/register" className="btn secondary-btn">Register</Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="info-section">
        <h2>Why Jobnest?</h2>
        <p>
          Jobnest is built for everyday people — helpers, shopkeepers, delivery partners,
          and anyone who wants honest local work. We connect you with trusted employers nearby
          without the need for degrees or resumes.
        </p>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <ul>
          <li>📍 Choose your location</li>
          <li>🧰 Select job category</li>
          <li>📲 Apply with one click — no long forms</li>
        </ul>
      </section>
      

      <section className="job-categories-section">
  <div className="categories-container">
    <h2 className="section-title">Popular Job Categories</h2>
    <p className="section-subtitle">Explore opportunities in various fields</p>

    <div className="categories-grid">
      {[
        { name: "Cutting Shop", image: saloonImg },
        { name: "Helper/Assistant", image: process.env.PUBLIC_URL + "/assets/icons/helper.png" },
        { name: "Sales Associate", image: process.env.PUBLIC_URL + "/assets/icons/sales.png" },
        { name: "Kitchen Staff", image: process.env.PUBLIC_URL + "/assets/icons/kitchen.png" },
        { name: "Delivery Boy", image: process.env.PUBLIC_URL + "/assets/icons/delivery.png" },
        { name: "Security Guard", image: process.env.PUBLIC_URL + "/assets/icons/security.png" },
        { name: "Cleaner", image: process.env.PUBLIC_URL + "/assets/icons/cleaner.png" },
        { name: "Mechanic", image: process.env.PUBLIC_URL + "/assets/icons/mechanic.png" },
      ].map((category, index) => (
        <div className="category-card" key={index}>
  <div className="category-image-wrapper">
    <img src={category.image} alt={category.name} />
    <div className="gradient-overlay"></div>
    <div className="category-name">{category.name}</div>
  </div>
</div>

      ))}
    </div>
  </div>
</section>


      

    </div>
  );
};

export default Default;
