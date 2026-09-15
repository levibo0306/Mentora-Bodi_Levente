import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserOverview } from "../api/users";
import { PageLayout } from "../ui/PageLayout";

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserOverview();
        setOverview(data);
      } catch {
        setOverview(null);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setUsername(user?.username ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await updateProfile({
        username,
        email,
        current_password: currentPassword,
        new_password: newPassword || undefined,
      });
      setCurrentPassword("");
      setNewPassword("");
      setStatus({ type: "success", text: "A fiókadataid frissültek." });
    } catch (error: any) {
      setStatus({ type: "error", text: error?.message ?? "Nem sikerült menteni a módosításokat." });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <PageLayout title="Profil" subtitle="Fiókadatok, biztonság és személyes előrehaladás." width="medium">
      <div className="profile-layout">
        <section className="card section profile-card profile-summary">
          <div className="profile-avatar" aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</div>
          <div>
            <span className="eyebrow">{user.role === "teacher" ? "Tanári fiók" : "Diák fiók"}</span>
            <h2>{user.username}</h2>
            <p>{user.email}</p>
          </div>
          <div className="profile-grid">
            <div>
              <div className="profile-label">Szerep</div>
              <div className="profile-value">{user.role === "teacher" ? "Tanár" : "Diák"}</div>
            </div>
            {overview && user.role === "student" && (
              <>
                <div>
                  <div className="profile-label">Szint</div>
                  <div className="profile-value">{overview.level}</div>
                </div>
                <div>
                  <div className="profile-label">Rang</div>
                  <div className="profile-value">{overview.rank}</div>
                </div>
                <div>
                  <div className="profile-label">XP</div>
                  <div className="profile-value">{overview.xp}</div>
                </div>
              </>
            )}
          </div>
        </section>
        <form className="card section profile-editor" onSubmit={submit}>
          <div>
            <span className="eyebrow">Fiókbeállítások</span>
            <h2>Belépési adatok módosítása</h2>
            <p className="section-help">A mentéshez biztonsági okból add meg a jelenlegi jelszavadat.</p>
          </div>
          <div className="form-grid">
            <label>Felhasználónév<input value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} maxLength={24} required /></label>
            <label>Email cím<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          </div>
          <div className="form-grid">
            <label>Jelenlegi jelszó<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" /></label>
            <label>Új jelszó <span>(opcionális)</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={6} autoComplete="new-password" /></label>
          </div>
          {status && <div className={`inline-status ${status.type}`}>{status.text}</div>}
          <button className="btn btn-primary profile-save" disabled={saving}>{saving ? "Mentés..." : "Módosítások mentése"}</button>
        </form>
      </div>
    </PageLayout>
  );
};
