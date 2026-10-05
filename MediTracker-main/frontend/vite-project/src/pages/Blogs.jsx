// src/pages/Blog.jsx
import React, { useState, useEffect } from "react";
import API from "../api/axios";

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await API.get("/blogs");
        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };
    fetchArticles();
  }, []);

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-4">
            Health Insights
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
            Stay updated with the latest health news, AI in healthcare, and wellness tips.
          </p>
        </div>

        {/* Search */}
        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full sm:w-2/3 md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 flex flex-col h-full"
              >
                {blog.urlToImage && (
                  <img
                    src={blog.urlToImage}
                    alt={blog.title}
                    className="w-full h-48 sm:h-56 md:h-48 object-cover rounded-t-2xl transition-transform duration-300 hover:scale-105"
                  />
                )}
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    {blog.title.length > 60
                      ? blog.title.slice(0, 60) + "..."
                      : blog.title}
                  </h2>
                  <p className="text-gray-500 text-sm sm:text-base mb-4 flex-grow">
                    {blog.description
                      ? blog.description.slice(0, 100) + "..."
                      : "Read full article for details."}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    {new Date(blog.publishedAt).toDateString()}
                  </p>
                  <a
                    href={blog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto text-blue-600 text-sm sm:text-base font-medium hover:underline"
                  >
                    Read More →
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-3">
              Loading articles...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Blog;