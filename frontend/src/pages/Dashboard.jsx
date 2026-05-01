import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import LiveReadings from "../components/LiveReadings";
import DeviceHealthSummary from "../components/DeviceHealthSummary"; 
import DeviceConsumption from "../components/DeviceConsumption";
import CostPredictions from "../components/CostPredictions";
import Layout from "../components/layout";
import { apiFetch } from "../api/api";

export default function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiFetch("/dashboard/summary"); 

        setData(data);
        setLoading(false);
      } catch (err) {
        console.error(err); // add this for debugging
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
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
                Energy Dashboard
              </h1>
            </div>

            <div className="space-y-6">

              <LiveReadings readings={data.live_readings} />

              <DeviceHealthSummary readings={data.live_readings} />

              <DeviceConsumption
                devices={data.device_consumption}
                totalEnergyKwh={data.total_energy_kwh}
              />

              <CostPredictions
                weeklyCost={data.weekly_predicted_cost}
                weeklyKwh={data.weekly_predicted_kwh}
                monthlyCost={data.monthly_predicted_cost}
                monthlyKwh={data.monthly_predicted_kwh}
              />

            </div>

            <div className="mt-8 text-center text-xs text-gray-500">
              Last updated{" "}
              {data?.live_readings?.[0]?.lastUpdated
                ? new Date(data.live_readings[0].lastUpdated).toLocaleTimeString()
                : "—"}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}