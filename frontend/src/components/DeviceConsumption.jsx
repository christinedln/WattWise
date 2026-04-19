export default function DeviceConsumption({ devices = [], totalEnergyKwh = 0 }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-bold text-lg mb-1">Device Consumption</h3>
      {/* Added total kWh line */}
      <p className="text-gray-500 text-sm mb-6">
        Real-time per-device energy usage in kWh &nbsp;·&nbsp;
        <span className="font-semibold text-gray-700">Total: {totalEnergyKwh} kWh</span>
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Device</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">kWh</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Usage</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.device_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4 px-4 flex items-center gap-2">
                  <span className="text-lg"></span>
                  <span className="font-medium text-gray-900">{device.name}</span>
                </td>
                <td className="py-4 px-4 text-gray-900">{device.kwh}</td>
                <td className="py-4 px-4">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${device.percent_of_total}%` }}
                      />
                    </div>
                    <span className="text-gray-900">{device.percent_of_total}%</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {/* Status badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${device.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-500"}`}>
                    {device.status === "active" ? "ACTIVE" : "OFFLINE"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}