import React from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import LiveReadings from "../components/LiveReadings";
import DeviceConsumption from "../components/DeviceConsumption";
import CostPredictions from "../components/CostPredictions";
import Layout from "../components/layout";

export default function DashboardPage() {
  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader />

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Energy Dashboard</h1>
              <p className="text-gray-500">Real-time monitoring and predictions</p>
            </div>

            {/* Content Grid */}
            <div className="space-y-6">
              <LiveReadings />
              <DeviceConsumption />
              <CostPredictions />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}