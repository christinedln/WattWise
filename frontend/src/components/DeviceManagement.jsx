'use client';

import React, { useState, useEffect } from "react";
// Icons replaced with inline SVGs
import { apiFetch } from "../api/api";

// ─── Inline SVG Icons ─────────────────────────────
const PowerIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
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

// NEW: Pencil Icon
const PencilIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s ease",
      display: "block",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);


// ─── Status Badge ─────────────────────────────────
function StatusBadge({ severity }) {
  if (severity === "critical") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-red-50 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Critical
      </span>
    );
  }

  if (severity === "warning") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Warning
      </span>
    );
  }

if (severity === "suspicious") {
  return (
    <span className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-200 leading-tight">
      <span className="w-1 h-1 rounded-full bg-purple-500 flex-shrink-0" />
      Suspicious
    </span>
  );
}
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
      Normal
    </span>
  );
}

function DeviceStatusBadge({ status }) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      Offline
    </span>
  );
}

// ─── Usage Bar ─────────────────────────────────
function UsageBar({ pct }) {
  const color = pct > 40 ? "bg-red-400" : pct > 20 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-600">{pct.toFixed(1)}%</span>
    </div>
  );
}

function getSeverity(currentalert = [], signal) {
  const alert = currentalert.find(a => a.signal === signal);

  if (!alert) return "normal";

  if (!alert.timestamp) return "normal";

  const FIVE_MINUTES = 5 * 60 * 1000;

  const isRecent =
    Date.now() - new Date(alert.timestamp).getTime() <= FIVE_MINUTES;

  return isRecent ? (alert.severity || "normal") : "normal";
}

