const nodemailer = require("nodemailer");

let transporter = null;

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error("EMAIL_USER or EMAIL_PASS is missing in .env");
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

  } catch (err) {
    console.error("Email transporter verification failed:");
    console.error(err);
  }
}

//Send email (used by anomalyListener)
async function sendAlertEmail(to, subject, html) {
  try {
    if (!transporter) {
      console.log("Transporter not initialized. Recreating...");
      transporter = createTransporter();
    }

    if (!transporter) {
      console.error("Cannot send email: transporter not available");
      return;
    }

    const info = await transporter.sendMail({
      from: `"WattWise Alerts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

  } catch (err) {
    console.error("Email sending failed:");
    console.error(err);
  }
}

module.exports = {
  sendAlertEmail,
  verifyTransporter,
};