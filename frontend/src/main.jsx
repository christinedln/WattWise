import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import DashboardPage from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import './index.css';

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />   
      <Route path="/signup" element={<SignUpPage />} />      
      <Route path="/dashboard" element={<DashboardPage />} /> 
    </Routes>
  </BrowserRouter>
);