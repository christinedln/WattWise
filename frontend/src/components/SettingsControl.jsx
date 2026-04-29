import { useState, useEffect } from "react";
import { apiFetch } from "../api/api";

const LEVEL_LABELS = ["Warning", "Med", "High", "Crit", "Sec"];

export default function SettingsControl() {

  const [activeTab, setActiveTab] = useState("Billing");

  const [rate, setRate] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(5);
  const [energyThreshold, setEnergyThreshold] = useState(5000);
  const [securityLevel, setSecurityLevel] = useState(3);

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [saved, setSaved] = useState(false);

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
        setPollingInterval(data.polling_interval);
        setEnergyThreshold(data.energy_alert_threshold);
        setSecurityLevel(data.security_alert_level);

      } catch (err) {
        console.error("LOAD ERROR:", err);
      }
    };

    loadSettings();
  }, [selectedDevice]);

  const monthlyEstimate = ((rate * 150 * 30) / 1000).toFixed(2);

  const handleSave = async () => {
    try {
      await apiFetch("/settings/update", {
        method: "POST",
        body: JSON.stringify({
          deviceId: selectedDevice?.id,
          settings: {
            electricity_rate: rate,
            polling_interval: pollingInterval,
            energy_alert_threshold: energyThreshold,
            security_alert_level: securityLevel
          }
        })
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const selectDevice = (device) => {
    setSelectedDevice(device);
  };

  if (
    rate === null ||
    pollingInterval === null ||
    energyThreshold === null ||
    securityLevel === null
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
            className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === tab
                ? "border-green-600 text-gray-900 font-semibold bg-gray-50"
                : "border-transparent text-gray-500 hover:text-gray-700"
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
            className={`px-3 py-2 text-sm rounded-md border ${
              selectedDevice?.id === device.id
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700"
            }`}
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
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50 outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">₱{rate.toFixed(2)}/kWh</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">This rate is used to calculate your weekly and monthly energy cost predictions</p>

            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <span className="text-blue-500 text-lg mt-0.5">ℹ</span>
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-0.5">Monthly Cost Estimate</p>
                <p className="text-xs text-blue-500">Based on current average consumption: ₱{monthlyEstimate}/month</p>
              </div>
            </div>
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
            <p className="text-sm font-bold text-gray-900 mb-1">Real-Time Monitoring Configuration</p>
            <p className="text-xs text-gray-500 mb-6">Adjust polling intervals and alert thresholds</p>

            {/* Polling Interval */}
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Polling Interval: {pollingInterval}s
            </label>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={pollingInterval}
              onChange={(e) => setPollingInterval(Number(e.target.value))}
              className="w-full accent-gray-900 mb-1"
            />
            <p className="text-xs text-gray-400 mb-6">Interval between each meter reading (1–60 seconds)</p>

            {/* Energy Alert Threshold */}
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Energy Alert Threshold (Watts)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="100"
                max="20000"
                step="100"
                value={energyThreshold}
                onChange={(e) => setEnergyThreshold(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50 outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">{energyThreshold}W</span>
            </div>
            <p className="text-xs text-gray-400 mt-1 mb-6">Alert will trigger when consumption exceeds this threshold</p>

            {/* Security Alert Level - Slider */}
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Security Alert Level: {securityLevel}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={securityLevel}
              onChange={(e) => setSecurityLevel(Number(e.target.value))}
              className="w-full accent-gray-900 mb-2"
            />
            {/* Level Labels */}
            <div className="flex justify-between mb-1">
              {LEVEL_LABELS.map((lvl, i) => (
                <span
                  key={lvl}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md flex-1 text-center mx-0.5 ${
                    securityLevel === i + 1
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {lvl}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">Anomaly detection sensitivity level for unauthorized usage</p>
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