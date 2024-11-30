const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  to: { type: [String], required: true },
  recipients: { type: [String], required: true },
  from: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  date: { type: Date, required: true },
  starredBy: { type: [String], default: [] },
  deletedBy: { type: [String], default: [] },
  binSend: { type: Boolean, default: false },
  type: { type: String, default: 'inbox' },
  attachments: [String]
});

module.exports = mongoose.model('Email', EmailSchema, 'inbox');