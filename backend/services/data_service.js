const { db } = require("../firebase_config");

// DEVICE REGISTRY (same as Python object)
const registry = {
    "1": {
        name: "Electric Fan",
        type: "Appliance",
        location: "Bedroom"
    },
    "2": {
        name: "Rice Cooker",
        type: "Appliance",
        location: "Kitchen"
    }
};

// RATE CONFIG
const ratePerKwh = 12.5;


// ===============================
// GET DEVICES
// ===============================
async function getDevices(userId) {
    try {
        console.log("\n================ FIRESTORE DEVICE FETCH ================");
        console.log("USER ID:", userId);

        const snapshot = await db
            .collection("devices")
            .doc(userId)
            .collection("user_devices")
            .get();

        const devices = [];

        snapshot.forEach(doc => {
            let d = doc.data();

            console.log("RAW DEVICE DOC:", doc.id, d);

            d.device_id = doc.id;

            let enabled = d.enabled ?? true;

            if (typeof enabled === "string") {
                enabled = enabled.toLowerCase() === "true";
            }

            d.enabled = enabled;

            devices.push(d);
        });


        return devices;

    } catch (error) {
        console.error("Devices fetch error:", error);
        return [];
    }
}


// ===============================
// GET REGISTRY
// ===============================
function getRegistry() {
    return registry;
}


// ===============================
// GET RATE
// ===============================
function getRate(userId) {
    return ratePerKwh;
}


// EXPORTS
module.exports = {
    getDevices,
    getRegistry,
    getRate
};