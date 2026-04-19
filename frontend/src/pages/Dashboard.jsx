import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import LiveReadings from "../components/LiveReadings";
import DeviceHealthSummary from "../components/DeviceHealthSummary"; 
import DeviceConsumption from "../components/DeviceConsumption";
import CostPredictions from "../components/CostPredictions";
import Layout from "../components/layout";

export default function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/dashboard/summary")
      .then((res) => res.json())
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
        <p className="text-gray-500">Loading dashboard...</p>
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

  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">

        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">

          <DashboardHeader criticalAlerts={data.critical_alerts} />

          <div className="flex-1 overflow-auto p-6">

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                WattWise Dashboard
              </h1>
              <p className="text-gray-500">
                Real-time monitoring and predictions
              </p>
            </div>

            {/* ── CONTENT ───────────────────────── */}
            <div className="space-y-6">

              {/* LIVE READINGS */}
              <LiveReadings readings={data.live_readings} />

              {/* NEW: HEALTH SUMMARY (ADDED UNDER LIVE READINGS) */}
              <DeviceHealthSummary readings={data.live_readings} />

              {/* DEVICE CONSUMPTION */}
              <DeviceConsumption
                devices={data.device_consumption}
                totalEnergyKwh={data.total_energy_kwh}
              />

              {/* COST PREDICTIONS */}
              <CostPredictions
                weeklyCost={data.weekly_predicted_cost}
                weeklyKwh={data.weekly_predicted_kwh}
                monthlyCost={data.monthly_predicted_cost}
                monthlyKwh={data.monthly_predicted_kwh}
              />

            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}