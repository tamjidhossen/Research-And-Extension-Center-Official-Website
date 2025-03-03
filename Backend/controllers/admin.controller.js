const fs = require('fs');
const mongoose = require("mongoose");
const ProposalDocument = require('../models/proposal.document.model.js');
const ProposalUpdateRequest = require('../models/update.request.model.js');
const { TeacherProposal } = require('../models/teacher.proposal.model.js');
const { StudentProposal } = require('../models/student.proposal.model.js');
const { ReviewerAssignment } = require("../models/reviewer.assignment.model.js");
const { Reviewer } = require("../models/reviewer.model.js");
const Admin = require('../models/admin.model.js');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendPasswordResetMail, sendMailToReviewer } = require("../config/emailConfig.js");
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

const getProposalOverviews = async (req, res) => {
    try {
        const proposalDoc = await ProposalDocument.findOne();
        res.status(200).json({ proposalDoc });
    } catch (error) {
        console.error("Error fetching proposal settings:", error);
        res.status(500).json({ error: "Internal Server Error" });
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
    user.password = newPassword;
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successful. You can now log in." });
};

const updateFiscalYear = async (req, res) => {
    try {
        const { fiscal_year, registrationOpen } = req.body;
        let proposalDoc = await ProposalDocument.findOne();
        if (!proposalDoc) {
            proposalDoc = new ProposalDocument({
                fiscal_year: "2025-2026",
                registrationOpen: false,
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
        const updatedDocument = await ProposalDocument.findByIdAndUpdate(
            proposalDoc._id,
            {
                fiscal_year,
                registrationOpen
            },
            { new: true }
        );
        res.status(200).json({ message: "Fiscal Year and Registration Status Updated", updatedDocument });
    } catch (error) {
        console.error("Error updating fiscal year and registration status:", error);
        res.status(500).json({ message: error });
    }
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


const sentToReviewer = async (req, res) => {
    const { reviewer_id, proposal_id, proposal_type } = req.body;
    if (!mongoose.Types.ObjectId.isValid(proposal_id) || !mongoose.Types.ObjectId.isValid(reviewer_id)) {
        res.status(404).json({ success: false, message: "ID not valid!" });
    }
    const proposalId = new mongoose.Types.ObjectId(proposal_id);
    const reviewerId = new mongoose.Types.ObjectId(reviewer_id);
    const reviewer = await Reviewer.findById(reviewerId);
    if (!reviewer) {
        res.status(404).json({ success: false, message: "Reviewer not found!" });
    }
    let proposal;
    if (proposal_type === "teacher") {
        proposal = await TeacherProposal.findById(proposalId);
    }
    else if (proposal_type === "student") {
        proposal = await StudentProposal.findById(proposalId);
    }
    if (!proposal) return res.status(404).json({ success: false, message: "Proposal not found" });

    const token = proposal.generateReviewerToken(reviewerId);
    proposal.reviewer.push({ id: reviewer._id });
    proposal.status = 1;
    await proposal.save();
    const newAssignment = new ReviewerAssignment({
        reviewer_id: reviewerId,
        proposal_id: proposalId,
        proposal_type,
        total_mark: 0,  // Default to 0
        mark_sheet_url: "",
        status: 0        // Pending by default
    });
    await newAssignment.save();
    await sendMailToReviewer(reviewer.email, reviewer.name, token);

    res.status(200).json({ success: true, message: "Sent Email to reviewer!" });
};


// ✅ Add a new reviewer
const addReviewer = async (req, res) => {
    try {
        const { name, email, designation, department, address } = req.body;

        if (!name || !email || !designation || !department || !address) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingReviewer = await Reviewer.findOne({ email });
        if (existingReviewer) {
            return res.status(400).json({ success: false, message: "Reviewer with this email already exists" });
        }

        const newReviewer = new Reviewer({ name, email, designation, department, address });
        await newReviewer.save();

        res.status(201).json({ success: true, message: "Reviewer added successfully", reviewer: newReviewer });

    } catch (error) {
        console.error("Error adding reviewer:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ Update reviewer details
const updateReviewer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, designation, department, address } = req.body;

        const reviewer = await Reviewer.findById(id);
        if (!reviewer) {
            return res.status(404).json({ success: false, message: "Reviewer not found" });
        }

        if (email && email !== reviewer.email) {
            const emailExists = await Reviewer.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ success: false, message: "Email already in use" });
            }
        }

        const updatedReviewer = await Reviewer.findByIdAndUpdate(
            id,
            { name, email, designation, department, address },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: "Reviewer updated successfully", reviewer: updatedReviewer });

    } catch (error) {
        console.error("Error updating reviewer:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ Delete reviewer
const deleteReviewer = async (req, res) => {
    try {
        const { id } = req.params;

        const reviewer = await Reviewer.findById(id);
        if (!reviewer) {
            return res.status(404).json({ success: false, message: "Reviewer not found" });
        }

        await Reviewer.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Reviewer deleted successfully" });

    } catch (error) {
        console.error("Error deleting reviewer:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ Get a single reviewer by ID
const getReviewerById = async (req, res) => {
    try {
        const { id } = req.params;

        const reviewer = await Reviewer.findById(id);
        if (!reviewer) {
            return res.status(404).json({ success: false, message: "Reviewer not found" });
        }

        res.status(200).json({ success: true, reviewer });

    } catch (error) {
        console.error("Error getting reviewer:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ Get all reviewers
const getAllReviewers = async (req, res) => {
    try {
        const reviewers = await Reviewer.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, reviewers });

    } catch (error) {
        console.error("Error getting reviewers:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};




module.exports = {
    updatedDocument, updateRequestStatus, getProposal, registerAdmin, loginAdmin, requestPasswordReset, resetPassword,
    sentToReviewer, updateFiscalYear, addReviewer, updateReviewer, deleteReviewer, getReviewerById, getAllReviewers, getProposalOverviews
};
