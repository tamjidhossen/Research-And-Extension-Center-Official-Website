const { TeacherProposal } = require("../models/teacher.proposal.model.js");
const ProposalDocument = require("../models/proposal.document.model.js");
const ProposalUpdateRequest = require("../models/update.request.model.js");
const fs = require("fs");
const { StudentProposal } = require("../models/student.proposal.model.js");

const submitProposal = async (req, res, next) => {
  try {
    const firstDocument = await ProposalDocument.findOne();
    if (!firstDocument || firstDocument.fiscal_year === "None") {
      if (req.files["partA"] && req.files["partA"][0].path) {
        fs.unlinkSync(req.files["partA"][0].path);
      }
      if (req.files["partB"] && req.files["partB"][0].path) {
        fs.unlinkSync(req.files["partB"][0].path);
      }
      return res
        .status(201)
        .json({ success: false, message: "Application process not started" });
    }
    const {
      project_director,
      designation,
      department,
      faculty,
      project_title,
      research_location,
      associate_investigator,
      project_details,
      total_budget,
    } = req.body;
    const proposal = new TeacherProposal({
      proposal_number: 0,
      proposal_type: "teacher",
      fiscal_year: firstDocument.fiscal_year,
      project_director: JSON.parse(project_director),
      associate_investigator,
      designation,
      department,
      faculty,
      project_title: project_title,
      research_location,
      project_details: JSON.parse(project_details),
      total_budget,
      pdf_url_part_A: req.files["partA"] ? req.files["partA"][0].path : null,
      pdf_url_part_B: req.files["partB"] ? req.files["partB"][0].path : null,
    });

    await proposal.save();
    res
      .status(201)
      .json({ message: "Teacher proposal submitted successfully", proposal });
  } catch (error) {
    if (req.files["partA"] && req.files["partA"][0].path) {
      fs.unlinkSync(req.files["partA"][0].path);
    }
    if (req.files["partB"] && req.files["partB"][0].path) {
      fs.unlinkSync(req.files["partB"][0].path);
    }
    res.status(500).json({ error: error.message });
  }
};

const requestUpdate = async (req, res) => {
  try {
    const { proposal_id, reason } = req.body;

    // 🔹 Check if Proposal Exists
    const proposalExists = await TeacherProposal.findById(proposal_id);
    if (!proposalExists) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    const newRequest = new ProposalUpdateRequest({
      proposal_id,
      requester_type: "teacher",
      reason,
    });

    await newRequest.save();
    res
      .status(201)
      .json({ message: "Update request submitted successfully", newRequest });
  } catch (error) {
    // console.error("Error submitting update request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateProposal = async (req, res) => {
  try {
    const { proposal_id } = req.body;
    const updates = req.body.updates ? JSON.parse(req.body.updates) : {};

    // Check if the proposal exists
    const proposal = await TeacherProposal.findById(proposal_id);
    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    // Track uploaded files
    const uploadedFiles = [];

    // Function to handle file updates
    const updateFileField = (fieldName, existingPath) => {
      if (req.files[fieldName]) {
        const filePath = req.files[fieldName][0].path;
        uploadedFiles.push(filePath);

        // Delete the old file if it exists
        if (existingPath) {
          fs.unlink(existingPath, (err) => {
            if (err)
              console.error(`Failed to delete old file: ${existingPath}`, err);
          });
        }

        return filePath;
      }
      return existingPath;
    };

    // Apply dynamic field updates
    Object.keys(updates).forEach((key) => {
      if (proposal[key] !== undefined) {
        proposal[key] = updates[key];
      }
    });

    // Handle file uploads (if any)
    proposal.pdf_url_part_A = updateFileField("partA", proposal.pdf_url_part_A);
    proposal.pdf_url_part_B = updateFileField("partB", proposal.pdf_url_part_B);

    // Save updated proposal
    const updatedProposal = await proposal.save();

    res
      .status(200)
      .json({ message: "Proposal updated successfully", updatedProposal });
  } catch (error) {
    // console.error("Error updating proposal:", error);

    // If an error occurs, delete any newly uploaded files
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) console.error(`Failed to delete file: ${file.path}`, err);
          });
        });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getApprovedProposals = async (req, res) => {
  try {
    const teacherProposals = await TeacherProposal.find({ approval_status: 3 });
    res
      .status(200)
      .json({
        message: "All approved proposals !",
        StudentProposal: req.student_proposals,
        TeacherProposal: teacherProposals,
      });
  } catch (error) {
    // console.error("Error fetching proposals:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  submitProposal,
  updateProposal,
  requestUpdate,
  getApprovedProposals,
};
