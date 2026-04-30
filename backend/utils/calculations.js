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

function computePowerTrend(realtime_logs, debug = false) {
    const logs = Array.isArray(realtime_logs)
        ? realtime_logs
        : realtime_logs?.power || [];

    if (debug) {
        console.log("RAW realtime_logs:", JSON.stringify(realtime_logs, null, 2));
        console.log("Extracted logs:", logs);
    }

    const trend = logs.map((log, index) => {
        const point = {
            time: log?.timestamp || null,
            power: typeof log?.value === "number" ? log.value : 0
        };

        if (debug) {
            console.log(`Mapping [${index}]`, { input: log, output: point });
        }

        return point;
    });

    if (debug) {
        console.log("FINAL TREND:", trend);
    }

    return trend;
}

module.exports = {
    calcKwh,
    calculateCost,
    computePowerTrend
};