process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboard");
const devicesRoutes = require("./routes/devices");
const realtimeRoutes = require("./routes/realtimemonitor");
const predictionsRoutes = require("./routes/predictions");
const settingsRoutes = require("./routes/settings");
const alertsRoutes = require("./routes/alerts");
const { startAnomalyListener } = require("./services/anomalyListener");
const { verifyTransporter } = require("./utils/emailService");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/predictions", predictionsRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/realtime", realtimeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/alerts", alertsRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "WattWise API running",
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  verifyTransporter();
  startAnomalyListener();
});