'use client';

import React, { useState, useEffect } from "react";
import { Power, Settings, X, ChevronUp, ChevronDown } from "lucide-react";

// ─── Sample Device Data ───────────────────────────────────────────────────────
// Replace with your real API / data source
const DEVICES_DATA = [
  {
    id: "DEV-001", name: "Kitchen Lights", type: "Lighting", location: "Kitchen",
    status: "active", health: "Normal", kwh: 4.2, voltage: "120V", power: "200W",
    lastActive: new Date(Date.now() - 2 * 60000),
    timeline: [0,0,0,0,0,0,0.2,0.8,1,0.9,0.4,0.3,0.5,0.4,0.3,0.2,0.7,1,0.9,0.8,0.6,0.4,0.1,0],
  },
  {
    id: "DEV-002", name: "Living Room Lights", type: "Lighting", location: "Living Room",
    status: "active", health: "Normal", kwh: 3.5, voltage: "120V", power: "150W",
    lastActive: new Date(Date.now() - 5 * 60000),
    timeline: [0,0,0,0,0,0,0,0.3,0.6,0.4,0.2,0.1,0.2,0.1,0.1,0.2,0.9,1,1,0.9,0.8,0.7,0.5,0.2],
  },
  {
    id: "DEV-003", name: "Bedroom AC", type: "HVAC", location: "Bedroom",
    status: "idle", health: "Normal", kwh: 8.1, voltage: "240V", power: "1200W",
    lastActive: new Date(Date.now() - 45 * 60000),
    timeline: [0.6,0.5,0.4,0.3,0.2,0.1,0,0,0,0,0,0,0,0,0.1,0.2,0.4,0.6,0.8,1,0.9,0.8,0.7,0.6],
  },
  {
    id: "DEV-004", name: "Refrigerator", type: "Appliances", location: "Kitchen",
    status: "active", health: "Normal", kwh: 6.3, voltage: "120V", power: "150W",
    lastActive: new Date(Date.now() - 30000),
    timeline: [0.5,0.5,0.4,0.5,0.4,0.5,0.5,0.6,0.7,0.6,0.5,0.5,0.6,0.5,0.5,0.4,0.6,0.7,0.8,0.7,0.6,0.5,0.5,0.5],
  },
  {
    id: "DEV-005", name: "Washing Machine", type: "Appliances", location: "Utility Room",
    status: "idle", health: "Warning", kwh: 2.8, voltage: "240V", power: "500W",
    lastActive: new Date(Date.now() - 3 * 3600000),
    timeline: [0,0,0,0,0,0,0,0,0.2,1,0.9,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: "DEV-006", name: "Garage Lights", type: "Lighting", location: "Garage",
    status: "active", health: "Normal", kwh: 1.4, voltage: "120V", power: "60W",
    lastActive: new Date(Date.now() - 10 * 60000),
    timeline: [0,0,0,0,0,0,0.8,0.7,0.1,0,0,0,0,0,0,0,0,0.3,0.2,0.1,0,0,0,0],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const s = (Date.now() - date.getTime()) / 1000;
  if (s < 60)    return `${Math.floor(s)}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function freshnessClass(date) {
  const m = (Date.now() - date.getTime()) / 60000;
  if (m < 5)   return "text-green-600";
  if (m < 30)  return "text-gray-800";
  if (m < 120) return "text-amber-600";
  return "text-red-600";
}

function barBgClass(v) {
  if (v >= 0.7) return "bg-gray-800";
  if (v >= 0.3) return "bg-gray-400";
  return "bg-gray-200";
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, health }) {
  if (health === "Warning") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
      ⚠ Warning
    </span>
  );
  const cfg = {
    active:  { bg: "bg-green-50 border-green-200 text-green-700",  dot: "bg-green-500 animate-pulse", label: "Active"  },
    idle:    { bg: "bg-amber-50 border-amber-200 text-amber-700",  dot: "bg-amber-400",               label: "Idle"    },
    offline: { bg: "bg-red-50 border-red-200 text-red-700",        dot: "bg-red-500",                 label: "Offline" },
  }[status] || { bg: "bg-gray-50 border-gray-200 text-gray-600", dot: "bg-gray-400", label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Usage Bar ────────────────────────────────────────────────────────────────
function UsageBar({ pct }) {
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-800 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-gray-500 whitespace-nowrap">{pct.toFixed(1)}%</span>
    </div>
  );
}

// ─── Activity Timeline ────────────────────────────────────────────────────────
function ActivityTimeline({ data, mode }) {
  const [tooltip, setTooltip] = useState(null);
  const displayData  = mode === "daily" ? [0.6, 0.5, 0.8, 0.7, 0.9, 0.3, 0.2] : data;
  const hourLabels   = ["0h","","","","","","6h","","","","","","12h","","","","","","18h","","","","","23h"];
  const dayLabels    = ["M","T","W","T","F","S","S"];
  const labels       = mode === "daily" ? dayLabels : hourLabels;

  return (
    <div className="min-w-[160px] relative">
      {/* Axis labels */}
      <div className="flex justify-between mb-1">
        {labels.map((l, i) => (
          <span
            key={i}
            className="flex-1 text-[9px] text-gray-400 font-mono"
            style={{ textAlign: i === 0 ? "left" : i === labels.length - 1 ? "right" : "center" }}
          >
            {l}
          </span>
        ))}
      </div>

      {/* Bars */}
      <div className="flex gap-0.5 items-end h-7 relative">
        {displayData.map((v, i) => {
          const heightPct = Math.max(14, Math.round(v * 100));
          const tip = mode === "hourly"
            ? `${i}:00 — ${Math.round(v * 100)}% active`
            : `Day ${i + 1} — ${Math.round(v * 100)}% active`;
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm cursor-pointer hover:opacity-60 transition-opacity ${barBgClass(v)}`}
              style={{ height: `${heightPct}%` }}
              onMouseEnter={() => setTooltip(tip)}
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <div className="absolute bottom-full mb-1.5 left-0 bg-gray-900 text-white text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap pointer-events-none z-50 shadow-lg">
            {tooltip}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Filter / Toggle Button ───────────────────────────────────────────────────
function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-all duration-150 ${
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Device Table Row ─────────────────────────────────────────────────────────
function DeviceRow({ device: d, pct, timelineMode, isLast, tick }) {
  return (
    <tr className={`group hover:bg-gray-50 transition-colors duration-100 ${!isLast ? "border-b border-gray-100" : ""}`}>
      {/* Name / ID */}
      <td className="px-4 py-3.5 align-middle">
        <p className="text-sm font-semibold text-gray-900">{d.name}</p>
        <p className="text-[11px] font-mono text-gray-400 mt-0.5">{d.id}</p>
      </td>
      {/* Type */}
      <td className="px-4 py-3.5 align-middle text-sm text-gray-500">{d.type}</td>
      {/* Location */}
      <td className="px-4 py-3.5 align-middle text-sm text-gray-500">{d.location}</td>
      {/* Status */}
      <td className="px-4 py-3.5 align-middle">
        <StatusBadge status={d.status} health={d.health} />
      </td>
      {/* kWh */}
      <td className="px-4 py-3.5 align-middle">
        <span className="text-sm font-mono font-medium text-gray-800">{d.kwh}</span>
        <span className="text-[11px] text-gray-400 ml-1">kWh</span>
      </td>
      {/* % of total usage */}
      <td className="px-4 py-3.5 align-middle">
        <UsageBar pct={pct} />
      </td>
      {/* Last Active */}
      <td className="px-4 py-3.5 align-middle">
        <p className={`text-xs font-semibold font-mono ${freshnessClass(d.lastActive)}`}>
          {d.lastActive.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5" key={tick}>{timeAgo(d.lastActive)}</p>
      </td>
      {/* Activity Timeline */}
      <td className="px-4 py-3.5 align-middle">
        <ActivityTimeline data={d.timeline} mode={timelineMode} />
      </td>
      {/* Actions */}
      <td className="px-4 py-3.5 align-middle">
        <div className="flex items-center gap-1.5">
          <button
            title="Power toggle"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-150"
          >
            <Power size={13} />
          </button>
          <button
            title="Settings"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-150"
          >
            <Settings size={13} />
          </button>
          <button
            title="Remove"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-150"
          >
            <X size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DeviceManagement() {
  const [filter,       setFilter]       = useState("all");
  const [sortBy,       setSortBy]       = useState("name");
  const [sortDir,      setSortDir]      = useState("asc");
  const [timelineMode, setTimelineMode] = useState("hourly");
  const [tick,         setTick]         = useState(0);

  // Refresh "X ago" labels every 30 s
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const totalKwh = DEVICES_DATA.reduce((s, d) => s + d.kwh, 0);
  const counts = {
    active:  DEVICES_DATA.filter(d => d.status === "active").length,
    idle:    DEVICES_DATA.filter(d => d.status === "idle").length,
    offline: DEVICES_DATA.filter(d => d.status === "offline").length,
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(dir => dir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const filtered = DEVICES_DATA
    .filter(d => filter === "all" || d.status === filter)
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name")   cmp = a.name.localeCompare(b.name);
      if (sortBy === "kwh")    cmp = a.kwh - b.kwh;
      if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const SortIcon = ({ col }) => (
    <span className="ml-1 inline-flex flex-col leading-none">
      <ChevronUp
        size={8}
        className={sortBy === col && sortDir === "asc" ? "text-gray-900" : "text-gray-300"}
      />
      <ChevronDown
        size={8}
        className={sortBy === col && sortDir === "desc" ? "text-gray-900" : "text-gray-300"}
        style={{ marginTop: -2 }}
      />
    </span>
  );

  const headers = [
    { label: "Device Name / ID", col: "name",   sortable: true  },
    { label: "Type",             col: null,      sortable: false },
    { label: "Location",         col: null,      sortable: false },
    { label: "Status",           col: "status",  sortable: true  },
    { label: "kWh",              col: "kwh",     sortable: true  },
    { label: "% Usage",          col: null,      sortable: false },
    { label: "Last Active",      col: null,      sortable: false },
    { label: `Activity (${timelineMode === "hourly" ? "24h" : "7d"})`, col: null, sortable: false },
    { label: "Actions",          col: null,      sortable: false },
  ];

  return (
    <>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Devices Management</h1>
        <p className="text-gray-500 mt-0.5">Monitor and manage all your connected devices</p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Total Devices</p>
          <p className="text-3xl font-bold font-mono text-gray-900">{DEVICES_DATA.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Active</p>
          <p className="text-3xl font-bold font-mono text-green-600">{counts.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Idle</p>
          <p className="text-3xl font-bold font-mono text-amber-500">{counts.idle}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Offline</p>
          <p className="text-3xl font-bold font-mono text-red-500">{counts.offline}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm col-span-2 md:col-span-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Type Distribution</p>
          <div className="space-y-1.5">
            {["Lighting", "HVAC", "Appliances"].map(type => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{type}</span>
                <span className="text-xs font-semibold text-gray-800">
                  {DEVICES_DATA.filter(d => d.type === type).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center gap-5 mb-4">
        {/* Filter by status */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Filter</span>
          <div className="flex gap-1">
            {["all", "active", "idle", "offline"].map(f => (
              <FilterBtn key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </FilterBtn>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sort</span>
          <div className="flex gap-1">
            {[["name","Name"],["kwh","kWh"],["status","Status"]].map(([val, label]) => (
              <FilterBtn key={val} active={sortBy === val} onClick={() => handleSort(val)}>
                {label}
              </FilterBtn>
            ))}
          </div>
        </div>

        {/* Timeline mode */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Timeline</span>
          <div className="flex gap-1">
            {[["hourly","Hourly"],["daily","Daily"]].map(([val, label]) => (
              <FilterBtn key={val} active={timelineMode === val} onClick={() => setTimelineMode(val)}>
                {label}
              </FilterBtn>
            ))}
          </div>
        </div>

        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} device{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {headers.map(({ label, col, sortable }) => (
                  <th
                    key={label}
                    onClick={sortable ? () => handleSort(col) : undefined}
                    className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 whitespace-nowrap ${
                      sortable ? "cursor-pointer hover:text-gray-700 select-none" : ""
                    }`}
                  >
                    {label}
                    {sortable && <SortIcon col={col} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, idx) => (
                <DeviceRow
                  key={d.id}
                  device={d}
                  pct={(d.kwh / totalKwh) * 100}
                  timelineMode={timelineMode}
                  isLast={idx === filtered.length - 1}
                  tick={tick}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Legend */}
        <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Timeline key:
          </span>
          {[["bg-gray-800","High"],["bg-gray-400","Low"],["bg-gray-200","Inactive"]].map(([bg, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${bg}`} />
              <span className="text-[11px] text-gray-400">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] text-gray-400">Live — refreshes every 30s</span>
          </div>
        </div>
      </div>
    </>
  );
}