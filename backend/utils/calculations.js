function calcKwh(powerW, runtimeSeconds) {
    return Number(((powerW * runtimeSeconds) / 3600 / 1000).toFixed(4));
}

function calculateCost(kwh, rate) {
    return Number((kwh * rate).toFixed(2));
}

function computePowerTrend(realtime_logs) {
    const logs = realtime_logs?.power || [];

    const trend = logs.map((log, index) => {
        const point = {
            time: log.timestamp,
            power: log.value
        };

        return point;
    });

    return trend;
}

module.exports = {
    calcKwh,
    calculateCost,
    computePowerTrend
};