import React from "react";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sa-bg)] px-4 text-[var(--sa-foreground)]">
      <div className="max-w-lg rounded-[32px] border border-white/10 bg-[rgba(7,10,22,0.82)] p-8 text-center shadow-[0_30px_120px_rgba(3,7,18,0.45)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-400/10 text-rose-200">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold text-white">Access denied</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          This section is restricted to superadmin accounts only. Your current role does not have permission to access this resource.
        </p>
        <Link
          to="/super-admin/login"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Return to login
        </Link>
      </div>
    </div>
  );
}
