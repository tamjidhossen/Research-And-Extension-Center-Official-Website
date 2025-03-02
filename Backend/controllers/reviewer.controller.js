const fs = require('fs');
const path = require('path');
const { StudentProposal } = require('../models/student.proposal.model.js');
const { TeacherProposal } = require('../models/teacher.proposal.model.js');

const verifyReviewer = async (req, res) => {
    try {
        const { proposal_type } = req;
        let proposal;
        if (proposal_type === "student") {
            proposal = await StudentProposal.findById(req.proposal._id).select("pdf_url_part_B");
        }
        else if (proposal_type === "teacher") {
            proposal = await TeacherProposal.findById(req.proposal._id).select("pdf_url_part_B");
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
        const { proposal_type, reviewer_name, reviewer_email } = req;
        const id = req.proposal._id;
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
        const proposal = await ProposalModel.findOneAndUpdate(
            { _id: id, "reviewer.name": reviewer_name, "reviewer.email": reviewer_email },
            {
                $set: {
                    "reviewer.$.mark_sheet_url": fileUrl,
                    "reviewer.$.total_mark": total_mark,
                    "reviewer.$.status": 1,
                }
            },
            { new: true }
        );
        if (!proposal) {
            // Delete file if proposal update failed
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(404).json({ success: false, message: "Reviewer not found" });
        }
        const marks = proposal.reviewer.map(rev => Number(rev.total_mark) || 0);
        const reviewerAvgMark = marks.length ? (marks.reduce((sum, mark) => sum + mark, 0) / marks.length).toFixed(2) : 0;

        // Update the proposal with the new average mark
        await ProposalModel.findByIdAndUpdate(id, { reviewer_avg_mark: reviewerAvgMark });

        res.status(200).json({
            success: true,
            message: "Mark sheet & marks updated successfully",
            fileUrl,
            mark: total_mark
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
