// src/pages/Contact.jsx
import React, { useState } from "react";
import ContactsImage from "../assets/contacts.png"; // make sure this image exists

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const response = await fetch("http://localhost:4000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSuccess(data.error || "Failed to send message. Try again later.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setSuccess("Failed to send message. Try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-600">
          Contact Us
        </h2>
        <p className="text-center text-gray-600 text-sm sm:text-base mb-10">
          Have a question or feedback? Send us a message and we will get back to you.
        </p>

        <div className="flex flex-col md:flex-row md:space-x-12 space-y-10 md:space-y-0">
          {/* Left Side - Image */}
          <div className="md:w-1/2 flex justify-center items-start">
            <img
              src={ContactsImage}
              alt="Contact Us"
              className="w-full max-w-md rounded shadow-lg transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Right Side - Form & Contact Info */}
          <div className="md:w-1/2">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Name */}
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Email */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Subject */}
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Message */}
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows={5}
                required
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                className={`w-full px-6 py-3 sm:py-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>

            {success && (
              <p className="mt-6 text-green-600 font-medium">{success}</p>
            )}

            {/* Contact Info */}
            <div className="mt-10 text-gray-700 space-y-2">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">
                Need Help?
              </h3>
              <p>
                📞 Phone: <span className="font-medium">+91 7981822250</span>
              </p>
              <p>
                📧 Email: <span className="font-medium">f20220438@hyderabad.bits-pilani.ac.in</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;