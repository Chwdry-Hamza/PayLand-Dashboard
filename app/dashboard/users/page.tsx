'use client';
import { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Modal, Box, TextField, IconButton, MenuItem } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ff3d00' },
    background: { default: '#0f0f1a', paper: '#1e1e32' },
  },
});

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  userType: string;
}

export default function Users() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ username: '', email: '', phone: '', password: '', userType: '' });
  const [currentUserType, setCurrentUserType] = useState<string>('user');

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    // Get current user type from storage
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const type = parsedUser.userType || 'user';
        console.log('User type from storage:', type);
        setCurrentUserType(type);
      } catch {
        setCurrentUserType('user');
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/user');
        if (Array.isArray(response.data.users)) {
          const mappedData: User[] = response.data.users.map((item: any) => ({
            id: item._id,
            username: item.username || 'N/A',
            email: item.email || 'N/A',
            phone: item.phone?.toString() || 'N/A',
            userType: item.userType || 'N/A',
          }));
          setUsers(mappedData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUsers([]);
      }
    };
    fetchData();
  }, []);

  const columns: GridColDef[] = [
    {
      field: 'username',
      headerName: 'Username',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#ff3d00] to-[#fe7956] flex items-center justify-center text-white text-sm font-bold">
            {params.value.charAt(0).toUpperCase()}
          </div>
          <button onClick={() => handleViewUser(params.row.id)} className="text-[#fe7956] hover:text-[#ff3d00] font-medium transition-colors">
            {params.value}
          </button>
        </div>
      ),
    },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    {
      field: 'userType',
      headerName: 'Role',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
          params.value === 'admin' ? 'bg-red-500/20 text-red-400' :
          params.value === 'moderator' ? 'bg-[#ff3d00]/20 text-[#fe7956]' :
          'bg-[#ff3d00]/20 text-[#fe7956]'
        }`}>
          {params.value}
        </span>
      ),
    },

    {
      field: 'edit',
      headerName: 'Edit',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          color="primary"
          onClick={() => handleEditUser(params.row.id)}
          aria-label="edit contact"
        >
          <Edit />
        </IconButton>
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          color="error"
          onClick={() => handleOpenDeleteModal(params.row.id)}
          aria-label="delete user"
        >
          <Delete />
        </IconButton>
      ),
    },
  ];

  // Filter columns based on user type - hide edit/delete for non-admin users
  const filteredColumns = currentUserType === 'admin'
    ? columns
    : columns.filter(col => !['edit', 'delete'].includes(col.field));

  const handleOpenModal = () => { setIsViewMode(false); setOpenModal(true); };
  const handleCloseModal = () => { setOpenModal(false); setEditUserId(null); setIsViewMode(false); setNewUser({ username: '', email: '', phone: '', password: '', userType: '' }); };
  const handleOpenDeleteModal = (id: string) => { setDeleteUserId(id); setOpenDeleteModal(true); };
  const handleCloseDeleteModal = () => { setOpenDeleteModal(false); setDeleteUserId(null); };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setNewUser((prev) => ({ ...prev, [name]: value })); };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/user/signup', newUser);
      const newUserFromAPI = response.data.user;
      setUsers([...users, { id: newUserFromAPI._id, username: newUserFromAPI.username || 'N/A', email: newUserFromAPI.email || 'N/A', phone: newUserFromAPI.phone?.toString() || 'N/A', userType: newUserFromAPI.userType || 'N/A' }]);
      handleCloseModal();
    } catch (error) { console.error('Error adding user:', error); }
  };

  const handleViewUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setNewUser({ username: user.username, email: user.email, phone: user.phone, password: '', userType: user.userType });
      setEditUserId(id); setIsViewMode(true); setOpenModal(true);
    }
  };

  const handleEditUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setNewUser({ username: user.username === 'N/A' ? '' : user.username, email: user.email === 'N/A' ? '' : user.email, phone: user.phone === 'N/A' ? '' : user.phone, password: '', userType: user.userType === 'N/A' ? '' : user.userType });
      setEditUserId(id); setIsViewMode(false); setOpenModal(true);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId) return;
    try {
      const updateData: any = { username: newUser.username, email: newUser.email, phone: newUser.phone, userType: newUser.userType };
      if (newUser.password) updateData.password = newUser.password;
      const response = await axios.put(`/api/user/${editUserId}`, updateData);
      const updated = response.data.user;
      setUsers(users.map((u) => u.id === editUserId ? { id: editUserId, username: updated.username || newUser.username || 'N/A', email: updated.email || newUser.email || 'N/A', phone: updated.phone?.toString() || newUser.phone || 'N/A', userType: updated.userType || newUser.userType || 'N/A' } : u));
      handleCloseModal();
    } catch (error) { console.error('Error updating user:', error); }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try { await axios.delete(`/api/user/${deleteUserId}`); setUsers(users.filter((u) => u.id !== deleteUserId)); handleCloseDeleteModal(); }
    catch (error) { console.error('Error deleting user:', error); }
  };

  const userTypes = ['admin', 'user', 'moderator'];

  const inputStyle = {
    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' }, '&:hover fieldset': { borderColor: '#ff3d00' }, '&.Mui-focused fieldset': { borderColor: '#ff3d00' } },
    '& .MuiInputLabel-root': { color: '#9ca3af' }, '& .MuiInputLabel-root.Mui-focused': { color: '#ff3d00' }, '& .MuiOutlinedInput-input': { color: '#fff' },
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-[#0f0f1a] p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Users Management</h1>
          <p className="text-gray-400">Manage system users and their roles</p>
        </div>

        <div className="bg-gradient-to-br from-[#1e1e32] to-[#1a1a2e] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#ff3d00] to-[#fe7956] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">All Users</h2>
                <p className="text-gray-400 text-sm">{users.length} total users</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-2.5 px-4 pl-10 rounded-xl bg-gray-800/50 border border-gray-700 focus:outline-none focus:border-[#ff3d00] text-gray-200 placeholder-gray-500" />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {currentUserType === 'admin' && (
                <button onClick={handleOpenModal} className="px-4 py-2.5 bg-gradient-to-r from-[#ff3d00] to-[#fe7956] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#ff3d00]/30 transition-all duration-300 whitespace-nowrap">
                  + Add User
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            <Box sx={{
              height: 500, width: '100%',
              '& .MuiDataGrid-root': { border: 'none', backgroundColor: 'transparent' },
              '& .MuiDataGrid-cell': { borderColor: 'rgba(255, 255, 255, 0.05)', color: '#e5e7eb' },
              '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', color: '#9ca3af', borderBottom: 'none' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'transparent' },
              '& .MuiTablePagination-root': { color: '#9ca3af' },
              '& .MuiCheckbox-root': { color: '#6b7280' }, '& .MuiCheckbox-root.Mui-checked': { color: '#ff3d00' },
              '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(255, 61, 0, 0.05)' },
              '& .MuiDataGrid-columnSeparator': { display: 'none' },
            }}>
              <DataGrid rows={filteredUsers} columns={filteredColumns} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} pageSizeOptions={[5, 10, 25]} checkboxSelection disableRowSelectionOnClick />
            </Box>
          </div>
        </div>

        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '95%', sm: 500 }, maxHeight: '90vh', overflowY: 'auto', bgcolor: '#1e1e32', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', p: { xs: 3, sm: 4 }, borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{isViewMode ? 'User Details' : editUserId ? 'Edit User' : 'Add New User'}</h2>
                <p className="text-gray-400 text-sm mt-1">{isViewMode ? 'View user information' : editUserId ? 'Update user details' : 'Fill in user information'}</p>
              </div>
              <button onClick={handleCloseModal} className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <Box component="form" onSubmit={editUserId && !isViewMode ? handleUpdateUser : handleAddUser} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField fullWidth label="Username" name="username" value={newUser.username} onChange={handleInputChange} required={!isViewMode} disabled={isViewMode} sx={inputStyle} />
              <TextField fullWidth label="Email" name="email" type="email" value={newUser.email} onChange={handleInputChange} required={!isViewMode} disabled={isViewMode} sx={inputStyle} />
              <TextField fullWidth label="Phone" name="phone" value={newUser.phone} onChange={handleInputChange} disabled={isViewMode} sx={inputStyle} />
              {!isViewMode && (
                <TextField fullWidth label={editUserId ? "Password (leave empty to keep)" : "Password"} name="password" type="password" value={newUser.password} onChange={handleInputChange} required={!editUserId} sx={inputStyle} />
              )}
              {isViewMode ? (
                <TextField fullWidth label="User Type" name="userType" value={newUser.userType} disabled sx={inputStyle} />
              ) : (
                <TextField fullWidth select label="User Type" name="userType" value={newUser.userType} onChange={handleInputChange} required sx={inputStyle}>
                  {userTypes.map((type) => <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>)}
                </TextField>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors">{isViewMode ? 'Close' : 'Cancel'}</button>
                {!isViewMode && (
                  <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-[#ff3d00] to-[#fe7956] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#ff3d00]/30 transition-all duration-300">
                    {editUserId ? 'Update User' : 'Add User'}
                  </button>
                )}
              </Box>
            </Box>
          </Box>
        </Modal>

        <Modal open={openDeleteModal} onClose={handleCloseDeleteModal}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 400 }, bgcolor: '#1e1e32', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', p: 4, textAlign: 'center' }}>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete User</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={handleCloseDeleteModal} className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={handleDeleteUser} className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </Box>
        </Modal>
      </div>
    </ThemeProvider>
  );
}
