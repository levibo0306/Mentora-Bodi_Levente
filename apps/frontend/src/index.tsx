import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./ui/Navbar";
import { Login } from "./pages/Login";
import { QuizList } from "./ui/QuizList";
import { CreateQuizForm } from "./ui/CreateQuizForm";
import { MetricsPanel } from "./ui/MetricsPanel";
import { useAuth } from "./context/AuthContext";

// Ez a segéd komponens védi az útvonalakat
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  
  // ÁLLAPOTOK A DASHBOARDHOZ
  // showModal: látható-e a felugró ablak?
  const [showModal, setShowModal] = useState(false);
  // refreshKey: ha ez változik, a lista újratölti magát
  const [refreshKey, setRefreshKey] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);

  // Ez fut le, ha sikeresen létrehoztunk egy kvízt
  const handleQuizCreated = () => {
    setShowModal(false);       // Bezárjuk az ablakot
    setRefreshKey(prev => prev + 1); // Frissítjük a listát
  };

  // Dashboard tartalma (most már inline komponensként kezeljük a tisztaság kedvéért)
  const Dashboard = (
    <div className="dashboard active"> {/* A 'active' class a test.html stílusa miatt kell */}
      
      {/* A tartalom konténere - test.html 'main-content' */}
      <div className="main-content">
        
        {/* STATISZTIKÁK (Opcionális, a test.html alapján) */}
        <div className="stats-grid">
           <div className="stat-card">
              <div className="stat-number">12</div>
              <div className="stat-label">Aktív Kvízek</div>
           </div>
           <div className="stat-card">
              <div className="stat-number">87%</div>
              <div className="stat-label">Átlagos eredmény</div>
           </div>
        </div>

        {/* Címsor és Gomb */}
        <div className="section-header">
            <h2 className="section-title">Saját Projektek</h2>
            {/* Itt nyitjuk meg a modalt navigáció helyett */}
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Új Kvíz
            </button>
        </div>

        {/* LISTA */}
        {/* A key={refreshKey} miatt újratöltődik, ha a key változik */}
        <QuizList key={refreshKey} />

        {/* METRIKÁK TOGGLE (Meglévő funkciód) */}
        <div style={{ marginTop: "2rem" }}>
          <button className="btn btn-secondary" onClick={() => setShowMetrics((v) => !v)}>
            {showMetrics ? "Metrikák elrejtése" : "Metrikák megjelenítése"}
          </button>
          {showMetrics && <MetricsPanel />}
        </div>

      </div>

      {/* MODAL: Csak akkor jelenítjük meg, ha a showModal igaz */}
      {showModal && (
        <CreateQuizForm 
          onSuccess={handleQuizCreated} 
          onCancel={() => setShowModal(false)} 
        />
      )}
    </div>
  );

  return (
    <div>
      {/* A Navbar mindig látszik, ha be vagyunk jelentkezve (opcionális logika) */}
      {user && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* A főoldal a Dashboard */}
        <Route
          path="/"
          element={<ProtectedRoute>{Dashboard}</ProtectedRoute>}
        />
        
        {/* A /create útvonalat töröltük, mert most már Modal-t használunk! */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}