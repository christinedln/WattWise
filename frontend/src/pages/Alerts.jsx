'use client';

import React from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import Layout from "../components/layout";
import { TrendingUp, TrendingDown } from "lucide-react";
import AlertNotif from "../components/AlertNotif";


export default function Alerts() {
  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        <Sidebar />

       <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <div className="flex-1 overflow-auto p-6">
            <AlertNotif />
          </div>
        </div>
      </div>
    </Layout>
  );
}
 
