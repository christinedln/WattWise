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
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);


// ─── Status Badge ─────────────────────────────────
function StatusBadge({ status, severity }) {
  if (severity === "Critical") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-red-50 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Critical
      </span>
    );
  }

  if (severity === "Warning") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Warning
      </span>
    );
  }

  if (severity === "Suspicious") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-200">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
        Suspicious
      </span>
    );
  }

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

// ─── Row ─────────────────────────────────────
function DeviceRow({ device, pct, openEdit }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 font-semibold whitespace-nowrap">
  <div className="flex items-center gap-2">
    {device.name}
    <button onClick={() => openEdit(device, "name")} className="p-1">
      <PencilIcon />
    </button>
  </div>
</td>
      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
  <div className="flex items-center gap-2">
    {device.location}
    <button onClick={() => openEdit(device, "location")} className="p-1">
      <PencilIcon />
    </button>
  </div>
</td>

      <td className="px-4 py-3">
        <StatusBadge status={device.status} severity={device.severity} />
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
              gap: 5,
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              background: "transparent",
              color: "#374151",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
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
            Power
          </button>

          {/* ── Remove Device ── */}
            <button
              title="Remove device"
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
              <TrashIcon size={14} />
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

// ─── Activity Timeline ─────────────────────────────────
function ActivityTimeline({ device }) {
  if (!device.activity_timeline?.length) return null;

  return (
    <div className="px-4 py-3 bg-slate-50 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Activity Timeline
      </p>

      <div className="space-y-1.5">
        {device.activity_timeline.map((log, idx) => (
          <div key={idx} className="text-xs text-gray-600 flex gap-3">
            <span className="text-gray-400 shrink-0">
              {formatTime(log.time)}
            </span>
            <span>{log.event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Filter meta — each filter has its own active color ──
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

  Critical: {
    label: "Critical",
    activeClass:
      "!bg-red-100 !text-red-900 !border-red-300 shadow-[0_0_6px_rgba(239,68,68,0.35)] !rounded-full",
  },

  Suspicious: {
    label: "Suspicious",
    activeClass:
      "!bg-purple-100 !text-purple-900 !border-purple-300 shadow-[0_0_6px_rgba(147,51,234,0.35)] !rounded-full",
  },

  Warning: {
    label: "Warning",
    activeClass:
      "!bg-amber-100 !text-amber-900 !border-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.35)] !rounded-full",
  },

  Normal: {
    label: "Normal",
    activeClass:
      "!bg-blue-100 !text-blue-900 !border-blue-300 shadow-[0_0_6px_rgba(59,130,246,0.35)] !rounded-full",
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


  useEffect(() => {
    const fetchDevices = async () => {
      const json = await apiFetch("/devices/");

      const formatted = (json.data || []).map((d) => ({
        id: d.id,
        device_id: d.device_id,
        name: d.name,
       
        location: d.location,
        status: d.status,
        kwh: d.kwh ?? d.consumption ?? 0,
        severity: d.severity,
        lastUpdated: d.lastUpdated,
        activity_timeline: d.activity_timeline || []
      }));

      setDevices(formatted);
    };

    fetchDevices();
  }, []);

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
    if (filter === "all") return true;
    if (filter === "active") return d.status === "active";
    if (filter === "offline") return d.status === "offline";

    return d.severity === filter;
  });

  const totalKwh = filteredDevices.reduce((s, d) => s + d.kwh, 0);

  // ─── COUNTS ─────────────────────────────
  const counts = {
    active:     devices.filter(d => d.status === "active").length,
    offline:    devices.filter(d => d.status === "offline").length,
    Critical:   devices.filter(d => d.severity === "Critical").length,
    Warning:    devices.filter(d => d.severity === "Warning").length,
    Suspicious: devices.filter(d => d.severity === "Suspicious").length,
    Normal:     devices.filter(d => d.severity === "Normal").length,
  };

  return (
    <>
      {/* ── HEADER ───────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Devices Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">Monitor, control, and analyze all connected devices</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <SummaryCard label="Active"     count={counts.active}     colorClass="bg-emerald-50 border-emerald-100 text-emerald-800" />
        <SummaryCard label="Offline"    count={counts.offline}    colorClass="bg-gray-50 border-gray-200 text-gray-700" />
        <SummaryCard label="Critical"   count={counts.Critical}   colorClass="bg-red-50 border-red-100 text-red-800" />
        <SummaryCard label="Suspicious" count={counts.Suspicious} colorClass="bg-purple-50 border-purple-100 text-purple-800" />
        <SummaryCard label="Warning"    count={counts.Warning}    colorClass="bg-amber-50 border-amber-100 text-amber-800" />
        <SummaryCard label="Normal"     count={counts.Normal}     colorClass="bg-blue-50 border-blue-100 text-blue-800" />
      </div>

      {/* ── FILTERS ───────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-5">
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

      {/* ── TABLE ───────────────────────────── */}
<div className="bg-white border border-gray-200 rounded-xl shadow-sm">
  
  {/* enables horizontal scroll on small screens */}
  <div className="overflow-x-auto">
    <table className="min-w-[900px] w-full">
      
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50">
          {["Name", "Location", "Status/Severity", "kWh", "% Usage", "Last Updated", "Actions"].map((h) => (
            <th
              key={h}
              className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

          <tbody>
            {filteredDevices.map((d) => (
              <React.Fragment key={d.id}>
                <DeviceRow
                  device={d}
                  pct={totalKwh ? (d.kwh / totalKwh) * 100 : 0} openEdit={openEdit}
                />
                <tr>
                  <td colSpan="7">
                    <ActivityTimeline device={d} />
                  </td>
                </tr>
              </React.Fragment>
            ))}
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