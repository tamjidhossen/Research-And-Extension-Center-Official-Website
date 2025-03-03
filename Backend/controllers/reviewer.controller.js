const fs = require('fs');
const path = require('path');
const { StudentProposal } = require('../models/student.proposal.model.js');
const { TeacherProposal } = require('../models/teacher.proposal.model.js');
const { ReviewerAssignment } = require("../models/reviewer.assignment.model.js");
const mongoose = require("mongoose");
const verifyReviewer = async (req, res) => {
    try {
        const { proposal_type } = req;
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
        res.status(201).json({ succes: true, message: "Verified Reviewer", proposal: proposal });
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
        if (result.length === 2) {
            await ProposalModel.findByIdAndUpdate(id, { reviewer_avg_mark: result[0], status: 2 });
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

module.exports = { verifyReviewer, addMark };
