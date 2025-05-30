const { TeacherProposal } = require('../models/teacher.proposal.model.js');
const { StudentProposal } = require('../models/student.proposal.model.js');
const mongoose = require("mongoose");

const jwt = require('jsonwebtoken');
const { Reviewer } = require('../models/reviewer.model.js');

const authReview = async (req, res, next) => {
    let token = null;
    token = req.headers.authorization?.split(' ')[1];
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY_REVIEWER);
        let proposal;
        if (!decoded.proposal_id || !decoded.reviewer_id || !decoded.proposal_type) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const proposalId = new mongoose.Types.ObjectId(decoded.proposal_id);
        const reviewerId = new mongoose.Types.ObjectId(decoded.reviewer_id);
        if (decoded.proposal_type === "student") {
            proposal = await StudentProposal.findOne(
                { _id: proposalId, reviewer: { $elemMatch: { id: reviewerId } } },
                { "reviewer.$": 1 }
            );
        }
        else if (decoded.proposal_type === "teacher") {
            proposal = await TeacherProposal.findOne(
                { _id: proposalId, reviewer: { $elemMatch: { id: reviewerId } } },
                { "reviewer.$": 1 }
            );
        }
        else {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (!proposal) {
            return res.status(401).json({ success: false, message: 'Proposal Not Found' });
        }
        req.proposal = proposal;
        req.proposal_type = decoded.proposal_type;
        req.proposal_id = decoded.proposal_id;
        req.reviewer_id = decoded.reviewer_id;
        next();
    } catch (err) {
        console.error("Authentication Error:", err);
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

const authenticate = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(' ')[1] || req.cookies?.token || req.query?.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY_REVIEWER);

        if (!decoded.reviewer_id || !decoded.fiscal_year || decoded.message !== "invoice") {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const reviewer = await Reviewer.findById(decoded.reviewer_id);
        if (!reviewer) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        req.reviewer = reviewer;
        req.fiscal_year = decoded.fiscal_year;

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

module.exports = {
    authReview,
    authenticate
};