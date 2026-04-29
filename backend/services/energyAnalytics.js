const { db } = require("../firebase_config");

// ===============================
// GET DAILY CONSUMPTION (LAST N DAYS)
// ===============================
async function getDailyConsumption(userId, days = 7) {
    const logsRef = db
        .collection("energy_logs")
        .doc(userId)
        .collection("logs");

    const snapshot = await logsRef.get();

    const daily = {};
    const end = Date.now();
    const start = end - days * 24 * 60 * 60 * 1000;

    console.log("📊 TOTAL LOGS FOUND:", snapshot.size);

    snapshot.forEach(doc => {
        const data = doc.data();

        // Safety checks
        if (!data.timestamp || data.consumption == null) return;

        let logTime;

        if (data.timestamp?.toDate) {
    // Firestore Timestamp
            logTime = data.timestamp.toDate().getTime();
        } else {
    // String timestamp
            logTime = new Date(data.timestamp).getTime();
        }

        if (!Number.isFinite(logTime)) return;

        console.log("LOG:", {
            raw: data.timestamp,
            parsed: logTime,
            consumption: data.consumption
        });


        if (logTime < start || logTime > end) return;

        const d = new Date(logTime);
const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        const consumption = Number(data.consumption);

        if (!Number.isFinite(consumption)) return;

        if (!daily[dateKey]) {
            daily[dateKey] = 0;
        }

        daily[dateKey] += consumption;
    });

    console.log("📈 DAILY AGGREGATED DATA:", daily);
    

    return daily;
}

// ===============================
// COMPUTE FORECAST + COST
// ===============================
function computeForecast(dailyData, rate) {
    const values = Object.values(dailyData);

    if (!values.length) {
        return {
            average_daily_kwh: 0,
            weekly_kwh: 0,
            monthly_kwh: 0,
            weekly_cost: 0,
            monthly_cost: 0
        };
    }

    const total = values.reduce((sum, v) => sum + v, 0);
    const avg = total / values.length;

    const weekly_kwh = avg * 7;
    const monthly_kwh = avg * 30;

    return {
        average_daily_kwh: Number(avg.toFixed(4)),

        weekly_kwh: Number(weekly_kwh.toFixed(2)),
        monthly_kwh: Number(monthly_kwh.toFixed(2)),

        weekly_cost: Number((weekly_kwh * rate).toFixed(2)),
        monthly_cost: Number((monthly_kwh * rate).toFixed(2))
    };
}

module.exports = {
    getDailyConsumption,
    computeForecast
};