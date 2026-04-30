const express = require("express");
const router = express.Router();

const { getDevices, getRate } = require("../services/data_service");
const { mergeDeviceData } = require("../utils/mapper");
const { calcKwh } = require("../utils/calculations");
const authRequired = require("../utils/auth");
const { getDailyConsumption, computeForecast } = require("../services/energyAnalytics");

// SUMMARY
router.get("/summary", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const enrichedDevices = await mergeDeviceData(userId);

        const devices = (await getDevices(userId)).filter(
            d => d.enabled !== false
        );

        const ratePerKwh = await getRate(userId);

        // STATS
        const activeCount = enrichedDevices.filter(
            d => d.status === "active"
        ).length;

        // ENERGY TOTAL
        const totalEnergyKwh = Number(
            enrichedDevices
                .reduce((sum, d) => sum + calcKwh(d.power, d.runtime || 0), 0)
                .toFixed(4)
        );

        const grandTotal = totalEnergyKwh || 1;

        // DEVICE BREAKDOWN
        const deviceConsumption = enrichedDevices.map(d => {
            const power =
                devices.find(x => x.device_id === d.device_id)?.power || 0;

            const runtime =
                devices.find(x => x.device_id === d.device_id)?.runtime || 0;

            const kwh = calcKwh(power, runtime);

            return {
                device_id: d.device_id,
                name: d.name,

                kwh: kwh,

                percent_of_total: Number(
                    ((kwh / grandTotal) * 100).toFixed(1)
                ),

                voltage: d.voltage,
                current: d.current,
                power: d.power,
                status: d.status,
            };
        });

        // PREDICTIONS
        const dailyData   = await getDailyConsumption(userId);
        const forecast    = computeForecast(dailyData, ratePerKwh);

        const weeklyKwh   = Number(forecast.weekly_kwh.toFixed(4));
        const monthlyKwh  = Number(forecast.monthly_kwh.toFixed(4));
        const weeklyCost  = Number(forecast.weekly_cost.toFixed(2));
        const monthlyCost = Number(forecast.monthly_cost.toFixed(2));

        // RESPONSE
        res.json({
            active_devices: activeCount,
            total_devices: devices.length,

            live_readings: enrichedDevices,
            device_consumption: deviceConsumption,

            total_energy_kwh: totalEnergyKwh,
            weekly_predicted_kwh: weeklyKwh,
            weekly_predicted_cost: weeklyCost,
            monthly_predicted_kwh: monthlyKwh,
            monthly_predicted_cost: monthlyCost,

            rate_per_kwh: ratePerKwh,
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;