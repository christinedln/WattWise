const express = require("express");
const router = express.Router();

const authRequired = require("../utils/auth");
const { db } = require("../firebase_config");

// ===============================
// SAFE NUMBER
// ===============================
function safe(n) {
    return Number.isFinite(n) ? n : 0;
}

// ===============================
// GET DEVICE RATE
// ===============================
function getDeviceRate(device) {
    return device?.settings?.electricity_rate ?? 12.5;
}

// ===============================
// GET DEVICE LOGS
// ===============================
async function getDeviceLogs(userId, deviceId) {
    const logsSnap = await db
        .collection("user")
        .doc(userId)
        .collection("devices")
        .doc(deviceId)
        .collection("energy_logs")
        .get();

    const logs = [];

    logsSnap.forEach(doc => {
        const d = doc.data();

        if (!d.timestamp || d.consumption == null) return;

        const time = new Date(d.timestamp).getTime();
        if (!Number.isFinite(time)) return;

        logs.push({
            time,
            consumption: Number(d.consumption) || 0
        });
    });

    return logs;
}

// ===============================
// GROUP BY DATE
// ===============================
function groupByDate(logs, daysBack = 7) {
    const daily = {};

    const now = Date.now();
    const start = now - daysBack * 24 * 60 * 60 * 1000;

    for (const log of logs) {
        if (log.time < start) continue;

        const d = new Date(log.time);

        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        if (!daily[key]) daily[key] = 0;

        daily[key] += log.consumption; //daily energy group by date;total electricity used in 1 day (daily kwh = summation of of consumption logs per day) 
    }

    return daily;
}

// ===============================
// FORECAST
// ===============================
function computeForecast(daily) {
    const values = Object.values(daily);

    if (!values.length) return { avg: 0 };

    const total = values.reduce((a, b) => a + b, 0);
    const days = Object.keys(daily).length || 1;

    return {
        avg: total / days ///AVG DAILY kwH;; normal electricity use per day (total daily usage divided by number of days)
    };
}

// ===============================
// MAIN ROUTE
// ===============================
router.get("/summary", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const devicesSnap = await db
            .collection("user")
            .doc(userId)
            .collection("devices")
            .get();

        const per_device = {};

        let totalWeekly = 0;
        let totalMonthly = 0;

        // ===============================
        // BUILD GLOBAL DAILY MAP (FOR CHARTS)
        // ===============================
        const globalDaily = {};
        const globalActual = [];

        for (const device of devicesSnap.docs) {
            const deviceId = device.id;
            const deviceData = device.data();

            const rate = getDeviceRate(deviceData);

            const logs = await getDeviceLogs(userId, deviceId);
            const daily = groupByDate(logs, 7);
            const forecast = computeForecast(daily);

            const weekly_kwh = forecast.avg * 7; ////weekly prediction; AVG DAILY kWh times 7
            const monthly_kwh = forecast.avg * 30; ////monthly prediction; AVG DAILY kWh times 30
            
            ///cost calculation (kWh x electricty rate)
            const weekly_cost = weekly_kwh * rate; 
            const monthly_cost = monthly_kwh * rate;

            per_device[deviceId] = {
                name: deviceData.name || deviceId,
                rate,
                weekly_kwh: safe(weekly_kwh),
                monthly_kwh: safe(monthly_kwh),
                weekly_cost: safe(weekly_cost),
                monthly_cost: safe(monthly_cost)
            };

            totalWeekly += weekly_kwh; //total weekly usage of all devices
            totalMonthly += monthly_kwh; //total month;y usage of all devices

            // ===============================
            // MERGE FOR GLOBAL CHARTS
            // ===============================
            for (const [date, value] of Object.entries(daily)) {
                globalDaily[date] = (globalDaily[date] || 0) + value;
            }

            for (const [date, value] of Object.entries(daily)) {
                globalActual.push({ date, value });
            }
        }

        const rateFallback = 12.5;

        // ===============================
        // DAILY FORECAST (FIXED)
        // ===============================
        const avg = totalWeekly / 7 || 0; ////global avg daily; this means typical daily usage; Convert weekly total back into per day average

        const today = new Date();

        const daily_forecast = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);

            return {
                date: d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit"
                }),
                consumption: avg,   //Forecast per day=Avg Daily; Repeat same value for next 7 days; Prediction assumes nothing changes
                cost: avg * rateFallback
            };
        });

        // ===============================
        // ACTUAL VS PREDICTED (FIXED)
        // ===============================
        const actual_vs_predicted = Object.entries(globalDaily)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, value]) => ({
                date: new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit"
                }),
                actual: value,
                predicted: avg
            }));

        // ===============================
        // RESPONSE
        // ===============================
        return res.json({
            rate_per_kwh: rateFallback,

            weekly_predicted_kwh: safe(totalWeekly),
            monthly_predicted_kwh: safe(totalMonthly),

            weekly_predicted_cost: safe(totalWeekly * rateFallback),
            monthly_predicted_cost: safe(totalMonthly * rateFallback),

            per_device,

            daily_forecast,
            actual_vs_predicted
        });

    } catch (err) {
        console.error("Predictions error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;