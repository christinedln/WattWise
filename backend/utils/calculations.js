// ===============================
// kWh calculation
// ===============================
function calcKwh(powerW, runtimeSeconds) {
    return Number(((powerW * runtimeSeconds) / 3600 / 1000).toFixed(4));
}


// ===============================
// Alternative kWh function (same logic as Python version)
// ===============================
function calculateKwh(powerWatts, runtimeSeconds) {
    return Number(((powerWatts * runtimeSeconds) / 3600000).toFixed(4));
}


// ===============================
// Cost calculation
// ===============================
function calculateCost(kwh, rate) {
    return Number((kwh * rate).toFixed(2));
}


// ===============================
// Power trend (placeholder for real-time graph)
// ===============================
function computePowerTrend(devices) {
    // NOTE: devices parameter is unused (same as Python placeholder)

    return [
        { time: "04:45", power: 150 },
        { time: "04:50", power: 165 },
        { time: "04:55", power: 175 },
        { time: "05:00", power: 192 },
    ];
}


// EXPORTS
module.exports = {
    calcKwh,
    calculateKwh,
    calculateCost,
    computePowerTrend
};