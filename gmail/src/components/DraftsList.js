import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import './DraftsList.css';
import ComposeMail from './ComposeMail'; // Import ComposeMail component

const DraftsList = ({ isDarkTheme }) => {
    const [drafts, setDrafts] = useState([]);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const response = await axios.get('http://localhost:1973/api/drafts', {
                    params: { email: user.email },
                });
                setDrafts(response.data || []);
            } catch (error) {
                console.error('Error fetching drafts:', error);
            }
        };
        fetchDrafts();
    }, []);

    const handleDraftClick = (draft) => {
        setSelectedDraft(draft);
        setIsComposeOpen(true);
    };

    return (
        <Box className="drafts-list-container">
            <Typography variant="h5" style={{ fontWeight: "bold", textAlign: "center" }}>Drafts</Typography>
            <ul>
                {drafts.map((draft) => (
                    <li key={draft._id} onClick={() => handleDraftClick(draft)} className="draft-item">
                        <span className="draft-subject">{draft.subject}</span> - <span className="draft-from">{draft.to}</span>
                    </li>
                ))}
            </ul>
            {isComposeOpen && (
                <ComposeMail
                    open={isComposeOpen}
                    setOpenDrawer={setIsComposeOpen}
                    isDarkTheme={isDarkTheme}
                    draftData={selectedDraft}
                />
            )}
        </Box>
    );
};

export default DraftsList;