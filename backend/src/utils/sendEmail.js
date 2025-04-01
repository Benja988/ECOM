import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;

// Validate required environment variables
if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
  throw new Error("❌ Missing required email environment variables.");
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT), // Ensure it's a number
  secure: EMAIL_PORT === "465", // Convert string to boolean
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Prevent certificate validation errors
  },
});

/**
 * Send an email using Nodemailer.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} html - HTML content of the email.
 * @returns {Promise<boolean>} - Returns true if the email is sent successfully, otherwise false.
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"EMP" <${EMAIL_FROM}>`, // Use EMAIL_FROM instead of EMAIL_USER
      to,
      subject,
      text: html.replace(/<[^>]+>/g, ""), // Strip HTML tags as fallback
      html,
    });

    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message || error}`);
    return false;
  }
};