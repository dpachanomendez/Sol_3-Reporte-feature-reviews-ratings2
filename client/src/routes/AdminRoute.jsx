import { useAuth } from "../context/authContext";
import { Navigate, Outlet } from "react-router-dom";

export function AdminRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || user?.role !== "administrador") return <Navigate to="/home" />;
  return <Outlet />;
}