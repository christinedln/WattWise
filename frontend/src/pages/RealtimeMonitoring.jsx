import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import { CheckCircle, AlertCircle } from "lucide-react";
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

  // FETCH POWER TREND
useEffect(() => {
  if (!selectedDevice) return;

  const fetchTrend = async () => {
    try {
      const data = await apiFetch(`/realtime/power-trend/${selectedDevice}`);

      const formatted = data.map(point => ({
        ...point,
        time: new Date(point.time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      }));

      setChartData(formatted);
    } catch (err) {
      console.error("Trend fetch error:", err);
    }
  };

  // initial fetch
  fetchTrend();

  // poll every 5 seconds
  //const interval = setInterval(fetchTrend, 5000);

  //return () => clearInterval(interval);
}, [selectedDevice]);

  const device = devices.find((d) => d.device_id === selectedDevice);

  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <div className="flex-1 overflow-auto p-6 space-y-6">

            {/* DEVICE SELECTOR */}
            <div className="flex gap-2 mb-4">
              {devices.map(d => (
                <button
                  key={d.device_id}
                  onClick={() => setSelectedDevice(d.device_id)}
                 className={`px-3 py-1 rounded-lg text-sm border-2 transition-all duration-200 ${
                    selectedDevice === d.id
                      ? "bg-gray-100 text-gray-900 border-gray-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-500"
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {device && (
              <>
                {/* HEADER */}
                <div className="mb-6 flex flex-col md:flex-row justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {device.name}
                    </h1>
                    <p className="text-gray-500">{device.location}</p>
                  </div>

                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-semibold">
                        {device.status}
                      </span>
                    </div>

                    {device.message && device.message !== "No issues detected" && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-600 font-semibold">
                          {device.message}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* LIVE READINGS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-yellow-50 p-6 rounded-lg border">
                    <p>Voltage</p>
                    <p className="text-3xl font-bold">{device.voltage}</p>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg border">
                    <p>Current</p>
                    <p className="text-3xl font-bold">{device.current}</p>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg border">
                    <p>Power</p>
                    <p className="text-3xl font-bold">{device.power}</p>
                  </div>
                </div>

                {/* CHART */}
                <div className="bg-white p-6 rounded-lg border">
                  <h2 className="text-xl font-bold mb-4">
                    Power Trend (Live)
                  </h2>

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