// ─── Row ─────────────────────────────────────
function DeviceRow({ device, pct, openEdit, onDelete }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 font-semibold whitespace-nowrap">
        <div className="flex items-center justify-between gap-2">
          <span>{device.name}</span>
          <button onClick={() => openEdit(device, "name")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#9ca3af" }}>
            <PencilIcon />
          </button>
        </div>
      </td>

      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
        <div className="flex items-center justify-between gap-2">
          <span>{device.location}</span>
          <button onClick={() => openEdit(device, "location")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#9ca3af" }}>
            <PencilIcon />
          </button>
        </div>
      </td>

      <td className="px-4 py-3">
        <DeviceStatusBadge status={device.status} />
      </td>

      <td className="px-4 py-3">
        <StatusBadge severity={getSeverity(device.currentalert, "current")} />
      </td>

      <td className="px-4 py-3">
        <StatusBadge severity={getSeverity(device.currentalert, "voltage")} />
      </td>

      <td className="px-4 py-3">
        <StatusBadge severity={getSeverity(device.currentalert, "power")} />
      </td>

      <td className="px-4 py-3 font-mono text-sm text-gray-700 font-medium">{device.kwh}</td>

      <td className="px-4 py-3">
        <UsageBar pct={pct} />
      </td>

      <td className="px-4 py-3 text-xs text-gray-400">
        {device.lastUpdated ? formatTime(device.lastUpdated) : "—"}
      </td>

      <td className="px-4 py-3">
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>

          {/* ── Toggle Power ── */}
          <button
            title="Toggle power"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "transparent",
              color: "#374151",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#111827";
              e.currentTarget.style.borderColor = "#111827";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.color = "#374151";
            }}
          >
            <PowerIcon />
          </button>

          {/* ── Remove Device ── */}
          <button
            title="Remove device"
            onClick={() => onDelete(device.device_id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              borderRadius: 8,
              border: "none",
              background: "#F0F0F0",
              color: "#1e1e1e",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#E0E0E0"}
            onMouseLeave={e => e.currentTarget.style.background = "#F0F0F0"}
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

function formatTime(time) {
  return new Date(time).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

// Activity Timeline 
function ActivityTimeline({ device }) {
  const [open, setOpen] = useState(false);
  if (!device.activity_timeline?.length) return null;

  return (
    <div className="w-full px-4 py-5 bg-white border-t border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Activity Timeline
        </p>

        <button
          onClick={() => setOpen(prev => !prev)}
          className="
            inline-flex items-center gap-1.5
            px-3 py-1.5
            text-xs font-medium
            rounded-full
            transition-all duration-200
          "
        >
          <ChevronIcon open={open} />
          <span>{open ? "" : ""}</span>
        </button>
      </div>

      {/* Timeline container */}
      {open && (
        <div className="relative pl-8">

          {/* vertical line */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />

          <div className="space-y-5">
            {device.activity_timeline.map((log, idx) => {

              // simple severity color parsing from event text
              const isCritical = log.event.includes("critical");
              const isWarning = log.event.includes("warning");
              const isSuspicious = log.event.includes("suspicious");
              const signal = log.event.split("]")[0].replace("[", "").toLowerCase();
              const severityText = (log.event.split("-")[1]?.trim() || log.event).toUpperCase();

              const signalColor =
                signal === "current"
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : signal === "voltage"
                  ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                  : signal === "power"
                  ? "bg-pink-100 text-pink-700 border-pink-300"
                  : "bg-gray-100 text-gray-600 border-gray-200";

              const dotColor =
                isCritical ? "bg-red-500"
                  : isWarning ? "bg-amber-500"
                    : isSuspicious ? "bg-purple-500"
                      : "bg-emerald-500";

              return (
                <div key={idx} className="relative flex items-start gap-3">

                  {/* dot */}
                  <div
                    className={`absolute left-[-6px] top-1 w-3 h-3 rounded-full border-2 border-white shadow ${dotColor}`}
                  />

                  {/* card */}
                  <div className="w-full bg-gray-50 hover:bg-gray-100 transition rounded-lg px-3 py-2 border border-gray-100">

                    {/* top row */}
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-gray-400">
                        {formatTime(log.time)}
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${signalColor}`}
                      >
                        {signal}
                      </span>
                    </div>

                    {/* message */}
                    <p className="text-xs text-gray-700 leading-snug">
                      {severityText}
                    </p>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const filterMeta = {
  all: {
    label: "All",
    activeClass:
      "!bg-green-800 !text-white !border-green-900 shadow-[0_0_10px_rgba(20,83,45,0.55)] !rounded-full",
  },

  active: {
    label: "Active",
    activeClass:
      "!bg-emerald-100 !text-emerald-900 !border-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.35)] !rounded-full",
  },

  offline: {
    label: "Offline",
    activeClass:
      "!bg-gray-100 !text-gray-800 !border-gray-300 shadow-[0_0_6px_rgba(156,163,175,0.3)] !rounded-full",
  },

  // ── SIGNALS ──
  current: {
    label: "Current",
    activeClass:
      "!bg-blue-100 !text-blue-900 !border-blue-300 shadow-[0_0_6px_rgba(59,130,246,0.35)] !rounded-full",
  },

  voltage: {
    label: "Voltage",
    activeClass:
      "!bg-indigo-100 !text-indigo-900 !border-indigo-300 shadow-[0_0_6px_rgba(99,102,241,0.35)] !rounded-full",
  },

  power: {
    label: "Power",
    activeClass:
      "!bg-pink-100 !text-pink-900 !border-pink-300 shadow-[0_0_6px_rgba(236,72,153,0.35)] !rounded-full",
  },

  // ── SEVERITY ──
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

Suspicious: {
  label: "Suspicious",
  activeClass:
    "!bg-purple-100 !text-purple-900 !border-purple-300 shadow-[0_0_3px_rgba(147,51,234,0.25)] !rounded-full px-2 py-0.5",
},

  Normal: {
    label: "Normal",
    activeClass:
      "!bg-blue-50 !text-blue-700 !border-blue-200 shadow-[0_0_6px_rgba(59,130,246,0.25)] !rounded-full",
  },
};

// ─── Summary Card ────────────────────────────────────
function SummaryCard({ label, count, colorClass }) {
  return (
    <div className={`rounded-xl border p-4 ${colorClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">{label}</p>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────
export default function DeviceManagement() {

  const [devices, setDevices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [signalFilter, setSignalFilter] = useState(null);
  const [severityFilter, setSeverityFilter] = useState(null);

  const fetchDevices = async () => {
    const json = await apiFetch("/devices/");

    const formatted = (json.data || []).map((d) => ({
      id: d.id,
      device_id: d.device_id,
      name: d.name,
      location: d.location,
      status: d.status,
      kwh: d.kwh ?? d.consumption ?? 0,
      currentalert: d.currentalert || [],
      alerts: d.alerts || [],
      lastUpdated: d.lastUpdated,
    }));

    setDevices(formatted);
  };

    useEffect(() => {
      fetchDevices();
    }, []);

  const refreshAfterDelay = () => {
    setTimeout(() => {
      fetchDevices();
    }, 5000);
  };

  const handleDelete = async (deviceId) => {
    try {
      await apiFetch(`/devices/${deviceId}`, {
        method: "DELETE",
      });

      setDevices((prev) => prev.filter(d => d.device_id !== deviceId));
      refreshAfterDelay();
    } catch (err) {
      console.error("Delete failed", err);
      alert(err.message || "Failed to delete device");
    }
  };

  const openEdit = (device, field) => {
    setErrorMsg("");

    setEditing({
      device_id: device.device_id,
      field,
      value: device[field],
    });
  };

  const closeEdit = () => {
    setEditing(null);
  };

  const saveEdit = async () => {
    try {

      const payload = {
        [editing.field]:
          editing.field === "enabled"
            ? Boolean(editing.value)
            : editing.value.trim(),
      };

      await apiFetch(`/devices/${editing.device_id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setDevices((prev) =>
        prev.map((d) =>
          d.device_id === editing.device_id
            ? { ...d, [editing.field]: editing.value }
            : d
        )
      );

      closeEdit();
    } catch (err) {
      console.error("Update failed", err);

      const message =
        err?.message ||
        "Changes cannot be empty.";

      setErrorMsg(message);
    }
  };


  // ─── FILTER LOGIC ─────────────────────────────
  const filteredDevices = devices.filter((d) => {
    if (filter === "active" && d.status !== "active") return false;
    if (filter === "offline" && d.status !== "offline") return false;
    if (signalFilter && severityFilter) {
      const severity = getSeverity(d.currentalert, signalFilter);
      return severity === severityFilter.toLowerCase();
    }

    return true;
  });

    const devicesWithTimeline = filteredDevices.map(d => ({
    ...d,
    activity_timeline: (d.alerts || [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(a => ({
        time: a.timestamp,
        event: `[${a.signal}] ${a.severity} - ${a.message}`
      }))
  }));

  const totalKwh = filteredDevices.reduce((s, d) => s + d.kwh, 0);

  // ─── COUNTS ─────────────────────────────
  const counts = {
    active: devices.filter(d => d.status === "active").length,
    offline: devices.filter(d => d.status === "offline").length,
  };

  return (
    <>
      {/* ── HEADER ───────────────────────────── */}


      <div className="bg-white rounded-lg border border-gray-200 px-6 py-4 mb-6">
        {/* STATUS */}
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard
            label="Active"
            count={counts.active}
            colorClass="bg-green-50 border-green-100 text-green-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          />
          <SummaryCard
            label="Offline"
            count={counts.offline}
            colorClass="bg-gray-50 border-gray-200 text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          />
        </div>
      </div>

      {/* ── FILTERS ───────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-5">

        <div className="flex items-center bg-gray-100 p-1 rounded-full w-fit flex-wrap gap-1">

          {Object.entries(filterMeta).map(([key, { label, activeClass }]) => {
            const isBase =
              ["all", "active", "offline", "current", "voltage", "power"].includes(key);

            if (!isBase) return null;

            const isActive =
              filter === key || signalFilter === key;

            return (
              <button
                key={key}
                onClick={() => {
                  if (["current", "voltage", "power"].includes(key)) {
                    setSignalFilter(key);
                    setSeverityFilter(null);
                  } else {
                    setFilter(key);
                    setSignalFilter(null);
                    setSeverityFilter(null);
                  }
                }}
                className={`
            px-5 py-2 text-sm font-medium transition-all duration-200 z-10
            ${isActive
                    ? (key === "all"
                      ? "!bg-green-600 !text-white"
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


      {/* ── SEVERITY FILTERS ───────────────────────────── */}
      {signalFilter && (
        <div className="flex items-center bg-gray-100 p-1 rounded-full w-fit mb-4 flex-wrap gap-1">

          {["All", "Critical", "Warning", "Suspicious", "Normal"].map((key) => {
            const isAll = key === "All";

            const isActive =
              (isAll && severityFilter === null) ||
              severityFilter === key;

            const meta = isAll
              ? {
                label: "All",
                activeClass:
                  "!bg-green-600 !text-white shadow-md shadow-green-300",
              }
              : filterMeta[key];

            return (
              <button
                key={key}
                onClick={() => {
                  if (isAll) {
                    setSeverityFilter(null);
                  } else {
                    setSeverityFilter(key);
                  }
                }}
                className={`
            px-5 py-2 text-sm font-medium transition-all duration-200 z-10
            ${isActive
                    ? meta.activeClass
                    : "!bg-transparent !text-gray-600 hover:!bg-gray-200"
                  }
          `}
                style={{ borderRadius: "9999px" }}
              >
                {meta.label}
              </button>
            );
          })}

        </div>
      )}

      {/* ── TABLE ───────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* enables horizontal scroll on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">

            <thead>
              <tr className="border-b border-green-700 bg-green-700">
                {[
                  "Name",
                  "Location",
                  "Status",
                  "Current",
                  "Voltage",
                  "Power",
                  "kWh",
                  "% Usage",
                  "Last Updated",
                  "Actions"
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
                    style={{
                      width:
                        h === "Name" || h === "Location"
                          ? "13%"
                          : h === "Last Updated"
                            ? "15%"
                            : h === "% Usage"
                              ? "11%"
                              : h === "Actions"
                                ? "10%"
                                : "8%"
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center">
                    <p className="text-sm font-medium text-gray-400">
                      No devices found
                    </p>
                  </td>
                </tr>
              ) : (
                devicesWithTimeline.map((d) => (
                  <React.Fragment key={d.id}>
                    <DeviceRow
                      device={d}
                      pct={totalKwh ? (d.kwh / totalKwh) * 100 : 0}
                      openEdit={openEdit}
                      onDelete={handleDelete}
                    />

                    {/* FULL WIDTH TIMELINE ROW */}
                    <tr>
                      <td colSpan={10} className="p-0 border-b border-gray-100 bg-white">

                        <div className="w-full">
                          <ActivityTimeline device={d} />
                        </div>

                      </td>
                    </tr>

                  </React.Fragment>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 rounded-2xl w-80 shadow-xl">

            {/* Title */}
            <h2 className="text-lg font-semibold mb-4 text-center">
              Edit {editing.field}
            </h2>

            {/* Input */}
            <input
              type="text"
              value={editing.value}
              onChange={(e) =>
                setEditing({ ...editing, value: e.target.value })
              }
              className="w-full border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg mb-5 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {errorMsg && (
              <p className="text-red-500 text-xs mt-2 mb-3">
                {errorMsg}
              </p>
            )}

            {/* Buttons */}
            <div className="flex justify-center items-center gap-3 mt-2">

              {/* Cancel */}
              <button
                onClick={closeEdit}
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>

              {/* Save */}
              <button
                onClick={saveEdit}
                className="
            px-4 py-1.5 rounded-md
            !bg-emerald-500 !text-white
            hover:!bg-emerald-600
            active:scale-95
            transition-all duration-150
            shadow-sm
            focus:outline-none focus:ring-2 focus:ring-emerald-400
          "
              >
                Save Changes
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
} 