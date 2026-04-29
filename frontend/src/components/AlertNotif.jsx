import { useEffect } from "react";
import { useState } from "react";
import { mockAlerts, TYPE } from "./AlertsData";
import EmailModal from "./EmailModal";
import SoundModal from "./SoundModal";
import HistoryDrawer from "./HistoryDrawer";
import { apiFetch } from "../api/api";

// ─── Inline SVG Icons ─────────────────────────────────
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const VolumeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

// ─── Filter meta ──────────────────────────────────────
const filterMeta = [
  { key: "All",      activeClass: "border-gray-900  text-gray-900  bg-white font-semibold" },
  { key: "Critical", activeClass: "border-red-500   text-red-600   bg-white font-semibold" },
  { key: "Warning",  activeClass: "border-amber-500 text-amber-600 bg-white font-semibold" },
  { key: "Info",     activeClass: "border-blue-500  text-blue-600  bg-white font-semibold" },
];

const Badge = ({ type }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${TYPE[type].badge}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${TYPE[type].dot}`} />{type}
  </span>
);

// ─── Summary Card — matches DeviceManagement style ────
function SummaryCard({ label, value, sub, colorClass }) {
  return (
    <div className={`rounded-xl border p-4 ${colorClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">{label}</p>
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
          type:
            alert.severity === "Critical" ? "Critical"
            : alert.severity === "Warning" ? "Warning"
            : "Info",
          title: alert.device_name,
          description: alert.message,
          category: alert.severity,
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

  const [filter, setFilter]           = useState("All");
  const [showResolved, setShowResolved] = useState(false);
  const [selected, setSelected]       = useState([]);
  const [showEmail, setShowEmail]     = useState(false);
  const [showSound, setShowSound]     = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast]             = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = alerts.filter(a =>
    (showResolved || !a.resolved) && (filter === "All" || a.type === filter)
  );

  const stats = {
    active:   alerts.filter(a => !a.resolved).length,
    critical: alerts.filter(a => a.type === "Critical" && !a.resolved).length,
    warnings: alerts.filter(a => a.type === "Warning"  && !a.resolved).length,
    total:    alerts.length,
  };

  const toggleSelect    = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const selectAll       = () => setSelected(selected.length === filtered.length ? [] : filtered.map(a => a.id));
  const deleteAlert     = (id) => { setAlerts(p => p.filter(a => a.id !== id)); showToast("Alert dismissed"); };
  const resolveSelected = () => {
    setAlerts(p => p.map(a => selected.includes(a.id) ? { ...a, resolved: true } : a));
    setSelected([]);
    showToast("Marked as resolved");
  };

  return (
    <div className="relative">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Alerts & Notifications</h1>
          <p className="text-sm text-gray-400 mt-0.5">Stay informed about device issues and energy anomalies</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowHistory(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#ffffff", color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >
            <ClockIcon /> Alert History
          </button>
          <button
            onClick={() => setShowSound(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#ffffff", color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >
            <VolumeIcon /> Sound Settings
          </button>
          <button
            onClick={() => setShowEmail(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid #16a34a", background: "#22c55e", color: "#ffffff", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#16a34a"}
            onMouseLeave={e => e.currentTarget.style.background = "#22c55e"}
          >
            <MailIcon /> Email Notifications
          </button>
        </div>
      </div>

      {/* ── Stats — same card style as DeviceManagement ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryCard label="Active Alerts"  value={stats.active}   sub="Unresolved"         colorClass="bg-gray-50    border-gray-200   text-gray-800"   />
        <SummaryCard label="Critical"       value={stats.critical} sub="Requires attention"  colorClass="bg-red-50     border-red-100    text-red-800"    />
        <SummaryCard label="Warnings"       value={stats.warnings} sub="Monitor closely"     colorClass="bg-amber-50   border-amber-100  text-amber-800"  />
        <SummaryCard label="Total Alerts"   value={stats.total}    sub="All time"            colorClass="bg-blue-50    border-blue-100   text-blue-800"   />
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
          {filterMeta.map(({ key, activeClass }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 text-sm rounded-full border-2 transition-all duration-150 font-medium ${
                filter === key
                  ? activeClass
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {key}
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
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No alerts match this filter.</p>
        )}
        {filtered.map(alert => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-opacity ${alert.resolved ? "opacity-60" : ""}`}
          >
            <input
              type="checkbox"
              checked={selected.includes(alert.id)}
              onChange={() => toggleSelect(alert.id)}
              className="mt-1 w-4 h-4 accent-gray-900 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge type={alert.type} />
                {alert.resolved && (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    Resolved
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-gray-900">{alert.title}</p>
              <p className="text-sm text-gray-500">{alert.description}</p>
              <p className="text-xs text-gray-400 mt-1">Type: {alert.category}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2 min-w-[90px]">
              <span className="text-xs text-gray-400">{alert.time}</span>
              <button
                onClick={() => deleteAlert(alert.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "1px solid #fca5a5",
                  background: "transparent",
                  color: "#dc2626",
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s, border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#ef4444";
                  e.currentTarget.style.borderColor = "#ef4444";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "#fca5a5";
                  e.currentTarget.style.color = "#dc2626";
                }}
              >
                <TrashIcon />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals & Drawer */}
      {showEmail   && <EmailModal    onClose={() => setShowEmail(false)}   onSave={() => { setShowEmail(false);   showToast("Email notifications saved!"); }} />}
      {showSound   && <SoundModal    onClose={() => setShowSound(false)}   onSave={() => { setShowSound(false);   showToast("Sound settings saved!");       }} />}
      {showHistory && <HistoryDrawer onClose={() => setShowHistory(false)} />}
    </div>
  );
}