export default function LiveReadings({ readings = [] }) {
  const now = new Date().toLocaleTimeString();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-bold text-lg mb-1">Live Readings</h3>
      {/* Only change: dynamic time instead of hardcoded */}
      <p className="text-gray-500 text-sm mb-6">Last updated {now}</p>

      {/* Grid layout, now loops per device */}
      {readings.map((device) => (
        <div key={device.device_id} className="mb-6">

          {/* Device name label - new but minimal */}
          <p className="text-sm font-semibold text-gray-700 mb-2">
            🤖 {device.name}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium
              ${device.status === "ON"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"}`}>
              {device.status}
            </span>
          </p>

          {/* 3-card grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">⚡ Voltage</p>
              <p className="text-3xl font-bold text-gray-900">
                {device.voltage}<span className="text-lg ml-1">V</span>
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">🔌 Current</p>
              <p className="text-3xl font-bold text-gray-900">
                {device.current}<span className="text-lg ml-1">A</span>
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">💡 Power</p>
              <p className="text-3xl font-bold text-gray-900">
                {device.power}<span className="text-lg ml-1">W</span>
              </p>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}