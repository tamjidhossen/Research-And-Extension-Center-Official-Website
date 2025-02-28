const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const cors = require('cors')
const connectToDb = require('./db/db.js')
connectToDb();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'));

const proposalRoutes = require('./routes/research_proposal.routes.js')

app.use('/v1/api/research-proposal/', proposalRoutes);

module.exports = app;