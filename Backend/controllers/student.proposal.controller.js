const studentProposalModel = require('../models/student.proposal.model.js')

const submitProposal = async (req, res, next) => {
    console.log(req.body);
    res.send("Done!");
};

module.exports = { submitProposal };