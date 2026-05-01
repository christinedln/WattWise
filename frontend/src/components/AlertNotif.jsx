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
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

// ─── Filter meta ──────────────────────────────────────
const filterMeta = {
  All: {
    label: "All",
    activeClass:
      "!bg-green-800 !text-white !border-green-900 shadow-[0_0_10px_rgba(20,83,45,0.55)] !rounded-full",
  },
  Critical: {
    label: "Critical",
    activeClass:
      "!bg-red-100 !text-red-900 !border-red-300 shadow-[0_0_6px_rgba(239,68,68,0.35)] !rounded-full",
  },
  Warning: {
    label: "Warning",
    activeClass:
      "!bg-amber-100 !text-amber-900 !border-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.35)] !rounded-full",
  },
  Info: {
    label: "Info",
    activeClass:
      "!bg-blue-100 !text-blue-900 !border-blue-300 shadow-[0_0_6px_rgba(59,130,246,0.35)] !rounded-full",
  },
};

// Add this constant above Badge
const TYPE = {
  Critical: {
    badge: "bg-red-100 text-red-800 border-red-300",
    dot: "bg-red-500",
  },
  Warning: {
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    dot: "bg-amber-500",
  },
  Info: {
    badge: "bg-blue-100 text-blue-800 border-blue-300",
    dot: "bg-blue-500",
  },
  Suspicious: {
    badge: "bg-purple-100 text-purple-800 border-purple-300",
    dot: "bg-purple-500",
  },
};

const Badge = ({ type }) => {
  const style = TYPE[type] ?? { badge: "bg-gray-100 text-gray-700 border-gray-300", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />{type}
    </span>
  );
};

// ─── Summary Card ─────────────────────────────────────
function SummaryCard({ label, value, sub, colorClass, textClass }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 ${colorClass}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${textClass}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold ${textClass}`}>
        {value}
      </p>
      
      <p className="text-xs mt-1 opacity-60">
        {sub}
      </p>
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

const activeAlerts = alerts.filter(
  (a) =>
    !a.resolved &&
    ["Critical", "Warning", "Suspicious"].includes(a.severity)
);

const stats = {
  critical: activeAlerts.filter(a => a.severity === "Critical").length,
  warnings: activeAlerts.filter(a => a.severity === "Warning").length,
  suspicious: activeAlerts.filter(a => a.severity === "Suspicious").length,
  total: activeAlerts.length,
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


      {/* STATS */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <SummaryCard label="Critical"    value={stats.critical}   sub="Needs attention"    colorClass="bg-red-50"    textClass="text-red-700" />
        <SummaryCard label="Suspicious"  value={stats.suspicious} sub="Unusual behavior"   colorClass="bg-purple-50" textClass="text-purple-700" />
        <SummaryCard label="Warning"     value={stats.warnings}   sub="Monitor"            colorClass="bg-amber-50"  textClass="text-amber-700" />
        <SummaryCard label="Total"       value={stats.total}      sub="All alerts"         colorClass="bg-blue-50"   textClass="text-blue-700" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">

        {/* Show / Hide Resolved */}
        <button
          onClick={() => setShowResolved(!showResolved)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 12px",
            borderRadius: 8,
            border: showResolved ? "1px solid #86efac" : "1px solid #d1d5db",
            background: showResolved ? "#f0fdf4" : "#ffffff",
            color: showResolved ? "#15803d" : "#4b5563",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {showResolved ? <EyeOffIcon /> : <EyeIcon />}
          {showResolved ? "Hide Resolved" : "Show Resolved"}
        </button>

        {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 font-medium">Filter:</span>

              {Object.entries(filterMeta).map(([key, { label, activeClass }]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 ${
                    filter === key
                      ? activeClass
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

        {selected.length > 0 && (
          <button
            onClick={resolveSelected}
            className="ml-auto px-3 py-2 rounded-lg bg-green-50 border border-green-300 text-green-700 text-sm font-semibold hover:bg-green-100 transition-colors"
          >
            ✓ Resolve {selected.length} selected
          </button>
        )}
      </div>

      {/* Select All */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-3">
        <input
          type="checkbox"
          checked={selected.length === filtered.length && filtered.length > 0}
          onChange={selectAll}
          className="w-4 h-4 accent-gray-900 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700">Select All</span>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <div key={alert.id} className="flex gap-3 border p-4 rounded-xl bg-white">

            <div className="flex-1">
              <Badge type={alert.severity} />
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
        {showEmail && <EmailModal onClose={() => setShowEmail(false)} onSave={() => { setShowEmail(false); showToast("Email preferences saved!"); }} />}
        {showSound && <SoundModal onClose={() => setShowSound(false)} onSave={() => { setShowSound(false); showToast("Sound settings saved!"); }} />}
            </div>
  );
}
