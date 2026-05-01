'use client';

import React, { useState, useEffect } from "react";
import { apiFetch } from "../api/api";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import Layout from "../components/layout";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from "recharts";

export default function PredictionsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

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

  // ── Map API data ──────────────
  const weeklyPredictions = [
    {
      period:         'This Week',
      cost:           `₱${data.weekly_predicted_cost.toFixed(2)}`,
      estimatedUsage: `${data.weekly_predicted_kwh} kWh`,
      trend:          'up',
      trendPercent:   '',
      trendLabel:     'Mon - Sun (current billing period)',
      bgColor:        'bg-yellow-50',
    },
    {
      period:         'This Month',
      cost:           `₱${data.monthly_predicted_cost.toFixed(2)}`,
      estimatedUsage: `${data.monthly_predicted_kwh} kWh`,
      trend:          'up',
      trendPercent:   '',
      trendLabel:     '30-day projection',
      bgColor:        'bg-blue-50',
    },
  ];

  // daily_forecast from API already has { date, consumption, cost }
  const forecastData = data.daily_forecast;

  // actual_vs_predicted from API already has { date, actual, predicted }
  const predictedVsActual = data.actual_vs_predicted;

  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Energy Predictions</h1>
              <p className="text-gray-500">Forecast your energy costs and usage patterns</p>
            </div>
            <div className="space-y-6">

              {/* Weekly/Monthly Predictions*/}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {weeklyPredictions.map((pred, index) => (
                  <div key={index} className={`${pred.bgColor} rounded-lg p-6 border border-gray-200`}>
                    <p className="text-sm text-gray-600 mb-3">{pred.period}</p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold text-gray-900">{pred.cost}</span>
                      <span className="text-sm text-gray-500">estimated</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{pred.estimatedUsage}</span>
                        <div className="flex items-center gap-1">

                          <span className={pred.trend === 'up' ? 'text-red-600' : 'text-green-600'}>
                            {pred.trendPercent}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{pred.trendLabel}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Daily Forecast Chart*/}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-bold text-lg mb-4">Next 7 Days Forecast</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip formatter={(value) => value.toFixed(2)} />
                    <Legend />
                    <Bar dataKey="consumption" fill="#10b981" name="Consumption (kWh)" />
                    <Bar dataKey="cost" fill="#3b82f6" name="Cost (₱)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Predicted vs Actual */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-bold text-lg mb-4">Predicted vs Actual Comparison</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictedVsActual}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip formatter={(value) => value.toFixed(2)} />
                    <Legend />
                    <Line type="monotone" dataKey="predicted" stroke="#3b82f6" name="Predicted (kWh)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual (kWh)" strokeWidth={2} dot={{ r: 4 }} />
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