// src/pages/MyMedicine.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const MyMedicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [editData, setEditData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/medicines`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMedicines(res.data);
    } catch (error) {
      console.error("Error fetching medicines", error);
      alert("Failed to fetch medicines. Are you logged in?");
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/medicines/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMedicines();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleEditClick = (medicine) => {
    setEditingId(medicine._id);
    setEditData(medicine);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/medicines/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingId(null);
      fetchMedicines();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">My Medicines</h1>

      {medicines.length === 0 && (
        <p className="text-gray-600 text-center">No medicines added yet.</p>
      )}

      <div className="space-y-4">
        {medicines.map((med) => (
          <div
            key={med._id}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col md:flex-row justify-between border"
          >
            {/* Left - Details */}
            <div className="flex-1 mb-4 md:mb-0 md:mr-4">
              {editingId === med._id ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    className="border p-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="dosage"
                    value={editData.dosage}
                    onChange={handleChange}
                    className="border p-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    name="startDate"
                    value={editData.startDate?.split("T")[0]}
                    onChange={handleChange}
                    className="border p-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={editData.endDate?.split("T")[0]}
                    onChange={handleChange}
                    className="border p-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="frequency"
                    value={editData.frequency}
                    onChange={handleChange}
                    className="border p-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    className="border p-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">{med.name}</h2>
                  <p><strong>Dosage:</strong> {med.dosage}</p>
                  <p><strong>Frequency:</strong> {med.frequency}</p>
                  <p><strong>Start:</strong> {new Date(med.startDate).toLocaleDateString()}</p>
                  <p><strong>End:</strong> {new Date(med.endDate).toLocaleDateString()}</p>
                  <p><strong>Times:</strong> {med.times?.join(", ")}</p>
                </>
              )}
            </div>

            {/* Right - Buttons */}
            <div className="flex flex-wrap md:flex-col gap-2">
              {editingId === med._id ? (
                <>
                  <button
                    onClick={() => handleUpdate(med._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full md:w-auto"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 w-full md:w-auto"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEditClick(med)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(med._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full md:w-auto"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyMedicine;