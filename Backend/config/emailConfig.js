const nodemailer = require("nodemailer");
require("dotenv").config();
const fs = require('fs')

// Configure transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
  },
});

const createResponsiveEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        margin: auto !important;
      }
      .content-padding {
        padding: 15px !important;
      }
      .table-responsive {
        overflow-x: auto !important;
      }
      .mobile-text {
        font-size: 14px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <div class="email-container" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    ${content}
  </div>
</body>
</html>
`;

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetLink - Password reset link
 * @returns {Promise} - Resolves when the email is sent successfully
 */
const sendPasswordResetMail = async (to, resetLink) => {
  try {
    const emailContent = `
      <div style="background-color: #1565C0; color: white; padding: 25px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
      </div>
      <div style="padding: 30px; color: #333;">
        <p style="font-size: 16px; line-height: 1.5;">Dear User,</p>
        <p style="font-size: 16px; line-height: 1.5;">You have requested to reset your password. Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #1565C0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">If you did not request this, please ignore this email. This link will expire in 1 hour.</p>
      </div>
      <div style="background-color: #f1f1f1; padding: 25px; text-align: center;">
        <p style="margin: 0 0 15px 0;">For any inquiries, please contact us at:<br/>
        <a href="mailto:alumnijkkniucse@gmail.com" style="color: #1565C0; text-decoration: none;">alumnijkkniucse@gmail.com</a></p>
        <p style="margin: 0;">Best regards,<br/>
        <strong>CSE Alumni Community</strong><br/>
        <span style="font-size: 14px;">Jatiya Kabi Kazi Nazrul Islam University</span></p>
      </div>
    `;

    const htmlContent = createResponsiveEmailTemplate(emailContent);

    const mailOptions = {
      from: `"RESEARCH EXTENSION CENTER" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject: "Password Reset Request",
      text: `Dear User, \n\nYou have requested to reset your password. Please use the following link: ${resetLink} \n\nIf you did not request this, please ignore this email. This link will expire in 1 hour.`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

const sendMailToReviewer = async (to, name, token) => {
  try {
    // Construct the review link
    const reviewLink = `${process.env.FRONTEND_URL}/review?token=${token}`;

    const emailContent = `
      <div style="background-color: #1565C0; color: white; padding: 25px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Research Proposal Review Request</h1>
      </div>
      <div style="padding: 30px; color: #333;">
        <p style="font-size: 16px; line-height: 1.5;">Dear ${name},</p>
        <p style="font-size: 16px; line-height: 1.5;">You have been assigned to review a research proposal. Please click the button below to provide your evaluation:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${reviewLink}" style="background-color: #1565C0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Proposal</a>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">This link will expire in 24 hours.</p>
      </div>
      <div style="background-color: #f1f1f1; padding: 25px; text-align: center;">
        <p style="margin: 0 0 15px 0;">For any inquiries, please contact us at:<br/>
        <a href="mailto:alumnijkkniucse@gmail.com" style="color: #1565C0; text-decoration: none;">alumnijkkniucse@gmail.com</a></p>
        <p style="margin: 0;">Best regards,<br/>
        <strong>RESEARCH EXTENSION CENTER</strong><br/>
        <span style="font-size: 14px;">Jatiya Kabi Kazi Nazrul Islam University</span></p>
      </div>
    `;

    const htmlContent = createResponsiveEmailTemplate(emailContent);

    const mailOptions = {
      from: `"RESEARCH EXTENSION CENTER" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject: "Research Proposal Review Request",
      text: `Dear ${name},\n\nYou have been assigned to review a research proposal. Please use the following link: ${reviewLink} \n\nThis link will expire in 24 hours.`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending reviewer email:", error);
    throw error;
  }
};

const sendMailInvoiceToReviewer = async (reviewerEmail, filePath, uploadUrl) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: reviewerEmail,
      subject: "Invoice for Review Work",
      text: `Dear Reviewer,\n\nPlease find attached the invoice for your review work.\n\nAfter signing, please upload it using the following secure link:\n${uploadUrl}\n\nBest regards,\nResearch Proposal System`,
      attachments: [
        {
          filename: "invoice.pdf",
          path: filePath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    // console.log("Invoice email sent successfully.");
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error sending invoice email:", error);
  }
};

module.exports = {
  sendPasswordResetMail,
  sendMailToReviewer,
  sendMailInvoiceToReviewer
};
