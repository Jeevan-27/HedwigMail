const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
    to: { type: [String], default: [] },               // Array of recipient emails
    recipients: { type: [String], default: [] },       // Array of all recipients (same as `to`)
    from: { type: String, required: true },            // Sender's email
    subject: { type: String, default: '' },            // Subject of the draft
    body: { type: String, default: '' },               // Body content of the draft
    date: { type: Date, default: Date.now },           // Date of draft creation or update
    starredBy: { type: [String], default: [] },        // Array of users who starred this draft
    deletedBy: { type: [String], default: [] },        // Users who have marked the draft as deleted
    binSend: { type: Boolean, default: false },        // Whether the draft is in the sender's bin
    type: { type: String, default: 'drafts' },         // Default type as 'drafts'
    attachments: { type: [String], default: [] },      // Array for attachment URLs or filenames
});

module.exports = mongoose.model('Draft', draftSchema, 'drafts');