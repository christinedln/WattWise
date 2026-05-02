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
              <SettingsControl />


              <div className="h-16" />
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}