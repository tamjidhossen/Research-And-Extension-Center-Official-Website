const fs = require('fs');
const { StudentProposal } = require('../models/student.proposal.model.js');
const { TeacherProposal } = require('../models/student.proposal.model.js');

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

module.exports = { verifyReviewer };
