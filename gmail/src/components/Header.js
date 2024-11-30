import React, { useState, useEffect } from 'react';
import { FiMenu, FiSettings, FiUser } from 'react-icons/fi';
import axios from 'axios';
import UserInfo from './UserInfo';
import Settings from './Settings';
import BottomTray from './BottomTray';
import SearchResultsDialog from './SearchResultsDialog'; // Import the dialog component
import './Header.css';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar, onToggleTheme }) => {
  const [isUserInfoVisible, setUserInfoVisible] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isSearchDialogOpen, setSearchDialogOpen] = useState(false); // New state to manage search dialog visibility
  const [user, setUser] = useState({ username: '', email: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleUserClick = () => {
    setUserInfoVisible(!isUserInfoVisible);
  };

  const handleSettingsClick = () => {
    setSettingsVisible(!isSettingsVisible);
    setUserInfoVisible(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length > 0) {
      try {
        const response = await axios.get('http://localhost:1973/api/searchMails', {
          params: { email: user.email, query },
        });
        setSearchResults(response.data);
        setSelectedEmail(null);
        setSearchDialogOpen(true); // Open the search results dialog
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    } else {
      setSearchResults([]);
      setSelectedEmail(null);
      setSearchDialogOpen(false); // Close the dialog if search is cleared
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email); // Show the email in the bottom tray
    setSearchDialogOpen(false); // Close the search results dialog when an email is clicked
  };

  return (
    <header className="header">
      <div className="header__left">
        <FiMenu className="header__menuIcon" onClick={toggleSidebar} />
        <img
          src={require('../assets/Logo-removebg3.png')}
          alt="Smail"
          className="header__logo"
        />
      </div>
      <div className="header__center">
        <input
          type="text"
          placeholder="Search mail"
          className="header__search"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="header__right">
        <FiSettings className="header__icon" onClick={handleSettingsClick} />
        <FiUser className="header__icon" onClick={handleUserClick} />
        <UserInfo
          username={user.username}
          email={user.email}
          onLogout={handleLogout}
          isVisible={isUserInfoVisible}
        />
        <Settings isVisible={isSettingsVisible} onToggleTheme={onToggleTheme} />
      </div>

      {selectedEmail && (
        <BottomTray email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}

      {/* Search Results Dialog */}
      <SearchResultsDialog
        isOpen={isSearchDialogOpen}
        searchResults={searchResults}
        onEmailClick={handleEmailClick}
        onClose={() => setSearchDialogOpen(false)} // Close the dialog when clicking outside or on close button
      />
    </header>
  );
};

export default Header;