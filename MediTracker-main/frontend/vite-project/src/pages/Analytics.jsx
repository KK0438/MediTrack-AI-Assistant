import React, { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AppContext } from "../context/AppContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from "recharts";

const Analytics = () => {
  const { user } = useContext(AppContext);
  const [analytics, setAnalytics] = useState({
    total: 0,
    taken: 0,
    missed: 0,
    pending: 0,
    adherence: 0,
    medicineWise: [],
    monthlyProgress: [],
  });

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/dashboard/analytics");
      setAnalytics({
        total: res.data.total || 0,
        taken: res.data.taken || 0,
        missed: res.data.missed || 0,
        pending: res.data.pending || 0,
        adherence: res.data.adherence || 0,
        medicineWise: res.data.medicineWise || [],
        monthlyProgress: res.data.monthlyProgress || [],
      });
    } catch (error) {
      console.log("Analytics error:", error);
    }
  };

  useEffect(() => {
    setAnalytics({
      total: 0,
      taken: 0,
      missed: 0,
      pending: 0,
      adherence: 0,
      medicineWise: [],
      monthlyProgress: [],
    });
    fetchAnalytics();
  }, [user?._id || user?.id || user?.email]);

  const COLORS = ["#22c55e", "#ef4444", "#facc15"];
  const barData = [
    { name: "Taken", value: analytics.taken || 0 },
    { name: "Missed", value: analytics.missed || 0 },
    { name: "Pending", value: analytics.pending || 0 },
  ];

  const monthlyData =
    analytics.monthlyProgress && analytics.monthlyProgress.length > 0
      ? analytics.monthlyProgress
      : [
          { month: "Jan", value: 0 },
          { month: "Feb", value: 0 },
          { month: "Mar", value: 0 },
          { month: "Apr", value: 0 },
          { month: "May", value: 0 },
          { month: "Jun", value: 0 },
          { month: "Jul", value: 0 },
        ];

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">
        Medicine Analytics
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500 text-white p-4 sm:p-6 rounded-xl shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2 text-center">Total Doses</h2>
          <p className="text-2xl font-bold">{analytics.total || 0}</p>
        </div>
        <div className="bg-green-500 text-white p-4 sm:p-6 rounded-xl shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2 text-center">Taken Doses</h2>
          <p className="text-2xl font-bold">{analytics.taken || 0}</p>
        </div>
        <div className="bg-red-500 text-white p-4 sm:p-6 rounded-xl shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2 text-center">Missed Doses</h2>
          <p className="text-2xl font-bold">{analytics.missed || 0}</p>
        </div>
        <div className="bg-yellow-400 text-white p-4 sm:p-6 rounded-xl shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2 text-center">Pending Doses</h2>
          <p className="text-2xl font-bold">{analytics.pending || 0}</p>
        </div>
      </div>

      {/* Adherence & Doses Status */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow flex flex-col items-center flex-1">
          <h2 className="text-lg font-semibold mb-4">Adherence Rate</h2>
          <div className="relative w-40 h-40 sm:w-48 sm:h-48">
            <svg viewBox="0 0 160 160" className="w-full h-full">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#22c55e"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={
                  circumference -
                  (circumference * (analytics.adherence || 0)) / 100
                }
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl font-bold">
              {analytics.adherence || 0}%
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow flex-1 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4 text-center md:text-left">
            Doses Status
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Monthly Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Medicine-wise Adherence */}
      {analytics.medicineWise?.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Medicine-wise Adherence (%)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.medicineWise}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="adherence" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Analytics;