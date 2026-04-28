import { TrendingUp, TrendingDown } from 'lucide-react';

export default function CostPredictions({
  weeklyCost = 0,
  weeklyKwh = 0,
  monthlyCost = 0,
  monthlyKwh = 0,
}) {
  const predictions = [
    {
      period: 'This Week',
      cost: `₱${weeklyCost.toFixed(2)}`,
      estimatedUsage: `${weeklyKwh} kWh`,
      trend: 'up',
      trendPercent: '3.2%',
      trendLabel: 'Mon - Sun (current billing period)',
      bgColor: 'bg-yellow-50',
    },
    {
      period: 'This Month',
      cost: `₱${monthlyCost.toFixed(2)}`,
      estimatedUsage: `${monthlyKwh} kWh`,
      trend: 'up',
      trendPercent: '2.3%',
      trendLabel: '30-day projection',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      {/* Header */}
      <h3 className="font-bold text-lg mb-1">Energy Cost Predictions</h3>
      <p className="text-gray-500 text-sm mb-6">
        Daily predicted costs based on current usage
      </p>

      {/* ✅ Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {predictions.map((pred, index) => (
          <div
            key={index}
            className={`${pred.bgColor} rounded-lg p-4 sm:p-5 md:p-6`}
          >
            {/* Period */}
            <p className="text-sm text-gray-600 mb-2">{pred.period}</p>

            {/* Cost */}
            <div className="flex flex-wrap items-baseline gap-2 mb-4">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {pred.cost}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                estimated
              </span>
            </div>

            {/* Details */}
            <div className="space-y-3">

              {/* Usage + Trend */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm text-gray-600">
                  {pred.estimatedUsage}
                </span>

                <div className="flex items-center gap-1">
                  {pred.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  )}
                  <span
                    className={`text-sm ${
                      pred.trend === 'up'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {pred.trendPercent}
                  </span>
                </div>
              </div>

              {/* ✅ Responsive Chart */}
              <div className="w-full h-10 sm:h-12 bg-white/60 rounded flex items-end gap-1 p-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t opacity-70"
                    style={{ height: `${30 + Math.random() * 40}%` }}
                  />
                ))}
              </div>

              {/* Label */}
              <p className="text-xs text-gray-600">
                {pred.trendLabel}
              </p>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}