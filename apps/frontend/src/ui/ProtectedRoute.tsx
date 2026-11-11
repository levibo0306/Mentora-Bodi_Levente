import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../api/auth";

type ProtectedRouteProps = {
  children: ReactElement;
  requiredRole?: UserRole;
};

/**
 * Csak bejelentkezett felhasználónak mutatja meg a kapott oldalt.
 * Ha requiredRole is van, a szerepkört (tanár vagy diák) is ellenőrzi.
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div className="full-page-message">Betöltés...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />;

  return children;
}
