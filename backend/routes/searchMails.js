const express = require('express');
const router = express.Router();
const Inbox = require('../models/Email');  
const Draft = require('../models/Drafts'); 

// Search emails based on query and user email
router.get('/', async (req, res) => {
  const { email, query } = req.query;

  try {
    const inboxEmails = await Inbox.find({
      $or: [
        { recipients: email, subject: { $regex: query, $options: 'i' }, deletedBy: { $nin: [email] }, binSend: false }, // Fetch inbox emails for recipients, not deleted, and not in the bin
        { from: email, subject: { $regex: query, $options: 'i' }, binSend: false }, // Fetch sent emails from the user that are not in the bin
      ],
    });

    const draftEmails = await Draft.find({
      from: email,
      subject: { $regex: query, $options: 'i' },
    });

    const allEmails = [...inboxEmails, ...draftEmails];

    res.json(allEmails);
  } catch (err) {
    console.error('Error searching emails:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;