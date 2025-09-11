import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css'
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaSearch,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaMobileAlt,
} from 'react-icons/fa';

const categories = [
  { icon: '👷', name: 'Construction' },
  { icon: '🚚', name: 'Delivery' },
  { icon: '🧹', name: 'Housekeeping' },
  { icon: '🛍️', name: 'Retail' },
  { icon: '🍽️', name: 'Food Service' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 px-4 py-10 text-center">
      {/* Hero Section */}
      <section className="mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Find Local Jobs Fast — Jobnest</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          A nest of opportunities for daily wage and hyperlocal workers
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/jobs">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-lg">
              Explore Jobs
            </button>
          </Link>
          <Link to="/post-job">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl text-lg">
              Post a Job
            </button>
          </Link>
        </div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/4333/4333609.png"
          alt="Worker Illustration"
          className="mx-auto mt-12 w-60 md:w-72"
        />
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-4">
            <FaSearch className="text-3xl mb-2 text-blue-600 mx-auto" />
            <p className="font-semibold">Easy Search</p>
            <p className="text-sm text-gray-600">Filter jobs by sector, pay, or location</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <FaMapMarkerAlt className="text-3xl mb-2 text-red-500 mx-auto" />
            <p className="font-semibold">Local Listings</p>
            <p className="text-sm text-gray-600">Jobs near your location</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <FaShieldAlt className="text-3xl mb-2 text-yellow-600 mx-auto" />
            <p className="font-semibold">Verified Employers</p>
            <p className="text-sm text-gray-600">Only verified job creators can post</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <FaMobileAlt className="text-3xl mb-2 text-green-500 mx-auto" />
            <p className="font-semibold">Mobile Friendly</p>
            <p className="text-sm text-gray-600">Apply or post a job right from your phone</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Browse Job Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-items-center">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="w-32 h-32 flex items-center justify-center flex-col text-lg shadow-md rounded-2xl bg-white hover:shadow-xl"
            >
              <span className="text-3xl mb-1">{cat.icon}</span>
              {cat.name}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 text-sm text-gray-700 border-t">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 justify-center">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <div className="mt-4 flex justify-center gap-4 text-2xl text-gray-600">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        </div>
      </footer>
    </div>
  );
}
