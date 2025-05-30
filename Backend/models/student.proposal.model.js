const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const studentProposalSchema = new mongoose.Schema(
    {
        proposal_number: { type: Number, required: true },
        proposal_type: { type: String, required: true },
        fiscal_year: { type: String, required: true },
        project_director: {
            name_en: { type: String, required: true },
            mobile: { type: String, required: true },
            email: { type: String, required: true }
        },
        department: { type: String, required: true },
        faculty: { type: String, required: true },
        session: { type: String, required: true },
        roll_no: { type: String, required: true },
        cgpa_honours: { type: Number, required: true },
        supervisor: {
            name: { type: String, required: true },
            designation: { type: String, required: true },
            department: { type: String, required: true },
            faculty: { type: String, required: true }
        },
        project_title: { type: String, required: true },
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
studentProposalSchema.pre("save", async function (next) {
    if (!this.isNew) return next(); // Only generate number for new proposals

    try {
        const yearParts = this.fiscal_year.split("-");
        if (yearParts.length !== 2 || isNaN(yearParts[0]) || isNaN(yearParts[1])) {
            throw new Error("Invalid fiscal year format. Expected format: YYYY-YYYY");
        }

        // Extract last two digits of each year
        const yearCode = yearParts[0].slice(-2) + yearParts[1].slice(-2);

        // Lazy load TeacherProposal to avoid circular dependency
        const TeacherProposal = require("./teacher.proposal.model.js").TeacherProposal;

        // Find the maximum proposal number for the same fiscal year from both collections
        const maxStudentProposal = await mongoose.models.StudentProposal
            .findOne({ fiscal_year: this.fiscal_year })
            .sort({ proposal_number: -1 })
            .select("proposal_number");

        const maxTeacherProposal = await TeacherProposal
            .findOne({ fiscal_year: this.fiscal_year })
            .sort({ proposal_number: -1 })
            .select("proposal_number");

        // Extract the highest proposal number
        const maxProposalNumber = Math.max(
            maxStudentProposal ? maxStudentProposal.proposal_number : 0,
            maxTeacherProposal ? maxTeacherProposal.proposal_number : 0
        );

        // Generate the new proposal number
        const nextNumber = maxProposalNumber > 0 ? maxProposalNumber + 1 : parseInt(yearCode + "001");
        this.proposal_number = nextNumber;

        next();
    } catch (error) {
        next(error);
    }
});


// Generate token for update link
studentProposalSchema.methods.generateUpdateToken = function () {
    return jwt.sign(
        { _id: this._id, proposal: "student" },
        process.env.SECRET_KEY_STUDENT,
        { expiresIn: "7d" }
    );
};

// Generate token for reviewer access
studentProposalSchema.methods.generateReviewerToken = function (reviewer_id, expiresIn = 45) {
    // If expiresIn is a number, convert it to a string with "d" suffix
    if (typeof expiresIn === "number") {
        expiresIn = `${expiresIn}d`;
    }

    return jwt.sign(
        { proposal_id: this._id, reviewer_id: reviewer_id, proposal_type: "student" },
        process.env.SECRET_KEY_REVIEWER,
        { expiresIn: expiresIn }
    );
};


// Register model safely
const StudentProposal = mongoose.models.StudentProposal || mongoose.model("StudentProposal", studentProposalSchema);

module.exports = { StudentProposal };
