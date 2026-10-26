import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ClipLoader } from 'react-spinners';
import { TabView, TabPanel } from 'primereact/tabview';
import { Paginator } from 'primereact/paginator';
import FollowUpNotes from '../Components/FollowUpNotes';
import Dashboard from '../Components/Dashboard';
import { useNavigate } from 'react-router-dom';
import '../Components/CSS/DynamicCard.css';

export default function ExcelLeadsEmployee() {
    const APi_Url = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('Token');
    const navigate = useNavigate();

    const [sheets, setSheets] = useState([]);
    const [activeSheetIndex, setActiveSheetIndex] = useState(0);
    const [leads, setLeads] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1, search: '' });
    const [loading, setLoading] = useState(false);
    
    // For Followup modal
    const [noteOpen, setNoteOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState({});
    
    // Mobile view state
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toast = useRef(null);

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const fetchSheets = async () => {
        try {
            const res = await axios.get(`${APi_Url}/digicoder/crm/api/v1/excel-leads/employee-sheets`, authHeaders);
            if (res.data && res.data.sheets) {
                setSheets(res.data.sheets);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLeads = async (sheetName = sheets[activeSheetIndex], params = lazyParams) => {
        if (!sheetName) return;
        setLoading(true);
        try {
            const res = await axios.get(`${APi_Url}/digicoder/crm/api/v1/excel-leads/employee-leads`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    sheetName,
                    page: params.page,
                    limit: params.rows,
                    search: params.search
                }
            });
            if (res.data && res.data.success) {
                setLeads(res.data.leads);
                setTotalRecords(res.data.totalLeads);
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch your leads' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSheets();
    }, []);

    useEffect(() => {
        if (sheets.length > 0) {
            fetchLeads(sheets[activeSheetIndex], lazyParams);
        }
    }, [activeSheetIndex, lazyParams, sheets]);

    const handlePageChange = (event) => {
        setLazyParams({
            ...lazyParams,
            first: event.first,
            rows: event.rows,
            page: event.page + 1
        });
    };

    const handleSearch = (e) => {
        setLazyParams({
            ...lazyParams,
            search: e.target.value,
            first: 0,
            page: 1
        });
    };

    const handleStickyNote = (rowData) => {
        setSelectedLead({ ...rowData, isExcelLead: true });
        setNoteOpen(true);
    };

    const closeNote = () => {
        setNoteOpen(false);
        setSelectedLead({});
    };

    const getPhoneNumber = (dynamicData) => {
        if (!dynamicData) return null;
        for (const key of Object.keys(dynamicData)) {
            if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('mobile') || key.toLowerCase().includes('contact')) {
                return String(dynamicData[key]);
            }
        }
        return null;
    };

    const getName = (dynamicData) => {
        if (!dynamicData) return 'Unknown';
        for (const key of Object.keys(dynamicData)) {
            if (key.toLowerCase().includes('name')) {
                return String(dynamicData[key]);
            }
        }
        return dynamicData[Object.keys(dynamicData)[0]] || 'Unknown';
    };

    const handleView = (lead) => {
        navigate('/fullExcelLeads', { state: { viewdata: lead, TableTitle: "My Excel Leads" } });
    };

    const handleEdit = (lead) => {
        navigate('/fullExcelLeads', { state: { viewdata: lead, TableTitle: "My Excel Leads", fromEdit: true } });
    };

    const actionsTemplate = (rowData) => {
        const phone = getPhoneNumber(rowData.dynamicData);
        return (
            <div style={{display:"flex", gap:"5px", alignItems: 'center'}}>
                {/* View Button */}
                <div style={{ height: '35px', width: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button onClick={() => handleView(rowData)} style={{ color: 'red', backgroundColor: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer' }} title="View">
                        <i className="ri-eye-line"></i>
                    </button>
                </div>
                {/* Edit Button */}
                <div style={{ height: '35px', width: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button onClick={() => handleEdit(rowData)} style={{ color: '#3454D1', backgroundColor: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer' }} title="Edit">
                        <i className="ri-edit-box-fill"></i>
                    </button>
                </div>
                {/* Note Button */}
                <div style={{ height: '35px', width: '35px', backgroundColor: '#EDF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <button onClick={() => handleStickyNote(rowData)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#657C7B' }} title="Add Remark">
                        <i className="ri-sticky-note-add-fill" />
                    </button>
                </div>
                {/* WhatsApp Button */}
                {phone && (
                    <div style={{ height: '35px', width: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <a href={`https://wa.me/${phone.startsWith('+91') ? phone.replace(/\D/g, '') : '91' + phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <button style={{ color: 'green', border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer' }} title="WhatsApp">
                                <i className="ri-whatsapp-line"></i>
                            </button>
                        </a>
                    </div>
                )}
                {/* Phone Call Button */}
                {phone && (
                    <div style={{ height: '35px', width: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <a href={`tel:${phone}`} style={{ textDecoration: 'none', fontSize: '16px', color: '#3454D1', cursor: 'pointer' }} title="Call">
                            <i className="ri-phone-fill" />
                        </a>
                    </div>
                )}
            </div>
        );
    };

    const statusTemplate = (rowData) => {
        return rowData.leadStatus ? (
            <span style={{ padding: '5px 10px', borderRadius: '15px', background: '#e0f2f1', color: '#00695c', fontSize: '12px' }}>
                {rowData.leadStatus.statusName || 'Status Updated'}
            </span>
        ) : <span style={{color: '#999'}}>New</span>;
    };

    const getColumnsForSheet = (sheetLeads) => {
        if (!sheetLeads || sheetLeads.length === 0) return [];
        if (!sheetLeads[0].dynamicData) return [];
        return Object.keys(sheetLeads[0].dynamicData).map(key => ({
            field: `dynamicData.${key}`,
            header: key
        }));
    };

    return (
        <Dashboard active="excelLeads">
            <div style={{ padding: '20px', background: '#fff', borderRadius: '10px', width: '100%', boxSizing: 'border-box' }}>
                <style>
                    {`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        .no-scrollbar {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                        }
                        /* Ensure the parent doesn't stretch */
                        .p-tabview-panels {
                            padding: 0;
                        }
                    `}
                </style>
                <Toast ref={toast} />
                <h2>My Excel Leads</h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span className="p-input-icon-left" style={{ flex: 1, maxWidth: '300px' }}>
                        <i className="ri-search-line" />
                        <input 
                            type="text" 
                            className="p-inputtext p-component" 
                            placeholder="Search..." 
                            value={lazyParams.search} 
                            onChange={handleSearch} 
                            style={{ width: '100%', paddingLeft: '35px' }}
                        />
                    </span>
                </div>

                {sheets.length > 0 ? (
                    <TabView activeIndex={activeSheetIndex} onTabChange={(e) => {
                        setActiveSheetIndex(e.index);
                        setLazyParams({ ...lazyParams, first: 0, page: 1 });
                    }}>
                        {sheets.map((sheetKey, index) => {
                            const cols = getColumnsForSheet(leads);
                            return (
                                <TabPanel header={sheetKey} key={sheetKey}>
                                    {isMobile ? (
                                        <div className="dynamic-card-outer" style={{ padding: '0', background: 'transparent' }}>
                                            {loading ? (
                                                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><ClipLoader color="#3454D1" /></div>
                                            ) : leads.map((lead, index) => {
                                                const phone = getPhoneNumber(lead.dynamicData);
                                                const name = getName(lead.dynamicData);
                                                return (
                                                    <div key={lead._id || index} className="Dynamic-card" style={{ width: '100%', margin: '10px 0' }}>
                                                        <div className="dynamic-card-details-body">
                                                            <div className="dynamic-card-details">
                                                                <div className="card-body">
                                                                    <p>
                                                                        <span className="card-heading">Name:- </span>
                                                                        <span>{name}</span>
                                                                    </p>
                                                                    {phone && (
                                                                        <p>
                                                                            <span className="card-heading">Phone:- </span>
                                                                            <span>{phone}</span>
                                                                        </p>
                                                                    )}
                                                                    <p>
                                                                        <span className="card-heading">Status:- </span>
                                                                        {statusTemplate(lead)}
                                                                    </p>
                                                                    {Object.keys(lead.dynamicData).slice(0, 3).map(key => {
                                                                        if (key.toLowerCase().includes('name') || key.toLowerCase().includes('phone') || key.toLowerCase().includes('mobile') || key.toLowerCase().includes('contact')) return null;
                                                                        return (
                                                                            <p key={key}>
                                                                                <span className="card-heading">{key}:- </span>
                                                                                <span>{lead.dynamicData[key]}</span>
                                                                            </p>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="dynamic-card-footer">
                                                            <div className="action-abtn">
                                                                <div className="call-icon-wrapper">
                                                                    <button onClick={() => handleEdit(lead)} style={{ color: '#3454D1', backgroundColor: 'transparent', border: 'none', fontSize: '15px', cursor: 'pointer' }}><i className="ri-edit-box-fill"></i></button>
                                                                </div>
                                                                <div className="call-icon-wrapper">
                                                                    <button onClick={() => handleView(lead)} style={{ color: 'red', backgroundColor: 'transparent', border: 'none', fontSize: '15px', cursor: 'pointer' }}><i className="ri-eye-line"></i></button>
                                                                </div>
                                                            </div>
                                                            <div className="action-btn-footer">
                                                                <div className="call-icon-wrapper">
                                                                    <button onClick={() => handleStickyNote(lead)} style={{ border: 'none', background: 'transparent' }}><i style={{ cursor: 'pointer', fontSize: '15px', color: '#657C7B' }} className="ri-sticky-note-add-fill" /></button>
                                                                </div>
                                                                {phone && (
                                                                    <div className="call-icon-wrapper">
                                                                        <a href={`https://wa.me/${phone.startsWith('+91') ? phone.replace(/\D/g, '') : '91' + phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                                            <button style={{ color: 'green', border: 'none', background: 'transparent', fontSize: '15px', cursor: 'pointer', position: 'relative', bottom: '2px' }}><i className="ri-whatsapp-line"></i></button>
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {phone && (
                                                                    <div className="call-icon-wrapper">
                                                                        <a href={`tel:${phone}`} style={{ cursor: 'pointer', textDecoration: 'none', fontSize: '15px', color: '#3454D1' }}><i className="ri-phone-fill" /></a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {totalRecords > 0 && (
                                                <Paginator 
                                                    first={lazyParams.first} 
                                                    rows={lazyParams.rows} 
                                                    totalRecords={totalRecords} 
                                                    rowsPerPageOptions={[10, 25, 50]}
                                                    onPageChange={handlePageChange} 
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="no-scrollbar" style={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
                                            <DataTable 
                                                value={leads} 
                                                lazy
                                                first={lazyParams.first}
                                                rows={lazyParams.rows}
                                                totalRecords={totalRecords}
                                                onPage={handlePageChange}
                                                loading={loading}
                                                dataKey="_id" 
                                                paginator 
                                                rowsPerPageOptions={[10, 25, 50]}
                                                emptyMessage="No assigned leads found."
                                            >
                                                <Column header="Actions" body={actionsTemplate} style={{ minWidth: '150px', textAlign: 'center' }}></Column>
                                                <Column header="Status" body={statusTemplate} style={{ minWidth: '120px' }}></Column>
                                                
                                                {cols.map((col) => (
                                                    <Column key={col.field} field={col.field} header={col.header} style={{ minWidth: '150px' }} sortable />
                                                ))}
                                            </DataTable>
                                        </div>
                                    )}
                                </TabPanel>
                            );
                        })}
                    </TabView>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No assigned leads found.</div>
                )}

                {noteOpen && (
                    <FollowUpNotes 
                        isOpenNote={noteOpen} 
                        oncloseNote={closeNote} 
                        leadData={selectedLead} 
                        onFollowupAdded={fetchLeads}
                    />
                )}
            </div>
        </Dashboard>
    );
}
