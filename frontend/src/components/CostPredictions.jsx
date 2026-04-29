import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

export default function CostPredictions({
  weeklyCost = 0,
  weeklyKwh = 0,
  monthlyCost = 0,
  monthlyKwh = 0,
}) {
  const data = [
    {
      title: "This Week",
      cost: weeklyCost,
      usage: weeklyKwh,
      max: 245,
      percent: 89,
      trend: "up",
      change: "5.2%",
      label: "Mon - Sun (current billing period)",
      color: "yellow",
    },
    {
      title: "This Month",
      cost: monthlyCost,
      usage: monthlyKwh,
      max: 920,
      percent: 67,
      trend: "down",
      change: "2.8%",
      label: "Feb 1 - Feb 28 (projected)",
      color: "blue",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-900">
        Energy Cost Predictions
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Weekly and monthly cost forecasts at ₱13.50/kWh
      </p>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.map((item, i) => (
          <div
            key={i}
            className="bg-green-50/40 border border-green-200 rounded-xl p-5 shadow-sm"
          >
            {/* Top Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-lg ${
                    item.color === "yellow"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <Calendar size={16} />
                </div>
                <span className="font-semibold text-gray-800">
                  {item.title}
                </span>
              </div>

              {/* Trend Badge */}
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
                ${
                  item.trend === "up"
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {item.trend === "up" ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {item.change}
              </div>
            </div>

            {/* Cost */}
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-3xl font-bold text-green-600">
                ₱{item.cost.toFixed(2)}
              </h3>
              <span className="text-sm text-gray-500">estimated</span>
            </div>

            {/* Usage */}
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                {item.usage}/{item.max} kWh
              </span>
              <span className="font-medium">{item.percent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full ${
                  item.color === "yellow"
                    ? "bg-yellow-400"
                    : "bg-blue-400"
                }`}
                style={{ width: `${item.percent}%` }}
              />
            </div>

            {/* Label */}
            <p className="text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}