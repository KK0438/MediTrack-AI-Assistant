import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { AppContext } from "../context/AppContext";
import { FaPills, FaPlus, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const MyMedicine = () => {
  const { user } = useContext(AppContext);
  const [medicines, setMedicines] = useState([]);
  const [editData, setEditData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [refillMsg, setRefillMsg] = useState("");

  const fetchMedicines = async () => {
    try {
      const res = await API.get("/medicines");
      setMedicines(res.data);
    } catch (error) {
      console.error("Error fetching medicines", error);
    }
  };

  useEffect(() => {
    setMedicines([]);
    fetchMedicines();
  }, [user?._id || user?.id || user?.email]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await API.delete(`/medicines/${id}`);
      fetchMedicines();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleEditClick = (medicine) => {
    setEditingId(medicine._id);
    setEditData({
      ...medicine,
      currentStock: medicine.currentStock !== undefined ? medicine.currentStock : 30,
      unit: medicine.unit || "tablets",
      refillThreshold: medicine.refillThreshold || 5,
    });
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id) => {
    try {
      await API.put(`/medicines/${id}`, {
        ...editData,
        currentStock: Number(editData.currentStock) || 0,
        refillThreshold: Number(editData.refillThreshold) || 5,
      });
      setEditingId(null);
      fetchMedicines();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  // Quick Refill handler (+30)
  const handleQuickRefill = async (med, amount = 30) => {
    const current = Number(med.currentStock !== undefined ? med.currentStock : 30);
    const updatedStock = current + amount;
    try {
      await API.put(`/medicines/${med._id}`, {
        ...med,
        currentStock: updatedStock,
        lastRefillDate: new Date().toISOString(),
      });
      setRefillMsg(`Added +${amount} pills to ${med.name}! Total: ${updatedStock}`);
      setTimeout(() => setRefillMsg(""), 3500);
      fetchMedicines();
    } catch (err) {
      console.error("Quick refill error:", err);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Medications</h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage your active prescriptions, schedules, and pill inventory.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/dashboard/refills"
              className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-semibold transition"
            >
              Smart Refills Overview
            </Link>
            <Link
              to="/dashboard/add-medicine"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow"
            >
              + Add Medicine
            </Link>
          </div>
        </div>

        {refillMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm animate-fade-in">
            <FaCheckCircle className="text-green-600" />
            {refillMsg}
          </div>
        )}

        {medicines.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl shadow text-gray-500">
            <FaPills className="text-4xl text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">No medicines added yet</h3>
            <p className="text-sm mt-1 mb-4">Add your first medicine manually or scan a prescription.</p>
            <Link
              to="/dashboard/scanner"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              📷 Scan Prescription
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {medicines.map((med) => {
            const stock = Number(med.currentStock !== undefined ? med.currentStock : 30);
            const timesPerDay = med.times?.length || 1;
            const daysRemaining = timesPerDay > 0 ? Math.floor(stock / timesPerDay) : 30;
            const isLow = daysRemaining <= 7 || stock <= (med.refillThreshold || 5);

            return (
              <div
                key={med._id}
                className="bg-white shadow-md rounded-2xl p-5 flex flex-col md:flex-row justify-between border border-gray-100 hover:border-blue-300 transition"
              >
                {/* Left - Details */}
                <div className="flex-1 mb-4 md:mb-0 md:mr-6">
                  {editingId === med._id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Medicine Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleChange}
                            className="border p-2 w-full rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            name="dosage"
                            value={editData.dosage}
                            onChange={handleChange}
                            className="border p-2 w-full rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            value={editData.startDate?.split("T")[0]}
                            onChange={handleChange}
                            className="border p-2 w-full rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={editData.endDate?.split("T")[0]}
                            onChange={handleChange}
                            className="border p-2 w-full rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Frequency
                          </label>
                          <input
                            type="text"
                            name="frequency"
                            value={editData.frequency}
                            onChange={handleChange}
                            className="border p-2 w-full rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Current Stock
                          </label>
                          <input
                            type="number"
                            name="currentStock"
                            value={editData.currentStock}
                            onChange={handleChange}
                            className="border p-2 w-full rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            name="unit"
                            value={editData.unit}
                            onChange={handleChange}
                            className="border p-2 w-full rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          Times (comma separated)
                        </label>
                        <input
                          type="text"
                          name="times"
                          value={editData.times?.join(", ")}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              times: e.target.value.split(",").map((t) => t.trim()),
                            })
                          }
                          className="border p-2 w-full rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-gray-800">{med.name}</h2>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                            isLow
                              ? "bg-red-50 text-red-700 border-red-300"
                              : "bg-green-50 text-green-700 border-green-300"
                          }`}
                        >
                          {isLow ? `Low Stock (${stock} ${med.unit || "tablets"})` : `Stock: ${stock} ${med.unit || "tablets"}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          (~{daysRemaining} days left)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-xs text-gray-600">
                        <p><strong>Dosage:</strong> {med.dosage}</p>
                        <p><strong>Frequency:</strong> {med.frequency}</p>
                        <p><strong>Start:</strong> {new Date(med.startDate).toLocaleDateString()}</p>
                        <p><strong>End:</strong> {new Date(med.endDate).toLocaleDateString()}</p>
                        <p className="sm:col-span-2">
                          <strong>Times:</strong> {med.times?.join(", ") || "09:00 AM"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right - Buttons */}
                <div className="flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
                  {editingId === med._id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(med._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-500 transition"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleQuickRefill(med, 30)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                        title="Add 30 tablets to stock"
                      >
                        +30 Refill
                      </button>
                      <button
                        onClick={() => handleEditClick(med)}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(med._id)}
                        className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyMedicine;
