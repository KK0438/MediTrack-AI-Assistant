// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios";

const History = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [medicineFilter, setMedicineFilter] = useState("");

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await API.get("/dashboard/history");
      setHistory(res.data);
      setFilteredHistory(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filters
  useEffect(() => {
    let filtered = history;

    if (dateFilter) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.date).toISOString().split("T")[0] === dateFilter
      );
    }

    if (medicineFilter) {
      filtered = filtered.filter((item) =>
        item.medicineName.toLowerCase().includes(medicineFilter.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
  }, [dateFilter, medicineFilter, history]);

  const getStatusStyle = (status) => {
    if (status === "Taken") return "bg-green-500 text-white";
    if (status === "Missed") return "bg-red-500 text-white";
    return "bg-yellow-400 text-black";
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Medicine History</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium">Filter by Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border p-2 rounded mt-1 w-full"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium">Filter by Medicine</label>
          <input
            type="text"
            placeholder="Enter medicine name"
            value={medicineFilter}
            onChange={(e) => setMedicineFilter(e.target.value)}
            className="border p-2 rounded mt-1 w-full"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Medicine</th>
              <th className="px-6 py-3">Dose</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No history found
                </td>
              </tr>
            ) : (
              filteredHistory.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 font-medium">{item.medicineName}</td>
                  <td className="px-6 py-3">{item.dose}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredHistory.length === 0 ? (
          <p className="text-center text-gray-500">No history found</p>
        ) : (
          filteredHistory.map((item, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow flex flex-col"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{item.medicineName}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(item.status)}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="text-gray-600 text-sm">
                <p>
                  <strong>Date:</strong> {new Date(item.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Dose:</strong> {item.dose}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;