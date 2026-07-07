import React, { useEffect } from 'react';
import Dashboard from '../Components/Dashboard';
import './CSS/MissedLeads.css';
import { useNavigate } from 'react-router-dom';
import MissedLeadsPage from './MissedLeadsPage';

function MissedLeads() {
  const navigate = useNavigate();

  // 🔐 Auth check
  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div>
      <Dashboard active={'missedLead'}>
        <div className="content">

          {/* 🔥 SERVER-SIDE PAGINATED COMPONENT (Contains both table and card views) */}
          <MissedLeadsPage TableTitle="Missed Leads" />

        </div>
      </Dashboard>
    </div>
  );
}

export default MissedLeads;