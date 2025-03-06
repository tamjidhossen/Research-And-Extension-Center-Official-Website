const fs = require('fs');
const path = require('path');
const mongoose = require("mongoose");
const ProposalDocument = require('../models/proposal.document.model.js');
const ProposalUpdateRequest = require('../models/update.request.model.js');
const { TeacherProposal } = require('../models/teacher.proposal.model.js');
const { StudentProposal } = require('../models/student.proposal.model.js');
const { ReviewerAssignment } = require("../models/reviewer.assignment.model.js");
const { Reviewer } = require("../models/reviewer.model.js");
const { Invoice } = require("../models/invoice.model.js");
const Admin = require('../models/admin.model.js');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendPasswordResetMail, sendMailToReviewer, sendMailInvoiceToReviewer } = require("../config/emailConfig.js");
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

const updateRegistrationOpen = async (req, res) => {
    try {
        let { value } = req.params;
        value = Number(value);
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
        let open;
        if (value === 0) {
            open = false;
        }
        else {
            open = true;
        }
        const updatedDocument = await ProposalDocument.findByIdAndUpdate(
            proposalDoc._id,
            {
                registrationOpen: open
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
                },
                proposal_mark_sheet: null
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
        proposalDoc.proposal_mark_sheet = setFilePath('proposal_mark_sheet', proposalDoc.proposal_mark_sheet);
        // Save the updated document
        const updatedDocument = await proposalDoc.save();
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
    try {
        const { reviewer_id, proposal_id, proposal_type } = req.body;

        // Validate Object IDs
        if (!mongoose.Types.ObjectId.isValid(proposal_id) || !mongoose.Types.ObjectId.isValid(reviewer_id)) {
            return res.status(400).json({ success: false, message: "Invalid ID format!" });
        }

        const proposalId = new mongoose.Types.ObjectId(proposal_id);
        const reviewerId = new mongoose.Types.ObjectId(reviewer_id);

        // Check if reviewer exists
        const reviewer = await Reviewer.findById(reviewerId);
        if (!reviewer) {
            return res.status(404).json({ success: false, message: "Reviewer not found!" });
        }

        // Validate proposal type
        if (!["teacher", "student"].includes(proposal_type)) {
            return res.status(400).json({ success: false, message: "Invalid proposal type!" });
        }

        // Fetch the correct proposal based on type
        let proposal = proposal_type === "teacher"
            ? await TeacherProposal.findById(proposalId)
            : await StudentProposal.findById(proposalId);

        if (!proposal) {
            return res.status(404).json({ success: false, message: "Proposal not found!" });
        }

        // Check if the reviewer is already assigned
        const existingAssignment = await ReviewerAssignment.findOne({
            reviewer_id: reviewerId,
            proposal_id: proposalId
        });

        if (existingAssignment) {
            return res.status(400).json({ success: false, message: "Reviewer already assigned to this proposal!" });
        }

        // Generate token for the reviewer
        const token = proposal.generateReviewerToken(reviewerId);

        // Assign reviewer and update status
        proposal.reviewer.push({ id: reviewerId });
        proposal.status = 1;
        await proposal.save();

        // Create a new reviewer assignment
        const newAssignment = new ReviewerAssignment({
            reviewer_id: reviewerId,
            proposal_id: proposalId,
            proposal_type,
            total_mark: 0,  // Default to 0
            mark_sheet_url: "/",
            evaluation_sheet_url: "/",
            status: 0        // Pending by default
        });

        // Save the assignment first
        await newAssignment.save();

        try {
            // Try sending the email
            await sendMailToReviewer(reviewer.email, reviewer.name, token);
            console.log("Email sent successfully");

            return res.status(200).json({ success: true, message: "Reviewer assigned! Email sent successfully." });

        } catch (emailError) {
            console.error("Error sending email:", emailError);

            // **Rollback: Delete the newly created assignment**
            await ReviewerAssignment.findByIdAndDelete(newAssignment._id);

            // **Rollback: Remove reviewer from proposal and reset status**
            proposal.reviewer = proposal.reviewer.filter(r => !r.id.equals(reviewerId));
            proposal.status = 0;  // Reset to original state
            await proposal.save();

            return res.status(500).json({ success: false, message: "Failed to send email. Assignment rolled back." });
        }

    } catch (error) {
        console.error("Error in sentToReviewer:", error);
        return res.status(500).json({ success: false, message: "Internal server error!" });
    }
};


const addReviewer = async (req, res) => {
    try {
        const { name, email, designation, department, address } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Name and email required!" });
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

const getAllReviewers = async (req, res) => {
    try {
        const reviewers = await Reviewer.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, reviewers });

    } catch (error) {
        console.error("Error getting reviewers:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateProposalStatus = async (req, res) => {
    try {
        const { proposal_type, proposal_id } = req.params;
        let { status } = req.params;
        // Find the proposal
        let proposal;
        if (proposal_type === "student") {
            proposal = await StudentProposal.findById(proposal_id);
        }
        else if (proposal_type === "teacher") {
            proposal = await TeacherProposal.findById(proposal_id);
        }
        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found" });
        }
        status = Number(status)
        if (status === 3) {
            proposal.approval_status = status;
            proposal.status = status;
            await proposal.save();
            return res.status(200).json({ message: "Proposal approved", proposal });
        } else if (status === 0) {
            proposal.approval_status = status;
            await proposal.save();
            return res.status(200).json({ message: "Proposal approval in pending", proposal });
        } else if (status === 2) {
            const filesToDelete = [proposal.pdf_url_part_A, proposal.pdf_url_part_B];

            filesToDelete.forEach((filePath) => {
                if (filePath) {
                    const fullPath = path.join(__dirname, "..", filePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            });
            if (proposal_type === "student") {
                await StudentProposal.findByIdAndDelete(proposal_id);
            }
            else {
                await TeacherProposal.findByIdAndDelete(proposal_id);
            }
            return res.status(200).json({ message: "Proposal deleted successfully" });
        } else {
            return res.status(400).json({ message: "Invalid status value" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateApprovalBudget = async (req, res) => {
    try {
        const { proposal_id, proposal_type, approval_budget } = req.body;
        // Ensure approval_budget is a valid number
        if (isNaN(approval_budget) || approval_budget < 0) {
            return res.status(400).json({ message: "Invalid approval budget amount" });
        }
        let Proposal;
        if (proposal_type === "student") {
            Proposal = await StudentProposal.findById(proposal_id);
        }
        else if (proposal_type === "teacher") {
            Proposal = await TeacherProposal.findById(proposal_id);
        }
        if (!Proposal) {
            return res.status(404).json({ message: "Proposal not found" });
        }

        Proposal.approval_budget = approval_budget;
        Proposal.approval_status = 3;
        Proposal.status = 3;
        await Proposal.save();

        return res.status(200).json({ message: "Approval budget updated successfully", Proposal });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


const getAllReviewerAssignments = async (req, res) => {
    try {
        // Fetch all assignments and populate reviewer details
        const assignments = await ReviewerAssignment.find()
            .populate("reviewer_id", "name email designation department address") // Fetch reviewer details
            .lean(); // Convert to plain object

        if (!assignments.length) {
            return res.status(404).json({ message: "No reviewer assignments found" });
        }

        // Fetch proposal details for each assignment
        const assignmentsWithProposals = await Promise.all(
            assignments.map(async (assignment) => {
                let proposal;
                if (assignment.proposal_type === "student") {
                    proposal = await StudentProposal.findById(assignment.proposal_id)
                } else if (assignment.proposal_type === "teacher") {

                    proposal = await TeacherProposal.findById(assignment.proposal_id)
                }
                return { ...assignment, proposal };
            })
        );

        return res.status(200).json(assignmentsWithProposals);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const searchReviewerByFiscalYear = async (reviewer_id, fiscal_year) => {
    try {
        // Find proposals matching the fiscal year
        const studentProposals = await StudentProposal.find({ fiscal_year }).select("_id");
        const teacherProposals = await TeacherProposal.find({ fiscal_year }).select("_id");

        // Extract proposal IDs
        const studentProposalIds = studentProposals.map(p => p._id);
        const teacherProposalIds = teacherProposals.map(p => p._id);

        // Check if the reviewer is assigned to any of these proposals
        const assignmentExists = await ReviewerAssignment.exists({
            reviewer_id,
            proposal_id: { $in: [...studentProposalIds, ...teacherProposalIds] }
        });

        return assignmentExists ? true : false;
    } catch (error) {
        console.error("Error searching reviewer by fiscal year:", error);
        return false;
    }
};

const sendInvoice = async (req, res) => {
    try {
        const { reviewer_id, fiscal_year } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "File upload failed" });
        }

        // Ensure the reviewer exists in the specified fiscal year
        const exists = await searchReviewerByFiscalYear(reviewer_id, fiscal_year);
        if (!exists) {
            // Delete uploaded file if the reviewer does not exist
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: "No such data!" });
        }

        // File Path
        const filePath = path.join(__dirname, "..", "uploads", "invoice", req.file.filename);
        const fileUrl = `uploads/invoice/${req.file.filename}`;

        // Ensure the file exists before proceeding
        if (!fs.existsSync(filePath)) {
            return res.status(500).json({ success: false, message: "Invoice file not found!" });
        }

        // Find reviewer details
        const reviewer = await Reviewer.findById(reviewer_id);
        if (!reviewer) {
            fs.unlinkSync(filePath);
            return res.status(404).json({ success: false, message: "Reviewer not found!" });
        }

        // Generate a secure upload link for the reviewer to upload a signed invoice
        const token = jwt.sign(
            { reviewer_id, fiscal_year, message: "invoice" },
            process.env.SECRET_KEY_REVIEWER,
            { expiresIn: "7d" }
        );
        const uploadUrl = `${process.env.FRONTEND_BASE_URL}/invoice/upload?token=${token}`;

        // Create invoice record in DB before sending email
        const invoice = new Invoice({
            reviewer_id: reviewer._id,
            fiscal_year,
            invoice_url: fileUrl,
            status: 1
        });

        await invoice.save();

        // Send response **before** sending the email
        res.status(200).json({
            success: true,
            message: "Invoice Sent!",
            uploadUrl, // Include upload URL in the response
        });

        // Send email asynchronously
        setImmediate(async () => {
            try {
                await sendMailInvoiceToReviewer(reviewer.email, filePath, uploadUrl);
                console.log(`Invoice email sent successfully to ${reviewer.email}`);
            } catch (emailError) {
                console.error("Error sending invoice email:", emailError);
            }
        });

    } catch (error) {
        console.error("Upload Error:", error);

        // Delete uploaded file if there is an error
        if (req.file) {
            const filePath = path.join(__dirname, "..", "uploads", "invoice", req.file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().populate("reviewer_id", "name email");

        if (invoices.length === 0) {
            return res.status(404).json({ success: false, message: "No invoices found!" });
        }

        res.status(200).json({ success: true, invoices });
    } catch (error) {
        console.error("Error retrieving all invoices:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found!" });
        }

        const filePath = path.join(__dirname, "..", invoice.invoice_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Invoice.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Invoice deleted successfully!" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    updatedDocument, updateRequestStatus, getProposal, registerAdmin, loginAdmin, requestPasswordReset, resetPassword,
    sentToReviewer, updateFiscalYear, addReviewer, updateReviewer, deleteReviewer, getReviewerById, getAllReviewers, getProposalOverviews,
    updateProposalStatus, updateRegistrationOpen, updateApprovalBudget, getAllReviewerAssignments, sendInvoice, getAllInvoices, deleteInvoice
};
