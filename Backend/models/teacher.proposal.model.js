const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const teacherProposalSchema = new mongoose.Schema(
    {
        proposal_number: { type: Number, required: true },
        proposal_type: { type: String, required: true },
        fiscal_year: { type: String, required: true },
        project_director: {
            name_en: { type: String, required: true },
            mobile: { type: String, required: true },
            email: { type: String, required: true }
        },
        designation: { type: String, required: true },
        department: { type: String, required: true },
        faculty: { type: String, required: true },
        associate_investigator: { type: String, required: false, default: "" },
        project_title: { type: String, required: true },
        research_location: { type: String, required: true },
        project_details: {
            approx_pages: { type: Number, required: true },
            approx_words: { type: Number, required: true }
        },
        total_budget: { type: Number, required: true },
        approval_budget: { type: Number, required: true, default: 0 },
        reviewer_avg_mark: { type: Number, required: true, default: 0 },
        signatures: {
            project_director: {
                signature: { type: String },
                date: { type: String }
            },
            department_head: {
                signature: { type: String },
                date: { type: String },
                recommendation: { type: String }
            },
            dean: {
                signature: { type: String },
                date: { type: String },
                recommendation: { type: String }
            }
        },
        pdf_url_part_A: { type: String, required: true },
        pdf_url_part_B: { type: String, required: true },
        reviewer: {
            type: [
                {
                    id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Reviewer" }
                }
            ],
            default: []
        },
        status: { type: Number, default: 0 },
        approval_status: { type: Number, default: 0 }
    },
    { timestamps: true }
);

// Pre-save hook to generate proposal_number
teacherProposalSchema.pre("save", async function (next) {
    if (!this.isNew) return next(); // Only generate number for new proposals

    try {
        const yearParts = this.fiscal_year.split("-");
        if (yearParts.length !== 2) {
            throw new Error("Invalid fiscal year format. Expected format: YYYY-YYYY");
        }

        // Extract last two digits of each year
        const yearCode = yearParts[0].slice(-2) + yearParts[1].slice(-2);

        // Lazy load StudentProposal to avoid circular dependency
        const StudentProposal = require("./student.proposal.model.js").StudentProposal;

        // Count existing proposals for the same fiscal year
        const count1 = await mongoose.models.TeacherProposal.countDocuments({ fiscal_year: this.fiscal_year });
        const count2 = await StudentProposal.countDocuments({ fiscal_year: this.fiscal_year });

        // Generate proposal number (e.g., 2526001, 2526002, ...)
        this.proposal_number = parseInt(yearCode + String(count1 + count2 + 1).padStart(3, "0"));

        next();
    } catch (error) {
        next(error);
    }
});

// Generate token for update link
teacherProposalSchema.methods.generateUpdateToken = function () {
    return jwt.sign(
        { _id: this._id, proposal: "teacher" },
        process.env.SECRET_KEY_TEACHER,
        { expiresIn: "7d" }
    );
};

// Generate token for reviewer access
teacherProposalSchema.methods.generateReviewerToken = function (reviewer_id) {
    return jwt.sign(
        { proposal_id: this._id, reviewer_id: reviewer_id, proposal_type: "teacher" },
        process.env.SECRET_KEY_REVIEWER,
        { expiresIn: "7d" }
    );
};

// Register the model safely
const TeacherProposal = mongoose.models.TeacherProposal || mongoose.model("TeacherProposal", teacherProposalSchema);

module.exports = { TeacherProposal };
