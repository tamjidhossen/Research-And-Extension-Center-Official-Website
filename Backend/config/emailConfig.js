const nodemailer = require("nodemailer");
require("dotenv").config();
const fs = require('fs')
const path = require("path");

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

const sendMailToReviewer = async (to, name, token, expiresIn = 45) => {
  try {
    // Construct the review link
    const reviewLink = `${process.env.FRONTEND_URL}/review?token=${token}`;

    // Convert expiresIn to a more readable format if it's a number
    const expirationText = typeof expiresIn === "number" ? `${expiresIn} Days` : expiresIn;

    const emailContent = `
      <div style="background-color: #065f46; color: white; padding: 40px 30px; text-align: center;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0;">Research Proposal Review Request</h1>
        <p style="font-size: 18px; margin-top: 10px;">Jatiya Kabi Kazi Nazrul Islam University</p>
      </div>
      
      <div style="padding: 30px; background-color: #fafefd; color: #065f46; font-family: Arial, sans-serif;">
        <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">You have been selected as an esteemed reviewer for a research proposal submitted to
        the Research and Extension Center, JKKNIU. Please click the button below to evaluate it:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${reviewLink}" style="background-color: #056e51; color: white; padding: 15px 25px; text-decoration: none; font-size: 18px; border-radius: 5px; display: inline-block; font-weight: bold;">
            Review Proposal
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">Please note: The review link will expire in ${expirationText}.</p>

        <p style="font-size: 16px; line-height: 1.6;">If you have any questions or require further assistance, please don’t hesitate to contact us.</p>
      </div>

      <div style="background-color: #065f46; padding: 25px; text-align: center; font-size: 14px; color: white;">
        <p style="margin: 0;">For any inquiries, please contact us at:</p>
        <p style="margin: 10px 0;">
          <a href="mailto:habiburfbjkkniu@gmail.com" style="color: #fafefd; text-decoration: none;">habiburfbjkkniu@gmail.com</a>
        </p>
        <p style="margin: 0;">Best regards,<br/>
        <strong>Research And Extension Center</strong><br/>
        <span style="font-size: 14px;">Jatiya Kabi Kazi Nazrul Islam University</span></p>
      </div>
    `;

    const htmlContent = createResponsiveEmailTemplate(emailContent);

    const mailOptions = {
      from: `"Research And Extension Center" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject: "Research Proposal Review Request",
      text: `Dear ${name},\n\nYou have been selected as an esteemed reviewer for a research proposal submitted to
the Research and Extension Center, JKKNIU.\nPlease click the link below to evaluate it:\n${reviewLink}\n\nThis link will expire in ${expirationText}.`,
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

const sendUpdateRequestEmail = async (to, proposalTitle, message, updateLink, expiryDays, evaluationSheetUrls = []) => {
  try {
    // Format message text with proper HTML line breaks
    const formattedMessage = message
      .replace(/\n\d+\.\s/g, '</p><p style="margin-bottom: 8px;"><strong>•</strong> ') // Convert numbered list to bullet points
      .replace(/\n/g, '<br>'); // Convert remaining line breaks to <br> tags

    // Create HTML for evaluation sheets list - without reviewer numbering
    let evaluationSheetsHtml = '';
    if (evaluationSheetUrls && evaluationSheetUrls.length > 0) {
      evaluationSheetsHtml = `
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #065f46;">Evaluation Sheets:</h3>
          <ul style="list-style-type: none; padding-left: 10px;">
            ${evaluationSheetUrls.map((sheet) =>
        `<li style="margin-bottom: 12px;">
                <a href="${process.env.BACKEND_URL || 'http://localhost:5000'}/${sheet.url}" 
                   style="color: #065f46; text-decoration: none; display: inline-block; 
                   border: 1px solid #065f46; padding: 8px 15px; border-radius: 4px;">
                   <span style="vertical-align: middle;">📄</span> 
                   <span style="vertical-align: middle; margin-left: 5px;">View Evaluation Sheet</span>
                </a>
              </li>`
      ).join('')}
          </ul>
        </div>
      `;
    }

    // Rest of the email content with properly formatted message
    const emailContent = `
      <div style="background-color: #065f46; color: white; padding: 40px 30px; text-align: center;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0;">Research Proposal Update Request</h1>
        <p style="font-size: 18px; margin-top: 10px;">Jatiya Kabi Kazi Nazrul Islam University</p>
      </div>
      
      <div style="padding: 30px; background-color: #fafefd; color: #065f46; font-family: Arial, sans-serif;">
        <p style="font-size: 16px; line-height: 1.6;">Dear Researcher,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          The Research and Extension Center has requested updates to your proposal: <strong>${proposalTitle}</strong>
        </p>
        
        <div style="font-size: 16px; line-height: 1.6; border-left: 4px solid #065f46; padding: 15px; margin: 20px 0; background-color: #f0f9f6;">
          <p style="margin-top: 0;">${formattedMessage}</p>
        </div>
        
        ${evaluationSheetsHtml}
        
        <p style="font-size: 16px; line-height: 1.6;">
          Please click the button below to view details and submit your updates:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${updateLink}" style="background-color: #065f46; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Submit Updates
          </a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6;">
          This link will expire in <strong>${expiryDays} days</strong>. Please submit your updates before then.
        </p>
        
        <p style="font-size: 14px; line-height: 1.6; margin-top: 30px; color: #555;">
          If you have any questions, please contact us at:
          <a href="mailto:habiburfbjkkniu@gmail.com" style="color: #065f46; text-decoration: none;">habiburfbjkkniu@gmail.com</a>
        </p>
        
        <p style="margin: 0;">Best regards,<br/>
        <strong>Research And Extension Center</strong><br/>
        <span style="font-size: 14px;">Jatiya Kabi Kazi Nazrul Islam University</span></p>
      </div>
    `;

    const htmlContent = createResponsiveEmailTemplate(emailContent);

    // Create attachments array with unique filenames
    const attachments = evaluationSheetUrls
      .filter(sheet => sheet.url)
      .map((sheet, index) => ({
        filename: `evaluation_sheet_${index + 1}.pdf`, // Add unique numbering
        path: path.resolve(__dirname, '..', sheet.url)
      }));

    const mailOptions = {
      from: `"Research And Extension Center" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject: "Research Proposal Update Request",
      text: `Dear Researcher,\n\nThe Research and Extension Center has requested updates to your proposal: "${proposalTitle}"\n\n${message}\n\nPlease visit this link to submit your updates: ${updateLink}\n\nThis link will expire in ${expiryDays} days.\n\nBest regards,\nResearch And Extension Center\nJatiya Kabi Kazi Nazrul Islam University`,
      html: htmlContent,
      ...(attachments.length > 0 && { attachments })
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Update request email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending update request email:", error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetMail,
  sendMailToReviewer,
  sendMailInvoiceToReviewer,
  sendUpdateRequestEmail
};
