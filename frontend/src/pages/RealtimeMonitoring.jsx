import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import { CheckCircle, AlertCircle, Activity, MapPin } from "lucide-react";
import Layout from "../components/layout";
import { apiFetch } from "../api/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export default function RealtimeMonitoringPage() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [voltageData, setVoltageData] = useState([]);

  // FETCH DEVICES
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await apiFetch("/realtime/devices");
        setDevices(data);

        if (!selectedDevice && data.length > 0) {
          setSelectedDevice(data[0].device_id);
        }
      } catch (err) {
        console.error("Device fetch error:", err);
      }
    };

    fetchDevices();
    //const interval = setInterval(fetchDevices, 5000);
    //return () => clearInterval(interval);
  }, [selectedDevice]);

  // FETCH TREND
useEffect(() => {
  if (!selectedDevice) return;

  const fetchAllTrends = async () => {
    try {
      const [power, current, voltage] = await Promise.all([
        apiFetch(`/realtime/power-trend/${selectedDevice}`),
        apiFetch(`/realtime/current-trend/${selectedDevice}`),
        apiFetch(`/realtime/voltage-trend/${selectedDevice}`)
      ]);

      const format = (data) =>
        data.map(p => ({
          ...p,
          time: new Date(p.time).toLocaleTimeString()
        }));

      setChartData(format(power));
      setCurrentData(format(current));
      setVoltageData(format(voltage));

    } catch (err) {
      console.error("Trend fetch error:", err);
    }
  };

  fetchAllTrends();
  // const interval = setInterval(fetchAllTrends, 5000);

  // return () => clearInterval(interval);
}, [selectedDevice]);

  const device = devices.find((d) => d.device_id === selectedDevice);

  const alerts = device?.alerts || [];

  const activeAlerts = alerts.filter(a => a.severity !== "Normal");
  const hasActiveAlerts = activeAlerts.length > 0;

  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          {/* FIX APPLIED HERE */}
          <div className="flex-1 overflow-auto overscroll-contain p-6 space-y-6 bg-gray-50">

            {/* DEVICE SELECTOR */}
            <div className="flex items-center mb-4 bg-gray-100 p-1 rounded-full w-fit">
  {devices.map((d) => {
    const isActive = selectedDevice === d.device_id;

    return (
      <button
        key={d.device_id}
        onClick={() => setSelectedDevice(d.device_id)}
        className={`
          px-5 py-2 text-sm font-medium transition-all duration-200 z-10
          ${
            isActive
              ? "!bg-green-600 !text-white shadow-md shadow-green-300"
              : "!bg-transparent !text-gray-600 hover:!bg-gray-200"
          }
        `}
        style={{
          borderRadius: "9999px",
        }}
      >
        {d.name}
      </button>
    );
  })}
</div>

 {device && (
  <>
    {/* HEADER */}
    <div className="mb-6 flex flex-col md:flex-row justify-between">
  <div>
    <div className="flex items-center gap-2">

      {/* DEVICE NAME (slightly bigger, balanced) */}
      <h1 className="text-2xl font-bold">
        {device.name}
      </h1>

      {/* STATUS */}
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-green-600 font-semibold">
          {device.status}
        </span>
      </div>

    </div>

     <div className="flex items-center gap-1 text-gray-500 mt-1">
      <MapPin className="w-4 h-4" />
      <p>{device.location}</p>
    </div>
    </div>

                    {/* ALERT BOX (FIXED NO COMPONENT DEPENDENCY) */}
<div className="w-full max-w-sm">
  {hasActiveAlerts ? (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col">
      <div className="flex items-center gap-2 text-red-600 font-semibold">
        <AlertCircle className="w-4 h-4" />
        Critical Anomalies Detected
      </div>

      <p className="text-red-700 text-sm mt-1 leading-snug whitespace-normal break-words">
        {activeAlerts.map((a) => `${a.signal}: ${a.message}`).join(" | ")}
      </p>
    </div>
  ) : (
    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex flex-col">
      <div className="flex items-center gap-2 text-green-700 font-semibold">
        <CheckCircle className="w-4 h-4" />
        System Stable
      </div>

      <p className="text-green-600 text-sm mt-1 leading-snug whitespace-normal break-words">
        No anomaly detected
      </p>
    </div>
  )}

  {/* DEVICE MESSAGE */}
  {device.message &&
    device.message !== "No issues detected" && (
      <div
        className={`mt-3 rounded-xl p-3 border flex flex-col ${
          device.message.toLowerCase().includes("stable")
            ? "bg-blue-50 border-blue-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div
          className={`flex items-center gap-2 font-semibold ${
            device.message.toLowerCase().includes("stable")
              ? "text-blue-700"
              : "text-red-600"
          }`}
        >
          {device.message.toLowerCase().includes("stable") ? (
            <Activity className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          Device Status
        </div>

        <p
          className={`text-sm mt-1 leading-snug whitespace-normal break-words ${
            device.message.toLowerCase().includes("stable")
              ? "text-blue-600"
              : "text-red-700"
          }`}
        >
          {device.message}
        </p>
      </div>
    )}
</div>
</div>

                              {/* LIVE READINGS */}
                <div className="bg-green-50/40 border border-green-200 rounded-2xl p-6 shadow-sm mb-6">

                  <div className="mb-5">
                    <h3 className="font-semibold text-lg text-gray-900">Live Readings</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Voltage */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                        <img src="/voltage.png" alt="Voltage" className="w-7 h-7 object-contain" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Voltage</p>
                        <p className="text-xl font-bold text-gray-900">
                          {device.voltage ?? "—"}{" "}
                          <span className="text-sm font-medium">V</span>
                        </p>
                      </div>
                    </div>

                    {/* Current */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <img src="/current.png" alt="Current" className="w-7 h-7 object-contain" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current</p>
                        <p className="text-xl font-bold text-gray-900">
                          {device.current ?? "—"}{" "}
                          <span className="text-sm font-medium">A</span>
                        </p>
                      </div>
                    </div>

                    {/* Power */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M13 2L4 14h7l-1 8 10-12h-7l0-8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Power</p>
                        <p className="text-xl font-bold text-gray-900">
                          {device.power ?? "—"}{" "}
                          <span className="text-sm font-medium">kW</span>
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* CHART */}
                <div className="bg-white p-6 rounded-lg border">
                  <h2 className="text-xl font-bold mb-4">Power Trend (Live)</h2>

                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="power"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg border mt-6">
                  <h2 className="text-xl font-bold mb-4">Current Trend (Live)</h2>

                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg border mt-6">
                  <h2 className="text-xl font-bold mb-4">Voltage Trend (Live)</h2>

                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={voltageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* FOOTER */}
                <div className="bg-white p-4 rounded border flex justify-between text-sm">
                  <span>
                    Consumption: <b>{device.consumption} kWh</b>
                  </span>
                  <span>
                    Last Updated:{" "}
                    <b>
                      {device.lastUpdated
                        ? new Date(device.lastUpdated).toLocaleString()
                        : "—"}
                    </b>
                  </span>
                </div>

              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}