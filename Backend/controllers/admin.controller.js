const fs = require('fs');
const ProposalDocument = require('../models/proposal.document.model.js');
const ProposalUpdateRequest = require('../models/update.request.model.js');
const { TeacherProposal } = require('../models/teacher.proposal.model.js');
const { StudentProposal } = require('../models/student.proposal.model.js');
const Admin = require('../models/admin.model.js');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendPasswordResetMail } = require("../config/emailConfig.js");
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }


        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
        }

        // Create a new admin instance
        const admin = new Admin({
            name,
            email,
            password,
        });

        // Save the admin to the database
        await admin.save();

        // Generate a token
        const token = admin.generateAuthToken();

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while registering the admin' });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Check if the admin exists
        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Compare the password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate a token
        const token = admin.generateAuthToken();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while logging in the admin' });
    }
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    const user = await Admin.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store token in DB with expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Send email with reset link
    const resetLink = `https://yourapp.com/reset-password?token=${resetToken}`;
    await sendPasswordResetMail(email, resetLink);

    res.status(200).json({ token: resetToken, user: user, message: "Password reset email sent." });
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log(hashedToken)
    const user = await Admin.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Hash new password
    user.password = newPassword;
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successful. You can now log in." });
};

const updatedDocument = async (req, res, next) => {
    try {
        let proposalDoc = await ProposalDocument.findOne();
        if (!proposalDoc) {
            proposalDoc = new ProposalDocument({
                fiscal_year: "2025-2026",
                student: {
                    partA_url: { en: null, bn: null },
                    partB_url: { en: null, bn: null }
                },
                teacher: {
                    partA_url: { en: null, bn: null },
                    partB_url: { en: null, bn: null }
                }
            });
        }

        const uploadedFiles = [];

        // Function to delete old file before setting new path
        const setFilePath = (fieldName, currentPath) => {
            if (req.files[fieldName]) {
                const filePath = req.files[fieldName][0].path;
                uploadedFiles.push(filePath); // Track uploaded files

                // Delete the previous file if exists
                if (currentPath) {
                    fs.unlink(currentPath, (err) => {
                        if (err) console.error(`Failed to delete old file: ${currentPath}`, err);
                    });
                }
                return filePath;
            }
            return currentPath;
        };

        proposalDoc.fiscal_year = req.body.fiscal_year || proposalDoc.fiscal_year;

        // Check and update each document, deleting previous file if replaced
        proposalDoc.student.partA_url.en = setFilePath('student_partA_en', proposalDoc.student.partA_url.en);
        proposalDoc.student.partA_url.bn = setFilePath('student_partA_bn', proposalDoc.student.partA_url.bn);
        proposalDoc.student.partB_url.en = setFilePath('student_partB_en', proposalDoc.student.partB_url.en);
        proposalDoc.student.partB_url.bn = setFilePath('student_partB_bn', proposalDoc.student.partB_url.bn);
        proposalDoc.teacher.partA_url.en = setFilePath('teacher_partA_en', proposalDoc.teacher.partA_url.en);
        proposalDoc.teacher.partA_url.bn = setFilePath('teacher_partA_bn', proposalDoc.teacher.partA_url.bn);
        proposalDoc.teacher.partB_url.en = setFilePath('teacher_partB_en', proposalDoc.teacher.partB_url.en);
        proposalDoc.teacher.partB_url.bn = setFilePath('teacher_partB_bn', proposalDoc.teacher.partB_url.bn);

        // Save the updated document
        const updatedDocument = await proposalDoc.save();
        console.log("Updated Proposal Document:", updatedDocument);

        res.status(200).json({ message: "Proposal document updated successfully", updatedDocument });

    } catch (error) {
        console.error("Error inserting/updating document:", error);

        // Delete uploaded files if an error occurs
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error(`Failed to delete file: ${file.path}`, err);
                });
            });
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
};
const updateRequestStatus = async (req, res) => {
    try {
        const { request_id } = req.params;
        const { status, admin_response, requester_type } = req.body;

        // 🔹 Check if Update Request Exists
        const request = await ProposalUpdateRequest.findById(request_id);
        let proposal;
        if (requester_type === "student") {
            proposal = await StudentProposal.findById(request.proposal_id);
        }
        if (requester_type === "teacher") {
            proposal = await TeacherProposal.findById(request.proposal_id);
        }
        if (!request) {
            return res.status(404).json({ error: "Update request not found" });
        }
        if (!proposal) {
            return res.status(404).json({ error: "Proposal request not found" });
        }
        request.status = status;
        request.admin_response = admin_response;
        const token = proposal.generateUpdateToken();
        await request.save();

        res.status(200).json({ message: `Request ${status} successfully`, token: token });

    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const getProposal = async (req, res) => {
    try {
        const studentProposals = await StudentProposal.find();
        const teacherProposals = await TeacherProposal.find();

        res.status(200).json({ studentProposals, teacherProposals });
    } catch (error) {
        console.error("Error fetching proposals:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = {
    updatedDocument, updateRequestStatus, getProposal, registerAdmin, loginAdmin, requestPasswordReset, resetPassword
};
