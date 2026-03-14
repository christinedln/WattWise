// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Zap, 
  Lock, 
  TrendingUp, 
  Smartphone, 
  Bell, 
  Settings,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", to: "/dashboard", icon: <Home size={20} /> },
    { name: "Real-Time Monitor", to: "/realtime", icon: <Zap size={20} /> },
    { name: "Predictions", to: "/predictions", icon: <TrendingUp size={20} /> },
    { name: "Devices", to: "/devices", icon: <Smartphone size={20} /> },
    { name: "Alerts", to: "/alerts", icon: <Bell size={20} /> },
    { name: "Settings", to: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-white shadow-md flex flex-col p-4">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center">
          <span className="text-white text-xl font-bold">⚡</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">WattWise</h2>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2 flex-grow">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.name}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center gap-3 mb-3">
          
          {/* Avatar (Initials) */}
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            JD
          </div>

          {/* User Info */}
          <div>
            <p className="font-semibold text-gray-900">John Doe</p>
            <p className="text-sm text-gray-500">john.doe@email.com</p>
          </div>
        </div>

        {/* Logout Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 py-2 rounded-lg transition-colors">
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </div>
  );
}