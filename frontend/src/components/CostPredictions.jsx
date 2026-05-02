import { TrendingUp, TrendingDown } from "lucide-react";

export default function CostPredictions({
  weeklyCost = 0,
  weeklyKwh = 0,
  monthlyCost = 0,
  monthlyKwh = 0,
  actualVsPredicted = [],
  dailyForecast = [],
  perDevice = {}, // ✅ NEW (optional)
  selectedDeviceId = null, // ✅ NEW
}) {

  // ===============================
  // DEVICE OR GLOBAL DATA PICK
  // ===============================
  const activeDevice = selectedDeviceId
    ? perDevice?.[selectedDeviceId]
    : null;

  const finalWeeklyKwh =
    activeDevice?.weekly_kwh ?? weeklyKwh;

  const finalMonthlyKwh =
    activeDevice?.monthly_kwh ?? monthlyKwh;

  const finalWeeklyCost =
    activeDevice?.weekly_cost ?? weeklyCost;

  const finalMonthlyCost =
    activeDevice?.monthly_cost ?? monthlyCost;

  // ===============================
  // TREND CALCULATION
  // ===============================
  const getTrend = (data = []) => {
    if (!data || data.length < 2) return 0;

    const first = Number(data[0]?.actual ?? 0);
    const last = Number(data[data.length - 1]?.actual ?? 0);

    if (first === 0) return 0;

    return ((last - first) / first) * 100;
  };

  const weeklyTrend = getTrend(actualVsPredicted);
  const monthlyTrend = weeklyTrend;

  // ===============================
  // UI DATA
  // ===============================
  const predictions = [
    {
      period: "This Week",
      cost: `₱${Number(finalWeeklyCost).toFixed(2)}`,
      estimatedUsage: `${Number(finalWeeklyKwh).toFixed(2)} kWh`,
      trend: weeklyTrend >= 0 ? "up" : "down",
      trendPercent: `${Math.abs(weeklyTrend).toFixed(2)}%`,
      trendLabel: activeDevice
        ? `Device: ${activeDevice.name}`
        : "All devices combined",
      bgColor: "bg-yellow-50",
    },
    {
      period: "This Month",
      cost: `₱${Number(finalMonthlyCost).toFixed(2)}`,
      estimatedUsage: `${Number(finalMonthlyKwh).toFixed(2)} kWh`,
      trend: monthlyTrend >= 0 ? "up" : "down",
      trendPercent: `${Math.abs(monthlyTrend).toFixed(2)}%`,
      trendLabel: "30-day projection",
      bgColor: "bg-blue-50",
    },
  ];

  // ===============================
  // CHART DATA
  // ===============================
  const chartData =
    dailyForecast?.length > 0
      ? dailyForecast
      : actualVsPredicted.map((d) => ({
          date: d.date,
          consumption: d.actual,
        }));

  const maxValue = Math.max(
    ...chartData.map((d) => Number(d.consumption || 0)),
    1
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-bold text-lg mb-1">
        Energy Cost Predictions
      </h3>

      <p className="text-gray-500 text-sm mb-6">
        {activeDevice
          ? `Device: ${activeDevice.name}`
          : "Based on all devices"}
      </p>

      <div className="grid grid-cols-2 gap-6">
        {predictions.map((pred, index) => (
          <div key={index} className={`${pred.bgColor} rounded-lg p-6`}>
            <p className="text-sm text-gray-600 mb-3">{pred.period}</p>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-gray-900">
                {pred.cost}
              </span>
              <span className="text-sm text-gray-500">estimated</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {pred.estimatedUsage}
              </span>

              <div className="flex items-center gap-1">
                {pred.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}

                <span
                  className={
                    pred.trend === "up"
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {pred.trendPercent}
                </span>
              </div>
            </div>

            {/* MINI CHART */}
            <div className="w-full h-12 bg-white bg-opacity-50 rounded flex items-end gap-1 p-1 mt-3">
              {chartData.slice(-7).map((d, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-400 rounded-t opacity-80"
                  style={{
                    height: `${((d.consumption || 0) / maxValue) * 100}%`,
                  }}
                />
              ))}
            </div>

            <p className="text-xs text-gray-600 mt-2">
              {pred.trendLabel}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}