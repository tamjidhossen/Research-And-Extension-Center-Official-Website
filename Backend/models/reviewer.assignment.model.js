const mongoose = require("mongoose");
const { Reviewer } = require("./reviewer.model.js");
const { StudentProposal } = require("./student.proposal.model.js");
const { TeacherProposal } = require("./teacher.proposal.model.js");

const reviewerAssignmentSchema = new mongoose.Schema(
    {
        reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Reviewer", required: true },
        proposal_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        proposal_type: { type: String, enum: ["student", "teacher"], required: true },
        total_mark: {
            type: Number,
            required: true,
            min: [0, "Total mark cannot be negative"],
            max: [100, "Total mark cannot exceed 100"]
        },
        mark_sheet_url: { type: String, required: true, default: "" }, // Marks uploaded file path
        evaluation_sheet_url: { type: String, required: true, default: "" }, // Evaluation sheet file path
        status: { type: Number, enum: [0, 1], default: 0 } // 0 = Pending, 1 = Reviewed
    },
    { timestamps: true }
);

// Pre-save Hook to Verify reviewer_id and proposal_id
reviewerAssignmentSchema.pre("save", async function (next) {
    try {
        const [reviewerExists, proposalExists] = await Promise.all([
            Reviewer.findById(this.reviewer_id),
            this.proposal_type === "student"
                ? StudentProposal.findById(this.proposal_id)
                : TeacherProposal.findById(this.proposal_id)
        ]);

        if (!reviewerExists) {
            return next(new Error("Reviewer not found"));
        }

        if (!proposalExists) {
            return next(new Error(`Proposal not found for type: ${this.proposal_type}`));
        }

        next(); // Proceed if both reviewer and proposal exist
    } catch (error) {
        next(error);
    }
});

const ReviewerAssignment = mongoose.model("ReviewerAssignment", reviewerAssignmentSchema);

module.exports = { ReviewerAssignment };
