import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddSubscription from "./pages/AddSubscription";

export default function App() {
  const [user, setUser] = useState(() => {
    return localStorage.getItem("user");
  });

  const login = (username) => {
    localStorage.setItem("user", username);
    setUser(username);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Login onLogin={login} />
          }
        />

        {/* Dashboard (protected) */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} onLogout={logout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Add subscription (protected) */}
        <Route
          path="/add"
          element={user ? <AddSubscription user={user} /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

