// src/components/Features.jsx
import React from "react";

function Features() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <h1 className="text-4xl font-bold text-center text-black mb-4">
          Our Features
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Everything you need to manage your medicines effectively
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Card 1 */}
          <div className="bg-blue-700 p-8 rounded-xl shadow-md hover:shadow-2xl hover:scale-105 transition duration-300 text-center">
            <div className="text-5xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold text-black">
              Smart Reminders
            </h3>
            <p className="text-gray-300 mt-3">
              Receive timely alerts so you never miss your medication again.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-blue-700 p-8 rounded-xl shadow-md hover:shadow-2xl hover:scale-105 transition duration-300 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-black">
              Track Adherence
            </h3>
            <p className="text-gray-300 mt-3">
              Monitor your daily intake and check your consistency rate.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-blue-700 p-8 rounded-xl shadow-md hover:shadow-2xl hover:scale-105 transition duration-300 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-black">
              Medicine History
            </h3>
            <p className="text-gray-300 mt-3">
              View records of taken and missed medicines anytime.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-blue-700 p-8 rounded-xl shadow-md hover:shadow-2xl hover:scale-105 transition duration-300 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-black">
              AI Health Assistant
            </h3>
            <p className="text-gray-300 mt-3">
              Ask medicine-related questions and get instant help.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Features;