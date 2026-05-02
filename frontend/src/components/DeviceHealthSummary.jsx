export default function DeviceHealthSummary({ readings = [] }) {

  const allAlerts = readings.flatMap(d => d.alerts || []);

  // DEVICE STATUS 
  const healthCounts = {
    Active: readings.filter(d => d.status === "active").length,
    Offline: readings.filter(d => d.status === "offline").length,
  };

  const count = (alerts, severity) =>
    alerts.filter(a => a.severity === severity).length;

  const currentAlerts = allAlerts.filter(a => a.signal === "current");
  const voltageAlerts = allAlerts.filter(a => a.signal === "voltage");
  const powerAlerts = allAlerts.filter(a => a.signal === "power");

  const Box = ({ label, value, color }) => (
    <div className={`${color} border rounded-lg p-4`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">

      <h3 className="font-bold text-lg mb-6">Device Overview</h3>

      {/* STATUS */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        <Box
          label="Active"
          value={healthCounts.Active}
          color="bg-green-50 border-green-100 text-green-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

        <Box
          label="Offline"
          value={healthCounts.Offline}
          color="bg-gray-50 border-gray-200 text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

      </div>

      {/* CURRENT  */}
      <p className="font-semibold mb-2">Current</p>
      <div className="grid grid-cols-4 gap-3 mb-5">

        <Box
          label="Critical"
          value={count(currentAlerts, "Critical")}
          color="bg-red-50 border-red-100 text-red-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

        <Box
          label="Warning"
          value={count(currentAlerts, "Warning")}
          color="bg-yellow-50 border-yellow-100 text-yellow-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

        <Box
          label="Suspicious"
          value={count(currentAlerts, "Suspicious")}
          color="bg-purple-50 border-purple-100 text-purple-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

        <Box
          label="Normal"
          value={count(currentAlerts, "Normal")}
          color="bg-green-50 border-green-100 text-green-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

      </div>

      {/* VOLTAGE*/}
      <p className="font-semibold mb-2">Voltage</p>
      <div className="grid grid-cols-4 gap-3 mb-5">

        <Box
          label="Critical"
          value={count(voltageAlerts, "Critical")}
          color="bg-red-50 border-red-100 text-red-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

        <Box
          label="Warning"
          value={count(voltageAlerts, "Warning")}
          color="bg-yellow-50 border-yellow-100 text-yellow-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

        <Box
          label="Suspicious"
          value={count(voltageAlerts, "Suspicious")}
          color="bg-purple-50 border-purple-100 text-purple-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

        <Box
          label="Normal"
          value={count(voltageAlerts, "Normal")}
          color="bg-green-50 border-green-100 text-green-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

      </div>

      {/* POWER*/}
      <p className="font-semibold mb-2">Power</p>
      <div className="grid grid-cols-4 gap-3">

        <Box
          label="Critical"
          value={count(powerAlerts, "Critical")}
          color="bg-red-50 border-red-100 text-red-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

        <Box
          label="Warning"
          value={count(powerAlerts, "Warning")}
          color="bg-yellow-50 border-yellow-100 text-yellow-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

        <Box
          label="Suspicious"
          value={count(powerAlerts, "Suspicious")}
          color="bg-purple-50 border-purple-100 text-purple-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

        <Box
          label="Normal"
          value={count(powerAlerts, "Normal")}
          color="bg-green-50 border-green-100 text-green-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        />

      </div>

    </div>
  );
}