'use client';

import React, { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../api/api";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import Layout from "../components/layout";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function PredictionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    apiFetch(
      selectedDeviceId
        ? `/predictions/summary?deviceId=${selectedDeviceId}`
        : "/predictions/summary"
    )
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Loading predictions...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Cannot connect to server.</p>
        </div>
      </Layout>
    );
  }

  // ===============================
  // SAFE FALLBACKS
  // ===============================
  const forecastData = data?.daily_forecast ?? [];
  const actualVsPredicted = data?.actual_vs_predicted ?? [];

  const perDevice = data?.per_device ?? {};
  const deviceIds = Object.keys(perDevice);

  // ===============================
  // DEVICE SELECTION (SAFE)
  // ===============================
  const activeDevice =
    selectedDeviceId && perDevice[selectedDeviceId]
      ? perDevice[selectedDeviceId]
      : null;

  // IMPORTANT FIX:
  // If backend doesn't provide per-device totals properly,
  // DO NOT assume these fields exist.
  const weeklyKwh = Number(
    activeDevice?.weekly_kwh ??
    data?.weekly_predicted_kwh ??
    0
  );

  const monthlyKwh = Number(
    activeDevice?.monthly_kwh ??
    data?.monthly_predicted_kwh ??
    0
  );

  const weeklyCost = Number(
    activeDevice?.weekly_cost ??
    data?.weekly_predicted_cost ??
    0
  );

  const monthlyCost = Number(
    activeDevice?.monthly_cost ??
    data?.monthly_predicted_cost ??
    0
  );

  // ===============================
  // FIXED TREND CALCULATION
  // ===============================
  const trend = useMemo(() => {
    if (!Array.isArray(actualVsPredicted) || actualVsPredicted.length < 2) {
      return { direction: "neutral", percent: 0 };
    }

    const first = Number(actualVsPredicted[0]?.actual ?? 0);
    const last = Number(actualVsPredicted.at(-1)?.actual ?? 0);

    if (!first) return { direction: "neutral", percent: 0 };

    const diff = ((last - first) / first) * 100;

    return {
      direction: diff >= 0 ? "up" : "down",
      percent: Math.abs(diff)
    };
  }, [actualVsPredicted]);

  // ===============================
  // CRITICAL FIX:
  // Prevent fake inflation when switching devices
  // ===============================
  const safeWeeklyPercentBase = weeklyKwh > 0 ? weeklyKwh : 1;
  const safeMonthlyPercentBase = monthlyKwh > 0 ? monthlyKwh : 1;

  // ===============================
  // UI CARDS
  // ===============================
  const weeklyPredictions = [
    {
      period: "This Week",
      cost: `₱${weeklyCost.toFixed(2)}`,
      estimatedUsage: `${weeklyKwh.toFixed(2)} kWh`,
      trend: trend.direction,
      trendPercent: `${trend.percent.toFixed(1)}%`,
      trendLabel: activeDevice
        ? `Device: ${activeDevice.name}`
        : "All devices combined",
      percent: Math.min((weeklyKwh / safeWeeklyPercentBase) * 100, 100)
    },
    {
      period: "This Month",
      cost: `₱${monthlyCost.toFixed(2)}`,
      estimatedUsage: `${monthlyKwh.toFixed(2)} kWh`,
      trend: trend.direction,
      trendPercent: `${trend.percent.toFixed(1)}%`,
      trendLabel: "30-day projection",
      percent: Math.min((monthlyKwh / safeMonthlyPercentBase) * 100, 100)
    }
  ];

  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <div className="flex-1 overflow-auto p-6">

            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Energy Predictions
              </h1>
              <p className="text-gray-500">
                Device-based forecasting from energy logs
              </p>
            </div>

            {/* DEVICE BUTTONS */}
            {deviceIds.length > 0 && (
              <div className="flex gap-2 mb-6 flex-wrap">
                <button
                  onClick={() => setSelectedDeviceId(null)}
                  className={`px-4 py-2 rounded-full text-sm border ${
                    !selectedDeviceId
                      ? "bg-green-600 text-white"
                      : "bg-white"
                  }`}
                >
                  All Devices
                </button>

                {deviceIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => setSelectedDeviceId(id)}
                    className={`px-4 py-2 rounded-full text-sm border ${
                      selectedDeviceId === id
                        ? "bg-green-600 text-white"
                        : "bg-white"
                    }`}
                  >
                    {perDevice[id]?.name || id}
                  </button>
                ))}
              </div>
            )}

            {/* PREDICTION CARDS */}
            <div className="bg-white border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Energy Cost Predictions
                {activeDevice && (
                  <span className="ml-2 text-sm text-green-600">
                    ({activeDevice.name})
                  </span>
                )}
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                {weeklyPredictions.map((pred, i) => (
                  <div key={i} className="p-5 border rounded-xl bg-green-50/40">
                    <div className="flex justify-between">
                      <span className="font-semibold">{pred.period}</span>

                      <span
                        className={
                          pred.trend === "up"
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      >
                        {pred.trendPercent}
                      </span>
                    </div>

                    <h3 className="text-3xl font-bold text-green-600 mt-2">
                      {pred.cost}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {pred.estimatedUsage}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      {pred.trendLabel}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* FORECAST */}
            <div className="bg-white p-6 border rounded-xl mb-6">
              <h2 className="font-bold mb-4">Next 7 Days Forecast</h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumption" fill="#10b981" />
                  <Bar dataKey="cost" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ACTUAL VS PREDICTED */}
            <div className="bg-white p-6 border rounded-xl">
              <h2 className="font-bold mb-4">Predicted vs Actual</h2>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={actualVsPredicted}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="predicted" stroke="#3b82f6" />
                  <Line dataKey="actual" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}