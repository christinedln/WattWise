'use client';

import React from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import Layout from "../components/layout";
import { TrendingUp, TrendingDown } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from "recharts";

export default function PredictionsPage() {
  const weeklyPredictions = [
    {
      period: 'This Week',
      cost: '₱230.40',
      estimatedUsage: '237.21 kWh',
      trend: 'up',
      trendPercent: '3.2%',
      trendLabel: 'Mon - Sun (current billing period)',
      bgColor: 'bg-yellow-50',
    },
    {
      period: 'This Month',
      cost: '₱921.60',
      estimatedUsage: '912.80 kWh',
      trend: 'up',
      trendPercent: '2.3%',
      trendLabel: 'Feb 1 - Feb 28 (projected)',
      bgColor: 'bg-blue-50',
    },
  ];

  const forecastData = [
    { date: 'Mar 15', consumption: 38.2, cost: 5.35, actual: 37.5 },
    { date: 'Mar 16', consumption: 42.1, cost: 5.89, actual: 41.8 },
    { date: 'Mar 17', consumption: 39.5, cost: 5.53, actual: 40.2 },
    { date: 'Mar 18', consumption: 45.3, cost: 6.34, actual: 44.9 },
    { date: 'Mar 19', consumption: 38.8, cost: 5.43, actual: 39.1 },
  ];

  const predictedVsActual = [
    { date: 'Mar 10', predicted: 38.5, actual: 37.9 },
    { date: 'Mar 11', predicted: 41.2, actual: 42.1 },
    { date: 'Mar 12', predicted: 39.8, actual: 39.3 },
    { date: 'Mar 13', predicted: 44.5, actual: 45.2 },
    { date: 'Mar 14', predicted: 37.2, actual: 36.8 },
  ];

  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        {/* Sidebar */}
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

            {/* Content Grid */}
            <div className="space-y-6">

              {/* Weekly/Monthly Predictions (aligned with Dashboard cards) */}
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
                          {pred.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-500" />
                          )}
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

              {/* Daily Forecast Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-bold text-lg mb-4">Next 5 Days Forecast</h2>
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