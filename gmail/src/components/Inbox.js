import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Inbox.css';

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.email) {
      setLoggedInUserEmail(user.email);
    }
  }, []);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.email) {
          const response = await axios.get('http://localhost:1973/api/inbox', {
            params: { email: user.email },
          });
          setEmails(response.data);
        }
      } catch (error) {
        console.error('Error fetching inbox:', error);
      }
    };

    if (loggedInUserEmail) {
      fetchInbox();
    }
  }, [loggedInUserEmail]);

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleClose = () => {
    setSelectedEmail(null);
    setIsForwarding(false);
    setRecipientEmail('');
  };

  const toggleStarred = async (emailId) => {
    try {
      const response = await axios.put(
        `http://localhost:1973/api/inbox/${emailId}/star`,
        { email: loggedInUserEmail },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if (response.data) {
        // Update the emails list with the new data
        setEmails(prevEmails =>
          prevEmails.map(email =>
            email._id === emailId ? response.data : email
          )
        );
  
        // Also update selectedEmail if it's the one being starred/unstarred
        if (selectedEmail && selectedEmail._id === emailId) {
          setSelectedEmail(response.data);
        }
      }
    } catch (error) {
      console.error('Error updating starred status:', error);
      // Log the full error details for debugging
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      alert('Failed to update starred status. Please try again.');
    }
  };

  const handleDelete = async (emailId) => {
    try {
      await axios.put(`http://localhost:1973/api/inbox/${emailId}/bin`, {
        email: loggedInUserEmail
      });

      setEmails(prevEmails => prevEmails.filter(email => email._id !== emailId));
      
      if (selectedEmail && selectedEmail._id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error moving email to bin:', error);
      alert('Failed to delete email. Please try again.');
    }
  };

  const handleForward = () => {
    setIsForwarding(true);
  };

const handleSendForward = async () => {
  if (!recipientEmail) {
    alert("Please enter a recipient email.");
    return;
  }

  try {
    // Split recipients into an array, assuming comma-separated input
    const recipientList = recipientEmail.split(',').map(email => email.trim());

    const forwardedEmail = {
      to: recipientList, // Now properly formatted as an array
      recipients: recipientList, // Ensure `recipients` is an array
      from: loggedInUserEmail,
      subject: `Fwd: ${selectedEmail.subject}`,
      body: `
---------- Forwarded message ---------
From: ${selectedEmail.from}
Date: ${new Date(selectedEmail.date).toLocaleString()}
Subject: ${selectedEmail.subject}
To: ${selectedEmail.to.join(", ")}

${selectedEmail.body}`,
      attachments: selectedEmail.attachments || [],
      binSend: false, // Since this is a sent email, binSend is false
      deletedBy: [] // Initialize as empty array, as no recipient has deleted it
    };

    await axios.post('http://localhost:1973/api/send', forwardedEmail);
    alert("Email forwarded successfully!");
    handleClose();
  } catch (error) {
    console.error('Error forwarding email:', error);
    alert("Error forwarding email. Please try again.");
  }
};

  // Helper function to check if email is starred by current user
  const isStarredByUser = (email) => {
    return email.starredBy?.includes(loggedInUserEmail) || false;
  };

  return (
    <div className="main-content-container">
      <div className="inbox-list">
        <h2>Inbox</h2>
        <ul>
          {emails.map((email) => (
            <li 
              key={email._id} 
              onClick={() => handleEmailClick(email)} 
              className="email-item"
            >
              <span className="email-subject">{email.subject}</span>{' '}
              <span className="email-from">
                {email.from === loggedInUserEmail 
                  ? `To: ${Array.isArray(email.to) ? email.to.join(", ") : email.to}` 
                  : `From: ${email.from}`}
              </span>
              <button
                className={`star-btn ${isStarredByUser(email) ? 'starred' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStarred(email._id);
                }}
              >
                {isStarredByUser(email) ? '★' : '☆'}
              </button>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(email._id);
                }}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedEmail && (
        <div className="email-tray">
          <div className="email-tray-content">
            <button className="close-btn" onClick={handleClose}>✖</button>
            <h2>{selectedEmail.subject}</h2>
            <p><strong>From:</strong> {selectedEmail.from}</p>
            <p><strong>To:</strong> {selectedEmail.to}</p>
            <p><strong>Date:</strong> {new Date(selectedEmail.date).toLocaleString()}</p>
            <div className="email-body">
              <strong>Content:</strong>
              <pre>{selectedEmail.body}</pre>
            </div>
            {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
              <p><strong>Attachments:</strong> {selectedEmail.attachments.join(', ')}</p>
            )}

            <button className="forward-btn" onClick={handleForward}>Forward</button>

            {isForwarding && (
              <div className="forward-input">
                <input
                  type="email"
                  placeholder="Recipient email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
                <button onClick={handleSendForward}>Send</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;