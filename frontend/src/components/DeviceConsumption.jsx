import { Monitor, Fan, Laptop, Tv } from "lucide-react";

export default function DeviceConsumption({
  devices = [],
  totalEnergyKwh = 0,
}) {

  // Icon selector
  const getDeviceIcon = (name = "") => {
    const device = name.toLowerCase();

    if (device.includes("fan")) return <Fan className="w-5 h-5 text-green-600" />;
    if (device.includes("laptop")) return <Laptop className="w-5 h-5 text-green-600" />;
    if (device.includes("tv")) return <Tv className="w-5 h-5 text-green-600" />;

    // default
    return <Monitor className="w-5 h-5 text-green-600" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      
      {/* Header */}
      <h3 className="text-xl font-semibold text-gray-800">
        Device Consumption
      </h3>
      <p className="text-gray-500 text-sm mb-6">
        Real-time per-device energy usage in kWh
        <span className="ml-2 font-semibold text-gray-700">
          · Total: {totalEnergyKwh} kWh
        </span>
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          
          <thead>
            <tr className="text-gray-600 text-sm">
              <th className="text-left py-3 px-4 font-semibold">Device</th>
              <th className="text-left py-3 px-4 font-semibold">kWh</th>
              <th className="text-left py-3 px-4 font-semibold">Usage</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((device) => (
              <tr key={device.device_id} className="border-t border-gray-200">
                
                {/* Device */}
                <td className="py-4 px-4 flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    {getDeviceIcon(device.name)}
                  </div>
                  <span className="font-medium text-gray-800">
                    {device.name}
                  </span>
                </td>

                {/* kWh */}
                <td className="py-4 px-4 font-semibold text-gray-900">
                  {device.kwh}
                </td>

                {/* Usage */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: `${device.percent_of_total}%` }}
                      />
                    </div>
                    <span className="text-gray-700 text-sm">
                      {device.percent_of_total}%
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        device.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                  >
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