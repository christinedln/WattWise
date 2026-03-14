import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import RealtimeMonitoringPage from "./pages/RealtimeMonitoring";
import PredictionsPage from "./pages/Predictions";
import AlertsPage from "./pages/Alerts";
import DevicesPage from "./pages/Devices";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import './index.css';

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />   
      <Route path="/realtime" element={<RealtimeMonitoringPage />} />
      <Route path="/predictions" element={<PredictionsPage />} />
      <Route path="/devices" element={<DevicesPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      
    </Routes>
  </BrowserRouter>
);