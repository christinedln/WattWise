function calcKwh(powerW, runtimeSeconds) {
    if (typeof powerW !== "number" || typeof runtimeSeconds !== "number") {
        return 0;
    }

    return Number(((powerW * runtimeSeconds) / 3600 / 1000).toFixed(4));
}

function calculateCost(kwh, rate) {
    if (typeof kwh !== "number" || typeof rate !== "number") {
        return 0;
    }

    return Number((kwh * rate).toFixed(2));
}

function computePowerTrend(realtime_logs) {
    const logs = realtime_logs?.power || [];

    const trend = logs.map((log, index) => {
        const point = {
            time: log?.timestamp || null,
            power: typeof log?.value === "number" ? log.value : 0
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