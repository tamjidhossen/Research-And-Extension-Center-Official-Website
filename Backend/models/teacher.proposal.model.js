const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const teacherProposalSchema = new mongoose.Schema(
    {
        proposal_type: { type: String, required: true },
        fiscal_year: { type: String, required: true },
        project_director: {
            name_bn: { type: String, required: true },
            name_en: { type: String, required: true },
            mobile: { type: String, required: true },
            email: { type: String, required: true }
        },
        designation: { type: String, required: true },
        department: { type: String, required: true },
        faculty: { type: String, required: true },
        project_title: {
            title_bn: { type: String, required: true },
            title_en: { type: String, required: true }
        },
        research_location: { type: String, required: true },
        project_details: {
            approx_pages: { type: Number, required: true },
            approx_words: { type: Number, required: true }
        },
        total_budget: { type: Number, required: true },
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
                    name: { type: String, required: true },
                    email: { type: String, required: true },
                    password: { type: String, select: false }, // Hide password by default
                    mark: [
                        {
                            part_name: { type: String, required: true },
                            part_mark: { type: Number, required: true }
                        }
                    ]
                }
            ],
            default: []
        }
    },
    { timestamps: true }
);

teacherProposalSchema.methods.generateUpdateToken = function () {
    return jwt.sign(
        { _id: this._id, proposal: "teacher" },
        process.env.SECRET_KEY_TEACHER,
        { expiresIn: '7d' }
    );
};

teacherProposalSchema.methods.generateReviewerToken = function (name_, email_) {
    if (!name_ || !email_) throw new Error("Name and Email are required for token generation.");

    return jwt.sign(
        { id: this._id, proposal: "teacher", name: name_, email: email_ },
        process.env.SECRET_KEY_REVIEWER,
        { expiresIn: '7d' }
    );
};

const TeacherProposal = mongoose.model('TeacherProposal', teacherProposalSchema);

module.exports = { TeacherProposal };
