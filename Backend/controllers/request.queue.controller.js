const mongoose = require('mongoose');
const RequestQueueModel = require('../models/request.queue.model.js');
const Request = require('../models/request.model.js');

// Add a request to the queue
const addToQueue = async (request_id) => {
    try {
        // Convert string ID to ObjectId if needed
        const objectId = mongoose.Types.ObjectId.isValid(request_id)
            ? new mongoose.Types.ObjectId(request_id)
            : request_id;


        // Validate request exists
        const requestExists = await Request.findById(objectId);
        if (!requestExists) {
            throw new Error('Request not found');
        }

        // Check if already in queue
        const existing = await RequestQueueModel.findOne({ request_id: objectId });
        if (existing) {
            // Update expire time
            existing.expire_time = new Date(new Date().getTime() + 30 * 60000); // 30 minutes
            await existing.save();
            return existing;
        }

        // Create new queue entry
        const queueEntry = new RequestQueueModel({ request_id: objectId });
        const savedEntry = await queueEntry.save();

        // Verify it was added
        const verifyEntry = await RequestQueueModel.findOne({ request_id: objectId });

        return savedEntry;
    } catch (error) {
        console.error('Error adding to queue:', error);
        throw error;
    }
};

// Check if request is in queue
const checkInQueue = async (request_id) => {
    try {
        // Convert string ID to ObjectId if needed
        const objectId = mongoose.Types.ObjectId.isValid(request_id)
            ? new mongoose.Types.ObjectId(request_id)
            : request_id;


        // Log all existing entries for debugging
        const allEntries = await RequestQueueModel.find({});


        const queueEntry = await RequestQueueModel.findOne({ request_id: objectId });

        return !!queueEntry;
    } catch (error) {
        console.error('Error checking queue:', error);
        throw error;
    }
};

// Remove from queue
const removeFromQueue = async (request_id) => {
    try {
        // Convert string ID to ObjectId if needed
        const objectId = mongoose.Types.ObjectId.isValid(request_id)
            ? new mongoose.Types.ObjectId(request_id)
            : request_id;


        const result = await RequestQueueModel.findOneAndDelete({ request_id: objectId });

        return !!result;
    } catch (error) {
        console.error('Error removing from queue:', error);
        throw error;
    }
};

module.exports = {
    addToQueue,
    checkInQueue,
    removeFromQueue
};