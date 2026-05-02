import React, { useState, useEffect } from "react";
import Layout from "../components/layout";
import { apiFetch } from "../api/api";

import SuperAdminDashboard from "../pages/DashboardPage";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch("/dashboard/summary");

        setData(res);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500 text-center px-4">
            Cannot connect to server. Make sure backend is running.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-auto p-4 md:p-6">

          <div className="space-y-6">

            <LiveReadings readings={data?.live_readings || []} />

            <DeviceHealthSummary readings={data?.live_readings || []} />

            <DeviceConsumption
              devices={data?.device_consumption || []}
              totalEnergyKwh={data?.total_energy_kwh || 0}
            />

            <CostPredictions
              weeklyCost={data?.weekly_predicted_cost || 0}
              weeklyKwh={data?.weekly_predicted_kwh || 0}
              monthlyCost={data?.monthly_predicted_cost || 0}
              monthlyKwh={data?.monthly_predicted_kwh || 0}
            />

          </div>

          {/* FOOTER */}
          <div className="mt-8 text-center text-xs text-gray-500">
            Last updated{" "}
            {data?.live_readings?.[0]?.lastUpdated
              ? new Date(data.live_readings[0].lastUpdated).toLocaleTimeString()
              : "—"}
          </div>

        </div>
      </div>
    </Layout>
  );
}