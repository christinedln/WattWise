'use client';

import React, { useState, useEffect } from "react";
import { apiFetch } from "../api/api";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import Layout from "../components/layout";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from "recharts";

export default function PredictionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null); // NEW

  useEffect(() => {
    apiFetch("/predictions/summary")
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading predictions...</p>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Cannot connect to server. Make sure Flask is running.</p>
      </div>
    </Layout>
  );

  function calculateTrend(actualVsPredicted) {
    if (!actualVsPredicted || actualVsPredicted.length < 2) {
      return { trend: "neutral", percent: "0%" };
    }
    const first = actualVsPredicted[0].actual;
    const last = actualVsPredicted[actualVsPredicted.length - 1].actual;
    if (!first) return { trend: "neutral", percent: "0%" };
    const diff = ((last - first) / first) * 100;
    return {
      trend: diff >= 0 ? "up" : "down",
      percent: `${Math.abs(diff).toFixed(1)}%`,
    };
  }

  const forecastData = data?.daily_forecast || [];
  const predictedVsActual = data?.actual_vs_predicted || [];
  const trendData = calculateTrend(predictedVsActual);

  // ── DEVICE BUTTONS DATA ──────────────────────────────────────────
  const perDevice = data?.per_device || {};
  const deviceIds = Object.keys(perDevice);

  // Active device data — falls back to totals if none selected
  const activeDevice = selectedDeviceId ? perDevice[selectedDeviceId] : null;

  const weeklyKwh   = activeDevice ? activeDevice.weekly_kwh   : data?.weekly_predicted_kwh;
  const weeklyCost  = activeDevice ? activeDevice.weekly_cost  : data?.weekly_predicted_cost;
  const monthlyKwh  = activeDevice ? activeDevice.monthly_kwh  : data?.monthly_predicted_kwh;
  const monthlyCost = activeDevice ? activeDevice.monthly_cost : data?.monthly_predicted_cost;

  // ── SAFE DATA MAP ─────────────────────
  const weeklyPredictions = [
    {
      period: 'This Week',
      cost: `₱${weeklyCost?.toFixed(2) || "0.00"}`,
      estimatedUsage: `${weeklyKwh || 0} kWh`,
      trend: trendData.trend,
      trendPercent: trendData.percent,
      trendLabel: 'Mon - Sun (current billing period)',
      percent: Math.min((weeklyKwh / 245) * 100, 100),
    },
    {
      period: 'This Month',
      cost: `₱${monthlyCost?.toFixed(2) || "0.00"}`,
      estimatedUsage: `${monthlyKwh || 0} kWh`,
      trend: trendData.trend,
      trendPercent: trendData.percent,
      trendLabel: '30-day projection',
      percent: Math.min((monthlyKwh / 920) * 100, 100),
    },
  ];

  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <div className="flex-1 overflow-auto p-6">

            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Energy Predictions</h1>
              <p className="text-gray-500">Forecast your energy costs and usage patterns</p>
            </div>

            {/* ── DEVICE SELECTOR BUTTONS ─────────────────────────── */}
              {deviceIds.length > 0 && (
                <div className="flex gap-2 mb-6 flex-wrap">
                  <button
                    onClick={() => setSelectedDeviceId(null)}
                    className={`
                      px-5 py-2 !rounded-full text-sm font-medium transition-all duration-200
                      ${
                        selectedDeviceId === null
                          ? "!bg-green-600 !text-white shadow-md shadow-green-300 !border-green-700"
                          : "!bg-white !text-gray-600 !border-gray-300 hover:!bg-gray-100"
                      }
                    `}
                  >
                    All Devices
                  </button>

                  {deviceIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => setSelectedDeviceId(id)}
                      className={`
                        px-5 py-2 !rounded-full text-sm font-medium transition-all duration-200
                        ${
                          selectedDeviceId === id
                            ? "!bg-green-600 !text-white shadow-md shadow-green-300 !border-green-700"
                            : "!bg-white !text-gray-600 !border-gray-300 hover:!bg-gray-100"
                        }
                      `}
                    >
                      {perDevice[id]?.name || id}
                    </button>
                  ))}
                </div>
              )}
            <div className="space-y-6">

              {/* Predictions Cards */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Energy Cost Predictions
                  {activeDevice && (
                    <span className="ml-2 text-base font-normal text-green-600">
                      — {activeDevice.name}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Weekly and monthly cost forecasts at ₱13.50/kWh
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {weeklyPredictions.map((pred, index) => (
                    <div
                      key={index}
                      className="bg-green-50/40 border border-green-200 rounded-xl p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg ${
                              pred.period === "This Week"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <Calendar size={16} />
                          </div>
                          <span className="font-semibold text-gray-800">{pred.period}</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                            pred.trend === "up"
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {pred.trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {pred.trendPercent}
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 mb-2">
                        <h3 className="text-3xl font-bold text-green-600">{pred.cost}</h3>
                        <span className="text-sm text-gray-500">estimated</span>
                      </div>

                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{pred.estimatedUsage}</span>
                      </div>

                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full rounded-full ${
                            pred.period === "This Week" ? "bg-yellow-400" : "bg-blue-400"
                          }`}
                          style={{ width: `${pred.percent || 0}%` }}
                        />
                      </div>

                      <p className="text-xs text-gray-500">{pred.trendLabel}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts — unchanged */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-bold text-lg mb-4">Next 7 Days Forecast</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="consumption" fill="#10b981" />
                    <Bar dataKey="cost" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-bold text-lg mb-4">Predicted vs Actual Comparison</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictedVsActual}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}