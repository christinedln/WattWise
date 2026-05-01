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

      // keep same selected device but refresh its latest settings
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

  // initial load
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
            log_interval: numericLog,
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

  return (
    <div className="w-full">

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl shadow-sm mb-6 w-full">
        {["Billing", "Monitoring"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === tab
                ? "!bg-green-600 !text-white"
                : "!bg-white !text-gray-500 hover:!bg-gray-100 hover:!text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* DEVICE SELECTOR */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {devices.map((device) => (
          <button
            key={device.id}
            onClick={() => selectDevice(device)}
            className={`
              !px-5 !py-2 !rounded-full !text-sm !font-medium 
              !transition-all !duration-200 !border
              ${
                selectedDevice?.id === device.id
                  ? "!bg-green-600 !text-white !shadow-md !border-green-700"
                  : "!bg-white !text-gray-600 !border-gray-300 hover:!bg-gray-100"
              }
            `}
          >
            {device.name}
          </button>
        ))}
      </div>

      {/* BILLING */}
      {activeTab === "Billing" && (
        <div className="w-full">

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 w-full">
            <p className="text-sm font-bold text-gray-900 mb-1">
              Electricity Rate Configuration
            </p>

            <p className="text-xs text-gray-500 mb-5">
              Set your local electricity rate for accurate cost predictions
            </p>

            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Rate (₱/kWh)
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />

              <span className="text-sm text-gray-500">
                ₱{Number(rate || 0).toFixed(2)}/kWh
              </span>
            </div>

            {error && (
              <p className="text-red-500 text-xs mt-2">{error}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
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

            <p className="text-sm font-bold text-gray-900 mb-1">
              Real-Time Monitoring Configuration
            </p>

            <p className="text-xs text-gray-500 mb-6">
              Adjust log window and anomaly sensitivity
            </p>

            <label className="block text-xs font-semibold">
              Log Window Size: {logWindow} logs
            </label>

            <input
              type="range"
              min="10"
              max="50"
              value={logWindow}
              onChange={(e) => setlogWindow(Number(e.target.value))}
              className="w-full"
            />

            <p className="text-xs text-gray-400 mb-6">
              Number of recent readings used for anomaly detection and trends
            </p>

            {/* CURRENT THRESHOLDS */}
            <p className="text-sm font-bold text-gray-900 mb-2">
              Current Severity Threshold
            </p>

            {/* WARNING */}
            <label className="text-xs text-gray-700">
              Warning: {currentwarning.toFixed(1)}
            </label>
            <input
              type="range"
              min="1.8"
              max="2.2"
              step="0.1"
              value={currentwarning}
              onChange={(e) => {
                const val = Number(e.target.value);
                setcurrentWarning(val);

                if (val >= currentsuspicious) {
                  setcurrentSuspicious(val);
                }
              }}
              className="w-full mb-4"
            />

            {/* SUSPICIOUS */}
            <label className="text-xs text-gray-700">
              Suspicious: {currentsuspicious.toFixed(1)}
            </label>
            <input
              type="range"
              min="2.2"
              max="2.8"
              step="0.1"
              value={currentsuspicious}
              onChange={(e) => {
                const val = Number(e.target.value);
                setcurrentSuspicious(val);

                if (val <= currentwarning) {
                  setcurrentWarning(val);
                }
                if (val >= currentcritical) {
                  setcurrentCritical(val);
                }
              }}
              className="w-full mb-4"
            />

            {/* CRITICAL */}
            <label className="text-xs text-gray-700">
              Critical: {currentcritical.toFixed(1)}
            </label>
            <input
              type="range"
              min="2.8"
              max="3.5"
              step="0.1"
              value={currentcritical}
              onChange={(e) => {
                const val = Number(e.target.value);
                setcurrentCritical(val);

                if (val <= currentsuspicious) {
                  setcurrentSuspicious(val);
                }
              }}
              className="w-full mb-3"
            />

            <p className="text-xs text-gray-400">
              Controls how sensitive current-based anomaly detection is
            </p>

            {/* VOLTAGE THRESHOLDS */}
            <p className="text-sm font-bold text-gray-900 mb-2">
              Voltage Severity Threshold
            </p>

            {/* WARNING */}
            <label className="text-xs text-gray-700">
              Warning: {voltagewarning.toFixed(1)}
            </label>
            <input
              type="range"
              min="1.3"
              max="1.9"
              step="0.1"
              value={voltagewarning}
              onChange={(e) => {
                const val = Number(e.target.value);
                setvoltageWarning(val);

                if (val >= voltagesuspicious) {
                  setvoltageSuspicious(Math.min(val + 0.1, 2.4));
                }
              }}
              className="w-full mb-4"
            />

            {/* SUSPICIOUS */}
            <label className="text-xs text-gray-700">
              Suspicious: {voltagesuspicious.toFixed(1)}
            </label>
            <input
              type="range"
              min="1.9"
              max="2.4"
              step="0.1"
              value={voltagesuspicious}
              onChange={(e) => {
                const val = Number(e.target.value);
                setvoltageSuspicious(val);

                if (val <= voltagewarning) {
                  setvoltageWarning(Math.max(val - 0.1, 1.3));
                }

                if (val >= voltagecritical) {
                  setvoltageCritical(Math.min(val + 0.1, 3.0));
                }
              }}
              className="w-full mb-4"
            />

            {/* CRITICAL */}
            <label className="text-xs text-gray-700">
              Critical: {voltagecritical.toFixed(1)}
            </label>
            <input
              type="range"
              min="2.4"
              max="3.0"
              step="0.1"
              value={voltagecritical}
              onChange={(e) => {
                const val = Number(e.target.value);
                setvoltageCritical(val);

                if (val <= voltagesuspicious) {
                  setvoltageSuspicious(Math.max(val - 0.1, 1.9));
                }
              }}
              className="w-full mb-3"
            />

            <p className="text-xs text-gray-400">
              Controls how sensitive voltage-based anomaly detection is
            </p>

            {/* POWER THRESHOLDS */}
            <p className="text-sm font-bold text-gray-900 mb-2">
              Power Severity Threshold
            </p>

            {/* WARNING */}
            <label className="text-xs text-gray-700">
              Warning: {powerwarning.toFixed(1)}
            </label>
            <input
              type="range"
              min="1.8"
              max="2.2"
              step="0.1"
              value={powerwarning}
              onChange={(e) => {
                const val = Number(e.target.value);
                setpowerWarning(val);

                if (val >= powersuspicious) {
                  setpowerSuspicious(val);
                }
              }}
              className="w-full mb-4"
            />

            {/* SUSPICIOUS */}
            <label className="text-xs text-gray-700">
              Suspicious: {powersuspicious.toFixed(1)}
            </label>
            <input
              type="range"
              min="2.2"
              max="2.8"
              step="0.1"
              value={powersuspicious}
              onChange={(e) => {
                const val = Number(e.target.value);
                setpowerSuspicious(val);

                if (val <= powerwarning) {
                  setpowerWarning(val);
                }
                if (val >= powercritical) {
                  setpowerCritical(val);
                }
              }}
              className="w-full mb-4"
            />

            {/* CRITICAL */}
            <label className="text-xs text-gray-700">
              Critical: {powercritical.toFixed(1)}
            </label>
            <input
              type="range"
              min="2.8"
              max="3.4"
              step="0.1"
              value={powercritical}
              onChange={(e) => {
                const val = Number(e.target.value);
                setpowerCritical(val);

                if (val <= powersuspicious) {
                  setpowerSuspicious(val);
                }
              }}
              className="w-full mb-3"
            />

            <p className="text-xs text-gray-400">
              Controls how sensitive power-based anomaly detection is
            </p>

          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}