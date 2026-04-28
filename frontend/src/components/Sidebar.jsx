// src/components/Sidebar.jsx
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
    { name: "Dashboard", to: "/dashboard", icon: <Home size={20} /> },
    { name: "Real-Time Monitor", to: "/realtime", icon: <Zap size={20} /> },
    { name: "Predictions", to: "/predictions", icon: <TrendingUp size={20} /> },
    { name: "Devices", to: "/devices", icon: <Smartphone size={20} /> },
    { name: "Alerts", to: "/alerts", icon: <Bell size={20} /> },
    { name: "Settings", to: "/settings", icon: <Settings size={20} /> },
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
         <Menu className="w-6 h-6 text-gray-700" />
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">⚡</span>
              </div>
              <h2 className="text-xl font-bold">WattWise</h2>
            </div>


            <button onClick={() => setIsOpen(false)} className="md:hidden">
              <X size={22} />
            </button>
          </div>


          {/* Menu */}
          <nav className="flex flex-col gap-2 flex-grow">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>


<div className="border-t pt-4 mt-4">


  {/* USER INFO */}
  <div className="flex flex-col gap-1 px-2">
    <p className="font-semibold text-sm text-gray-900">
      {userData?.fullName || "Loading..."}
    </p>


    <p className="text-xs text-gray-500 truncate">
      {userData?.email || ""}
    </p>
  </div>


  {/* LOGOUT BUTTON */}
  <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200">
    <LogOut size={18} />
    Logout
  </button>


</div>
        </div>
      </div>
    </>
  );
}

