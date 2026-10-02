// src/pages/AddMedicine.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const AddMedicine = () => {
  const { user } = useContext(AppContext);
  const [medicine, setMedicine] = useState({
    name: "",
    dosage: "",
    frequency: "Daily",
    startDate: "",
    endDate: "",
    times: [""],
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
    setMedicine((prev) => ({ ...prev, times: [...prev.times, ""] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/medicines`,
        medicine,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Medicine added successfully!");
      setMedicine({
        name: "",
        dosage: "",
        frequency: "Daily",
        startDate: "",
        endDate: "",
        times: [""],
      });
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Error adding medicine. Please try again."
      );
    }
  };

  return (
    <div className="flex justify-center p-4 md:p-8 bg-gray-100 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white shadow-md rounded-md p-6 md:p-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Add Medicine
        </h2>

        {/* Medicine Name */}
        <label className="block mb-2 text-gray-700">Medicine Name</label>
        <input
          type="text"
          name="name"
          value={medicine.name}
          onChange={handleChange}
          className="border p-2 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Dosage */}
        <label className="block mb-2 text-gray-700">Dosage</label>
        <input
          type="text"
          name="dosage"
          value={medicine.dosage}
          onChange={handleChange}
          className="border p-2 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Frequency */}
        <label className="block mb-2 text-gray-700">Frequency</label>
        <select
          name="frequency"
          value={medicine.frequency}
          onChange={handleChange}
          className="border p-2 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Once">Once</option>
        </select>

        {/* Start Date */}
        <label className="block mb-2 text-gray-700">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={medicine.startDate}
          onChange={handleChange}
          className="border p-2 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* End Date */}
        <label className="block mb-2 text-gray-700">End Date</label>
        <input
          type="date"
          name="endDate"
          value={medicine.endDate}
          onChange={handleChange}
          className="border p-2 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Times */}
        <label className="block mb-2 text-gray-700">Times</label>
        {medicine.times.map((time, index) => (
          <input
            key={index}
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(index, e.target.value)}
            className="border p-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        ))}

        <button
          type="button"
          onClick={addTimeField}
          className="text-blue-500 mb-4 hover:underline"
        >
          + Add Time
        </button>

        <button
          type="submit"
          className="bg-blue-500 text-white p-3 rounded w-full hover:bg-blue-600 transition"
        >
          Add Medicine
        </button>
      </form>
    </div>
  );
};

export default AddMedicine;