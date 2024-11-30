import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MainContent.css';

const StarredEmails = () => {
  const [starredEmails, setStarredEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStarredEmails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.email) {
          const response = await axios.get('http://localhost:1973/api/starred', {
            params: { email: user.email },
          });
          console.log('Fetched starred emails:', response.data); // Log response
          setStarredEmails(response.data);
        } else {
          setError('User email is not available.');
        }
      } catch (err) {
        console.error('Error fetching starred emails:', err);
        setError('Failed to load starred emails.');
      } finally {
        setLoading(false);
      }
    };    

    fetchStarredEmails();
  }, []);

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleClose = () => {
    setSelectedEmail(null);
  };

  if (loading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="main-content-container">
      <div className="inbox-list">
        <h2>Starred Emails</h2>
        {starredEmails.length === 0 ? (
          <p>No starred emails found.</p>
        ) : (
          <ul className="starred-emails-list">
            {starredEmails.map((email) => (
              <li key={email._id} onClick={() => handleEmailClick(email)} className="email-item">
                <span className="email-subject">{email.subject}</span> -{' '}
                <span className="email-from">{email.from}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedEmail && (
        <div className="email-tray">
          <div className="email-tray-content">
            <button className="close-btn" onClick={handleClose}>✖</button>
            <h2>{selectedEmail.subject}</h2>
            <p><strong>From:</strong> {selectedEmail.from}</p>
            <p><strong>To:</strong> {selectedEmail.to}</p>
            <p><strong>Date:</strong> {new Date(selectedEmail.date).toLocaleString()}</p>
            <p><strong>Content:</strong> {selectedEmail.body}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarredEmails;