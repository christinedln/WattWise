export default function LiveReadings({ readings = [] }) {
  // ✅ Centralized status → color map
  const statusColors = {
    critical: "bg-red-100 text-red-700",
    suspicious: "bg-purple-100 text-purple-700",
    warning: "bg-yellow-100 text-yellow-700",
    normal: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    on: "bg-green-100 text-green-700",
    offline: "bg-gray-100 text-gray-500",
    off: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-bold text-lg mb-1">Live Readings</h3>

      <p className="text-gray-500 text-sm mb-6">
        Last updated{" "}
        {readings[0]?.lastUpdated
          ? new Date(readings[0].lastUpdated).toLocaleString()
          : "—"}
      </p>

      {readings.map((device) => {
        // ✅ Normalize status (fixes mismatch issue)
        const status = device.status?.toLowerCase().trim();

        return (
          <div key={device.device_id} className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              {device.name}

              {/* ✅ STATUS BADGE */}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[status] || "bg-gray-100 text-gray-500"
                }`}
              >
                {device.status || "Unknown"}
              </span>
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">⚡ Voltage</p>
                <p className="text-3xl font-bold text-gray-900">
                  {device.voltage}
                  <span className="text-lg ml-1">V</span>
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">🔌 Current</p>
                <p className="text-3xl font-bold text-gray-900">
                  {device.current}
                  <span className="text-lg ml-1">A</span>
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">💡 Power</p>
                <p className="text-3xl font-bold text-gray-900">
                  {device.power}
                  <span className="text-lg ml-1">W</span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}