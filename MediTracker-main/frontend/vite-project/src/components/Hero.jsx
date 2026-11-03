import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import HeroImage from "../assets/hero.png";
import Features from "./Features";
import { AppContext } from "../context/AppContext";
import { FaDownload } from "react-icons/fa";

function Hero() {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);

  return (
    <div className="relative w-full h-screen bg-gray-900">
      
      {/* Background Image */}
      <img
        src={HeroImage}
        alt="Hero"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      {/* Overlay Content */}
      <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-6">
        <div className="max-w-xl">
          
          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Never Miss Your Medicine Again
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-lg text-gray-300">
            Get timely notifications for your medication
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => navigate(user ? "/dashboard" : "/register")}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold 
    hover:bg-white hover:text-blue-600 transition duration-300 shadow-lg"
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </button>

            <button
              onClick={() => navigate("/install")}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-lg font-semibold transition duration-300 shadow-lg flex items-center gap-2 border border-emerald-400/30"
              title="Install MediTracker PWA"
            >
              <FaDownload className="text-base" />
              <span>Install App</span>
              <span className="text-xs bg-emerald-800/80 px-2 py-0.5 rounded-full font-bold">
                ~6 MB
              </span>
            </button>
          </div>

        </div>
      </div>
      <Features />
    </div>
  );
}

export default Hero;
