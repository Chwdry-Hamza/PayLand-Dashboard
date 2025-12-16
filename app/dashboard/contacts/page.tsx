'use client';
import { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Modal, Box, TextField, MenuItem, FormControlLabel,IconButton, Checkbox } from '@mui/material';
import { Edit, Delete, Visibility, Phone, Email } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import * as XLSX from 'xlsx';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f59e0b',
    },
    background: {
      default: '#0f0f1a',
      paper: '#1e1e32',
    },
  },
});

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phone: string;
  jobTitle: string;
  website: string;
  businessType: string;
  companySize: string;
  countryHQ: string;
  interestedIn: string;
  geographiesTargeting: string;
  hearAboutUs: string;
  consent: boolean;
  newsletter: boolean;
  createdAt: string;
  saved: boolean;
}

export default function Contacts() {
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editContactId, setEditContactId] = useState<string | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phone: '',
    jobTitle: '',
    website: '',
    businessType: '',
    companySize: '',
    countryHQ: '',
    interestedIn: '',
    geographiesTargeting: '',
    hearAboutUs: '',
    consent: false,
    newsletter: false,
  });

  const filteredContacts = contacts.filter((contact) =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    contact.email.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/contact');
        if (Array.isArray(response.data.contacts)) {
          const mappedData: Contact[] = response.data.contacts.map((item: any) => ({
            id: item._id,
            firstName: item.firstName || 'N/A',
            lastName: item.lastName || 'N/A',
            email: item.email || 'N/A',
            country: item.country || 'N/A',
            phone: item.phone || 'N/A',
            jobTitle: item.jobTitle || 'N/A',
            website: item.website || 'N/A',
            businessType: item.businessType || 'N/A',
            companySize: item.companySize || 'N/A',
            countryHQ: item.countryHQ || 'N/A',
            interestedIn: item.interestedIn || 'N/A',
            geographiesTargeting: item.geographiesTargeting || 'N/A',
            hearAboutUs: item.hearAboutUs || 'N/A',
            consent: item.consent || false,
            newsletter: item.newsletter || false,
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'N/A',
            saved: item.saved || false,
          }));
          setContacts(mappedData);
        }
      } catch (error) {
        console.error('Error fetching contact data:', error);
        setContacts([]);
      }
    };
    fetchData();
  }, []);

  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'Name',
      width: 190,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
            {params.row.firstName.charAt(0)}
          </div>
          <button
            onClick={() => handleViewContact(params.row.id)}
            className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            {`${params.row.firstName} ${params.row.lastName}`}
          </button>
        </div>
      ),
    },
    { field: 'email', headerName: 'Email', width: 180 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { field: 'country', headerName: 'Country', width: 70 },
    { field: 'interestedIn', headerName: 'Interested In', width: 120 },
    { field: 'website', headerName: 'Website', width: 175 },
    // {
    //   field: 'businessType',
    //   headerName: 'Business',
    //   width: 110,
    //   renderCell: (params: GridRenderCellParams) => (
    //     <span className="px-2 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400">
    //       {params.value}
    //     </span>
    //   ),
    // },
    { field: 'companySize', headerName: 'Size', width: 70 },
    { field: 'createdAt', headerName: 'Created', width: 100 },
    {
      field: 'call',
      headerName: 'Call',
      width: 60,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          sx={{ color: '#22c55e', '&:hover': { backgroundColor: 'rgba(34, 197, 94, 0.1)' } }}
          onClick={() => window.location.href = `tel:${params.row.phone}`}
          aria-label="call contact"
          disabled={!params.row.phone || params.row.phone === 'N/A'}
        >
          <Phone />
        </IconButton>
      ),
    },
    {
      field: 'sendEmail',
      headerName: 'Mail',
      width: 60,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          sx={{ color: '#3b82f6', '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' } }}
          onClick={() => window.location.href = `mailto:${params.row.email}`}
          aria-label="email contact"
          disabled={!params.row.email || params.row.email === 'N/A'}
        >
          <Email />
        </IconButton>
      ),
    },
    {
      field: 'save',
      headerName: 'Save',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <button
          onClick={() => handleToggleSave(params.row.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            params.row.saved
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              : 'bg-gray-700/50 text-gray-400 hover:bg-amber-500/20 hover:text-amber-400'
          }`}
        >
          {params.row.saved ? 'Saved' : 'Save'}
        </button>
      ),
    },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 60,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          color="primary"
          onClick={() => handleEditContact(params.row.id)}
          aria-label="edit contact"
          disabled={params.row.saved}
          sx={{ opacity: params.row.saved ? 0.3 : 1 }}
        >
          <Edit />
        </IconButton>
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 60,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          color="error"
          onClick={() => handleOpenDeleteModal(params.row.id)}
          aria-label="delete contact"
          disabled={params.row.saved}
          sx={{ opacity: params.row.saved ? 0.3 : 1 }}
        >
          <Delete />
        </IconButton>
      ),
    },
  ];

  const handleOpenModal = () => {
    setIsViewMode(false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditContactId(null);
    setIsViewMode(false);
    setNewContact({
      firstName: '', lastName: '', email: '', country: '', phone: '', jobTitle: '',
      website: '', businessType: '', companySize: '', countryHQ: '', interestedIn: '',
      geographiesTargeting: '', hearAboutUs: '', consent: false, newsletter: false,
    });
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeleteContactId(id);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setDeleteContactId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewContact((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/contact', newContact);
      const newContactFromAPI = response.data.contact;
      const contactToAdd: Contact = {
        id: newContactFromAPI._id || `temp-${Date.now()}`,
        firstName: newContactFromAPI.firstName || 'N/A',
        lastName: newContactFromAPI.lastName || 'N/A',
        email: newContactFromAPI.email || 'N/A',
        country: newContactFromAPI.country || 'N/A',
        phone: newContactFromAPI.phone || 'N/A',
        jobTitle: newContactFromAPI.jobTitle || 'N/A',
        website: newContactFromAPI.website || 'N/A',
        businessType: newContactFromAPI.businessType || 'N/A',
        companySize: newContactFromAPI.companySize || 'N/A',
        countryHQ: newContactFromAPI.countryHQ || 'N/A',
        interestedIn: newContactFromAPI.interestedIn || 'N/A',
        geographiesTargeting: newContactFromAPI.geographiesTargeting || 'N/A',
        hearAboutUs: newContactFromAPI.hearAboutUs || 'N/A',
        consent: newContactFromAPI.consent || false,
        newsletter: newContactFromAPI.newsletter || false,
        createdAt: newContactFromAPI.createdAt ? new Date(newContactFromAPI.createdAt).toISOString().split('T')[0] : 'N/A',
        saved: false,
      };
      setContacts([...contacts, contactToAdd]);
      handleCloseModal();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleViewContact = (id: string) => {
    const contactToView = contacts.find((contact) => contact.id === id);
    if (contactToView) {
      setNewContact({
        firstName: contactToView.firstName,
        lastName: contactToView.lastName,
        email: contactToView.email,
        country: contactToView.country,
        phone: contactToView.phone,
        jobTitle: contactToView.jobTitle,
        website: contactToView.website,
        businessType: contactToView.businessType,
        companySize: contactToView.companySize,
        countryHQ: contactToView.countryHQ,
        interestedIn: contactToView.interestedIn,
        geographiesTargeting: contactToView.geographiesTargeting,
        hearAboutUs: contactToView.hearAboutUs,
        consent: contactToView.consent,
        newsletter: contactToView.newsletter,
      });
      setEditContactId(id);
      setIsViewMode(true);
      setOpenModal(true);
    }
  };

  const handleEditContact = (id: string) => {
    const contactToEdit = contacts.find((contact) => contact.id === id);
    if (contactToEdit) {
      setNewContact({
        firstName: contactToEdit.firstName === 'N/A' ? '' : contactToEdit.firstName,
        lastName: contactToEdit.lastName === 'N/A' ? '' : contactToEdit.lastName,
        email: contactToEdit.email === 'N/A' ? '' : contactToEdit.email,
        country: contactToEdit.country === 'N/A' ? '' : contactToEdit.country,
        phone: contactToEdit.phone === 'N/A' ? '' : contactToEdit.phone,
        jobTitle: contactToEdit.jobTitle === 'N/A' ? '' : contactToEdit.jobTitle,
        website: contactToEdit.website === 'N/A' ? '' : contactToEdit.website,
        businessType: contactToEdit.businessType,
        companySize: contactToEdit.companySize,
        countryHQ: contactToEdit.countryHQ === 'N/A' ? '' : contactToEdit.countryHQ,
        interestedIn: contactToEdit.interestedIn,
        geographiesTargeting: contactToEdit.geographiesTargeting === 'N/A' ? '' : contactToEdit.geographiesTargeting,
        hearAboutUs: contactToEdit.hearAboutUs,
        consent: contactToEdit.consent,
        newsletter: contactToEdit.newsletter,
      });
      setEditContactId(id);
      setIsViewMode(false);
      setOpenModal(true);
    }
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContactId) return;
    try {
      const response = await axios.put(`/api/contact/${editContactId}`, newContact);
      const updatedContactFromAPI = response.data.contact;
      const existingContact = contacts.find(c => c.id === editContactId);
      const updatedContact: Contact = {
        id: editContactId,
        firstName: updatedContactFromAPI.firstName || newContact.firstName || 'N/A',
        lastName: updatedContactFromAPI.lastName || newContact.lastName || 'N/A',
        email: updatedContactFromAPI.email || newContact.email || 'N/A',
        country: updatedContactFromAPI.country || newContact.country || 'N/A',
        phone: updatedContactFromAPI.phone || newContact.phone || 'N/A',
        jobTitle: updatedContactFromAPI.jobTitle || newContact.jobTitle || 'N/A',
        website: updatedContactFromAPI.website || newContact.website || 'N/A',
        businessType: updatedContactFromAPI.businessType || newContact.businessType || 'N/A',
        companySize: updatedContactFromAPI.companySize || newContact.companySize || 'N/A',
        countryHQ: updatedContactFromAPI.countryHQ || newContact.countryHQ || 'N/A',
        interestedIn: updatedContactFromAPI.interestedIn || newContact.interestedIn || 'N/A',
        geographiesTargeting: updatedContactFromAPI.geographiesTargeting || newContact.geographiesTargeting || 'N/A',
        hearAboutUs: updatedContactFromAPI.hearAboutUs || newContact.hearAboutUs || 'N/A',
        consent: updatedContactFromAPI.consent ?? newContact.consent,
        newsletter: updatedContactFromAPI.newsletter ?? newContact.newsletter,
        createdAt: updatedContactFromAPI.createdAt ? new Date(updatedContactFromAPI.createdAt).toISOString().split('T')[0] : 'N/A',
        saved: existingContact?.saved || false,
      };
      setContacts(contacts.map((contact) => (contact.id === editContactId ? updatedContact : contact)));
      handleCloseModal();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteContactId) return;
    try {
      await axios.delete(`/api/contact/${deleteContactId}`);
      setContacts(contacts.filter((contact) => contact.id !== deleteContactId));
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleToggleSave = async (id: string) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;

    const newSavedState = !contact.saved;

    try {
      await axios.put(`/api/contact/${id}`, { saved: newSavedState });
      setContacts(contacts.map((c) =>
        c.id === id ? { ...c, saved: newSavedState } : c
      ));
    } catch (error) {
      console.error('Error toggling save status:', error);
      // Still update locally even if API fails
      setContacts(contacts.map((c) =>
        c.id === id ? { ...c, saved: newSavedState } : c
      ));
    }
  };

  const handleExportExcel = () => {
    // Get contacts to export (selected or all)
    const contactsToExport = selectedRows.length > 0
      ? contacts.filter(c => selectedRows.includes(c.id))
      : filteredContacts;

    if (contactsToExport.length === 0) {
      alert('No contacts to export');
      return;
    }

    // Prepare data for Excel
    const exportData = contactsToExport.map(contact => ({
      'First Name': contact.firstName,
      'Last Name': contact.lastName,
      'Email': contact.email,
      'Phone': contact.phone,
      'Country': contact.country,
      'Job Title': contact.jobTitle,
      'Website': contact.website,
      'Business Type': contact.businessType,
      'Company Size': contact.companySize,
      'Country HQ': contact.countryHQ,
      'Interested In': contact.interestedIn,
      'Geographies Targeting': contact.geographiesTargeting,
      'How Heard About Us': contact.hearAboutUs,
      'Created Date': contact.createdAt,
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `PayLand_Contacts_${date}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
  };

  const businessTypes = ['E-commerce', 'SaaS', 'Fintech', 'Healthcare', 'Education', 'Other'];
  const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];
  const interestedInOptions = ['Payment Processing', 'Fraud Prevention', 'Analytics', 'API Integration', 'Other'];
  const hearAboutUsOptions = ['Google', 'LinkedIn', 'Referral', 'Conference', 'Blog', 'Other'];

  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: 600, md: 800 },
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: '#1e1e32',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    p: { xs: 3, sm: 4 },
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
      '&:hover fieldset': { borderColor: '#f59e0b' },
      '&.Mui-focused fieldset': { borderColor: '#f59e0b' },
    },
    '& .MuiInputLabel-root': { color: '#9ca3af' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' },
    '& .MuiOutlinedInput-input': { color: '#fff' },
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-[#0f0f1a] p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Contacts Management</h1>
          <p className="text-gray-400">Manage and organize your business contacts</p>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-[#1e1e32] to-[#1a1a2e] rounded-2xl border border-gray-800 overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">All Contacts</h2>
                <p className="text-gray-400 text-sm">{contacts.length} total contacts</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-2.5 px-4 pl-10 rounded-xl bg-gray-800/50 border border-gray-700 focus:outline-none focus:border-amber-500 text-gray-200 placeholder-gray-500"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 whitespace-nowrap flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export {selectedRows.length > 0 ? `(${selectedRows.length})` : 'All'}
              </button>
              <button
                onClick={handleOpenModal}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 whitespace-nowrap"
              >
                + Add Contact
              </button>
            </div>
          </div>

          {/* Data Grid */}
          <div className="p-6">
            <Box sx={{
              height: 500,
              width: '100%',
              '& .MuiDataGrid-root': {
                border: 'none',
                backgroundColor: 'transparent',
              },
              '& .MuiDataGrid-cell': {
                borderColor: 'rgba(255, 255, 255, 0.05)',
                color: '#e5e7eb',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                color: '#9ca3af',
                borderBottom: 'none',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                backgroundColor: 'transparent',
              },
              '& .MuiTablePagination-root': {
                color: '#9ca3af',
              },
              '& .MuiCheckbox-root': {
                color: '#6b7280',
              },
              '& .MuiCheckbox-root.Mui-checked': {
                color: '#f59e0b',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(245, 158, 11, 0.05)',
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none',
              },
            }}>
              <DataGrid
                rows={filteredContacts}
                columns={columns}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[5, 10, 25]}
                checkboxSelection
                disableRowSelectionOnClick
                onRowSelectionModelChange={(selection) => {
                  const ids = selection.type === 'include' ? selection.ids : [];
                  setSelectedRows(Array.from(ids).map(id => String(id)));
                }}
              />
            </Box>
          </div>
        </div>

        {/* Contact Form Modal */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={modalStyle}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isViewMode ? 'Contact Details' : editContactId ? 'Edit Contact' : 'Add New Contact'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {isViewMode ? 'View contact information' : editContactId ? 'Update contact details' : 'Fill in the contact information'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <Box
              component="form"
              onSubmit={editContactId && !isViewMode ? handleUpdateContact : handleAddContact}
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              <TextField fullWidth label="First Name" name="firstName" value={newContact.firstName} onChange={handleInputChange} required={!isViewMode} disabled={isViewMode} sx={inputStyle} />
              <TextField fullWidth label="Last Name" name="lastName" value={newContact.lastName} onChange={handleInputChange} required={!isViewMode} disabled={isViewMode} sx={inputStyle} />
              <TextField fullWidth label="Email" name="email" type="email" value={newContact.email} onChange={handleInputChange} required={!isViewMode} disabled={isViewMode} sx={inputStyle} />
              <TextField fullWidth label="Phone" name="phone" value={newContact.phone} onChange={handleInputChange} required={!isViewMode} disabled={isViewMode} sx={inputStyle} />
              <TextField fullWidth label="Country" name="country" value={newContact.country} onChange={handleInputChange} required={!isViewMode} disabled={isViewMode} sx={inputStyle} />
              <TextField fullWidth label="Job Title" name="jobTitle" value={newContact.jobTitle} onChange={handleInputChange} disabled={isViewMode} sx={inputStyle} />
              <TextField fullWidth label="Website" name="website" value={newContact.website} onChange={handleInputChange} disabled={isViewMode} sx={inputStyle} />
              {isViewMode ? (
                <TextField fullWidth label="Business Type" name="businessType" value={newContact.businessType} disabled sx={inputStyle} />
              ) : (
                <TextField fullWidth select label="Business Type" name="businessType" value={newContact.businessType} onChange={handleInputChange} required sx={inputStyle}>
                  {newContact.businessType && !businessTypes.includes(newContact.businessType) && (
                    <MenuItem value={newContact.businessType}>{newContact.businessType}</MenuItem>
                  )}
                  {businessTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </TextField>
              )}
              {isViewMode ? (
                <TextField fullWidth label="Company Size" name="companySize" value={newContact.companySize} disabled sx={inputStyle} />
              ) : (
                <TextField fullWidth select label="Company Size" name="companySize" value={newContact.companySize} onChange={handleInputChange} required sx={inputStyle}>
                  {newContact.companySize && !companySizes.includes(newContact.companySize) && (
                    <MenuItem value={newContact.companySize}>{newContact.companySize}</MenuItem>
                  )}
                  {companySizes.map((size) => <MenuItem key={size} value={size}>{size}</MenuItem>)}
                </TextField>
              )}
              <TextField fullWidth label="Country HQ" name="countryHQ" value={newContact.countryHQ} onChange={handleInputChange} disabled={isViewMode} sx={inputStyle} />
              {isViewMode ? (
                <TextField fullWidth label="Interested In" name="interestedIn" value={newContact.interestedIn} disabled sx={inputStyle} />
              ) : (
                <TextField fullWidth select label="Interested In" name="interestedIn" value={newContact.interestedIn} onChange={handleInputChange} sx={inputStyle}>
                  {newContact.interestedIn && !interestedInOptions.includes(newContact.interestedIn) && (
                    <MenuItem value={newContact.interestedIn}>{newContact.interestedIn}</MenuItem>
                  )}
                  {interestedInOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
              )}
              <TextField fullWidth label="Geographies Targeting" name="geographiesTargeting" value={newContact.geographiesTargeting} onChange={handleInputChange} disabled={isViewMode} sx={inputStyle} />
              {isViewMode ? (
                <TextField fullWidth label="How Did You Hear About Us" name="hearAboutUs" value={newContact.hearAboutUs} disabled sx={{ ...inputStyle, gridColumn: { md: '1 / 3' } }} />
              ) : (
                <TextField fullWidth select label="How Did You Hear About Us" name="hearAboutUs" value={newContact.hearAboutUs} onChange={handleInputChange} sx={{ ...inputStyle, gridColumn: { md: '1 / 3' } }}>
                  {newContact.hearAboutUs && !hearAboutUsOptions.includes(newContact.hearAboutUs) && (
                    <MenuItem value={newContact.hearAboutUs}>{newContact.hearAboutUs}</MenuItem>
                  )}
                  {hearAboutUsOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
              )}

              {!isViewMode && (
                <>
                  <Box sx={{ gridColumn: { md: '1 / 3' } }}>
                    <FormControlLabel
                      control={<Checkbox checked={newContact.consent} onChange={handleCheckboxChange} name="consent" sx={{ color: '#6b7280', '&.Mui-checked': { color: '#f59e0b' } }} />}
                      label={<span className="text-gray-300">I consent to being contacted</span>}
                    />
                  </Box>
                  <Box sx={{ gridColumn: { md: '1 / 3' } }}>
                    <FormControlLabel
                      control={<Checkbox checked={newContact.newsletter} onChange={handleCheckboxChange} name="newsletter" sx={{ color: '#6b7280', '&.Mui-checked': { color: '#f59e0b' } }} />}
                      label={<span className="text-gray-300">Subscribe to newsletter</span>}
                    />
                  </Box>
                </>
              )}

              <Box sx={{ gridColumn: { md: '1 / 3' }, display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  {isViewMode ? 'Close' : 'Cancel'}
                </button>
                {!isViewMode && (
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
                  >
                    {editContactId ? 'Update Contact' : 'Add Contact'}
                  </button>
                )}
              </Box>
            </Box>
          </Box>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal open={openDeleteModal} onClose={handleCloseDeleteModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: '#1e1e32',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            p: 4,
            textAlign: 'center',
          }}>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Contact</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this contact? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteContact}
                className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </Box>
        </Modal>
      </div>
    </ThemeProvider>
  );
}
