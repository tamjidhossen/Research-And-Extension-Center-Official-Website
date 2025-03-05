const fs = require('fs');
const path = require('path');
const { StudentProposal } = require('../models/student.proposal.model.js');
const { TeacherProposal } = require('../models/teacher.proposal.model.js');
const { ReviewerAssignment } = require("../models/reviewer.assignment.model.js");
const { Reviewer } = require("../models/reviewer.model.js");
const { Invoice } = require("../models/invoice.model.js");
const mongoose = require("mongoose");
const verifyReviewer = async (req, res) => {
    try {
        const { proposal_type, reviewer_id } = req;
        const reviewer = await Reviewer.findById(reviewer_id);
        if (!reviewer) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        let proposal;
        if (proposal_type === "student") {
            proposal = await StudentProposal.findById(req.proposal_id).select("pdf_url_part_B");
        }
        else if (proposal_type === "teacher") {
            proposal = await TeacherProposal.findById(req.proposal_id).select("pdf_url_part_B");
        }
        else {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        res.status(201).json({ success: true, message: "Verified Reviewer", proposal: proposal, reviewer: reviewer });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const addMark = async (req, res) => {
    try {
        const { total_mark } = req.body;
        const { proposal_type, proposal_id, reviewer_id } = req;
        if (!req.file) {
            return res.status(400).json({ success: false, message: "File upload failed" });
        }

        const filePath = path.join(__dirname, "..", "uploads", "marksheet", req.file.filename);
        const fileUrl = `uploads/marksheet/${req.file.filename}`;

        let ProposalModel;
        if (proposal_type === "student") {
            ProposalModel = StudentProposal;
        } else if (proposal_type === "teacher") {
            ProposalModel = TeacherProposal;
        } else {
            return res.status(400).json({ success: false, message: "Invalid proposal type" });
        }
        const assignment = await ReviewerAssignment.findOneAndUpdate(
            { reviewer_id: reviewer_id, proposal_id: proposal_id },
            {
                $set: {
                    "mark_sheet_url": fileUrl,
                    "total_mark": total_mark,
                    "status": 1,
                }
            },
            { new: true }
        );
        if (!assignment) {
            // Delete file if proposal update failed
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(404).json({ success: false, message: "Reviewer not found" });
        }
        const result = await ReviewerAssignment.aggregate([
            { $match: { proposal_id: new mongoose.Types.ObjectId(proposal_id), status: 1 } }, // Filter by proposal_id & reviewed status
            {
                $group: {
                    _id: "$proposal_id",
                    totalAssignments: { $sum: 1 }, // Count total reviewed assignments
                    averageMark: { $avg: "$total_mark" } // Calculate average mark
                }
            }
        ]);
        console.log(result);
        if (result.length > 0 && result[0].totalAssignments === 2) {
            await ProposalModel.findByIdAndUpdate(proposal_id, { reviewer_avg_mark: result[0].averageMark, status: 2 });
        }

        res.status(200).json({
            success: true,
            message: "Mark sheet & marks updated successfully",
        });

    } catch (error) {
        console.error("Upload Error:", error);
        if (req.file) {
            const filePath = path.join(__dirname, "..", "uploads", "marksheet", req.file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete file on error
        }
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const submitInvoice = async (req, res) => {
    try {
        const { reviewer, fiscal_year } = req;
        if (!req.file) {
            return res.status(400).json({ success: false, message: "File upload failed" });
        }

        const filePath = path.join(__dirname, "..", "uploads", "invoice", req.file.filename);
        const fileUrl = `uploads/invoice/${req.file.filename}`;

        const updatedInvoice = await Invoice.findOneAndUpdate(
            { reviewer_id: reviewer._id, fiscal_year }, // Search criteria
            {
                status: 2,
                invoice_url: fileUrl
            }, // Update status and invoice_url
            { new: true } // Return the updated document
        );
        if (!updatedInvoice) {
            if (req.file) {
                const filePath = path.join(__dirname, "..", "uploads", "invoice", req.file.filename);
                console.log("Attempting to delete:", filePath);

                try {
                    await fs.unlink(filePath);
                    console.log("File deleted successfully.");
                } catch (unlinkError) {
                    console.error("Error deleting file:", unlinkError);
                }
            }
            return res.status(400).json({ success: false, message: "Invoice not found!" });
        }
        res.status(200).json({ success: true, message: "Invoice submitted successfully!" });

    } catch (error) {
        console.error("Invoice Submission Error:", error);

        if (req.file) {
            const filePath = path.join(__dirname, "..", "uploads", "invoice", req.file.filename);
            console.log("Attempting to delete:", filePath);

            try {
                await fs.unlink(filePath);
                console.log("File deleted successfully.");
            } catch (unlinkError) {
                console.error("Error deleting file:", unlinkError);
            }
        }

        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const invoiceVerify = async (req, res) => {
    try {
        res.status(201).json({ success: true, message: "Verified Reviewer!", reviewer: req.reviewer, fiscal_year: req.fiscal_year });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = { verifyReviewer, addMark, submitInvoice, invoiceVerify };
