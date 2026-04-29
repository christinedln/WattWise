export default function LiveReadings({ readings = [] }) {
  return (
    <div className="bg-green-50/40 border border-green-200 rounded-2xl p-6 shadow-sm">

      {/* Header */}
      <div className="mb-5">
        <h3 className="font-semibold text-lg text-gray-900">
          Live Readings
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          Last updated{" "}
          {readings[0]?.lastUpdated
            ? new Date(readings[0].lastUpdated).toLocaleTimeString()
            : "—"}
        </p>
      </div>

      {/* MULTIPLE DEVICES */}
      {readings.map((device) => (
        <div key={device.device_id} className="mb-6">

          {/* Device Name */}
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {device.name}
          </p>

          {/* Cards */}
          <div className="grid grid-cols-3 gap-4">

            {/* Voltage */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <img
                  src="/voltage.png"
                  alt="Voltage"
                  className="w-8 h-8 object-contain"
                />
              </div>

              <div>
                <p className="text-xs text-gray-500">Voltage</p>
                <p className="text-xl font-bold text-gray-900">
                  {device.voltage ?? "—"}{" "}
                  <span className="text-sm font-medium">V</span>
                </p>
              </div>
            </div>

            {/* Current */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <img
                  src="/current.png"
                  alt="Current"
                  className="w-8 h-8 object-contain"
                />
              </div>

              <div>
                <p className="text-xs text-gray-500">Current</p>
                <p className="text-xl font-bold text-gray-900">
                  {device.current ?? "—"}{" "}
                  <span className="text-sm font-medium">A</span>
                </p>
              </div>
            </div>

            {/* Power */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 2L4 14h7l-1 8 10-12h-7l0-8z" />
                </svg>
              </div>

              <div>
                <p className="text-xs text-gray-500">Power</p>
                <p className="text-xl font-bold text-gray-900">
                  {device.power ?? "—"}{" "}
                  <span className="text-sm font-medium">kW</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      ))}

    </div>
  );
}