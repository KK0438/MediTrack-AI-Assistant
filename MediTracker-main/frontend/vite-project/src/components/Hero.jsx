import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import HeroImage from "../assets/hero.png"; // Make sure hero.png exists
import Features from "./Features";
import { AppContext } from "../context/AppContext";

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

          {/* Button */}
          <button
            onClick={() => navigate(user ? "/dashboard" : "/register")}
            className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold 
  hover:bg-white hover:text-blue-600 transition duration-300 shadow-lg"
          >
            {user ? "Go to Dashboard" : "Get Started"}
          </button>

        </div>
      </div>
       <Features />
    </div>
  );
}

export default Hero;