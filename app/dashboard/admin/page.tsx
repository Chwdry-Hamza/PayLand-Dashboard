'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessType: string;
  companySize: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  userType: string;
}

export default function AdminDashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Fetch contact data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get authentication token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 // 5 second timeout
        };

        const [contactRes, userRes] = await Promise.all([
          axios.get('https://pay-land-backoffic.vercel.app/contact', config).catch(err => {
            console.error('Contact API error:', err);
            return { data: { contacts: [] } };
          }),
          axios.get('https://pay-land-backoffic.vercel.app/user', config).catch(err => {
            console.error('User API error:', err);
            return { data: { users: [] } };
          })
        ]);

        if (Array.isArray(contactRes.data.contacts)) {
          const mappedContacts: Contact[] = contactRes.data.contacts.map((item: any) => ({
            id: item._id,
            firstName: item.firstName || 'N/A',
            lastName: item.lastName || 'N/A',
            email: item.email || 'N/A',
            phone: item.phone || 'N/A',
            businessType: item.businessType || 'N/A',
            companySize: item.companySize || 'N/A',
          }));
          setContacts(mappedContacts);
        }

        if (Array.isArray(userRes.data.users)) {
          const mappedUsers: User[] = userRes.data.users.map((item: any) => ({
            id: item._id,
            username: item.username || 'N/A',
            email: item.email || 'N/A',
            userType: item.userType || 'N/A',
          }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Add a small delay to ensure token is saved
    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back! <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Admin</span>
        </h1>
        <p className="text-gray-400">Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Contacts Card */}
        <div className="bg-gradient-to-br from-[#1e1e32] to-[#1a1a2e] rounded-2xl p-6 border border-gray-800 hover:border-amber-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-green-400 text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              +12%
            </span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Contacts</h3>
          <p className="text-3xl font-bold text-white">{contacts.length}</p>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="mt-4 text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors flex items-center"
          >
            View all
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Total Users Card */}
        <div className="bg-gradient-to-br from-[#1e1e32] to-[#1a1a2e] rounded-2xl p-6 border border-gray-800 hover:border-purple-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-green-400 text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              +8%
            </span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-white">{users.length}</p>
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="mt-4 text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors flex items-center"
          >
            View all
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Active Sessions Card */}
        <div className="bg-gradient-to-br from-[#1e1e32] to-[#1a1a2e] rounded-2xl p-6 border border-gray-800 hover:border-cyan-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-green-400 text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Live
            </span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Active Sessions</h3>
          <p className="text-3xl font-bold text-white">24</p>
          <p className="mt-4 text-cyan-400 text-sm font-medium">Currently online</p>
        </div>

        {/* Revenue Card */}
        {/* <div className="bg-gradient-to-br from-[#1e1e32] to-[#1a1a2e] rounded-2xl p-6 border border-gray-800 hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-green-400 text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              +23%
            </span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-white">$48,574</p>
          <p className="mt-4 text-emerald-400 text-sm font-medium">This month</p>
        </div> */}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contacts */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1e1e32] to-[#1a1a2e] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Contacts</h2>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="p-6">
            {contacts.slice(0, 5).map((contact, index) => (
              <div key={contact.id} className={`flex items-center justify-between py-4 ${index !== 0 ? 'border-t border-gray-800' : ''}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                    {contact.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{contact.firstName} {contact.lastName}</p>
                    <p className="text-gray-400 text-sm">{contact.email}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                  {contact.businessType}
                </span>
              </div>
            ))}
            {contacts.length === 0 && (
              <p className="text-gray-400 text-center py-8">No contacts found</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-[#1e1e32] to-[#1a1a2e] rounded-2xl border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <a href="/dashboard/contacts" className="flex items-center p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium group-hover:text-amber-400 transition-colors">Add Contact</p>
                <p className="text-gray-400 text-sm">Create a new contact</p>
              </div>
            </a>
            <a href="/dashboard/users" className="flex items-center p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium group-hover:text-purple-400 transition-colors">Add User</p>
                <p className="text-gray-400 text-sm">Create a new user</p>
              </div>
            </a>
            <a href="/dashboard/profile" className="flex items-center p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">Settings</p>
                <p className="text-gray-400 text-sm">Manage your profile</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Contact Details Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e32] rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-amber-500/10 to-orange-500/10">
              <h2 className="text-2xl font-bold text-white">Contact List</h2>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {contacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Business Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact, index) => (
                        <tr key={contact.id} className={index !== 0 ? 'border-t border-gray-800' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold mr-3">
                                {contact.firstName.charAt(0)}
                              </div>
                              <span className="text-white">{contact.firstName} {contact.lastName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400">{contact.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400">{contact.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                              {contact.businessType}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No contacts found.</p>
              )}
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e32] rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <h2 className="text-2xl font-bold text-white">User List</h2>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.id} className={index !== 0 ? 'border-t border-gray-800' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold mr-3">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white">{user.username}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 capitalize">
                              {user.userType}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No users found.</p>
              )}
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
