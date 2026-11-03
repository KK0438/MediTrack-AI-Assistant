import React, { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import {
  FaDownload,
  FaCheckCircle,
  FaAndroid,
  FaApple,
  FaDesktop,
  FaHdd,
  FaBolt,
  FaShieldAlt,
  FaShareSquare,
  FaPlusSquare,
  FaEllipsisV,
  FaMobileAlt,
} from "react-icons/fa";

export default function InstallApp() {
  const { promptInstall, deferredPrompt, isInstalled, isIOS, isAndroid } =
    usePWAInstall();
  const [activePlatform, setActivePlatform] = useState(
    isIOS ? "ios" : isAndroid ? "android" : "desktop"
  );
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleInstallClick = async () => {
    const res = await promptInstall();
    if (res && res.outcome === "accepted") {
      setInstallSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase">
                Official Web Application
              </span>
              <span className="px-3 py-1 bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <FaHdd /> Download Size: ~6 MB (Under 20 MB Limit)
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Install MediTracker
            </h1>
            <p className="mt-3 text-lg text-blue-100 leading-relaxed">
              Experience fast medication tracking, instant reminders, and full offline support.
              Takes less than 10 seconds to install directly to your device home screen.
            </p>

            {/* Install CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {isInstalled ? (
                <div className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 text-white font-bold rounded-xl shadow-lg">
                  <FaCheckCircle className="text-xl" />
                  <span>Already Installed on this Device</span>
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl shadow-lg hover:shadow-2xl transition duration-200 transform hover:-translate-y-0.5 text-lg"
                >
                  <FaDownload className="text-blue-600" />
                  <span>{deferredPrompt ? "Install App (~6 MB)" : "How to Install (~6 MB)"}</span>
                </button>
              )}

              {installSuccess && (
                <p className="text-emerald-200 font-medium text-sm flex items-center gap-1.5">
                  <FaCheckCircle /> Installation initiated successfully!
                </p>
              )}
            </div>

            <p className="mt-4 text-xs text-blue-200">
              * Works across Android, iPhone (iOS Safari), Windows PC, Mac, and Linux without needing app store credentials.
            </p>
          </div>

          {/* Decorative Corner Pill */}
          <div className="absolute right-4 -bottom-10 opacity-20 hidden md:block">
            <img src="/medicine-capsule.svg" alt="" className="w-80 h-80" />
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-start">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-4">
              <FaHdd className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Ultra-Lightweight</h3>
            <p className="mt-2 text-sm text-gray-600">
              Uses only <strong>~6 MB</strong> of storage space on your device. Saves 90%+ storage compared to traditional 80MB–150MB mobile apps.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-start">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mb-4">
              <FaBolt className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Instant Offline Access</h3>
            <p className="mt-2 text-sm text-gray-600">
              Loads instantly even without internet. Check your scheduled doses and medicine logs anywhere, anytime.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-4">
              <FaShieldAlt className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Always Up-to-Date</h3>
            <p className="mt-2 text-sm text-gray-600">
              No manual updates needed. The app automatically syncs new improvements whenever you connect to Wi-Fi or mobile data.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50/70">
            <h2 className="text-xl font-bold text-gray-900">Why Install as PWA vs Traditional App?</h2>
            <p className="text-sm text-gray-600 mt-1">
              Compare MediTracker's streamlined architecture with heavy legacy apps.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600 border-b">
                <tr>
                  <th className="py-3 px-6">Metric</th>
                  <th className="py-3 px-6 text-blue-600 font-bold">MediTracker App</th>
                  <th className="py-3 px-6 text-gray-500">Typical App Store App</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-semibold text-gray-900">App Size / Storage</td>
                  <td className="py-4 px-6 text-emerald-600 font-bold flex items-center gap-1.5">
                    <FaCheckCircle /> ~6 MB (Under 20 MB)
                  </td>
                  <td className="py-4 px-6 text-red-500">80 MB – 150 MB</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-gray-900">Installation Time</td>
                  <td className="py-4 px-6 text-emerald-600 font-bold flex items-center gap-1.5">
                    <FaCheckCircle /> Instant (Under 5 seconds)
                  </td>
                  <td className="py-4 px-6 text-gray-500">1 – 3 minutes (App Store download)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-gray-900">Offline Caching</td>
                  <td className="py-4 px-6 text-emerald-600 font-bold flex items-center gap-1.5">
                    <FaCheckCircle /> Full Service Worker cache
                  </td>
                  <td className="py-4 px-6 text-gray-500">Varies</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-gray-900">App Store Account</td>
                  <td className="py-4 px-6 text-emerald-600 font-bold flex items-center gap-1.5">
                    <FaCheckCircle /> Not needed
                  </td>
                  <td className="py-4 px-6 text-gray-500">Required (Google / Apple ID)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Step-by-Step Installation Guides */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Step-by-Step Installation Instructions
          </h2>

          {/* Platform Switcher Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActivePlatform("android")}
              className={`pb-4 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition ${
                activePlatform === "android"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaAndroid className="text-lg" /> Android (Chrome / Samsung)
            </button>
            <button
              onClick={() => setActivePlatform("ios")}
              className={`pb-4 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition ${
                activePlatform === "ios"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaApple className="text-lg" /> iPhone & iPad (Safari)
            </button>
            <button
              onClick={() => setActivePlatform("desktop")}
              className={`pb-4 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition ${
                activePlatform === "desktop"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaDesktop className="text-lg" /> Windows / Mac / Linux
            </button>
          </div>

          {/* Android Steps */}
          {activePlatform === "android" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3">
                    1
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Open in Browser</h4>
                  <p className="text-sm text-gray-600">
                    Visit <strong>meditracker-public.vercel.app</strong> using Google Chrome or Samsung Internet.
                  </p>
                </div>

                <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3">
                    2
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Tap Menu ⋮</h4>
                  <p className="text-sm text-gray-600">
                    Tap the <strong>three dots menu (⋮)</strong> at the top right of your browser bar.
                  </p>
                </div>

                <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3">
                    3
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Install App</h4>
                  <p className="text-sm text-gray-600">
                    Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. Confirm to complete!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* iOS Steps */}
          {activePlatform === "ios" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3">
                    1
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Open in Safari</h4>
                  <p className="text-sm text-gray-600">
                    Navigate to <strong>meditracker-public.vercel.app</strong> in the Apple <strong>Safari</strong> browser.
                  </p>
                </div>

                <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3">
                    2
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                    Tap Share <FaShareSquare className="text-blue-600" />
                  </h4>
                  <p className="text-sm text-gray-600">
                    Tap the <strong>Share</strong> button (box with an arrow pointing up) in Safari's bottom toolbar.
                  </p>
                </div>

                <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3">
                    3
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                    Add to Home Screen <FaPlusSquare className="text-blue-600" />
                  </h4>
                  <p className="text-sm text-gray-600">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong> in top right.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Steps */}
          {activePlatform === "desktop" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3">
                    1
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Open Chrome or Edge</h4>
                  <p className="text-sm text-gray-600">
                    Open MediTracker in Google Chrome, Microsoft Edge, or Brave on Windows, Mac, or Linux.
                  </p>
                </div>

                <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3">
                    2
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Click Address Bar Icon</h4>
                  <p className="text-sm text-gray-600">
                    Click the <strong>Install</strong> icon (computer with down arrow or ⊕ symbol) on the right side of the address bar.
                  </p>
                </div>

                <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3">
                    3
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Launch Standalone</h4>
                  <p className="text-sm text-gray-600">
                    MediTracker will run in its own standalone, distraction-free window directly from your desktop or dock!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>

          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-800">Why is the download size so small (~6 MB)?</h4>
            <p className="text-sm text-gray-600 mt-1">
              MediTracker uses modern Progressive Web App (PWA) architecture. Instead of bundling unnecessary operating system emulators, it caches only the core application logic and assets, keeping the total size well under 20 MB while remaining lightning-fast.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-800">Can I use it offline?</h4>
            <p className="text-sm text-gray-600 mt-1">
              Yes! Once installed or visited, MediTracker precaches the user interface so you can open the app and view your schedule even when you have no cellular connection or Wi-Fi.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-800">How do I uninstall it if I ever need to?</h4>
            <p className="text-sm text-gray-600 mt-1">
              Just like any standard app on your phone or computer: long press the MediTracker app icon on your home screen and select "Remove" or "Uninstall".
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
