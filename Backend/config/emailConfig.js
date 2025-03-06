const nodemailer = require("nodemailer");
require("dotenv").config();
const fs = require('fs')
const path = require("path");

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
    // Construct the email content with the new color scheme
    const emailContent = `
      <div style="background-color: #065f46; color: white; padding: 40px 30px; text-align: center;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0;">Password Reset Request</h1>
        <p style="font-size: 18px; margin-top: 10px;">Jatiya Kabi Kazi Nazrul Islam University</p>
      </div>
      
      <div style="padding: 30px; background-color: #fafefd; color: #065f46; font-family: Arial, sans-serif;">
        <p style="font-size: 16px; line-height: 1.6;">Dear User,</p>
        <p style="font-size: 16px; line-height: 1.6;">You have requested to reset your password. Please click the button below to reset your password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #056e51; color: white; padding: 15px 25px; text-decoration: none; font-size: 18px; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">If you did not request this, please ignore this email. This link will expire in 1 hour.</p>
      </div>

      <div style="background-color: #065f46; padding: 25px; text-align: center; font-size: 14px; color: white;">
        <p style="margin: 0;">For any inquiries, please contact us at:</p>
        <p style="margin: 10px 0;">
          <a href="mailto:alumnijkkniucse@gmail.com" style="color: #fafefd; text-decoration: none;">alumnijkkniucse@gmail.com</a>
        </p>
        <p style="margin: 0;">Best regards,<br/>
        <strong>CSE Alumni Community</strong><br/>
        <span style="font-size: 14px;">Jatiya Kabi Kazi Nazrul Islam University</span></p>
      </div>
    `;

    // Create responsive template for mobile-friendliness
    const htmlContent = createResponsiveEmailTemplate(emailContent);

    const mailOptions = {
      from: `"CSE Alumni Community" <${process.env.EMAIL_USERNAME}>`,
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
      <div style="background-color: #065f46; color: white; padding: 40px 30px; text-align: center;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0;">Research Proposal Review Request</h1>
        <p style="font-size: 18px; margin-top: 10px;">Jatiya Kabi Kazi Nazrul Islam University</p>
      </div>
      
      <div style="padding: 30px; background-color: #fafefd; color: #065f46; font-family: Arial, sans-serif;">
        <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">You have been selected as the reviewer for an important research proposal. Please click the button below to provide your evaluation:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${reviewLink}" style="background-color: #056e51; color: white; padding: 15px 25px; text-decoration: none; font-size: 18px; border-radius: 5px; display: inline-block; font-weight: bold;">
            Review Proposal
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">Please note: The review link will expire in 24 hours.</p>

        <p style="font-size: 16px; line-height: 1.6;">Should you have any questions or require further assistance, please do not hesitate to contact us.</p>
      </div>

      <div style="background-color: #065f46; padding: 25px; text-align: center; font-size: 14px; color: white;">
        <p style="margin: 0;">For any inquiries, please contact us at:</p>
        <p style="margin: 10px 0;">
          <a href="mailto:alumnijkkniucse@gmail.com" style="color: #fafefd; text-decoration: none;">alumnijkkniucse@gmail.com</a>
        </p>
        <p style="margin: 0;">Best regards,<br/>
        <strong>Research Extension Center</strong><br/>
        <span style="font-size: 14px;">Jatiya Kabi Kazi Nazrul Islam University</span></p>
      </div>
    `;

    const htmlContent = createResponsiveEmailTemplate(emailContent);

    const mailOptions = {
      from: `"Research Extension Center" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject: "Research Proposal Review Request",
      text: `Dear ${name},\n\nYou have been assigned to review a research proposal. Please use the following link: ${reviewLink} \n\nThis link will expire in 7 Days.`,
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
    // Convert relative path to absolute path
    const absoluteFilePath = path.resolve(__dirname, filePath);

    // Check if file exists before attaching
    if (!fs.existsSync(absoluteFilePath)) {
      console.error("Invoice file not found:", absoluteFilePath);
      return;
    }

    const emailContent = `
      <div style="background-color: #065f46; color: white; padding: 40px 30px; text-align: center;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0;">Invoice for Review Work</h1>
        <p style="font-size: 18px; margin-top: 10px;">Jatiya Kabi Kazi Nazrul Islam University</p>
      </div>

      <div style="padding: 30px; background-color: #fafefd; color: #065f46; font-family: Arial, sans-serif;">
        <p style="font-size: 16px; line-height: 1.6;">Dear Reviewer,</p>
        <p style="font-size: 16px; line-height: 1.6;">We appreciate your contribution to reviewing the research proposal. Please find attached the invoice for your review work.</p>

        <p style="font-size: 16px; font-weight: bold; color: #065f46;">📎 Attachment Included:</p>
        <ul style="background-color: #ffffff; padding: 15px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
          <li style="font-size: 16px; color: #065f46;">Invoice File: <strong>invoice.pdf</strong></li>
        </ul>

        <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">After signing, please upload the invoice using the secure link below:</p>

        <div style="text-align: center; margin-top: 20px;">
          <a href="${uploadUrl}" target="_blank" style="background-color: #056e51; color: white; padding: 15px 25px; text-decoration: none; font-size: 18px; border-radius: 5px; display: inline-block; font-weight: bold;">
            Upload Signed Invoice
          </a>
        </div>
      </div>

      <div style="background-color: #065f46; padding: 25px; text-align: center; font-size: 14px; color: white;">
        <p style="margin: 0;">For any inquiries, please contact us at:</p>
        <p style="margin: 10px 0;">
          <a href="mailto:alumnijkkniucse@gmail.com" style="color: #fafefd; text-decoration: none;">alumnijkkniucse@gmail.com</a>
        </p>
        <p style="margin: 0;">Best regards,<br/>
        <strong>Research Proposal System</strong><br/>
        <span style="font-size: 14px;">Jatiya Kabi Kazi Nazrul Islam University</span></p>
      </div>
    `;

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: reviewerEmail,
      subject: "Invoice for Review Work",
      text: `Dear Reviewer,\n\nWe appreciate your contribution to reviewing the research proposal. The invoice is attached to this email.\n\nAfter signing, please upload it using the secure link:\n${uploadUrl}\n\nBest regards,\nResearch Proposal System`,
      html: emailContent,
      attachments: [
        {
          filename: "invoice.pdf",
          path: absoluteFilePath, // ✅ Absolute path used here
          contentType: "application/pdf"
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log("Invoice email sent successfully to:", reviewerEmail);
  } catch (error) {
    console.error("Error sending invoice email:", error);
  }
};




module.exports = {
  sendPasswordResetMail,
  sendMailToReviewer,
  sendMailInvoiceToReviewer
};
