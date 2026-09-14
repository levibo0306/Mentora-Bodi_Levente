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

  if (!isAuthenticated || !user) return null;

  return (
    <nav className="navbar">
      <Link to="/" className="logo navbar-logo" aria-label="Vissza a főoldalra">
        Mentora
      </Link>

      <div className="nav-actions">
        <Link to="/flashcards" className="btn btn-secondary" style={{ padding: "8px 14px", textDecoration: "none" }}>
          Kártyák
        </Link>
        <Link to="/feedback" className="btn btn-secondary" style={{ padding: "8px 14px", textDecoration: "none" }}>
          Visszajelzések
        </Link>
        {user.role === "student" && (
          <Link
            to="/missions"
            className="btn btn-secondary"
            style={{ padding: "8px 14px", textDecoration: "none" }}
          >
            Küldetések
          </Link>
        )}
        {user.role === "teacher" && (
          <Link
            to="/results"
            className="btn btn-secondary"
            style={{ padding: "8px 14px", textDecoration: "none" }}
          >
            Eredmények
          </Link>
        )}
        <Link to="/profile" className="user-badge" style={{ textDecoration: "none" }}>
          <span>{user.role === "teacher" ? "👨‍🏫" : "🎓"}</span>
          <span>{user.username ?? user.email}</span>
        </Link>
        
        <button className="logout-btn" onClick={handleLogout}>
          Kijelentkezés
        </button>
      </div>
    </nav>
  );
};
