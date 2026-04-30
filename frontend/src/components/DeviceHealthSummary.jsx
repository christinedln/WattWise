export default function DeviceHealthSummary({ readings = [] }) {

  // ── COUNTERS ─────────────────────────────
  const healthCounts = {
    Active: readings.filter(d => d.status === "active").length,
    Critical: readings.filter(d => d.severity === "Critical").length,
    Suspicious: readings.filter(d => d.severity === "Suspicious").length,
    Warning: readings.filter(d => d.severity === "Warning").length,
    Normal: readings.filter(d => d.severity === "Normal").length,
    Offline: readings.filter(d => d.status == "offline").length,
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">

      <h3 className="font-bold text-lg mb-6">Device Overview</h3>

      {/* ── ALL STATUS IN ONE GRID ───────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">

        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Active</p>
          <p className="text-2xl font-bold text-green-700">
            {healthCounts.Active}
          </p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
          <p className="text-sm text-red-600 font-medium">Critical</p>
          <p className="text-2xl font-bold text-red-700">
            {healthCounts.Critical}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Suspicious</p>
          <p className="text-2xl font-bold text-purple-700">
            {healthCounts.Suspicious}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-medium">Warning</p>
          <p className="text-2xl font-bold text-yellow-700">
            {healthCounts.Warning}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Normal</p>
          <p className="text-2xl font-bold text-blue-700">
            {healthCounts.Normal}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Offline</p>
          <p className="text-2xl font-bold text-gray-700">
            {healthCounts.Offline}
          </p>
        </div>

      </div>
    </div>
  );
}