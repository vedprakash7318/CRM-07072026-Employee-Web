import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Dashboard from "../Components/Dashboard";
import {
  FaUsers,
  FaClock,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUniversity
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

        {/* Assigned Colleges */}
        <div className="dashboard-card assigned-colleges-card" style={{ gridColumn: "1 / -1", textAlign: "left", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f3f4f6", paddingBottom: "12px" }}>
            <FaUniversity style={{ color: "#4f46e5", fontSize: "28px", marginRight: "12px", marginBottom: "0" }} />
            <h4 style={{ fontSize: "18px", color: "#1f2937", margin: "0", fontWeight: "700" }}>My Assigned Colleges</h4>
          </div>
          
          {stats?.assignedColleges && stats.assignedColleges.length > 0 ? (
            <div className="colleges-container" style={{ display: "flex", flexWrap: "wrap", gap: "12px", maxHeight: "200px", overflowY: "auto", paddingRight: "8px" }}>
              {stats.assignedColleges.map((college, idx) => (
                <div key={idx} className="college-badge" style={{
                  display: "flex",
                  alignItems: "center",
                  background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                  color: "#3730a3",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  border: "1px solid #a5b4fc",
                  transition: "all 0.2s ease"
                }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4f46e5", marginRight: "8px" }}></div>
                  {college}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", color: "#9ca3af" }}>
              <FaUniversity style={{ fontSize: "32px", color: "#e5e7eb", marginBottom: "8px" }} />
              <p style={{ fontSize: "15px", margin: 0 }}>No colleges assigned yet</p>
            </div>
          )}
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
              <Bar dataKey="Negative" fill="#64748b" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="Followups" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Dashboard>
  );
};

export default MainDashboard;
