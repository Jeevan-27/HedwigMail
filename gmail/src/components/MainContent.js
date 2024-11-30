import React from 'react';
import './MainContent.css';
import { Outlet } from 'react-router-dom';
const MainContent = () => {
  return (
    <main className="mainContent">
      <Outlet />
    </main>
  );
};

export default MainContent;