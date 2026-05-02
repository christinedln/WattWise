const nodemailer = require("nodemailer");

let transporter = null;

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error("❌ EMAIL_USER or EMAIL_PASS is missing in .env");
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });
}

async function verifyTransporter() {
  try {
    transporter = createTransporter();

    if (!transporter) return;

    await transporter.verify();

    console.log("✅ Email transporter verified and ready");
  } catch (err) {
    console.error("❌ Email transporter verification failed:");
    console.error(err);
  }
}

//Send email (used by anomalyListener)
async function sendAlertEmail(to, subject, html) {
  try {
    if (!transporter) {
      console.log("⚠️ Transporter not initialized. Recreating...");
      transporter = createTransporter();
    }

    if (!transporter) {
      console.error("❌ Cannot send email: transporter not available");
      return;
    }

    console.log("📤 Sending email...");
    console.log("FROM:", process.env.EMAIL_USER);
    console.log("TO:", to);

    const info = await transporter.sendMail({
      from: `"WattWise Alerts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", info.messageId);

  } catch (err) {
    console.error("❌ Email sending failed:");
    console.error(err);
  }
}

module.exports = {
  sendAlertEmail,
  verifyTransporter,
};