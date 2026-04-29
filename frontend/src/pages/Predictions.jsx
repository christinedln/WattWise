'use client';

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import Layout from "../components/layout";
import { TrendingUp, TrendingDown } from "lucide-react";
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

import { apiFetch } from "../api/api"; // ✅ FIXED IMPORT (must be top-level)

export default function PredictionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===============================
  // FETCH PREDICTIONS
  // ===============================
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const json = await apiFetch("/predictions/summary");
        setData(json);
        setLoading(false);
      } catch (err) {
        console.error("Prediction fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  // ===============================
  // LOADING STATE
  // ===============================
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Loading predictions...</p>
        </div>
      </Layout>
    );
  }

  // ===============================
  // ERROR STATE
  // ===============================
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
  // SAFE DATA MAPPING
  // ===============================
  const weeklyKwh = Number(data?.weekly_predicted_kwh ?? 0);
  const weeklyCost = Number(data?.weekly_predicted_cost ?? 0);

  const monthlyKwh = Number(data?.monthly_predicted_kwh ?? 0);
  const monthlyCost = Number(data?.monthly_predicted_cost ?? 0);

  const forecastData = Array.isArray(data?.daily_forecast)
    ? data.daily_forecast
    : [];

  const predictedVsActual = Array.isArray(data?.actual_vs_predicted)
    ? data.actual_vs_predicted
    : [];

  // ===============================
  // CARDS DATA
  // ===============================
  const weeklyPredictions = [
    {
      period: 'This Week',
      cost: `₱${weeklyCost.toFixed(2)}`,
      estimatedUsage: `${weeklyKwh.toFixed(2)} kWh`,
      trend: 'up',
      trendPercent: '3.2%',
      trendLabel: 'Mon - Sun (current billing period)',
      bgColor: 'bg-yellow-50',
    },
    {
      period: 'This Month',
      cost: `₱${monthlyCost.toFixed(2)}`,
      estimatedUsage: `${monthlyKwh.toFixed(2)} kWh`,
      trend: 'up',
      trendPercent: '2.3%',
      trendLabel: '30-day projection',
      bgColor: 'bg-blue-50',
    },
  ];

  // ===============================
  // UI
  // ===============================
  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <div className="flex-1 overflow-auto p-6">

            {/* HEADER */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Energy Predictions
              </h1>
              <p className="text-gray-500">
                Forecast your energy costs and usage patterns
              </p>
            </div>

            <div className="space-y-6">

              {/* TOP CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {weeklyPredictions.map((pred, index) => (
                  <div
                    key={index}
                    className={`${pred.bgColor} rounded-lg p-6 border border-gray-200`}
                  >
                    <p className="text-sm text-gray-600 mb-3">
                      {pred.period}
                    </p>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {pred.cost}
                      </span>
                      <span className="text-sm text-gray-500">
                        estimated
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {pred.estimatedUsage}
                      </span>

                      <div className="flex items-center gap-1">
                        {pred.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-red-600">
                          {pred.trendPercent}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mt-2">
                      {pred.trendLabel}
                    </p>
                  </div>
                ))}
              </div>

              {/* FORECAST CHART */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-bold text-lg mb-4">
                  Next 7 Days Forecast
                </h2>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="consumption" name="kWh" />
                    <Bar dataKey="cost" name="₱ Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ACTUAL VS PREDICTED */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-bold text-lg mb-4">
                  Predicted vs Actual
                </h2>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictedVsActual}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#3b82f6"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#10b981"
                    />
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