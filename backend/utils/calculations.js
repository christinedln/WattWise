function calcKwh(powerW, runtimeSeconds) {
    return Number(((powerW * runtimeSeconds) / 3600 / 1000).toFixed(4));
}

function calculateCost(kwh, rate) {
    return Number((kwh * rate).toFixed(2));
}

function computePowerTrend(realtime_logs) {
    console.log(" RAW realtime_logs received:");
    console.log(JSON.stringify(realtime_logs, null, 2));

    const logs = realtime_logs?.power || [];

    console.log(" Extracted power logs:");
    console.log(logs);

    const trend = logs.map((log, index) => {
        const point = {
            time: log.timestamp,
            power: log.value
        };

        console.log(`Mapping [${index}]`, {
            input: log,
            output: point
        });

        return point;
    });

    console.log("FINAL POWER TREND:");
    console.log(trend);

    return trend;
}

module.exports = {
    calcKwh,
    calculateCost,
    computePowerTrend
};