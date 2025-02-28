const { TeacherProposal } = require('../models/teacher.proposal.model.js');


const submitProposal = async (req, res, next) => {
    try {
        const { project_director, designation, department, faculty, project_title, research_location, project_details, total_budget } = req.body;
        const proposal = new TeacherProposal({
            project_director: JSON.parse(project_director),
            designation,
            department,
            faculty,
            project_title: JSON.parse(project_title),
            research_location,
            project_details: JSON.parse(project_details),
            total_budget,
            pdf_url_part_A: req.files['partA'] ? req.files['partA'][0].path : null,
            pdf_url_part_B: req.files['partB'] ? req.files['partB'][0].path : null
        });

        await proposal.save();
        res.status(201).json({ message: "Teacher proposal submitted successfully", proposal });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { submitProposal };
