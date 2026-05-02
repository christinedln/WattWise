import { useState, useEffect } from "react";
import { apiFetch } from "../api/api";

export default function SettingsControl() {

  const [activeTab, setActiveTab] = useState("Billing");

  // billing
  const [rate, setRate] = useState(12.5);

  // monitoring 
  const [logWindow, setlogWindow] = useState(10);
  const [currentwarning, setcurrentWarning] = useState(2.0);
  const [currentsuspicious, setcurrentSuspicious] = useState(2.5);
  const [currentcritical, setcurrentCritical] = useState(3.2);
  const [voltagewarning, setvoltageWarning] = useState(1.5);
  const [voltagesuspicious, setvoltageSuspicious] = useState(2.0);
  const [voltagecritical, setvoltageCritical] = useState(2.6);
  const [powerwarning, setpowerWarning] = useState(2.0);
  const [powersuspicious, setpowerSuspicious] = useState(2.5);
  const [powercritical, setpowerCritical] = useState(3.1);

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOAD DEVICES (reusable)
  // =========================
  const loadDevices = async () => {
    try {
      const data = await apiFetch("/devices");

      const list =
        data?.devices ||
        data?.merged_devices ||
        data?.data ||
        (Array.isArray(data) ? data : []);

      const mapped = list.map(d => ({
        id: d.device_id || d.id,
        name: d.name || `Device ${d.device_id}`,
        location: d.location ?? "Unknown",
        enabled: d.enabled === true || d.enabled === "true",
        status: d.status || "UNKNOWN",
        settings: d.settings || {}
      }));

      setDevices(mapped);


      const updated = mapped.find(d => d.id === selectedDevice?.id);

      if (updated) {
        setSelectedDevice(updated);
      } else if (mapped.length > 0 && !selectedDevice) {
        setSelectedDevice(mapped[0]);
      }

    } catch (err) {
      console.error("DEVICE LOAD ERROR:", err);
    }
  };


  useEffect(() => {
    loadDevices();
  }, []);

  // =========================
  // APPLY SETTINGS
  // =========================
  useEffect(() => {
    if (!selectedDevice) return;

    const s = selectedDevice.settings || {};

    setRate(s.electricity_rate ?? 12.5);
    setlogWindow(s.log_window ?? 10);

    setcurrentWarning(s.current_warning_threshold ?? 2.0);
    setcurrentSuspicious(s.current_suspicious_threshold ?? 2.5);
    setcurrentCritical(s.current_critical_threshold ?? 3.2);
    setvoltageWarning(s.voltage_warning_threshold ?? 1.5);
    setvoltageSuspicious(s.voltage_suspicious_threshold ?? 2.0);
    setvoltageCritical(s.voltage_critical_threshold ?? 2.6);
    setpowerWarning(s.power_warning_threshold ?? 2.0);
    setpowerSuspicious(s.power_suspicious_threshold ?? 2.5);
    setpowerCritical(s.power_critical_threshold ?? 3.1);

  }, [selectedDevice]);

  // =========================
  // SAVE SETTINGS
  // =========================
  const handleSave = async () => {
    const numericRate = Number(rate);
    const numericLog = Number(logWindow);

    try {
      setError("");

      if (isNaN(numericRate) || numericRate <= 0) {
        setError("Electricity rate must be greater than 0");
        return;
      }

      if (isNaN(numericLog) || numericLog <= 0) {
        setError("Log window must be greater than 10");
        return;
      }

      await apiFetch("/settings/update", {
        method: "POST",
        body: JSON.stringify({
          deviceId: selectedDevice?.id,
          settings: {
            electricity_rate: numericRate,
            log_window: numericLog,
            current_warning_threshold: currentwarning,
            current_suspicious_threshold: currentsuspicious,
            current_critical_threshold: currentcritical,
            voltage_warning_threshold: voltagewarning,
            voltage_suspicious_threshold: voltagesuspicious,
            voltage_critical_threshold: voltagecritical,
            power_warning_threshold: powerwarning,
            power_suspicious_threshold: powersuspicious,
            power_critical_threshold: powercritical
          }
        })
      });

      await loadDevices();

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

    } catch (err) {
      console.error("Save failed:", err);
      setError("Failed to save settings. Please try again.");
    }
  };

  const selectDevice = (device) => {
    setSelectedDevice(device);
  };

  if (!selectedDevice) {
    return <div className="p-6 text-gray-500">Loading settings...</div>;
  }

  // Tab definitions with icons and subtitles
  const tabs = [
    {
      id: "Billing",
      label: "Billing",
      subtitle: "Manage pricing and cost settings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h6m-6 4h4" />
        </svg>
      )
    },
    {
      id: "Monitoring",
      label: "Monitoring",
      subtitle: "Configure system monitoring",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-full">

      {/* Tabs — card style with icon + subtitle */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 20px",
                borderRadius: "12px",
                border: isActive ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                backgroundColor: isActive ? "#f0fdf4" : "#ffffff",
                cursor: "pointer",
                textAlign: "left",
                borderBottom: isActive ? "3px solid #16a34a" : "3px solid transparent",
                transition: "all 0.2s",
                boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                outline: "none"
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#dcfce7" : "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isActive ? "#16a34a" : "#9ca3af",
                  flexShrink: 0
                }}
              >
                {tab.icon}
              </div>

              {/* Label + subtitle */}
              <div>
                <p style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: isActive ? "#16a34a" : "#374151",
                  margin: 0,
                  lineHeight: "1.2"
                }}>
                  {tab.label}
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  margin: 0,
                  marginTop: "2px"
                }}>
                  {tab.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* DEVICE SELECTOR */}
      <div className="flex items-center bg-gray-100 p-1 rounded-full w-fit mb-4 flex-wrap gap-1">

        {devices.map((device) => {
          const isActive = selectedDevice?.id === device.id;

          return (
            <button
              key={device.id}
              onClick={() => selectDevice(device)}
              className={`
          px-5 py-2 text-sm font-medium transition-all duration-200 z-10
          ${isActive
                  ? "!bg-green-600 !text-white shadow-md shadow-green-300 !rounded-full"
                  : "!bg-transparent !text-gray-600 hover:!bg-gray-200"
                }
        `}
              style={{ borderRadius: "9999px" }}
            >
              {device.name}
            </button>
          );
        })}

      </div>

      {/* BILLING */}
      {activeTab === "Billing" && (
        <div className="w-full">

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 w-full">

            {/* Card header with lightning icon */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>
                  Electricity Rate Configuration
                </p>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, marginTop: "2px" }}>
                  Set your local electricity rate for accurate cost predictions.
                </p>
              </div>
            </div>

            {/* Divider */}
            <hr style={{ borderColor: "#f3f4f6", marginBottom: "20px" }} />

            {/* Rate input */}
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Rate (₱/kWh)
            </label>

            <div style={{
              display: "flex",
              alignItems: "center",
              border: "1.5px solid #d1fae5",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#ffffff"
            }}>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  fontSize: "14px",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  color: "#111827"
                }}
              />
              <div style={{
                padding: "10px 16px",
                backgroundColor: "#f0fdf4",
                borderLeft: "1.5px solid #d1fae5",
                fontSize: "13px",
                fontWeight: "600",
                color: "#16a34a",
                whiteSpace: "nowrap"
              }}>
                ₱{Number(rate || 0).toFixed(2)}/kWh
              </div>
            </div>

            <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px" }}>
              This rate will be used to calculate estimated electricity costs across the application.
            </p>

            {error && (
              <p className="text-red-500 text-xs mt-2">{error}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="!bg-green-600 !text-white px-5 py-2 rounded-lg text-sm font-semibold
             shadow-sm transition-all duration-200
             hover:!bg-green-700 hover:shadow-lg hover:-translate-y-0.5
             active:translate-y-0 active:shadow-md
             focus:outline-none"
            >
              {saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>

        </div>
      )}

      {/* MONITORING */}
      {activeTab === "Monitoring" && (
        <div className="w-full">

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 w-full">

            {/* HEADER WITH ICON */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>

              {/* Icon */}
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  viewBox="0 0 24 24" fill="none"
                  stroke="#16a34a" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>

              {/* Text */}
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: 0 }}>
                  Real-Time Monitoring Configuration
                </p>
                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                  Adjust log window and anomaly sensitivity
                </p>
              </div>

            </div>

            {/* LOG WINDOW */}
            <div style={{
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px"
            }}>
              {/* Label */}
              <div style={{ minWidth: "110px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>Log Window Size</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>{logWindow} logs</span>
              </div>

              {/* Slider */}
              <div style={{ flex: 1 }}>
                <style>{`
    input[type=range] {
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      border-radius: 4px;
      outline: none;
    }
    input[type=range]::-webkit-slider-runnable-track {
      height: 6px;
      border-radius: 4px;
    }
    input[type=range]::-moz-range-track {
      height: 6px;
      border-radius: 4px;
      background: #d1d5db;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      margin-top: -6px;
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
    }
    input[type=range]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
    }
    .slider-green::-webkit-slider-thumb { background: #16a34a; }
    .slider-green::-moz-range-thumb    { background: #16a34a; }
    .slider-green::-moz-range-progress { background: #16a34a; }
    .slider-orange::-webkit-slider-thumb { background: #f97316; }
    .slider-orange::-moz-range-thumb    { background: #f97316; }
    .slider-orange::-moz-range-progress { background: #f97316; }
    .slider-blue::-webkit-slider-thumb { background: #3b82f6; }
    .slider-blue::-moz-range-thumb    { background: #3b82f6; }
    .slider-blue::-moz-range-progress { background: #3b82f6; }
    .slider-purple::-webkit-slider-thumb { background: #8b5cf6; }
    .slider-purple::-moz-range-thumb    { background: #8b5cf6; }
    .slider-purple::-moz-range-progress { background: #8b5cf6; }
  `}</style>

                <input
                  type="range"
                  min="10"
                  max="50"
                  value={logWindow}
                  onChange={(e) => setlogWindow(Number(e.target.value))}
                  className="slider-green"
                  style={{
                    width: "100%",
                    background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((logWindow - 10) / (50 - 10)) * 100}%, #d1d5db ${((logWindow - 10) / (50 - 10)) * 100}%, #d1d5db 100%)`
                  }}
                />

                {/* Bottom Center Description */}
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textAlign: "center",
                    marginTop: "8px",
                    lineHeight: "1.5"
                  }}
                >
                  Number of recent readings used for anomaly detection and trends
                </p>
              </div>
            </div>

            {/* Section header */}
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a", marginBottom: "12px" }}>
              Current Severity Thresholds
            </p>

            {/* Severity rows */}
            {[
              {
                label: "Current Severity",
                subtitle: "Threshold",
                color: "#f97316",
                sliderClass: "slider-orange",
                bgColor: "#fff7ed",
                iconColor: "#f97316",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                ),
                warning: currentwarning, setWarning: setcurrentWarning,
                suspicious: currentsuspicious, setSuspicious: setcurrentSuspicious,
                critical: currentcritical, setCritical: setcurrentCritical,
                wMin: 1.8, wMax: 2.2,
                sMin: 2.2, sMax: 2.8,
                cMin: 2.8, cMax: 3.5,
                description: "Controls how sensitive current-based anomaly detection is"
              },
              {
                label: "Voltage Severity",
                subtitle: "Threshold",
                color: "#3b82f6",
                sliderClass: "slider-blue",
                bgColor: "#eff6ff",
                iconColor: "#3b82f6",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ),
                warning: voltagewarning, setWarning: setvoltageWarning,
                suspicious: voltagesuspicious, setSuspicious: setvoltageSuspicious,
                critical: voltagecritical, setCritical: setvoltageCritical,
                wMin: 1.3, wMax: 1.9,
                sMin: 1.9, sMax: 2.4,
                cMin: 2.4, cMax: 3.0,
                description: "Controls how sensitive voltage-based anomaly detection is"
              },
              {
                label: "Power Severity",
                subtitle: "Threshold",
                color: "#8b5cf6",
                sliderClass: "slider-purple",
                bgColor: "#f5f3ff",
                iconColor: "#8b5cf6",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                warning: powerwarning, setWarning: setpowerWarning,
                suspicious: powersuspicious, setSuspicious: setpowerSuspicious,
                critical: powercritical, setCritical: setpowerCritical,
                wMin: 1.8, wMax: 2.2,
                sMin: 2.2, sMax: 2.8,
                cMin: 2.8, cMax: 3.4,
                description: "Controls how sensitive power-based anomaly detection is"
              }
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                {/* TOP ROW */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

                  {/* Icon */}
                  <div style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    backgroundColor: row.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {row.icon}
                  </div>

                  {/* Label */}
                  <div style={{ minWidth: "110px", flexShrink: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827", margin: 0 }}>
                      {row.label}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                      {row.subtitle}
                    </p>
                  </div>

                  {/* Sliders (VALUE ALIGNED TO EACH RANGE) */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

                    {/* Warning */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                      <p style={{ fontSize: "10px", color: "#9ca3af", width: "70px", margin: 0 }}>
                        Warning
                      </p>

                      <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827", width: "40px", margin: 0 }}>
                        {row.warning.toFixed(1)}
                      </p>

                      <input
                        type="range"
                        min={row.wMin}
                        max={row.wMax}
                        step="0.1"
                        value={row.warning}
                        className={row.sliderClass}
                        style={{
                          flex: 1,
                          marginLeft: "8px",
                          background: `linear-gradient(to right, ${row.color} 0%, ${row.color} ${((row.warning - row.wMin) / (row.wMax - row.wMin)) * 100}%, #d1d5db ${((row.warning - row.wMin) / (row.wMax - row.wMin)) * 100}%, #d1d5db 100%)`
                        }}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          row.setWarning(val);
                          if (val >= row.suspicious) row.setSuspicious(val);
                        }}
                      />
                    </div>

                    {/* Suspicious */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                      <p style={{ fontSize: "10px", color: "#9ca3af", width: "70px", margin: 0 }}>
                        Suspicious
                      </p>

                      <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827", width: "40px", margin: 0 }}>
                        {row.suspicious.toFixed(1)}
                      </p>

                      <input
                        type="range"
                        min={row.sMin}
                        max={row.sMax}
                        step="0.1"
                        value={row.suspicious}
                        className={row.sliderClass}
                        style={{
                          flex: 1,
                          marginLeft: "8px",
                          background: `linear-gradient(to right, ${row.color} 0%, ${row.color} ${((row.suspicious - row.sMin) / (row.sMax - row.sMin)) * 100}%, #d1d5db ${((row.suspicious - row.sMin) / (row.sMax - row.sMin)) * 100}%, #d1d5db 100%)`
                        }}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          row.setSuspicious(val);
                          if (val <= row.warning) row.setWarning(val);
                          if (val >= row.critical) row.setCritical(val);
                        }}
                      />
                    </div>

                    {/* Critical */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <p style={{ fontSize: "10px", color: "#9ca3af", width: "70px", margin: 0 }}>
                        Critical
                      </p>

                      <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827", width: "40px", margin: 0 }}>
                        {row.critical.toFixed(1)}
                      </p>

                      <input
                        type="range"
                        min={row.cMin}
                        max={row.cMax}
                        step="0.1"
                        value={row.critical}
                        className={row.sliderClass}
                        style={{
                          flex: 1,
                          marginLeft: "8px",
                          background: `linear-gradient(to right, ${row.color} 0%, ${row.color} ${((row.critical - row.cMin) / (row.cMax - row.cMin)) * 100}%, #d1d5db ${((row.critical - row.cMin) / (row.cMax - row.cMin)) * 100}%, #d1d5db 100%)`
                        }}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          row.setCritical(val);
                          if (val <= row.suspicious) row.setSuspicious(val);
                        }}
                      />
                    </div>

                  </div>
                </div>

                {/* ✅ BOTTOM CENTER DESCRIPTION */}
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textAlign: "center",
                    margin: 0,
                    lineHeight: "1.5"
                  }}
                >
                  {row.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="!bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold
               shadow-sm transition-all duration-200
               hover:!bg-green-700 hover:shadow-lg hover:-translate-y-0.5
               active:translate-y-0 active:shadow-md
               focus:outline-none"
            >
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}