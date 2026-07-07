import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../Components/Dashboard';
import NegativeLeadPage from './NegativeLeadPage';

function NegativeLead() {
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
      <Dashboard active={'negative'}>

        {/* 🔥 SERVER-SIDE PAGINATED COMPONENT (Contains both table and card views) */}
        <NegativeLeadPage TableTitle="Negative Lead" />

      </Dashboard>
    </>
  );
}

export default NegativeLead;