// ===============================
// ISO CURRENT TIME
// ===============================
function nowTime() {
    return new Date().toISOString();
}


// ===============================
// TIMESTAMP (same behavior as nowTime)
// ===============================
function timestamp() {
    return new Date().toISOString();
}


// EXPORTS
module.exports = {
    nowTime,
    timestamp
};