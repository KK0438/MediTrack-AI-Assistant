// src/pages/About.jsx
import React from "react";
import AboutImage from "../assets/aboutRem.png";

function About() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
             <span className="text-blue-600">Medi</span>
             <span className="text-green-600">Track</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            MediTrack is a smart healthcare companion designed to simplify 
            medication management, improve health consistency, and empower 
            users with intelligent tracking tools.
          </p>
        </div>

        {/* About + Image Section */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center mb-20">

          {/* Mission Text */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>

            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Our mission is to make healthcare management simple, reliable, and stress-free. 
              Many people struggle with remembering their medication schedules, which can 
              directly impact their health and recovery process.
            </p>

            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              MediTrack provides intelligent reminders, detailed tracking systems, and 
              personalized insights to ensure users stay consistent with their prescribed 
              treatments. We believe technology should support better health decisions 
              through simplicity and accessibility.
            </p>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <img
              src={AboutImage}
              alt="Medicine Reminder Illustration"
              className="w-full max-w-md md:max-w-xl rounded-2xl shadow-xl hover:shadow-xl transition duration-300"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-16">

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖 AI Assistant</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Get intelligent suggestions, medication insights, and personalized
              health guidance powered by smart AI integration.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 Health Tracking</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Monitor medicine intake, view historical records,
              and analyze your health consistency over time.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">⏰ Smart Reminders</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Automated notifications ensure you take the right medicine
              at the right time — every single day.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🔐 Secure Authentication</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Protected login system with token-based authentication
              to keep your health data private and secure.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📅 Calendar Monitoring</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Visual calendar with taken (green) and missed (red)
              indicators for better medication tracking.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🧾 Prescription Management</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Upload and store medical prescriptions securely.
              Easily access doctor recommendations and medicine details anytime.
            </p>
          </div>

        </div>

        {/* Why Choose Us Section */}
        <div className="mt-10">

          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              Why Choose MediTrack?
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              We combine innovation, security, and user-friendly design 
              to deliver a trusted and reliable healthcare management experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
              <h3 className="text-xl font-bold text-blue-600 mb-2">99%</h3>
              <p className="text-gray-500 text-sm sm:text-base">Reminder Accuracy</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
              <h3 className="text-xl font-bold text-blue-600 mb-2">24/7</h3>
              <p className="text-gray-500 text-sm sm:text-base">Smart AI Assistance</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
              <h3 className="text-xl font-bold text-blue-600 mb-2">Secure</h3>
              <p className="text-gray-500 text-sm sm:text-base">Encrypted Data Protection</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
              <h3 className="text-xl font-bold text-blue-600 mb-2">10K+</h3>
              <p className="text-gray-500 text-sm sm:text-base">Happy Users</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default About;