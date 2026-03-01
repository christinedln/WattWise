export default function DeviceConsumption() {
  const devices = [
    {
      name: 'Desktop Computer',
      kWh: 2.41,
      usage: 9.6,
      status: 'Normal',
      statusColor: 'bg-green-100 text-green-800',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-bold text-lg mb-1">Device Consumption</h3>
      <p className="text-gray-500 text-sm mb-6">Real-time per-device energy usage in kWh</p>
      
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
            {devices.map((device, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4 px-4 flex items-center gap-2">
                  <span className="text-lg">💻</span>
                  <span className="font-medium text-gray-900">{device.name}</span>
                </td>
                <td className="py-4 px-4 text-gray-900">{device.kWh}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${device.usage}%` }}
                      />
                    </div>
                    <span className="text-gray-900">{device.usage}%</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${device.statusColor}`}>
                    {device.status}
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
