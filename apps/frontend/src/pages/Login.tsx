import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../api/auth";
import { getErrorMessage } from "../api/http";

export const Login: React.FC = () => {
  const nav = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      if (mode === "login") await login(identifier, password);
      else await register(username, email, password, role);
      nav("/");
    } catch (error: unknown) {
      setErr(getErrorMessage(error, "Hiba történt"));
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">Mentora</div>
        <div className="tagline">
          {mode === "login" ? "Jelentkezz be a folytatáshoz" : "Hozz létre egy új fiókot"}
        </div>

        {mode === "register" && (
          <div className="role-selector">
            <div 
              className={`role-btn ${role === "student" ? "active" : ""}`}
              onClick={() => setRole("student")}
            >
              <div className="role-icon">🎓</div>
              <div>Diák</div>
            </div>
            <div 
              className={`role-btn teacher ${role === "teacher" ? "active" : ""}`}
              onClick={() => setRole("teacher")}
            >
              <div className="role-icon">👨‍🏫</div>
              <div>Tanár</div>
            </div>
          </div>
        )}

        {err && (
          <div style={{ 
            color: "#721c24", 
            background: "#f8d7da", 
            padding: "12px 16px", 
            borderRadius: "12px", 
            marginBottom: "20px",
            border: "1px solid #f5c6cb",
            fontSize: "14px"
          }}>
            {err}
          </div>
        )}

        <form onSubmit={submit}>
          {mode === "register" && (
            <div className="input-group">
              <label>Felhasználónév</label>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                type="text"
                placeholder="pl. mate_gergo"
              />
            </div>
          )}

          {mode === "login" ? (
            <div className="input-group">
              <label>Email vagy felhasználónév</label>
              <input 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                required 
                type="text"
                placeholder="email vagy username"
              />
            </div>
          ) : (
            <div className="input-group">
              <label>Email cím</label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                type="email"
                placeholder="pelda@email.com"
              />
            </div>
          )}

          <div className="input-group">
            <label>Jelszó</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Legalább 6 karakter"
            />
          </div>

          <button type="submit" className="login-btn">
            {mode === "login" ? "Bejelentkezés" : "Fiók létrehozása"}
          </button>

          <div style={{ 
            textAlign: "center", 
            marginTop: "20px", 
            fontSize: "14px", 
            color: "#666" 
          }}>
            {mode === "login" ? (
              <>
                Még nincs fiókod?{" "}
                <span 
                  onClick={() => setMode("register")}
                  style={{ 
                    color: "var(--primary)", 
                    fontWeight: "600", 
                    cursor: "pointer" 
                  }}
                >
                  Regisztrálj
                </span>
              </>
            ) : (
              <>
                Van már fiókod?{" "}
                <span 
                  onClick={() => setMode("login")}
                  style={{ 
                    color: "var(--primary)", 
                    fontWeight: "600", 
                    cursor: "pointer" 
                  }}
                >
                  Jelentkezz be
                </span>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
