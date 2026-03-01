export default function LiveReadings() {
  const readings = [
    { icon: '⚡', label: 'Voltage', value: '222.1', unit: 'V', color: 'bg-yellow-50' },
    { icon: '🔌', label: 'Current', value: '9.4', unit: 'A', color: 'bg-blue-50' },
    { icon: '💡', label: 'Power', value: '3.1', unit: 'kW', color: 'bg-green-50' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-bold text-lg mb-1">Live Readings</h3>
      <p className="text-gray-500 text-sm mb-6">Last updated 10:34:49 AM</p>
      
      <div className="grid grid-cols-3 gap-4">
        {readings.map((reading, index) => (
          <div key={index} className={`${reading.color} rounded-lg p-4`}>
            <p className="text-sm text-gray-600 mb-2">{reading.label}</p>
            <p className="text-3xl font-bold text-gray-900">
              {reading.value}<span className="text-lg ml-1">{reading.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
