import { createContext, useState, useEffect } from "react";

// Create context
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function: store user and token in localStorage
  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  // Logout function: clear localStorage and context
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,       // current user object
        setUser,    // allow updates to user (profilePic, etc.)
        login,      // login function
        logout,     // logout function
        loading,    // loading state
      }}
    >
      {children}
    </AppContext.Provider>
  );
};