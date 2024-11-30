const express = require('express');
const router = express.Router();
const Email = require('../models/Email');

// Restore email (remove user from deletedBy)
router.put('/:id/restore', async (req, res) => {
  try {
    const emailId = req.params.id;
    const { userEmail } = req.body;

    const email = await Email.findById(emailId);

    if (!email) {
      return res.status(404).send('Email not found');
    }

    // Check if the logged-in user is the sender or recipient and restore accordingly
    if (email.from === userEmail && email.binSend === true) {
      // For sender, set binSend to false
      await Email.findByIdAndUpdate(emailId, { binSend: false });
      res.status(200).send('Email restored for the sender successfully');
    } else if (email.recipients.includes(userEmail) && email.deletedBy.includes(userEmail)) {
      // For recipient, remove from deletedBy array
      await Email.findByIdAndUpdate(emailId, {
        $pull: { deletedBy: userEmail }
      });
      res.status(200).send('Email restored for the recipient successfully');
    } else {
      res.status(400).send('No action required');
    }
  } catch (error) {
    console.error('Error restoring email:', error);
    res.status(500).send('Error restoring email');
  }
});

// Get bin emails for a specific user
router.get('/', async (req, res) => {
  const { email } = req.query;

  try {
    // Fetch all bin emails where:
    // 1. User is sender and binSend is true, OR
    // 2. User is in recipients and in deletedBy array
    const binEmails = await Email.find({
      $or: [
        { from: email, binSend: true },
        { 
          recipients: { $in: [email] },
          deletedBy: { $in: [email] }
        }
      ]
    });
    res.json(binEmails);
  } catch (err) {
    console.error('Error fetching bin emails:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const emailId = req.params.id;
    const { userEmail } = req.body;

    // Fetch the email document
    const email = await Email.findById(emailId);

    if (!email) {
      return res.status(404).send('Email not found');
    }

    let updated = false;

    // 1. If the user is the sender and the email is in their bin
    if (email.from === userEmail && email.binSend === true) {
      await Email.updateOne(
        { _id: emailId },
        { 
          $unset: { binSend: "" },
          // Remove sender from recipients if they exist there
          $pull: { recipients: userEmail }
        }
      );
      updated = true;
    }

    // 2. If the user is a recipient and has deleted it (exists in deletedBy)
    if (email.recipients.includes(userEmail) && email.deletedBy.includes(userEmail)) {
      await Email.updateOne(
        { _id: emailId },
        {
          // Remove user from recipients and deletedBy arrays
          $pull: {
            recipients: userEmail,
            deletedBy: userEmail,
            starredBy: userEmail
          }
        }
      );
      updated = true;
    }

    // If changes were made, check if the document should be deleted entirely
    if (updated) {
      // const updatedEmail = await Email.findById(emailId);

      // // Delete the email if no recipients remain and sender has deleted it (binSend is not set)
      // if (updatedEmail && updatedEmail.recipients.length === 0 && !updatedEmail.binSend) {
      //   await Email.deleteOne({ _id: emailId });
      //   return res.status(200).send('Email permanently deleted');
      // }

      // Final deletion condition: Delete only if there are no recipients left *and* it isn’t kept in the sent items
      // if (
      //   updatedEmail &&
      //   updatedEmail.recipients.length === 0 &&
      //   // updatedEmail.from !== userEmail && // Keeps self-addressed emails in sent box
      //   updatedEmail.binSend !== true
      // ) {
      //   await Email.deleteOne({ _id: emailId });
      //   return res.status(200).send('Email permanently deleted');
      // }


      return res.status(200).send('Email updated successfully');
    }

    res.status(400).send('No action required');
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).send('Error deleting email');
  }
});

module.exports = router;