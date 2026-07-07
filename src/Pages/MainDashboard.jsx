import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Dashboard from "../Components/Dashboard";
import {
  FaUsers,
  FaClock,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import "./CSS/MainDashboard.css";

const MainDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState("daily");

  const API_URL = import.meta.env.VITE_API_URL;
  const empId = localStorage.getItem("employeeId");

  useEffect(() => {
    if (!empId) {
      navigate("/");
      return;
    }
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (empId) fetchChartData();
  }, [chartPeriod]);

  const fetchChartData = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/digicoder/crm/api/v1/dashboard/employee-chart/${empId}?period=${chartPeriod}`
      );
      if (res.data.success) {
        setChartData(res.data.data);
      }
    } catch (error) {
      console.error("Chart data error:", error);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/digicoder/crm/api/v1/dashboard/employee/${empId}`
      );
      setStats(res.data.data);
      console.log(res.data.data);

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dashboard active="dashboard">
        <div className="dashboard-loader">Loading...</div>
      </Dashboard>
    );
  }

  return (
    <Dashboard active="dashboard">
      <div className="dashboard-grid">

        {/* Missed Leads (Moved to Top) */}
        <div className="dashboard-card missed-card" onClick={() => navigate("/missedLeads")}>
          <FaExclamationTriangle />
          <h4>Missed Leads</h4>
          <h1>{stats?.missedLeads}</h1>
        </div>

        {/* Today's Reminders (Moved to Top) */}
        <div className="dashboard-card reminder-card" onClick={() => navigate("/todayReminders")}>
          <FaBell />
          <h4>Today's Reminders</h4>
          <h1>{stats?.todayReminders}</h1>
        </div>

        {/* Target Progress */}
        <div className="dashboard-card target-card">
          <FaCheckCircle />
          <h4>Daily Target</h4>
          <h1>{stats?.achievement}%</h1>
          <p>{stats?.todayFollowups} / {stats?.target} Achieved</p>
        </div>

        {/* Total Leads */}
        <div className="dashboard-card" onClick={() => navigate("/leads")}>
          <FaUsers />
          <h4>Total Leads</h4>
          <h1>{stats?.totalLeads}</h1>
        </div>

        {/* Pending Leads */}
        <div className="dashboard-card" onClick={() => navigate("/pending")}>
          <FaClock />
          <h4>Pending Leads</h4>
          <h1>{stats?.pendingLeads}</h1>
        </div>

        {/* Today's Followups */}
        <div className="dashboard-card" onClick={() => navigate("/followups/today")}>
          <FaClock />
          <h4>Today's Followups</h4>
          <h1>{stats?.todayFollowups}</h1>
        </div>

        {/* Total Followups */}
        <div className="dashboard-card" onClick={() => navigate("/followups")}>
          <FaUsers />
          <h4>Total Followups</h4>
          <h1>{stats?.totalFollowups}</h1>
        </div>

        {/* Closed Leads */}
        <div className="dashboard-card" onClick={() => navigate("/closed")}>
          <FaCheckCircle />
          <h4>Closed Leads</h4>
          <h1>{stats?.closedLeads}</h1>
          <p>{stats?.completionRate}% completed</p>
        </div>

        {/* Negative Leads */}
        <div className="dashboard-card" onClick={() => navigate("/negative")}>
          <FaExclamationTriangle />
          <h4>Negative Leads</h4>
          <h1>{stats?.negativeLeads}</h1>
        </div>

      </div>

      <div className="custom-chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 className="custom-chart-title" style={{ marginBottom: 0 }}>Reality Vs Target</h3>
          <select 
            value={chartPeriod} 
            onChange={(e) => setChartPeriod(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{fill: '#4b5563', fontSize: 14}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#4b5563', fontSize: 14}} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="Reminders" fill="#eab308" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="Missed" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="Closed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Dashboard>
  );
};

export default MainDashboard;
