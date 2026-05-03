import { useEffect, useState } from "react";
import EmailModal from "./EmailModal";
import { apiFetch } from "../api/api";
import { CheckCircle, Undo2 } from "lucide-react";

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
  Suspicious: {
    label: "Suspicious",
    activeClass:
      "!bg-purple-100 !text-purple-900 !border-purple-300 shadow-[0_0_6px_rgba(168,85,247,0.35)] !rounded-full",
  },
  Warning: {
    label: "Warning",
    activeClass:
      "!bg-amber-100 !text-amber-900 !border-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.35)] !rounded-full",
  },
};

// Add this constant above Badge
const TYPE = {
  Critical: {
    badge: "bg-red-100 text-red-800 border-red-300",
    dot: "bg-red-500",
  },
  Suspicious: {
    badge: "bg-purple-100 text-purple-800 border-purple-300",
    dot: "bg-purple-500",
  },
  Warning: {
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    dot: "bg-amber-500",
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


function formatTime(ts) {
  if (!ts) return "Unknown";
  const date = new Date(ts.trim());
  return date.toLocaleString();
}

function normalizeSeverity(sev) {
  if (!sev) return "Warning";

  const s = sev.toLowerCase();

  if (s === "critical") return "Critical";
  if (s === "warning") return "Warning";
  if (s === "suspicious") return "Suspicious";

  return "Warning";
}

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
  const [logModal, setLogModal] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await apiFetch("/alerts");

        const transformed = data.map((alert) => ({
          id: alert.id,

          severity: normalizeSeverity(alert.severity),

          title: alert.device_name,

          description: `
            ${alert.signal?.toUpperCase()} anomaly
            | ${alert.power ?? "-"} W
            | ${alert.voltage ?? "-"} V
            | ${alert.current ?? "-"} A
          `,

          time: formatTime(alert.timestamp),

          resolved: alert.resolved,
          context_logs: alert.context_logs || [],
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
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = alerts.filter(
    (a) =>
      (showResolved || !a.resolved) &&
      (filter === "All" || a.severity.toLowerCase() === filter.toLowerCase())
  );

const activeAlerts = alerts.filter(
  (a) =>
    !a.resolved &&
    ["critical", "warning", "suspicious"].includes(a.severity.toLowerCase())
);

const stats = {
  critical: activeAlerts.filter(a => a.severity === "Critical").length,
  warnings: activeAlerts.filter(a => a.severity === "Warning").length,
  suspicious: activeAlerts.filter(a => a.severity === "Suspicious").length,
  total: activeAlerts.length,
};

  const selectAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((a) => a.id));

const toggleResolveAlert = async (id, currentResolved) => {
  try {
    await apiFetch(`/alerts/${id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify({ resolved: !currentResolved }),
    });

    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, resolved: !currentResolved } : a
      )
    );

    showToast(currentResolved ? "Marked as unresolved" : "Alert resolved");

  } catch (err) {
    console.error("Toggle resolve failed:", err);
  }
};

const resolveSelected = async () => {
  try {
    await Promise.all(
      selected.map((id) =>
        apiFetch(`/alerts/${id}/resolve`, {
          method: "PATCH",
          body: JSON.stringify({ resolved: true }), 
        })
      )
    );

    setAlerts((p) =>
      p.map((a) =>
        selected.includes(a.id) ? { ...a, resolved: true } : a
      )
    );

    setSelected([]);
    showToast("Marked as resolved");

  } catch (err) {
    console.error("Resolve failed:", err);
  }
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmail(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150"
             style={{ backgroundColor: "#F0F8F5 ", color: "black", border: "1px solid #86efac" }}
            >
          <MailIcon /> Email Alerts
            </button>
            
          </div>
        </div>

      {/* STATS */}
      <div className="bg-white rounded-lg border border-gray-200 px-6 py-4 mb-6">
        <div className="grid grid-cols-4 gap-3 mb-6">
          <SummaryCard label="Critical" value={stats.critical} sub="Needs attention" colorClass="bg-red-50" textClass="text-red-700" />
          <SummaryCard label="Suspicious" value={stats.suspicious} sub="Unusual behavior" colorClass="bg-purple-50" textClass="text-purple-700" />
          <SummaryCard label="Warning" value={stats.warnings} sub="Monitor" colorClass="bg-amber-50" textClass="text-amber-700" />
          <SummaryCard label="Total" value={stats.total} sub="All alerts" colorClass="bg-blue-50" textClass="text-blue-700" />
        </div>
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

          <div className="flex items-center bg-gray-100 p-1 rounded-full w-fit flex-wrap gap-1">

            {Object.entries(filterMeta).map(([key, { label, activeClass }]) => {
              const isActive = filter === key;

              const isAll = key === "All";

              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`
            px-5 py-2 text-sm font-medium transition-all duration-200 z-10
            ${isActive
                      ? (isAll
                        ? "!bg-green-600 !text-white shadow-md shadow-green-300 !rounded-full"
                        : activeClass)
                      : "!bg-transparent !text-gray-600 hover:!bg-gray-200"
                    }
          `}
                  style={{ borderRadius: "9999px" }}
                >
                  {label}
                </button>
              );
            })}

          </div>
        </div>

        {selected.length > 0 && (
         <button
  onClick={resolveSelected}
  className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-300 text-green-700 text-sm font-semibold hover:bg-green-100 transition-colors"
>
  <CheckCircle className="w-4 h-4" />
  Resolve {selected.length} selected
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
              <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
            </div>

            {/* INFO BUTTON */}
            <button
              onClick={() => setLogModal(alert)}
              className="text-xs px-1.5 py-0.5 text-blue-600 hover:text-blue-800"
              title="View context logs"
            >
              ℹ
            </button>

            <button
  onClick={() => toggleResolveAlert(alert.id, alert.resolved)}
  className="inline-flex items-center justify-center p-2 rounded-md !bg-transparent !bg-none !shadow-none !border-0 transition"
>
  {alert.resolved ? (
    <Undo2 className="w-5 h-5 !text-blue-600 hover:!text-blue-800" />
  ) : (
    <CheckCircle className="w-5 h-5 !text-green-600 hover:!text-green-800" />
  )}
</button>
          </div>
        ))}
      </div>
{logModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

    {/* modal */}
    <div className="bg-white w-[560px] max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl border border-gray-200 flex flex-col">

      {/* header */}
      <div className="flex justify-between items-center px-5 py-4 border-b bg-gray-50">
        <div>
          <h2 className="font-bold text-lg">Anomaly Timeline</h2>
          <p className="text-xs text-gray-500">
            Context logs leading to detection
          </p>
        </div>

        <button
          onClick={() => setLogModal(null)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* body */}
      <div className="p-5 overflow-auto">

        {logModal.context_logs?.length > 0 ? (() => {
          const logs = [...logModal.context_logs].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );

          const anomalyIndex = logs.length - 1;

          return (
            <div className="relative">

              {/* vertical timeline line */}
              <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />

              <div className="space-y-3">

                {logs.map((log, idx) => {
                  const isAnomaly = idx === anomalyIndex;

                  return (
                    <div key={idx} className="flex gap-3 relative">

                      {/* dot */}
                      <div className={`mt-2 w-3 h-3 rounded-full z-10 border-2
                        ${isAnomaly
                          ? "bg-red-500 border-red-300"
                          : "bg-gray-300 border-white"
                        }
                      `} />

                      {/* card */}
                      <div
                        className={`flex-1 rounded-xl border p-3 transition-all
                          ${isAnomaly
                            ? "bg-red-50 border-red-300 shadow-md"
                            : "bg-white border-gray-200"
                          }
                        `}
                      >

                        {/* top row */}
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-semibold ${
                            isAnomaly ? "text-red-600" : "text-gray-500"
                          }`}>
                            {isAnomaly ? "Anomaly Trigger" : "Normal Reading"}
                          </span>

                          <span className="text-[11px] text-gray-400">
                            {formatTime(log.timestamp)}
                          </span>
                        </div>

                        {/* values */}
                        <div className="grid grid-cols-3 text-xs text-gray-600">
                          <div>V: {log.voltage}</div>
                          <div>I: {log.current}</div>
                          <div>P: {log.power}</div>
                        </div>

                        {/* explanation */}
                        {isAnomaly && (
                          <div className="mt-2 text-xs text-red-600 font-medium">
                            This spike caused the alert detection.
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          );
        })() : (
          <p className="text-sm text-gray-500">No logs available</p>
        )}

      </div>
    </div>
  </div>
)}
      {/* MODALS */}
        {showEmail && (
          <EmailModal
            isOpen={showEmail} 
            onClose={() => setShowEmail(false)}
            onSave={() => {
              setShowEmail(false);
              showToast("Email preferences saved!");
            }}
          />
        )}
            </div>


  );
}
