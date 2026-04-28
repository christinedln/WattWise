'use client';

import React, { useState, useEffect } from "react";
// Icons replaced with inline SVGs
import { apiFetch } from "../api/api";

const API_URL = "http://localhost:5000/api/devices/";

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

// ✅ NEW: Pencil Icon
const PencilIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);


// ─── Status Badge ─────────────────────────────────
function StatusBadge({ status, health }) {
  if (health === "Critical") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-red-50 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Critical
      </span>
    );
  }

  if (health === "Warning") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Warning
      </span>
    );
  }

  if (health === "Suspicious") {
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
function DeviceRow({ device, pct }) {

  // ✅ ADD THESE STATES
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(device.name);

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState(device.location);

  return (
    <tr className="border-b border-gray-100 hover:bg-slate-50 transition-colors duration-150">

      {/* ✅ UPDATED NAME CELL */}
      <td className="px-4 py-3 font-semibold text-sm text-gray-900">
        <div className="flex items-center gap-2">

          {/* ✅ ADD CONDITIONAL INPUT */}
          {isEditingName ? (
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              className="border px-2 py-1 rounded text-sm"
              autoFocus
            />
          ) : (
            <>
              {newName}
              <button
                title="Edit name"
                onClick={() => setIsEditingName(true)} 
                className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
              >
                <PencilIcon />
              </button>
            </>
          )}

        </div>
      </td>

      <td className="px-4 py-3 text-sm text-gray-500">{device.type}</td>

      {/* ✅ UPDATED LOCATION CELL */}
      <td className="px-4 py-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">

          {/* ✅ ADD CONDITIONAL INPUT */}
          {isEditingLocation ? (
            <input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onBlur={() => setIsEditingLocation(false)}
              className="border px-2 py-1 rounded text-sm"
              autoFocus
            />
          ) : (
            <>
              {newLocation}
              <button
                title="Edit location"
                onClick={() => setIsEditingLocation(true)} 
                className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
              >
                <PencilIcon />
              </button>
            </>
          )}

        </div>
      </td>

      <td className="px-4 py-3">
        <StatusBadge status={device.status} health={device.health} />
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
  all:        { label: "All",        activeClass: "bg-gray-100 text-gray-900 border-gray-900 font-semibold" },
  active:     { label: "Active",     activeClass: "bg-emerald-100 text-emerald-800 border-emerald-500 font-semibold" },
  offline:    { label: "Offline",    activeClass: "bg-gray-100 text-gray-700 border-gray-500 font-semibold" },
  Normal:     { label: "Normal",     activeClass: "bg-blue-100 text-blue-800 border-blue-500 font-semibold" },
  Warning:    { label: "Warning",    activeClass: "bg-amber-100 text-amber-800 border-amber-500 font-semibold" },
  Critical:   { label: "Critical",   activeClass: "bg-red-100 text-red-800 border-red-500 font-semibold" },
  Suspicious: { label: "Suspicious", activeClass: "bg-purple-100 text-purple-800 border-purple-500 font-semibold" },
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

  useEffect(() => {
    const fetchDevices = async () => {
      const json = await apiFetch("/devices/");

      const formatted = json.data.map((d) => ({
        id: d.id,
        device_id: d.device_id,
        name: d.name,
        type: d.type,
        location: d.location,
        status: d.status,
        kwh: d.consumption,
        health: d.health,
        lastUpdated: d.lastUpdated,
        activity_timeline: d.activity_timeline || []
      }));

      setDevices(formatted);
    };

    fetchDevices();
  }, []);

  // ─── FILTER LOGIC ─────────────────────────────
  const filteredDevices = devices.filter((d) => {
    if (filter === "all") return true;
    if (filter === "active") return d.status === "active";
    if (filter === "offline") return d.status === "offline";

    return d.health === filter;
  });

  const totalKwh = filteredDevices.reduce((s, d) => s + d.kwh, 0);

  // ─── COUNTS ─────────────────────────────
  const counts = {
    active:     devices.filter(d => d.status === "active").length,
    offline:    devices.filter(d => d.status === "offline").length,
    Critical:   devices.filter(d => d.health === "Critical").length,
    Warning:    devices.filter(d => d.health === "Warning").length,
    Suspicious: devices.filter(d => d.health === "Suspicious").length,
    Normal:     devices.filter(d => d.health === "Normal").length,
  };

  return (
    <>
      {/* ── HEADER ───────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Devices Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">Monitor, control, and analyze all connected devices</p>
      </div>

      {/* ── HEALTH SUMMARY CARDS ───────────────── */}
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
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Name", "Type", "Location", "Status / Health", "kWh", "% Usage", "Last Updated", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
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
                  pct={totalKwh ? (d.kwh / totalKwh) * 100 : 0}
                />
                <tr>
                  <td colSpan="8">
                    <ActivityTimeline device={d} />
                  </td>
                </tr>
              </React.Fragment>
            ))}

            {filteredDevices.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-sm text-gray-400">
                  No devices match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}