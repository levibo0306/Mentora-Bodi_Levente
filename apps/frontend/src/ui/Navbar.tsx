import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Kezdőlap
        </NavLink>
        {user.role === "student" && (
          <NavLink
            to="/missions"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Küldetések
          </NavLink>
        )}
        {user.role === "teacher" && (
          <NavLink
            to="/results"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Eredmények
          </NavLink>
        )}
        <NavLink
          to="/feedback"
          className={({ isActive }) => `nav-link chat-nav-link ${isActive ? "active" : ""}`}
          aria-label="Csevegés megnyitása"
        >
          <span aria-hidden="true">💬</span>
          <span className="chat-nav-label">Csevegés</span>
        </NavLink>
        <Link to="/profile" className="user-badge" aria-label="Profil megnyitása">
          <span aria-hidden="true">{user.role === "teacher" ? "👨‍🏫" : "🎓"}</span>
          <span className="user-badge-name">{user.username ?? user.email}</span>
        </Link>
        
        <button className="logout-btn" onClick={handleLogout} title="Kijelentkezés" aria-label="Kijelentkezés">
          <span aria-hidden="true">↪</span><span className="logout-label"> Kilépés</span>
        </button>
      </div>
    </nav>
  );
};
