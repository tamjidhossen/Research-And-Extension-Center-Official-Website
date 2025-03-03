const mongoose = require("mongoose");
const { Reviewer } = require("./reviewer.model.js");
const { StudentProposal } = require("./student.proposal.model.js");
const { TeacherProposal } = require("./teacher.proposal.model.js");

const reviewerAssignmentSchema = new mongoose.Schema({
    reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Reviewer", required: true },
    proposal_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    proposal_type: { type: String, enum: ["student", "teacher"], required: true },
    total_mark: { type: Number, required: true },
    mark_sheet_url: { type: String },
    status: { type: Number, enum: [0, 1], default: 0 } // 0 = Pending, 1 = Reviewed
}, { timestamps: true });

// Pre-save Hook to Verify reviewer_id and proposal_id
reviewerAssignmentSchema.pre("save", async function (next) {
    try {
        // Check if reviewer exists
        const reviewerExists = await Reviewer.findById(this.reviewer_id);
        if (!reviewerExists) {
            return next(new Error("Reviewer not found"));
        }

        // Check if the proposal exists based on proposal_type
        let proposalExists;
        if (this.proposal_type === "student") {
            proposalExists = await StudentProposal.findById(this.proposal_id);
        } else if (this.proposal_type === "teacher") {
            proposalExists = await TeacherProposal.findById(this.proposal_id);
        }

        if (!proposalExists) {
            return next(new Error("Proposal not found"));
        }

        next(); // Proceed if both reviewer and proposal exist
    } catch (error) {
        next(error);
    }
});

const ReviewerAssignment = mongoose.model("ReviewerAssignment", reviewerAssignmentSchema);

module.exports = { ReviewerAssignment };
