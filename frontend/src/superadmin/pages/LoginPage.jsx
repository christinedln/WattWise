import React, { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../../components/Header";
import Layout from "../../components/layout";

const adminFeatures = [
  {
    icon: (
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
        <path d="M18 4L6 9V17C6 24 11.16 30.48 18 32C24.84 30.48 30 24 30 17V9L18 4Z" stroke="#1a7a45" strokeWidth="2" strokeLinejoin="round" fill="none"/>
        <polyline points="12,18 16,22 24,14" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Role-Aware Access",
    description: "Control permissions",
  },
  {
    icon: (
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
        <rect x="8" y="4" width="20" height="28" rx="3" stroke="#1a7a45" strokeWidth="2"/>
        <line x1="13" y1="13" x2="23" y2="13" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round"/>
        <line x1="13" y1="18" x2="23" y2="18" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round"/>
        <line x1="13" y1="23" x2="19" y2="23" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Audit Trails",
    description: "Every admin action logged",
  },
  {
    icon: (
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
        <circle cx="18" cy="18" r="13" stroke="#1a7a45" strokeWidth="2"/>
        <polyline points="18,10 18,18 24,22" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Session Timeout",
    description: "Security for idle users",
  },
  {
    icon: (
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
        <rect x="10" y="16" width="16" height="14" rx="2" stroke="#1a7a45" strokeWidth="2"/>
        <path d="M14 16V12C14 9.79 15.79 8 18 8C20.21 8 22 9.79 22 12V16" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <circle cx="18" cy="23" r="2" fill="#1a7a45"/>
      </svg>
    ),
    title: "Data Protection",
    description: "Masked sensitive fields",
  },
];

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const hasCheckedInitialSession = useRef(false);

  const { user, loading, signIn, signOutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userPortalUrl =
    import.meta.env.VITE_USER_PORTAL_URL || "http://localhost:5173/";

  const from = location.state?.from || "/super-admin/dashboard";

  useEffect(() => {
    if (loading || hasCheckedInitialSession.current) {
      return;
    }

    hasCheckedInitialSession.current = true;

    if (user) {
      signOutUser();
    }
  }, [loading, signOutUser, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await signIn(email, password);
      const nextRole = result?.profile?.role || "user";

      navigate(
        nextRole === "user" ? "/super-admin/unauthorized" : from,
        { replace: true }
      );
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>

      <div
        className="h-screen w-screen flex overflow-hidden"
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ── LEFT PANEL ── */}
          <div className="hidden md:flex flex-col flex-1 p-8 overflow-hidden bg-card text-card-foreground">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-14 h-14 bg-[#1a7a45] rounded-[14px] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z" fill="white" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">WattWise</span>
            </div>

          <div className="mt-2 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
                Control the platform securely
              </h2>

              <p className="text-muted-foreground text-base md:text-lg mb-6">
                Manage users, devices, and system settings with CIAANA-grade access control, comprehensive audit logs, and accountability features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminFeatures.map((f, i) => (
                <div
                  key={i}
                  className="bg-[#e8f5ee] border border-[#b2d8c0] rounded-lg p-4 md:p-6 flex flex-col items-start"
                >
                  <div className="mb-2">{f.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {f.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-1 justify-center items-center bg-card text-card-foreground">
          <div className="w-full max-w-md px-6 md:px-8 py-6 md:py-8 overflow-hidden">

            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground tracking-tight">
              Welcome back
            </h2>

            <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
              Sign in to access your admin dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="admin@wattwise.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-border rounded-lg bg-background text-foreground"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    style={{ background: "none", border: "none", outline: "none", boxShadow: "none" }}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 md:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* FOOTER */}
            <p className="mt-6 text-sm leading-6 text-muted-foreground text-center">
              Need the standard WattWise customer portal?{" "}
              <a
                href={userPortalUrl}
                className="font-semibold text-green-700 hover:text-green-800"
              >
                Go to the main login
              </a>
              .
            </p>

          </div>
        </div>
      </div>
    </Layout>
  );
}

