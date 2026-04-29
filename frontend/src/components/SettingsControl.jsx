import { useState, useEffect } from "react";
import { apiFetch } from "../api/api";


const LEVEL_LABELS = ["Low", "Med", "High", "Crit", "Sec"];


export default function SettingsControl() {
 
  const [activeTab, setActiveTab] = useState("Billing");


 
  const [rate, setRate] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(5);
  const [energyThreshold, setEnergyThreshold] = useState(5000);
  const [securityLevel, setSecurityLevel] = useState(3);


  // Devices
const [devices, setDevices] = useState([]);


useEffect(() => {
  const loadDevices = async () => {
    try {
      const data = await apiFetch("/devices");


      console.log("FULL DEVICE RESPONSE:", data);


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
      }));


      setDevices(mapped);
    } catch (err) {
      console.error("DEVICE LOAD ERROR:", err);
    }
  };


  loadDevices();
}, []);


  const [saved, setSaved] = useState(false);


  useEffect(() => {
  const loadSettings = async () => {
    try {
      const data = await apiFetch("/settings");


      console.log("LOADED FROM FIREBASE:", data);


      setRate(data.electricity_rate ?? 0);
      setPollingInterval(data.polling_interval ?? 5);
      setEnergyThreshold(data.energy_alert_threshold ?? 5000);
      setSecurityLevel(data.security_alert_level ?? 3);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };


  loadSettings();
}, []);


  const monthlyEstimate = ((rate * 150 * 30) / 1000).toFixed(2);


  const handleSave = async () => {
  try {
    const data = await apiFetch("/settings", {
      method: "POST",
      body: JSON.stringify({
        electricity_rate: rate,
        polling_interval: pollingInterval,
        energy_alert_threshold: energyThreshold,
        security_alert_level: securityLevel
      })
    });


    console.log("Saved:", data);


    setSaved(true);
    setTimeout(() => setSaved(false), 2000);


  } catch (err) {
    console.error("Save failed:", err);
  }
};


  const toggleDevice = async (id) => {
  const updatedDevice = devices.find((d) => String(d.id) === String(id));
  if (!updatedDevice) return;


  const newEnabled = !updatedDevice.enabled;


  // optimistic UI update
  setDevices((prev) =>
    prev.map((d) =>
      String(d.id) === String(id)
        ? { ...d, enabled: newEnabled }
        : d
    )
  );


  try {
    await apiFetch(`/devices/${updatedDevice.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        enabled: newEnabled,
      }),
    });
  } catch (err) {
    console.error("Device update failed:", err);
  }
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
        {["Billing", "Monitoring", "Devices"].map((tab) => (
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


      {/* DEVICES TAB */}
      {activeTab === "Devices" && (
        <div className="w-full">
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 w-full">
            <p className="text-sm font-bold text-gray-900 mb-1">Device Management</p>
            <p className="text-xs text-gray-500 mb-5">Enable or disable monitoring for each device</p>


            {devices.map((device) => (
              <div
                key={device.id}
                className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {device.name}
                    <span className="text-xs text-gray-400 ml-2">
                      ({device.enabled ? "ON" : "OFF"})
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{device.location || "No location set"}</p>
                </div>
                <div
                  onClick={() => toggleDevice(device.id)}
                  className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors flex-shrink-0 ${
                    device.enabled ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      device.enabled ? "left-6" : "left-1"
                    }`}
                  />
                </div>
              </div>
            ))}
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

