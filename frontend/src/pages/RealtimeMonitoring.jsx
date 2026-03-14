import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import { CheckCircle, AlertCircle } from "lucide-react";
import Layout from "../components/layout";
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
  const [selectedDevice] = useState("computer-1");

  const chartData = [
    { time: "04:45", power: 150 },
    { time: "04:50", power: 165 },
    { time: "04:55", power: 175 },
    { time: "05:00", power: 192 },
    { time: "05:05", power: 185 },
    { time: "05:10", power: 200 },
    { time: "05:15", power: 195 },
  ];

  const devices = [
    {
      id: "computer-1",
      name: "Computer 1",
      location: "Lab",
      status: "active",
      anomaly: true,
      voltage: 120,
      current: 1.67,
      power: 200,
      consumption: 4.2,
      lastUpdated: "10:37:41 AM",
    },
    {
      id: "computer-2",
      name: "Computer 2",
      location: "Lab",
      status: "active",
      anomaly: false,
      voltage: 119,
      current: 1.55,
      power: 185,
      consumption: 3.9,
      lastUpdated: "10:37:50 AM",
    },
  ];

  const device = devices.find((d) => d.id === selectedDevice);

  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <div className="flex-1 overflow-auto p-6 space-y-6">
            {device && (
              <>
                {/* Device Header */}
                <div className="mb-6 flex flex-col md:flex-row items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{device.name}</h1>
                    <p className="text-gray-500">{device.location}</p>
                  </div>

                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-semibold">Active</span>
                    </div>
                    {device.anomaly && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-600 font-semibold">Anomaly Detected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Readings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <p className="text-gray-600 text-sm font-medium">Voltage</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{device.voltage}</p>
                    <p className="text-gray-500 text-sm mt-1">Volts</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <p className="text-gray-600 text-sm font-medium">Current</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{device.current}</p>
                    <p className="text-gray-500 text-sm mt-1">Amperes</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <p className="text-gray-600 text-sm font-medium">Power</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{device.power}</p>
                    <p className="text-gray-500 text-sm mt-1">Watts</p>
                  </div>
                </div>

                {/* Short-term Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Last 15 Minutes</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value) => [`${value} W`, "Power"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="power"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ fill: "#16a34a", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Footer */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-sm text-gray-600 bg-white rounded-lg border border-gray-200 p-4">
                  <span>
                    Today's Consumption:{" "}
                    <span className="font-semibold text-gray-900">{device.consumption} kWh</span>
                  </span>
                  <span>
                    Last Updated:{" "}
                    <span className="font-semibold text-gray-900">{device.lastUpdated}</span>
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