const fs = require('fs');
const path = require('path');
const { StudentProposal } = require('../models/student.proposal.model.js');
const { TeacherProposal } = require('../models/teacher.proposal.model.js');
const { ReviewerAssignment } = require("../models/reviewer.assignment.model.js");
const { Reviewer } = require("../models/reviewer.model.js");
const { Invoice } = require("../models/invoice.model.js");
const ProposalDocument = require('../models/proposal.document.model.js');
const mongoose = require("mongoose");


const verifyReviewer = async (req, res) => {
    try {
        const { proposal_type, reviewer_id } = req;

        // Check if reviewer exists
        const reviewer = await Reviewer.findById(reviewer_id);
        if (!reviewer) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let proposal;

        // Find proposal based on the type
        if (proposal_type === "student") {
            proposal = await StudentProposal.findById(req.proposal_id).select("pdf_url_part_B fiscal_year");
        } else if (proposal_type === "teacher") {
            proposal = await TeacherProposal.findById(req.proposal_id).select("pdf_url_part_B fiscal_year");
        } else {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Get the proposal document (assuming there's only one document)
        const proposalDocument = await ProposalDocument.findOne({});
        if (!proposalDocument) {
            return res.status(404).json({ success: false, message: "Proposal documents not found" });
        }

        res.status(201).json({
            success: true,
            message: "Verified Reviewer",
            proposal: proposal,
            reviewer: reviewer,
            review_form_url: proposalDocument.review_form_url,
            invoice_url: proposalDocument.invoice_url,
            proposal_mark_sheet: proposalDocument.proposal_mark_sheet
        });
    } catch (error) {
        console.error("Error in verifyReviewer:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



const addMark = async (req, res) => {
    try {
        const { total_mark, fiscal_year } = req.body;
        const { proposal_type, proposal_id, reviewer_id } = req;

        // Ensure at least marksheet is provided
        if (!req.files || !req.files.marksheet) {
            return res.status(400).json({ success: false, message: "Marksheet is required" });
        }

        // File Paths (Evaluation sheet and invoice are optional)
        const marksheetPath = path.join(__dirname, "..", "uploads", "marksheet", req.files.marksheet[0].filename);
        const marksheetUrl = `uploads/marksheet/${req.files.marksheet[0].filename}`;

        let evaluationPath = null;
        let evaluationUrl = null;
        if (req.files.evaluation_sheet) {
            evaluationPath = path.join(__dirname, "..", "uploads", "evaluation_sheet", req.files.evaluation_sheet[0].filename);
            evaluationUrl = `uploads/evaluation_sheet/${req.files.evaluation_sheet[0].filename}`;
        }

        let invoicePath = null;
        let invoiceUrl = null;
        if (req.files.invoice) {
            invoicePath = path.join(__dirname, "..", "uploads", "invoice", req.files.invoice[0].filename);
            invoiceUrl = `uploads/invoice/${req.files.invoice[0].filename}`;
        }

        // Validate Proposal Type
        let ProposalModel;
        if (proposal_type === "student") {
            ProposalModel = StudentProposal;
        } else if (proposal_type === "teacher") {
            ProposalModel = TeacherProposal;
        } else {
            return res.status(400).json({ success: false, message: "Invalid proposal type" });
        }

        // Update Reviewer Assignment
        const assignment = await ReviewerAssignment.findOneAndUpdate(
            { reviewer_id: reviewer_id, proposal_id: proposal_id },
            {
                $set: {
                    mark_sheet_url: marksheetUrl,
                    evaluation_sheet_url: evaluationUrl || null,
                    total_mark: total_mark,
                    status: 1, // Mark as reviewed
                }
            },
            { new: true }
        );

        if (!assignment) {
            // Delete uploaded files if database update fails
            if (fs.existsSync(marksheetPath)) fs.unlinkSync(marksheetPath);
            if (evaluationPath && fs.existsSync(evaluationPath)) fs.unlinkSync(evaluationPath);
            if (invoicePath && fs.existsSync(invoicePath)) fs.unlinkSync(invoicePath);
            return res.status(404).json({ success: false, message: "Reviewer assignment not found" });
        }

        // Check and Delete Previous Invoice (if exists)
        if (invoiceUrl) {
            const existingInvoice = await Invoice.findOne({ reviewer_id: reviewer_id, fiscal_year: fiscal_year || "N/A" });
            if (existingInvoice) {
                // Delete the previous invoice file from disk
                const previousInvoicePath = path.join(__dirname, "..", existingInvoice.invoice_url);
                if (fs.existsSync(previousInvoicePath)) {
                    fs.unlinkSync(previousInvoicePath);
                }
                // Delete the previous invoice from the database
                await Invoice.deleteOne({ _id: existingInvoice._id });
            }

            // Save New Invoice
            try {
                const newInvoice = new Invoice({
                    reviewer_id: reviewer_id,
                    fiscal_year: fiscal_year || "N/A",
                    invoice_url: invoiceUrl,
                    status: 2, // Active or Paid
                });
                await newInvoice.save();
            } catch (invoiceError) {
                console.error("Invoice Save Error:", invoiceError);
                return res.status(500).json({ success: false, message: "Failed to save invoice" });
            }
        }

        // Aggregate to calculate average marks
        const result = await ReviewerAssignment.aggregate([
            { $match: { proposal_id: new mongoose.Types.ObjectId(proposal_id), status: 1 } },
            {
                $group: {
                    _id: "$proposal_id",
                    totalAssignments: { $sum: 1 },
                    averageMark: { $avg: "$total_mark" }
                }
            }
        ]);

        // If both reviewers have submitted marks, update Proposal status & average mark
        if (result.length > 0 && result[0].totalAssignments === 2) {
            await ProposalModel.findByIdAndUpdate(proposal_id, {
                reviewer_avg_mark: result[0].averageMark,
                status: 2 // Mark as fully reviewed
            });
        }

        res.status(200).json({
            success: true,
            message: "Marksheet uploaded successfully"
                + (evaluationUrl ? " along with evaluation sheet" : "")
                + (invoiceUrl ? " and invoice saved." : ""),
        });

    } catch (error) {
        console.error("Upload Error:", error);

        // Delete files if an error occurs
        if (req.files) {
            if (req.files.marksheet && fs.existsSync(req.files.marksheet[0].path)) {
                fs.unlinkSync(req.files.marksheet[0].path);
            }
            if (req.files.evaluation_sheet && fs.existsSync(req.files.evaluation_sheet[0].path)) {
                fs.unlinkSync(req.files.evaluation_sheet[0].path);
            }
            if (req.files.invoice && fs.existsSync(req.files.invoice[0].path)) {
                fs.unlinkSync(req.files.invoice[0].path);
            }
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
        const invoice = await Invoice.findOne({ reviewer_id: reviewer._id, fiscal_year });
        if (!invoice) {
            if (req.file) {
                const filePath = path.join(__dirname, "..", "uploads", "invoice", req.file.filename);

                try {
                    fs.unlink(filePath);
                } catch (unlinkError) {
                    console.error("Error deleting file:", unlinkError);
                }
            }
            return res.status(400).json({ success: false, message: "Not a valid invoice!" });
        }
        else {
            if (fs.existsSync(invoice.invoice_url)) {
                fs.unlinkSync(invoice.invoice_url);
            }
        }
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
                try {
                    fs.unlink(filePath);
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

            try {
                fs.unlink(filePath);
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
