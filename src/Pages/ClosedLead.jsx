import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../Components/Dashboard';
import ClosedLeadPage from './ClosedLeadPage';

function ClosedLead() {
  const navigate = useNavigate();

  // 🔐 Auth check
  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <>
      <Dashboard active={'closedLead'}>

        {/* 🔥 SERVER-SIDE PAGINATED COMPONENT (Contains both table and card views) */}
        <ClosedLeadPage TableTitle="Closed Lead" />

      </Dashboard>
    </>
  );
}

export default ClosedLead;