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
const adminRoutes = require('./routes/admin.routes.js')
const reviewerRoutes = require('./routes/reviewer.routes.js')
const noticeRoutes = require('./routes/notice.routes.js')

app.use('/v1/api/research-proposal/', proposalRoutes);
app.use('/v1/api/admin/', adminRoutes);
app.use('/v1/api/reviewer/', reviewerRoutes);
app.use('/v1/api/notice/', noticeRoutes);

module.exports = app;