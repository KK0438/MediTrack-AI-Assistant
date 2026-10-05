import React, { useEffect, useState, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API from "../api/axios";
import { AppContext } from "../context/AppContext";

const CalendarView = () => {
  const { user } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusData, setStatusData] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);

  // Fetch medicine status
  const fetchStatus = async () => {
    try {
      const res = await API.get("/dashboard/medicine-status");
      setStatusData(res.data);
    } catch (err) {
      console.error("Error fetching medicine status:", err);
    }
  };

  useEffect(() => {
    setStatusData([]);
    fetchStatus();
  }, [user?._id || user?.id || user?.email]);

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const getStatusForDate = (date) => {
    const dateString = formatDate(date);
    return statusData.filter((item) => item.date === dateString);
  };

  const handleDateClick = (date) => {
    const records = getStatusForDate(date);

    const summary = {
      taken: records.filter((r) => r.status === "taken").length,
      missed: records.filter((r) => r.status === "missed").length,
      pending: records.filter((r) => r.status === "pending").length,
      medicines: records,
    };

    setSelectedDate(date);
    setDailySummary(summary);
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const records = getStatusForDate(date);
      if (!records || records.length === 0) return null;

      let color = null;
      if (records.some((r) => r.status === "missed")) color = "red";
      else if (records.some((r) => r.status === "pending")) color = "yellow";
      else color = "green";

      return <div className={`status-dot ${color}`}></div>;
    }
  };

  return (
    <div className="calendar-page p-4 sm:p-6 flex flex-col items-center w-full">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        📅 Medicine Calendar
      </h2>

      {/* Daily Summary */}
      {dailySummary && (
        <div className="daily-summary p-4 mb-6 border rounded-lg shadow w-full max-w-xs sm:max-w-sm md:max-w-md text-center">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">
            {selectedDate.toDateString()}
          </h3>
          <p className="text-green-600 font-medium text-sm sm:text-base">
            Taken: {dailySummary.taken}
          </p>
          <p className="text-red-600 font-medium text-sm sm:text-base">
            Missed: {dailySummary.missed}
          </p>
          <p className="text-yellow-600 font-medium text-sm sm:text-base">
            Pending: {dailySummary.pending}
          </p>
        </div>
      )}

      {/* Calendar Container */}
      <div className="w-full max-w-full md:max-w-4xl">
        <div className="overflow-x-auto">
          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            tileContent={tileContent}
            className="custom-calendar w-full sm:scale-90 md:scale-100 transform origin-top-left"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 text-sm sm:text-base">
        <div className="flex items-center gap-2">
          <span className="legend-dot green"></span> Taken
        </div>
        <div className="flex items-center gap-2">
          <span className="legend-dot red"></span> Missed
        </div>
        <div className="flex items-center gap-2">
          <span className="legend-dot yellow"></span> Pending
        </div>
      </div>
    </div>
  );
};

export default CalendarView;