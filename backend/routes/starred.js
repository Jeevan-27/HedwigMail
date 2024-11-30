const express = require('express');
const Email = require('../models/Email');
const router = express.Router();

router.get('/', async (req, res) => {
  const { email } = req.query;
  console.log('Fetching starred emails for:', email); 
  try {
    const starredEmails = await Email.find({
      starredBy: { $in: [email] },
      deletedBy: { $nin: [email] }
    });
    console.log('Starred emails found:', starredEmails);
    res.json(starredEmails);
  } catch (error) {
    console.error('Error fetching starred emails:', error);
    res.status(500).json({ message: 'Error fetching starred emails', error });
  }
});

module.exports = router;