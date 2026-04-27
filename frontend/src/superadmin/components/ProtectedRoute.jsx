import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../config/permissions";

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-[var(--sa-bg)] text-[var(--sa-foreground)] flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 shadow-[0_20px_80px_rgba(9,11,20,0.35)] backdrop-blur-xl">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Verifying session
      </div>
    </div>
  );
}

export default function ProtectedRoute({ requiredRoles = [], requiredAction = null, children }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/super-admin/login" replace state={{ from: location.pathname }} />;
  }

  const roleAllowed = requiredRoles.length === 0 || requiredRoles.includes(role);
  const permissionAllowed = requiredAction ? hasPermission(role, requiredAction) : true;

  if (!roleAllowed || !permissionAllowed) {
    return <Navigate to="/super-admin/unauthorized" replace />;
  }

  return children || <Outlet />;
}
