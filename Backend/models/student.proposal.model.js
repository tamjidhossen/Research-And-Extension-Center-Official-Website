const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const studentProposalSchema = new mongoose.Schema({
    proposal_type: { type: String, required: true },
    fiscal_year: { type: String, required: true },
    project_director: {
        name_bn: { type: String, required: true },
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
        designation: { type: String, required: true }
    },
    project_title: {
        title_bn: { type: String, required: true },
        title_en: { type: String, required: true }
    },
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
                mark_sheet_url: { type: String },
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

}, { timestamps: true });

studentProposalSchema.methods.generateUpdateToken = function () {
    const token = jwt.sign({ _id: this._id, proposal: "student" }, process.env.SECRET_KEY_STUDENT, { expiresIn: '7d' });
    return token;
};

studentProposalSchema.methods.generateReviewerToken = function (name_, email_) {
    const token = jwt.sign({ id: this._id, proposal_type: "student", name: name_, email: email_ }, process.env.SECRET_KEY_REVIEWER, { expiresIn: '7d' });
    return token;
};

const StudentProposal = mongoose.model('StudentProposal', studentProposalSchema);

module.exports = { StudentProposal };
