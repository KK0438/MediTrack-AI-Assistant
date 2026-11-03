import React, { useState } from "react";
import { FaTimes, FaMobileAlt, FaApple, FaAndroid, FaDesktop, FaDownload, FaCheckCircle, FaBolt, FaHdd } from "react-icons/fa";

export default function InstallModal({ isOpen, onClose, onInstall, hasPrompt, isIOS, isAndroid }) {
  const [activeTab, setActiveTab] = useState(isIOS ? "ios" : isAndroid ? "android" : "desktop");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
            aria-label="Close"
          >
            <FaTimes className="text-lg" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white rounded-xl shadow-md flex items-center justify-center">
              <img src="/medicine-capsule.svg" alt="MediTracker" className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                Install MediTracker
              </h3>
              <p className="text-blue-100 text-sm">Fast, native-like experience on any device</p>
            </div>
          </div>

          {/* Size & Spec Badge */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-medium">
              <FaHdd className="text-emerald-300" /> Install Size: ~6 MB (Under 20 MB)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white font-medium">
              <FaBolt className="text-yellow-300" /> Offline Capable
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* Quick 1-Click Install Button if browser supports it */}
          {hasPrompt && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <p className="text-sm text-blue-900 font-medium mb-3">
                Your browser supports direct 1-tap installation!
              </p>
              <button
                onClick={() => {
                  if (onInstall) onInstall();
                }}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <FaDownload /> Install App Now (~6 MB)
              </button>
            </div>
          )}

          {/* Platform Guide Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab("android")}
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === "android"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaAndroid /> Android
            </button>
            <button
              onClick={() => setActiveTab("ios")}
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === "ios"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaApple /> iPhone / iPad
            </button>
            <button
              onClick={() => setActiveTab("desktop")}
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === "desktop"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaDesktop /> PC / Mac
            </button>
          </div>

          {/* Tab Instructions */}
          {activeTab === "android" && (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Open <strong>Chrome</strong> or <strong>Samsung Internet</strong> on your phone.
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Tap the <strong>three dots (⋮)</strong> menu in the upper right corner.
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === "ios" && (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Open this page in <strong>Safari</strong> on your iPhone or iPad.
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Tap the <strong>Share</strong> button (the square with an arrow pointing up ⎋) at the bottom toolbar.
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong> (with the ⊕ icon).
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </span>
                <p>
                  Tap <strong>"Add"</strong> in the top right. MediTracker is now on your home screen!
                </p>
              </div>
            </div>
          )}

          {activeTab === "desktop" && (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  In <strong>Chrome</strong> or <strong>Edge</strong>, look at the right side of the address bar.
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Click the <strong>Install</strong> icon (computer with down arrow or ⊕ button).
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  Confirm <strong>"Install"</strong> to add MediTracker to your desktop and taskbar.
                </p>
              </div>
            </div>
          )}

          {/* Value Highlights */}
          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              <span>Takes only ~6 MB storage</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              <span>No App Store needed</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              <span>Instant offline access</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              <span>Free automatic updates</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
}
