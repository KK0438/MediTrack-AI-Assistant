import React from "react";
import { Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/Login";

// Dashboard & nested pages
import DashBoard from "./pages/DashBoard";
import AddMedicine from "./pages/AddMedicine";
import MyMedicine from "./pages/MyMedicine";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import CalenderView from "./pages/CalenderView";
import Chatbot from "./pages/Chatbot";


function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* ================= HOME (NO FOOTER) ================= */}
        <Route path="/" element={<Home />} />

        {/* ================= PUBLIC PAGES WITH FOOTER ================= */}

        <Route
          path="/about"
          element={
            <>
              <About />
              <Footer />
            </>
          }
        />

        <Route
          path="/blogs"
          element={
            <>
              <Blogs />
              <Footer />
            </>
          }
        />

        <Route
          path="/contact"
          element={
            <>
              <Contact />
              <Footer />
            </>
          }
        />

        {/* ================= AUTH PAGES WITH FOOTER ================= */}

        <Route
          path="/register"
          element={
            <PublicRoute>
              <>
                <Register />
                <Footer />
              </>
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <>
                <Login />
                <Footer />
              </>
            </PublicRoute>
          }
        />

        {/* ================= DASHBOARD (NO FOOTER) ================= */}

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={null}
          />
          <Route path="add-medicine" element={<AddMedicine />} />
          <Route path="my-medicine" element={<MyMedicine />} />
          <Route path="history" element={<History />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="calendar" element={<CalenderView />} />
          <Route path="chatbot" element={<Chatbot />} />
          
        </Route>
      </Routes>
    </>
  );
}

export default App;