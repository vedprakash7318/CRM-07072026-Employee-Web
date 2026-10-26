import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ClipLoader } from 'react-spinners';
import { Dropdown } from 'primereact/dropdown';

export default function ExcelLeadsAdmin() {
    const APi_Url = import.meta.env.VITE_API_URL;
    const adminId = localStorage.getItem('addedBy');
    const token = localStorage.getItem('Token');

    const [leads, setLeads] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [file, setFile] = useState(null);
    const [columns, setColumns] = useState([]);
    
    const toast = useRef(null);

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`${APi_Url}/digicoder/crm/api/v1/employee/getAllEmployee/${adminId}`, authHeaders);
            if (res.data && res.data.data) {
                const mapped = res.data.data.map(emp => ({ label: emp.name || emp.empName, value: emp._id }));
                setEmployees(mapped);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${APi_Url}/digicoder/crm/api/v1/excel-leads/admin-leads`, authHeaders);
            if (res.data && res.data.leads) {
                setLeads(res.data.leads);
                // Extract dynamic columns from the first lead if it exists
                if (res.data.leads.length > 0 && res.data.leads[0].dynamicData) {
                    const cols = Object.keys(res.data.leads[0].dynamicData).map(key => ({
                        field: `dynamicData.${key}`,
                        header: key
                    }));
                    setColumns(cols);
                }
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch leads' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchLeads();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await axios.post(`${APi_Url}/digicoder/crm/api/v1/excel-leads/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data.success) {
                toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message });
                setFile(null);
                fetchLeads();
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Upload Error', detail: error.response?.data?.message || 'Upload failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedEmployee) {
            toast.current.show({ severity: 'warn', summary: 'Select Employee', detail: 'Please select an employee first' });
            return;
        }
        if (!selectedLeads || selectedLeads.length === 0) {
            toast.current.show({ severity: 'warn', summary: 'Select Leads', detail: 'Please select at least one lead' });
            return;
        }

        const leadIds = selectedLeads.map(l => l._id);
        setLoading(true);
        try {
            const res = await axios.post(`${APi_Url}/digicoder/crm/api/v1/excel-leads/assign`, {
                leadIds,
                employeeId: selectedEmployee
            }, authHeaders);
            
            if (res.data.success) {
                toast.current.show({ severity: 'success', summary: 'Assigned', detail: res.data.message });
                setSelectedLeads([]);
                setSelectedEmployee(null);
                fetchLeads();
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Assign Error', detail: 'Failed to assign leads' });
        } finally {
            setLoading(false);
        }
    };

    const assignedToTemplate = (rowData) => {
        return rowData.assignedTo ? (rowData.assignedTo.name || rowData.assignedTo.empName || 'Assigned') : <span style={{color: 'red'}}>Unassigned</span>;
    };

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '10px' }}>
            <Toast ref={toast} />
            <h2>Upload & Assign Excel Leads</h2>
            
            {/* Upload Section */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                <button 
                    onClick={handleUpload} 
                    disabled={!file || loading}
                    style={{ padding: '10px 20px', background: '#3454D1', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    {loading ? 'Uploading...' : 'Upload Excel'}
                </button>
            </div>

            {/* Assignment Section */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <Dropdown 
                    value={selectedEmployee} 
                    options={employees} 
                    onChange={(e) => setSelectedEmployee(e.value)} 
                    placeholder="Select an Employee to Assign" 
                    style={{ width: '300px' }}
                />
                <button 
                    onClick={handleAssign}
                    disabled={loading || selectedLeads.length === 0}
                    style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Assign Selected ({selectedLeads.length})
                </button>
            </div>

            {/* Dynamic Table */}
            {loading && !file ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><ClipLoader color="#3454D1" /></div>
            ) : (
                <DataTable 
                    value={leads} 
                    selection={selectedLeads} 
                    onSelectionChange={(e) => setSelectedLeads(e.value)}
                    dataKey="_id" 
                    paginator rows={10} 
                    scrollable scrollHeight="500px"
                    emptyMessage="No Excel Leads found."
                    responsiveLayout="scroll"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column header="Assigned To" body={assignedToTemplate} style={{ minWidth: '150px' }}></Column>
                    
                    {columns.map((col, i) => (
                        <Column key={col.field} field={col.field} header={col.header} style={{ minWidth: '150px' }} sortable />
                    ))}
                </DataTable>
            )}
        </div>
    );
}
