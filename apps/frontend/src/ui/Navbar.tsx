import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "white", marginBottom: 16 }}>
      <Link to="/" style={{ textDecoration: "none", fontWeight: 800 }}>Mentora</Link>

      {isAuthenticated && user ? (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span>{user.email} ({user.role})</span>
          {user.role === "teacher" && <Link to="/create" className="btn-primary">+ New Quiz</Link>}
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <Link to="/login" className="btn-primary">Login</Link>
      )}
    </nav>
  );
};
