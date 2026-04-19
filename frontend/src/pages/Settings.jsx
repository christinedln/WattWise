import React from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import Layout from "../components/layout";
import SettingsControl from "../components/SettingsControl";

export default function Settings() {
  return (
    <Layout>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Header */}
          <DashboardHeader />

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your WattWise preferences and configurations
                </p>
              </div>

              <SettingsControl />


              <div className="h-16" />
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}