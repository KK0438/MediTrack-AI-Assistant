// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-blue-600 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              <span className="text-blue-800">Medi</span>
              <span className="text-green-800">Track</span>
            </h2>
            <p className="text-blue-100">
              Never miss your medicine again. Manage your health with smart
              reminders and AI assistance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-blue-200 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-blue-200 transition">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-200 transition">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-200 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="text-blue-100">Email: support@meditrack.com</p>
            <p className="text-blue-100 mt-2">Phone: +91 7981822250</p>
            <p className="text-blue-100 mt-2">Hyderabad, India</p>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-500 mt-8 pt-6 text-center text-blue-200 text-sm">
          © {new Date().getFullYear()} MediTrack. All rights reserved.
        </div>

      </div>
    </footer>
  );
}

export default Footer;