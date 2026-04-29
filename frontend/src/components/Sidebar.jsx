import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Zap,
  TrendingUp,
  Smartphone,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function Sidebar() {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", to: "/dashboard", icon: Home },
    { name: "Real-Time Monitor", to: "/realtime", icon: Zap },
    { name: "Predictions", to: "/predictions", icon: TrendingUp },
    { name: "Devices", to: "/devices", icon: Smartphone },
    { name: "Alerts", to: "/alerts", icon: Bell },
    { name: "Settings", to: "/settings", icon: Settings },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth();
      const db = getFirestore();
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) setUserData(docSnap.data());
    };

    fetchUser();
  }, []);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 rounded-lg hover:bg-gray-100"
      >
        <Menu className="w-6 h-6 text-gray-800" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white shadow-xl z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="flex flex-col p-4 h-full">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md overflow-hidden">
                <img
                  src="/icon.png"
                  alt="WattWise Icon"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-800">
                WattWise
              </h2>
            </div>

            <button onClick={() => setIsOpen(false)} className="md:hidden">
              <X size={22} className="text-gray-800" />
            </button>
          </div>

          {/* ⭐ Divider Line ⭐ */}
          <div className="border-b border-gray-300 mb-4"></div>

          {/* Menu */}
          <nav className="flex flex-col gap-2 flex-grow">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.to;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition"
                >
                  {/* ICON */}
                  <Icon
                    className={`w-5 h-5 transition ${
                      isActive
                        ? "text-green-600 stroke-green-600"
                        : "text-gray-800"
                    }`}
                  />

                  {/* TEXT */}
                  <span
                    className={`transition ${
                      isActive
                        ? "text-green-600 font-medium"
                        : "text-gray-800"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t pt-4 mt-4">

            {/* USER INFO */}
            <div className="flex flex-col gap-1 px-2">
              <p className="font-semibold text-sm text-gray-800">
                {userData?.fullName || "Loading..."}
              </p>

              <p className="text-xs text-gray-600 truncate">
                {userData?.email || ""}
              </p>
            </div>

            {/* LOGOUT BUTTON */}
            <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-100 transition-all duration-200">
              <LogOut size={18} className="text-gray-700" />
              Logout
            </button>

          </div>
        </div>
      </div>
    </>
  );
} 