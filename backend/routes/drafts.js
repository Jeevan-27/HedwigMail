const express = require('express');
const router = express.Router();
const Draft = require('../models/Drafts');

// Route to save or update a draft
router.post('/', async (req, res) => {
    const { _id, to, from, subject, body, attachments } = req.body;

    // Check if `to` is already an array; if not, split the string by commas
    const recipients = Array.isArray(to) ? to.map(email => email.trim()) : to.split(',').map(email => email.trim());

    try {
        let draft;

        if (_id) {
            // Update existing draft
            draft = await Draft.findByIdAndUpdate(
                _id,
                { to: recipients, recipients, from, subject, body, attachments, date: Date.now() },
                { new: true } // Return the updated document
            );

            if (!draft) {
                return res.status(404).json({ message: 'Draft not found for update' });
            }
        } else {
            // Create new draft
            draft = new Draft({
                to: recipients,
                recipients,
                from,
                subject,
                body,
                attachments,
                date: Date.now()
            });
            await draft.save();
        }

        res.status(_id ? 200 : 201).json(draft);
    } catch (error) {
        console.error('Error saving draft:', error);
        res.status(500).json({ message: 'Error saving draft', error: error.message });
    }
});

// Route to fetch all drafts for a specific user
router.get('/', async (req, res) => {
    const { email } = req.query;

    try {
        const drafts = await Draft.find({ from: email });
        res.status(200).json(drafts);
    } catch (error) {
        console.error('Error fetching drafts:', error);
        res.status(500).json({ message: 'Error fetching drafts', error });
    }
});

// Route to delete a draft by ID
router.delete('/:id', async (req, res) => {
    try {
        const draftId = req.params.id;
        const deletedDraft = await Draft.findByIdAndDelete(draftId);

        if (!deletedDraft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.status(200).json({ message: 'Draft deleted successfully' });
    } catch (error) {
        console.error('Error deleting draft:', error);
        res.status(500).json({ message: 'Error deleting draft', error });
    }
});

module.exports = router;