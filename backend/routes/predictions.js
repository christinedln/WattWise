const express = require("express");
const router = express.Router();

const authRequired = require("../utils/auth");
const { getRate } = require("../services/data_service");

// ===============================
// ANALYTICS
// ===============================
const {
    getDailyConsumption,
    computeForecast
} = require("../services/energyAnalytics");

// ===============================
// DEBUG: FILE LOADED CHECK
// ===============================
console.log("📦 predictions.js LOADED");

// ===============================
// SAFE NUMBER HELPER
// ===============================
function safe(n) {
    return Number.isFinite(n) ? n : 0;
}

// ===============================
// SUMMARY ROUTE
// ===============================
router.get("/summary", (req, res, next) => {
    console.log("🔥 RAW REQUEST HIT (NO AUTH YET)");
    next();
}, authRequired, async (req, res) => {

    console.log("\n🔥 PREDICTIONS ROUTE HIT");

    const userId = req.user_id;

    console.log("USER ID:", userId);

    try {
        // ===============================
        // RATE
        // ===============================
        const rate = await getRate(userId);
        console.log("RATE PER KWH:", rate);

        // ===============================
        // DAILY DATA (LAST 7 DAYS EXPECTED)
        // ===============================
        const dailyData = await getDailyConsumption(userId);
        console.log("🔥 DAILY DATA FROM ANALYTICS:", dailyData);

        console.log("RAW DAILY DATA:", dailyData);

        const dailyEntries = Object.entries(dailyData)
            .sort(([a], [b]) => new Date(a) - new Date(b)) // fix date sorting
            .map(([date, consumption]) => ({
                date,
                consumption: safe(Number(consumption)).toFixed(4),
                cost: safe(Number(consumption) * rate).toFixed(2) //Cost = Energy × Rate
            }));

        console.log("DAILY ENTRIES:", dailyEntries);

        // ===============================
        // EMPTY CHECK
        // ===============================
        if (!dailyEntries.length) {
            console.log("⚠ NO DATA FOUND");

            return res.json({
                weekly_predicted_kwh: 0,
                weekly_predicted_cost: 0,
                monthly_predicted_kwh: 0,
                monthly_predicted_cost: 0,
                rate_per_kwh: rate,
                daily_forecast: [],
                actual_vs_predicted: [],
                raw_daily_data: []
            });
        }

        // ===============================
        // FORECAST COMPUTATION
        // ===============================
        const forecast = computeForecast(dailyData, rate);

        const avgDailyKwh = safe(forecast.average_daily_kwh);

        console.log("AVG DAILY KWH:", avgDailyKwh);

        // ===============================
        // WEEK / MONTH
        // ===============================
        const weeklyKwh = avgDailyKwh * 7;
        const monthlyKwh = avgDailyKwh * 30;

        const weeklyCost = weeklyKwh * rate;
        const monthlyCost = monthlyKwh * rate;

        console.log("WEEKLY KWH:", weeklyKwh);
        console.log("WEEKLY COST:", weeklyCost);
        console.log("MONTHLY COST:", monthlyCost);

        // ===============================
        // NEXT 7 DAYS FORECAST
        // ===============================
        const today = new Date();

        const dailyForecast = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);

            return {
                date: d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit"
                }),
                consumption: Number(avgDailyKwh.toFixed(4)),
                cost: Number((avgDailyKwh * rate).toFixed(2))
            };
        });

        // ===============================
        // ACTUAL VS PREDICTED
        // ===============================
        const last7 = dailyEntries.slice(-7);

        const actual_vs_predicted = last7.map((d) => ({
            date: d.date,
            actual: Number(d.consumption),
            predicted: Number(avgDailyKwh.toFixed(4))
        }));

        console.log("✔ PREDICTION SUCCESS");

        // ===============================
        // RESPONSE
        // ===============================
        return res.json({
            weekly_predicted_kwh: safe(weeklyKwh),
            weekly_predicted_cost: safe(weeklyCost),

            monthly_predicted_kwh: safe(monthlyKwh),
            monthly_predicted_cost: safe(monthlyCost),

            rate_per_kwh: rate,

            daily_forecast: dailyForecast,
            actual_vs_predicted,

            raw_daily_data: dailyEntries
        });

    } catch (error) {
        console.error("❌ Predictions error:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;