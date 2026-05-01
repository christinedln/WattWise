import { useState, useEffect } from "react";
import { apiFetch } from "../api/api";

export default function SettingsControl() {

  const [activeTab, setActiveTab] = useState("Billing");

  const [rate, setRate] = useState("12.5");
  const [pollingInterval, setPollingInterval] = useState(10);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOAD DEVICES
  // =========================
  useEffect(() => {
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
          name: d.name || d.device_name || `Device ${d.device_id}`,
          location: d.location ?? "Unknown",
          enabled: d.enabled === true || d.enabled === "true",
          status: d.status || "UNKNOWN",

          settings: {
            electricity_rate:
              d.settings?.electricity_rate ?? d.electricity_rate ?? 0,

            polling_interval:
              d.settings?.polling_interval ?? d.polling_interval ?? 5,

            energy_alert_threshold:
              d.settings?.energy_alert_threshold ?? d.energy_alert_threshold ?? 5000,

            security_alert_level:
              d.settings?.security_alert_level ?? d.security_alert_level ?? 3
          }
        }));

        setDevices(mapped);

        // auto-select first device
        if (mapped.length > 0) {
          setSelectedDevice(mapped[0]);
        }

      } catch (err) {
        console.error("DEVICE LOAD ERROR:", err);
      }
    };

    loadDevices();
  }, []);


  // =========================
  // LOAD SETTINGS PER DEVICE
  // =========================
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (!selectedDevice?.id) return;

        const data = await apiFetch("/settings/get", {
          method: "POST",
          body: JSON.stringify({
            deviceId: selectedDevice.id
          })
        });

        setRate(data.electricity_rate);
        setPollingInterval(Number(data.polling_interval) || 10);

      } catch (err) {
        console.error("LOAD ERROR:", err);
      }
    };

    loadSettings();
  }, [selectedDevice]);

  const monthlyEstimate = ((rate * 150 * 30) / 1000).toFixed(2);


  const handleSave = async () => {
    const numericRate = Number(rate);
    try {
      setError(""); // clear old errors

      // VALIDATION
      if (rate === "" || isNaN(numericRate) || numericRate <= 0) {
        setError("Electricity rate must be greater than 0");
        return;
      }

      const numericPolling = Number(pollingInterval);

      if (isNaN(numericPolling) || numericPolling <= 0) {
        setError("Polling interval must be greater than 0");
        return;
      }

      await apiFetch("/settings/update", {
        method: "POST",
        body: JSON.stringify({
          deviceId: selectedDevice?.id,
          settings: {
            electricity_rate: numericRate,
            polling_interval: numericPolling
          }
        })
      });

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

  if (
    rate === null ||
    pollingInterval === null 
  ) {
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
            ? "!bg-green-600 !text-white !shadow-md !shadow-green-300 !border-green-700"
            : "!bg-white !text-gray-600 !border-gray-300 hover:!bg-gray-100"
        }
      `}
    >
      {device.name}
    </button>
  ))}
</div>

      {/* BILLING TAB */}
      {activeTab === "Billing" && (
        <div className="w-full">
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 w-full">
            <p className="text-sm font-bold text-gray-900 mb-1">Electricity Rate Configuration</p>
            <p className="text-xs text-gray-500 mb-5">Set your local electricity rate for accurate cost predictions</p>


            <label className="block text-xs font-semibold text-gray-700 mb-1">Rate (₱/kWh)</label>
            <div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50 outline-none focus:ring-2 focus:ring-green-500"
                />

                <span className="text-sm text-gray-500 whitespace-nowrap">
                  ₱{Number(rate || 0).toFixed(2)}/kWh
                </span>
              </div>

              {error && (
                <p className="text-red-500 text-xs mt-2">
                  {error}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">This rate is used to calculate your weekly and monthly energy cost predictions</p>

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



{/* MONITORING TAB */}
{activeTab === "Monitoring" && (
  <div className="w-full">
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 w-full">
      <p className="text-sm font-bold text-gray-900 mb-1">
        Real-Time Monitoring Configuration
      </p>
      <p className="text-xs text-gray-500 mb-6">
        Adjust log window and current anomaly sensitivity
      </p>

      {/* LOG WINDOW (replaces polling interval) */}
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        Log Window Size: {pollingInterval} logs
      </label>
      <input
        type="range"
        min="10"
        max="50"
        step="1"
        value={pollingInterval}
        onChange={(e) => setPollingInterval(Number(e.target.value))}
        className="w-full accent-gray-900 mb-1"
      />
      <p className="text-xs text-gray-400 mb-6">
        Number of recent current readings used for anomaly detection
      </p>

      {/* SEVERITY THRESHOLDS */}
      <p className="text-sm font-bold text-gray-900 mb-2">
        Current Severity Threshold
      </p>

      {/* Warning */}
      <label className="text-xs text-gray-700">Warning</label>
      <input
        type="number"
        step="0.1"
        defaultValue={2.0}
        className="w-full mb-3 px-3 py-2 border rounded-lg text-sm"
      />

      {/* Suspiscious */}
      <label className="text-xs text-gray-700">Suspiscious</label>
      <input
        type="number"
        step="0.1"
        defaultValue={3.0}
        className="w-full mb-3 px-3 py-2 border rounded-lg text-sm"
      />

      {/* Critical */}
      <label className="text-xs text-gray-700">Critical</label>
      <input
        type="number"
        step="0.1"
        defaultValue={3.5}
        className="w-full mb-3 px-3 py-2 border rounded-lg text-sm"
      />

      <p className="text-xs text-gray-400">
        Controls how sensitive current-based anomaly detection is
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
        {saved ? "✓ Saved!" : "Save Changes"}
      </button>
    </div>
  </div>
)}


    </div>
  );
}

