function calcKwh(powerW, runtimeSeconds) {
    if (typeof powerW !== "number" || typeof runtimeSeconds !== "number") {
        return 0;
    }

    return Number(((powerW * runtimeSeconds) / 3600 / 1000).toFixed(4));
}

module.exports = {
    calcKwh
};