const express = require('express');
const router = express.Router();
const Email = require('../models/Email'); 

// GET route to fetch sent emails
router.get('/', async (req, res) => {
    const { email } = req.query;

    try {
        // Use binSend flag for sent emails
        const sentEmails = await Email.find({ 
            from: email,
            binSend: false
        });
        res.json(sentEmails);
    } catch (error) {
        console.error('Error fetching sent emails:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT route to move a sent email to bin
router.put('/:id/bin', async (req, res) => {
    const emailId = req.params.id;

    try {
        const updatedEmail = await Email.findByIdAndUpdate(
            emailId,
            { binSend: true },
            { new: true }
        );

        if (!updatedEmail) {
            return res.status(404).json({ message: 'Email not found' });
        }

        res.status(200).json({ message: 'Email moved to bin successfully' });
    } catch (error) {
        console.error('Error moving email to bin:', error);
        res.status(500).send('Error moving email to bin');
    }
});

// POST route to forward an email
router.post('/', async (req, res) => {
    const { from, to, subject, body, attachments, date } = req.body;

    // Ensure 'to' is an array of emails
    const recipients = Array.isArray(to) ? to : [to];

    // Create a new email entry for the forwarded email
    const forwardedEmail = new Email({
        from,
        to: recipients,
        recipients: recipients, // Set recipients same as to field
        subject: `${subject} (Forwarded)`,
        body,
        attachments: attachments || [],
        date: new Date(),
        binSend: false,    // Use binSend flag for sent emails
        deletedBy: [],     // Initialize empty deletedBy array for recipients
        type: 'sent'
    });

    try {
        const savedEmail = await forwardedEmail.save();
        res.status(201).json(savedEmail);
    } catch (error) {
        console.error('Error forwarding email:', error);
        res.status(500).json({ message: 'Error creating forwarded email', error });
    }
});

module.exports = router;