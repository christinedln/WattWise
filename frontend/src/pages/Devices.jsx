'use client';

import React from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import Layout from "../components/layout";
import DeviceManagement from "../components/DeviceManagement";

export default function DevicesPage() {
  
  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          {/* Scrollable area */}
          <div className="flex-1 overflow-auto p-6">
            <DeviceManagement />
          </div>
        </div>
      </div>
    </Layout>
  );
}