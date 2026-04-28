'use client';

import React, { useState, useEffect } from "react";
import { Power, X } from "lucide-react";
import { apiFetch } from "../api/api";

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
function DeviceRow({ device, pct, openEdit }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 font-semibold flex items-center gap-2">
  {device.name}
  <button
    onClick={() => openEdit(device, "name")}
    className="text-gray-400 hover:text-black"
  >
    <svg
  xmlns="http://www.w3.org/2000/svg"
  className="w-4 h-4"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"
  />
</svg>
  </button>
</td>
      <td className="px-4 py-3 text-gray-500">{device.type}</td>
      <td className="px-4 py-3 text-gray-500 flex items-center gap-2">
  {device.location}
  <button
    onClick={() => openEdit(device, "location")}
    className="text-gray-400 hover:text-black"
  >
    <svg
  xmlns="http://www.w3.org/2000/svg"
  className="w-4 h-4"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"
  />
</svg>
  </button>
</td>

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
  const [editing, setEditing] = useState(null);


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

  const openEdit = (device, field) => {
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
    await apiFetch(`/devices/${editing.device_id}`, {
      method: "PATCH",
      body: JSON.stringify({
        [editing.field]: editing.value,
      }),
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
  }
};


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
                  pct={totalKwh ? (d.kwh / totalKwh) * 100 : 0} openEdit={openEdit}
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


      {editing && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-80">
      
      <h2 className="text-lg font-semibold mb-4">
        Edit {editing.field}
      </h2>

      <input
        type="text"
        value={editing.value}
        onChange={(e) =>
          setEditing({ ...editing, value: e.target.value })
        }
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={closeEdit}
          className="px-3 py-1 border rounded"
        >
          Cancel
        </button>

        <button
          onClick={saveEdit}
          className="px-3 py-1 bg-black text-white rounded"
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