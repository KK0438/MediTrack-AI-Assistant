// src/pages/AddMedicine.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AppContext } from "../context/AppContext";
import { FaFilePrescription, FaPills, FaCamera } from "react-icons/fa";

const AddMedicine = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState({
    name: "",
    dosage: "",
    frequency: "Daily",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    times: ["09:00 AM"],
    currentStock: 30,
    unit: "tablets",
    dosePerIntake: 1,
    refillThreshold: 5,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicine((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...medicine.times];
    newTimes[index] = value;
    setMedicine((prev) => ({ ...prev, times: newTimes }));
  };

  const addTimeField = () => {
    setMedicine((prev) => ({ ...prev, times: [...prev.times, "09:00 AM"] }));
  };

  const removeTimeField = (index) => {
    if (medicine.times.length <= 1) return;
    setMedicine((prev) => ({
      ...prev,
      times: prev.times.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/medicines", {
        ...medicine,
        currentStock: Number(medicine.currentStock) || 30,
        dosePerIntake: Number(medicine.dosePerIntake) || 1,
        refillThreshold: Number(medicine.refillThreshold) || 5,
      });

      alert("Medicine added successfully with Smart Refill tracking enabled!");
      navigate("/dashboard/my-medicine");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Error adding medicine. Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Prescription Scanner Banner */}
      <div className="w-full max-w-xl mb-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-5 shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-white/10 rounded-xl text-2xl text-blue-200">
            <FaCamera />
          </span>
          <div>
            <h3 className="font-bold text-base">Have a Prescription or Medicine Strip?</h3>
            <p className="text-xs text-blue-200 mt-0.5">
              Scan with OCR to auto-extract medicine names, dosages, and schedules in seconds.
            </p>
          </div>
        </div>
        <Link
          to="/dashboard/scanner"
          className="w-full sm:w-auto px-4 py-2 bg-white text-blue-800 hover:bg-blue-50 text-xs font-bold rounded-xl shadow transition text-center whitespace-nowrap"
        >
          📷 Scan Prescription
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white shadow-md rounded-2xl p-6 md:p-8 space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Add New Medication
        </h2>
        <p className="text-xs text-gray-500 text-center mb-6">
          Enter medication schedule and pill count for automated dose and refill tracking.
        </p>

        {/* Medicine Name */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Medicine Name *
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Amoxicillin, Metformin"
            value={medicine.name}
            onChange={handleChange}
            className="border p-2.5 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Dosage & Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Dosage & Strength *
            </label>
            <input
              type="text"
              name="dosage"
              placeholder="e.g. 500mg - 1 tablet"
              value={medicine.dosage}
              onChange={handleChange}
              className="border p-2.5 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Frequency
            </label>
            <select
              name="frequency"
              value={medicine.frequency}
              onChange={handleChange}
              className="border p-2.5 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Once">Once</option>
            </select>
          </div>
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={medicine.startDate}
              onChange={handleChange}
              className="border p-2.5 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={medicine.endDate}
              onChange={handleChange}
              className="border p-2.5 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Smart Refill Tracking Fields */}
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <FaPills className="text-blue-600" />
            <span>Smart Refill Tracking Settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-xs font-semibold text-gray-600">
                Pills / Units in Stock
              </label>
              <input
                type="number"
                name="currentStock"
                min="0"
                value={medicine.currentStock}
                onChange={handleChange}
                className="border p-2 w-full rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold text-gray-600">
                Unit Type
              </label>
              <select
                name="unit"
                value={medicine.unit}
                onChange={handleChange}
                className="border p-2 w-full rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tablets">tablets</option>
                <option value="capsules">capsules</option>
                <option value="pills">pills</option>
                <option value="ml">ml</option>
                <option value="puffs">puffs</option>
                <option value="drops">drops</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold text-gray-600">
                Refill Alert When &lt;=
              </label>
              <input
                type="number"
                name="refillThreshold"
                min="1"
                value={medicine.refillThreshold}
                onChange={handleChange}
                className="border p-2 w-full rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-blue-700">
            MediTrack will automatically decrement remaining stock when you mark doses as 'Taken'
            and warn you before you run out!
          </p>
        </div>

        {/* Scheduled Times */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Dose Times
          </label>
          <div className="space-y-2">
            {medicine.times.map((time, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="border p-2 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {medicine.times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTimeField(index)}
                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1 font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addTimeField}
            className="text-blue-600 text-xs font-semibold mt-2 hover:underline inline-block"
          >
            + Add Another Dose Time
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white font-bold p-3 rounded-xl w-full hover:bg-blue-700 transition shadow mt-4"
        >
          Add Medicine to Tracker
        </button>
      </form>
    </div>
  );
};

export default AddMedicine;
