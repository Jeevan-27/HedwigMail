const express = require('express');
const router = express.Router();
const Email = require('../models/Email');

// POST route to handle sending emails
router.post('/', async (req, res) => {
    const { to, from, subject, body } = req.body;

    // Ensure 'to' is an array of emails
    const recipients = Array.isArray(to) ? to.map(email => email.trim()) : to.split(',').map(email => email.trim());

    try {
        // Create a single email with multiple recipients
        const email = new Email({
            to: recipients,         // Array of all recipients
            recipients: recipients, // Same as 'to' field
            from,
            subject,
            body,
            date: new Date(),
            starredBy: [],
            deletedBy: [],         // Initialize empty deletedBy array
            type: 'inbox',
            attachments: []
        });

        await email.save();
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error saving email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

module.exports = router;