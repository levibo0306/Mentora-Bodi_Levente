import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserOverview } from "../api/users";
import { PageLayout } from "../ui/PageLayout";

export const Profile = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<any>(null);

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

  if (!user) return null;

  return (
    <PageLayout title="Profil" subtitle="Fiókadatok és személyes előrehaladás." width="medium">
        <section className="card section profile-card">
          <div className="profile-grid">
            <div>
              <div className="profile-label">Felhasználónév</div>
              <div className="profile-value">{user.username ?? "—"}</div>
            </div>
            <div>
              <div className="profile-label">Email</div>
              <div className="profile-value">{user.email}</div>
            </div>
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
    </PageLayout>
  );
};
