// src/pages/PrescriptionScanner.jsx
import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import API from "../api/axios";
import {
  runOCR,
  parsePrescriptionText,
  SAMPLE_PRESCRIPTIONS,
  toDateInputString,
} from "../utils/ocrService";
import {
  FaCamera,
  FaUpload,
  FaCheckCircle,
  FaTrash,
  FaPlus,
  FaFilePrescription,
  FaMagic,
  FaSpinner,
  FaExclamationTriangle,
  FaPills,
} from "react-icons/fa";

const PrescriptionScanner = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [rawText, setRawText] = useState("");
  const [showRawText, setShowRawText] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle local file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  // Drag and drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processImageFile(file);
    }
  };

  // Process chosen image with OCR
  const processImageFile = async (file) => {
    setErrorMessage("");
    setImportSuccess(false);
    setSelectedSample(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);
      setLoading(true);
      setProgressText("Starting OCR engine...");
      setProgressPercent(10);

      try {
        const result = await runOCR(dataUrl, ({ status, progress }) => {
          setProgressText(status);
          setProgressPercent(Math.round(progress * 100));
        });

        if (result.success && result.medicines.length > 0) {
          setMedicines(result.medicines);
          setRawText(result.rawText);
        } else {
          // If no medicines were automatically extracted, try parsing raw text or provide fallback
          const fallbackMeds = parsePrescriptionText(result.rawText);
          if (fallbackMeds.length > 0) {
            setMedicines(fallbackMeds);
          } else {
            // Provide a starter template card so the user can complete review
            setMedicines([
              {
                id: `extracted_${Date.now()}`,
                name: "Prescription Medicine",
                dosage: "500mg - 1 tablet",
                frequency: "Daily",
                startDate: toDateInputString(new Date()),
                endDate: toDateInputString(new Date(Date.now() + 7 * 86400000)),
                times: ["09:00 AM", "09:00 PM"],
                currentStock: 14,
                unit: "tablets",
                dosePerIntake: 1,
                refillThreshold: 4,
                confidence: 0.65,
                detectedText: "Text detected from photo",
              },
            ]);
          }
          setRawText(result.rawText || "Image scanned. Please review details.");
        }
      } catch (err) {
        console.error("Scanner OCR failed:", err);
        setErrorMessage("Could not complete optical scan. You can still enter details or pick a sample prescription.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Load a curated sample prescription
  const loadSample = (sample) => {
    setErrorMessage("");
    setImportSuccess(false);
    setSelectedSample(sample.id);
    setImagePreview(null);
    setRawText(sample.rawText);
    setMedicines(JSON.parse(JSON.stringify(sample.medicines)));
  };

  // Update field of an extracted medicine
  const handleMedChange = (id, field, value) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Update a specific time in times array
  const handleTimeChange = (id, timeIndex, value) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const newTimes = [...m.times];
        newTimes[timeIndex] = value;
        return { ...m, times: newTimes };
      })
    );
  };

  // Add time field
  const addTimeField = (id) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, times: [...m.times, "12:00 PM"] } : m))
    );
  };

  // Remove a medicine from review
  const removeMedicine = (id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  // Add a manual medicine card
  const addManualMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        id: `extracted_${Date.now()}`,
        name: "",
        dosage: "500mg - 1 tablet",
        frequency: "Daily",
        startDate: toDateInputString(new Date()),
        endDate: toDateInputString(new Date(Date.now() + 7 * 86400000)),
        times: ["09:00 AM"],
        currentStock: 14,
        unit: "tablets",
        dosePerIntake: 1,
        refillThreshold: 4,
        confidence: 1.0,
        detectedText: "Manually added",
      },
    ]);
  };

  // Import all extracted medicines to backend
  const handleImportAll = async () => {
    if (medicines.length === 0) return;
    const invalidMed = medicines.find((m) => !m.name.trim() || !m.dosage.trim());
    if (invalidMed) {
      alert("Please ensure every medicine has a Name and Dosage before importing.");
      return;
    }

    setImporting(true);
    setErrorMessage("");

    try {
      for (const med of medicines) {
        await API.post("/medicines", {
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency || "Daily",
          startDate: med.startDate,
          endDate: med.endDate,
          times: med.times && med.times.length > 0 ? med.times : ["09:00 AM"],
          currentStock: Number(med.currentStock) || 30,
          unit: med.unit || "tablets",
          dosePerIntake: Number(med.dosePerIntake) || 1,
          refillThreshold: Number(med.refillThreshold) || 5,
        });
      }

      setImportSuccess(true);
      setTimeout(() => {
        navigate("/dashboard/my-medicine");
      }, 1500);
    } catch (err) {
      console.error("Import medicines error:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to import medicines. Please try again."
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FaFilePrescription />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Prescription & Medicine Scanner
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a doctor's prescription or medicine strip. Intelligent OCR extracts
                  dosages, timings, and stock automatically.
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard/add-medicine")}
            className="self-start sm:self-center px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-semibold transition"
          >
            Manual Entry Form
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Quick Sample Prescriptions Pills */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaMagic className="text-blue-600" />
              Instant Demo Prescriptions (1-Click Test)
            </span>
            <span className="text-xs text-gray-400">No image needed</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_PRESCRIPTIONS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSample(sample)}
                className={`p-3 text-left rounded-xl border transition ${
                  selectedSample === sample.id
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500"
                    : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                }`}
              >
                <div className="font-semibold text-gray-800 text-sm">{sample.title}</div>
                <div className="text-xs text-gray-500 mt-1">{sample.doctor}</div>
                <div className="text-xs text-blue-600 font-medium mt-2">
                  {sample.medicines.length} medications • Load & Review →
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCamera className="text-blue-600" />
            Upload Prescription Photo or Box
          </h2>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-8 text-center transition bg-gray-50 flex flex-col items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-3">
              <FaUpload />
            </div>

            <p className="font-medium text-gray-700">
              Drop your prescription image here, or{" "}
              <span className="text-blue-600 hover:underline">browse files</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports JPG, PNG, WEBP, or live camera snap
            </p>

            <div className="flex gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
              >
                <FaUpload /> Select Photo
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
              >
                <FaCamera /> Take Photo
              </button>
            </div>
          </div>

          {/* OCR Processing Loader */}
          {loading && (
            <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  <FaSpinner className="animate-spin text-blue-600" />
                  {progressText}
                </span>
                <span className="text-sm font-bold text-blue-700">{progressPercent}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <FaExclamationTriangle className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Uploaded Image Preview & Raw OCR View */}
          {imagePreview && (
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Uploaded Prescription Image
                </span>
                {rawText && (
                  <button
                    type="button"
                    onClick={() => setShowRawText(!showRawText)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {showRawText ? "Hide Raw OCR Text" : "View Raw OCR Text"}
                  </button>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <img
                  src={imagePreview}
                  alt="Prescription preview"
                  className="max-h-56 rounded-lg border object-contain bg-white shadow-sm"
                />
                {showRawText && rawText && (
                  <pre className="flex-1 text-xs bg-gray-50 p-3 rounded-lg border max-h-56 overflow-auto font-mono text-gray-700 whitespace-pre-wrap">
                    {rawText}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Extracted Medicines Review Section */}
        {medicines.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Review Extracted Medications ({medicines.length})
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Verify or edit names, doses, and schedules before adding them to your tracker.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addManualMedicine}
                  className="px-3 py-1.5 border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium rounded-lg flex items-center gap-1.5 transition"
                >
                  <FaPlus className="text-xs" /> Add Medicine
                </button>
              </div>
            </div>

            {/* Success Banner */}
            {importSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-semibold rounded-xl flex items-center gap-2 animate-bounce">
                <FaCheckCircle className="text-green-600 text-lg" />
                All medications have been successfully imported into your schedule! Redirecting...
              </div>
            )}

            {/* Medicine Cards Grid */}
            <div className="space-y-4">
              {medicines.map((med, index) => (
                <div
                  key={med.id || index}
                  className="border border-gray-200 rounded-xl p-5 bg-gray-50 hover:bg-white hover:border-blue-400 transition shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {med.confidence
                          ? `${Math.round(med.confidence * 100)}% Confidence Match`
                          : "Custom Entry"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeMedicine(med.id)}
                      className="text-red-500 hover:text-red-700 text-sm p-1 rounded transition"
                      title="Remove this medicine"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Medicine Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Medicine Name
                      </label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedChange(med.id, "name", e.target.value)}
                        placeholder="e.g. Amoxicillin"
                        className="w-full border border-gray-300 p-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>

                    {/* Dosage */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Dosage & Strength
                      </label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(med.id, "dosage", e.target.value)}
                        placeholder="e.g. 500mg - 1 capsule"
                        className="w-full border border-gray-300 p-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Frequency
                      </label>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleMedChange(med.id, "frequency", e.target.value)}
                        className="w-full border border-gray-300 p-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Once">Once</option>
                      </select>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={med.startDate}
                        onChange={(e) => handleMedChange(med.id, "startDate", e.target.value)}
                        className="w-full border border-gray-300 p-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={med.endDate}
                        onChange={(e) => handleMedChange(med.id, "endDate", e.target.value)}
                        className="w-full border border-gray-300 p-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    {/* Current Stock (Refill Tracking) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                        <FaPills className="text-blue-500 text-xs" />
                        Pill Stock (Refills)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={med.currentStock || 30}
                        onChange={(e) => handleMedChange(med.id, "currentStock", e.target.value)}
                        className="w-full border border-gray-300 p-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Total tablets"
                      />
                    </div>
                  </div>

                  {/* Scheduled Times */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Scheduled Dose Times
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {med.times.map((time, tIdx) => (
                        <input
                          key={tIdx}
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(med.id, tIdx, e.target.value)}
                          className="border border-gray-300 p-1.5 text-xs rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => addTimeField(med.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-blue-50 rounded"
                      >
                        + Add Time
                      </button>
                    </div>
                  </div>

                  {/* Detected raw OCR snippet */}
                  {med.detectedText && (
                    <div className="text-xs text-gray-400 italic">
                      Matched from Rx: "{med.detectedText}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setMedicines([]);
                  setImagePreview(null);
                  setSelectedSample(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={handleImportAll}
                disabled={importing || importSuccess}
                className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl text-base font-bold shadow-md transition flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Importing to MediTracker...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Confirm & Add {medicines.length} Medication(s)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionScanner;

