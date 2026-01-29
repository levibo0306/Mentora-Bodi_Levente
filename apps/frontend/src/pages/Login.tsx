import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";

export const Login: React.FC = () => {
  const nav = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("SUBMIT", mode, email, role);
    setErr(null);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, role);
      console.log("AUTH OK");
      nav("/");
    } catch (e: any) {
      setErr(e?.message ?? "Hiba történt");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", background: "white", padding: 24, borderRadius: 16 }}>
      <h2 style={{ marginTop: 0 }}>{mode === "login" ? "Sign In" : "Register"}</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={() => setMode("login")} disabled={mode === "login"}>Login</button>
        <button type="button" onClick={() => setMode("register")} disabled={mode === "register"}>Register</button>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <form onSubmit={submit}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label style={{ display: "block", marginTop: 12 }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {mode === "register" && (
          <>
            <label style={{ display: "block", marginTop: 12 }}>Role</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setRole("student")} style={{ flex: 1, opacity: role === "student" ? 1 : 0.6 }}>
                Student
              </button>
              <button type="button" onClick={() => setRole("teacher")} style={{ flex: 1, opacity: role === "teacher" ? 1 : 0.6 }}>
                Teacher
              </button>
            </div>
          </>
        )}

        <button type="submit" className="btn-primary" style={{ marginTop: 16, width: "100%" }}>
          {mode === "login" ? "Sign In" : "Create account"}
        </button>
      </form>
    </div>
  );
};
