const express = require("express");
const router = express.Router();

const { getDevices } = require("../services/data_service");
const { mergeDeviceData } = require("../utils/mapper");
const { calcKwh } = require("../utils/calculations");
const authRequired = require("../utils/auth");

// SUMMARY
router.get("/summary", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const enrichedDevices = await mergeDeviceData(userId) || [];

        const devices = await getDevices(userId) || [];

        const activeCount = enrichedDevices.filter(
            d => d.status === "active"
        ).length;
        
        const totalEnergyKwh = Number(
            enrichedDevices
                .reduce((sum, d) => sum + (Number(d.consumption) || 0), 0)
                .toFixed(4)
        );

        const grandTotal = totalEnergyKwh || 1;

        // DEVICE BREAKDOWN 
        const deviceConsumption = enrichedDevices.map(d => {
            const kwh = Number(d.consumption) || 0;

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

        // USE DEVICE SETTINGS 
        const ratePerKwh =
            enrichedDevices?.[0]?.settings?.electricity_rate ?? 12.5;

        // TOTAL CONSUMPTION 
        const totalConsumption = enrichedDevices.reduce(
            (sum, d) => sum + (Number(d.consumption) || 0),
            0
        );


        if (!enrichedDevices.length || !devices.length) {
            return res.json({
                active_devices: 0,
                total_devices: 0,
                live_readings: [],
                device_consumption: [],
                total_energy_kwh: 0,
                weekly_predicted_kwh: 0,
                weekly_predicted_cost: 0,
                monthly_predicted_kwh: 0,
                monthly_predicted_cost: 0,
                rate_per_kwh: 12.5,
            });
        }


        const totalRuntimeHours = Math.max(
            devices.reduce(
                (sum, d) => sum + (d.runtime || 0),
                0
            ) / 3600,
            1
        );

        const kwhPerHour = totalConsumption / totalRuntimeHours;

        const dailyKwh = Number((kwhPerHour * 24).toFixed(4));
        const weeklyKwh = Number((dailyKwh * 7).toFixed(4));
        const monthlyKwh = Number((dailyKwh * 30).toFixed(4));

        const weeklyCost = Number((weeklyKwh * ratePerKwh).toFixed(2));
        const monthlyCost = Number((monthlyKwh * ratePerKwh).toFixed(2));

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