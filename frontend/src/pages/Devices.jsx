'use client';

import React from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import Layout from "../components/layout";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function DevicesPage() {
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

            {/* Weekly/Monthly Predictions */}
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

          </div>
        </div>
      </div>
    </Layout>
  );
}