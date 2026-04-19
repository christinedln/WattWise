'use client';

import React, { useState, useEffect } from "react";
import { Power, X } from "lucide-react";

const API_URL = "http://localhost:5000/api/devices/";

// ─── Status Badge ─────────────────────────────────
function StatusBadge({ status, health }) {
  if (health === "Critical") {
    return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">🔴 Critical</span>;
  }

  if (health === "Warning") {
    return <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700">⚠ Warning</span>;
  }

  if (health === "Suspicious") {
    return <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700">🟣 Suspicious</span>;
  }

  return status === "active"
    ? <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Active</span>
    : <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">Offline</span>;
}

// ─── Usage Bar ─────────────────────────────────
function UsageBar({ pct }) {
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gray-800" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono">{pct.toFixed(1)}%</span>
    </div>
  );
}

// ─── Row ─────────────────────────────────────
function DeviceRow({ device, pct }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 font-semibold">{device.name}</td>
      <td className="px-4 py-3 text-gray-500">{device.type}</td>
      <td className="px-4 py-3 text-gray-500">{device.location}</td>

      <td className="px-4 py-3">
        <StatusBadge status={device.status} health={device.health} />
      </td>

      <td className="px-4 py-3 font-mono">{device.kwh}</td>

      <td className="px-4 py-3">
        <UsageBar pct={pct} />
      </td>

      <td className="px-4 py-3 text-xs text-gray-600">
        {device.lastUpdated ? formatTime(device.lastUpdated) : "—"}
      </td>

      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button className="w-7 h-7 border rounded hover:bg-black hover:text-white">
            <Power size={13} />
          </button>
          <button className="w-7 h-7 border rounded hover:bg-red-600 hover:text-white">
            <X size={13} />
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
    <div className="px-4 py-3 bg-gray-50 border-t">
      <p className="text-xs font-semibold text-gray-600 mb-2">
        Activity Timeline
      </p>

      <div className="space-y-1">
        {device.activity_timeline.map((log, idx) => (
          <div key={idx} className="text-xs text-gray-600 flex gap-2">
            <span className="text-gray-400">
              {formatTime(log.time)}
            </span>
            <span>{log.event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────
export default function DeviceManagement() {
  const [devices, setDevices] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchDevices = async () => {
      const res = await fetch(API_URL);
      const json = await res.json();

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
    active: devices.filter(d => d.status === "active").length,
    offline: devices.filter(d => d.status === "offline").length,
    Critical: devices.filter(d => d.health === "Critical").length,
    Warning: devices.filter(d => d.health === "Warning").length,
    Suspicious: devices.filter(d => d.health === "Suspicious").length,
    Normal: devices.filter(d => d.health === "Normal").length,
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Devices Management</h1>
        <p className="text-gray-500">Live data from backend</p>
      </div>

      {/* ── HEALTH SUMMARY CARDS ───────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">

        <div className="bg-green-50 p-4 border rounded">
          <p className="text-xs text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-700">{counts.active}</p>
        </div>

        <div className="bg-gray-50 p-4 border rounded">
          <p className="text-xs text-gray-600">Offline</p>
          <p className="text-2xl font-bold text-gray-700">{counts.offline}</p>
        </div>

        <div className="bg-red-50 p-4 border rounded">
          <p className="text-xs text-red-600">Critical</p>
          <p className="text-2xl font-bold text-red-700">{counts.Critical}</p>
        </div>

        <div className="bg-purple-50 p-4 border rounded">
          <p className="text-xs text-purple-600">Suspicious</p>
          <p className="text-2xl font-bold text-purple-700">{counts.Suspicious}</p>
        </div>

        <div className="bg-yellow-50 p-4 border rounded">
          <p className="text-xs text-yellow-600">Warning</p>
          <p className="text-2xl font-bold text-yellow-700">{counts.Warning}</p>
        </div>

        <div className="bg-blue-50 p-4 border rounded">
          <p className="text-xs text-blue-600">Normal</p>
          <p className="text-2xl font-bold text-blue-700">{counts.Normal}</p>
        </div>

      </div>

            {/* ── FILTERS ───────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          "all",
          "active",
          "offline",
          "Normal",
          "Warning",
          "Critical",
          "Suspicious",
        ].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded border transition ${
              filter === f
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── TABLE ───────────────────────────── */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-400 uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status / Health</th>
              <th className="px-4 py-3">kWh</th>
              <th className="px-4 py-3">% Usage</th>
              <th className="px-4 py-3">Last Updated</th>
              <th className="px-4 py-3">Actions</th>
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
          </tbody>
        </table>
      </div>
    </>
  );
}