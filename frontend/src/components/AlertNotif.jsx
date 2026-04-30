import { useEffect, useState } from "react";
import EmailModal from "./EmailModal";
import SoundModal from "./SoundModal";
import { apiFetch } from "../api/api";

// ─── Inline SVG Icons ─────────────────────────────────
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const VolumeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
  </svg>
);

// ─── Badge ────────────────────────────────────────────
const Badge = ({ severity }) => {
  const style =
    severity === "Critical"
      ? "bg-red-50 text-red-600 border-red-200"
      : severity === "Warning"
      ? "bg-amber-50 text-amber-600 border-amber-200"
      : "bg-blue-50 text-blue-600 border-blue-200";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${style}`}>
      {severity}
    </span>
  );
};

// ─── Summary Card ─────────────────────────────────────
function SummaryCard({ label, value, sub, colorClass }) {
  return (
    <div className={`rounded-xl border p-4 ${colorClass}`}>
      <p className="text-xs font-semibold uppercase mb-1 opacity-70">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-60">{sub}</p>
    </div>
  );
}

export default function AlertNotif() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await apiFetch("/alerts");

        const transformed = data.map((alert, index) => ({
          id: `${alert.device_id}-${index}`,
          severity: alert.severity,
          title: alert.device_name,
          description: alert.message,
          time: "Just now",
          resolved: false,
        }));

        setAlerts(transformed);
      } catch (err) {
        console.error("Alert fetch error:", err);
      }
    };

    fetchAlerts();
  }, []);

  const [filter, setFilter] = useState("All");
  const [showResolved, setShowResolved] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showEmail, setShowEmail] = useState(false);
  const [showSound, setShowSound] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = alerts.filter(
    (a) =>
      (showResolved || !a.resolved) &&
      (filter === "All" || a.severity === filter)
  );

const stats = {
  critical: alerts.filter((a) => a.severity === "Critical" && !a.resolved).length,
  warnings: alerts.filter((a) => a.severity === "Warning" && !a.resolved).length,
  suspicious: alerts.filter((a) => a.severity === "Suspicious" && !a.resolved).length,
  total: alerts.length,
};

  const toggleSelect = (id) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const selectAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((a) => a.id));

  const deleteAlert = (id) => {
    setAlerts((p) => p.filter((a) => a.id !== id));
    showToast("Alert dismissed");
  };

  const resolveSelected = () => {
    setAlerts((p) =>
      p.map((a) => (selected.includes(a.id) ? { ...a, resolved: true } : a))
    );
    setSelected([]);
    showToast("Marked as resolved");
  };

  return (
    <div className="relative">

      {toast && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-4 py-3 rounded-xl">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Alerts & Notifications</h1>
          <p className="text-sm text-gray-400">Device issues and anomalies</p>
        </div>
      </div>

      {/* STATS */}
<div className="grid grid-cols-5 gap-3 mb-6">
  <SummaryCard label="Critical" value={stats.critical} sub="Needs attention" colorClass="bg-red-50" />
  <SummaryCard label="Warning" value={stats.warnings} sub="Monitor" colorClass="bg-amber-50" />
  <SummaryCard label="Suspicious" value={stats.suspicious} sub="Unusual behavior" colorClass="bg-purple-50" />
  <SummaryCard label="Total" value={stats.total} sub="All alerts" colorClass="bg-blue-50" />
</div>

      {/* LIST */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <div key={alert.id} className="flex gap-3 border p-4 rounded-xl bg-white">

            <div className="flex-1">
              <Badge severity={alert.severity} />
              <p className="font-bold">{alert.title}</p>
              <p className="text-sm text-gray-500">{alert.description}</p>
            </div>

            <button onClick={() => deleteAlert(alert.id)}>
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {/* MODALS */}
      {showEmail && <EmailModal onClose={() => setShowEmail(false)} />}
      {showSound && <SoundModal onClose={() => setShowSound(false)} />}
    </div>
  );
}