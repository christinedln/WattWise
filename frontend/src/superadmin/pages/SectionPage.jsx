import React from "react";
import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { hasPermission } from "../config/permissions";
import { useAuth } from "../context/AuthContext";

export default function SectionPage({ title, description, actionLabel, actionTo, requiredAction = null }) {
  const { role } = useAuth();

  if (requiredAction && !hasPermission(role, requiredAction)) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Access restricted</h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-yellow-700">
          Your current role does not have permission to access this section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-md sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs uppercase tracking-widest font-medium text-green-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Super Admin Module
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">{description}</p>
          </div>
          {actionLabel ? (
            <Link
              to={actionTo || "/super-admin/dashboard"}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              {actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-gray-600">
        <p className="text-sm leading-6 text-gray-700">
          This page is scaffolded for the superadmin rollout. Connect the relevant Firestore collection, Cloud Function, or admin action here.
        </p>
      </section>
    </div>
  );
}
