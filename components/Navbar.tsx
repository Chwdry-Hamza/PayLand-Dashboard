'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function Navbar({
  onMobileToggleSidebar,
  onDesktopToggleSidebar,
  isCollapsed,
}: {
  onMobileToggleSidebar: () => void;
  onDesktopToggleSidebar: () => void;
  isCollapsed: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const [userType, setUserType] = useState('');

  // Notification states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [newContacts, setNewContacts] = useState<Array<{ _id: string; firstName: string; lastName: string; email: string; createdAt: string }>>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // Global search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allContacts, setAllContacts] = useState<Array<{ _id: string; firstName: string; lastName: string; email: string; phone: string }>>([]);
  const [allUsers, setAllUsers] = useState<Array<{ _id: string; username: string; email: string; phone: string; userType: string }>>([]);
  const [filteredContacts, setFilteredContacts] = useState<Array<{ _id: string; firstName: string; lastName: string; email: string; phone: string }>>([]);
  const [filteredUsers, setFilteredUsers] = useState<Array<{ _id: string; username: string; email: string; phone: string; userType: string }>>([]);

  // Refs for click outside detection
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUsername(user.username || 'User');
        setUserType(user.userType || 'Admin');
        if (user.email) {
          setEmail(user.email);
        } else if (user._id) {
          try {
            const response = await axios.get(`https://pay-land-backoffic.vercel.app/user/${user._id}`);
            if (response.data.user) {
              setEmail(response.data.user.email || 'N/A');
              const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
              storage.setItem('user', JSON.stringify({
                ...user,
                email: response.data.user.email
              }));
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            setEmail('N/A');
          }
        } else {
          setEmail('N/A');
        }
      } else {
        setUsername('User');
        setEmail('N/A');
      }
    };

    fetchUserData();
  }, []);

  // Fetch new contacts added in last 24 hours
  useEffect(() => {
    const fetchNewContacts = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          console.log('No token found for contacts fetch');
          return;
        }

        console.log('Fetching recent contacts...');
        const response = await axios.get('https://pay-land-backoffic.vercel.app/contact/recent-contacts', {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Recent contacts response:', response.data);
        console.log('Is array?', Array.isArray(response.data));

        // Calculate 24 hours ago timestamp
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        let allContacts = [];

        // Handle direct array response
        if (Array.isArray(response.data)) {
          allContacts = response.data;
        } else if (response.data.contacts && Array.isArray(response.data.contacts)) {
          // Handle object with contacts array (with or without success field)
          allContacts = response.data.contacts;
        } else {
          console.log('Unexpected response format:', response.data);
          return;
        }

        // Filter contacts to only include those from last 24 hours
        const recentContacts = allContacts.filter((contact: any) => {
          const contactDate = new Date(contact.createdAt);
          return contactDate >= twentyFourHoursAgo;
        });

        console.log('Total contacts received:', allContacts.length);
        console.log('Contacts from last 24 hours:', recentContacts.length);

        setNewContacts(recentContacts);
        setNotificationCount(recentContacts.length);
      } catch (error) {
        console.error('Error fetching new contacts:', error);
      }
    };

    fetchNewContacts();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNewContacts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all contacts and users for global search
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const [contactsRes, usersRes] = await Promise.all([
          axios.get('https://pay-land-backoffic.vercel.app/contact', {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { contacts: [] } })),
          axios.get('https://pay-land-backoffic.vercel.app/user', {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { users: [] } }))
        ]);

        if (Array.isArray(contactsRes.data.contacts)) {
          setAllContacts(contactsRes.data.contacts.map((c: any) => ({
            _id: c._id,
            firstName: c.firstName || '',
            lastName: c.lastName || '',
            email: c.email || '',
            phone: c.phone || ''
          })));
        }

        if (Array.isArray(usersRes.data.users)) {
          setAllUsers(usersRes.data.users.map((u: any) => ({
            _id: u._id,
            username: u.username || '',
            email: u.email || '',
            phone: u.phone?.toString() || '',
            userType: u.userType || ''
          })));
        }
      } catch (error) {
        console.error('Error fetching search data:', error);
      }
    };

    fetchSearchData();
  }, []);

  // Filter contacts and users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts([]);
      setFilteredUsers([]);
      setIsSearchOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase();

    const matchedContacts = allContacts.filter(contact =>
      contact.firstName.toLowerCase().includes(query) ||
      contact.lastName.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.phone.includes(query)
    ).slice(0, 5);

    const matchedUsers = allUsers.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(query)
    ).slice(0, 5);

    setFilteredContacts(matchedContacts);
    setFilteredUsers(matchedUsers);
    setIsSearchOpen(matchedContacts.length > 0 || matchedUsers.length > 0);
  }, [searchQuery, allContacts, allUsers]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close desktop dropdown if clicked outside
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      // Close mobile dropdown if clicked outside
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      // Close notification dropdown if clicked outside
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      // Close search dropdown if clicked outside
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    // Add event listener when dropdowns are open
    if (isDropdownOpen || isMobileMenuOpen || isNotificationOpen || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isMobileMenuOpen, isNotificationOpen, isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsDropdownOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');

    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/auth/login');
  };

  return (
    <nav className="bg-[#1a1a2e] border-b border-gray-800 px-4 py-3">
      <div className="flex justify-between items-center w-full">
        {/* Left: Toggler and Search */}
        <div className="flex items-center space-x-4 flex-1">
          <button
            className="md:hidden text-gray-400 p-2 rounded-xl hover:bg-gray-800 hover:text-amber-400 transition-all duration-300"
            onClick={onMobileToggleSidebar}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <button
            className="hidden md:block text-gray-400 p-2 rounded-xl hover:bg-gray-800 hover:text-amber-400 transition-all duration-300"
            onClick={onDesktopToggleSidebar}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          {/* Mobile Logo */}
          <div className="flex-1 flex justify-center items-center md:hidden">
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              PayLand
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block relative w-80" ref={searchDropdownRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && (filteredContacts.length > 0 || filteredUsers.length > 0) && setIsSearchOpen(true)}
                  placeholder="Search clients & users..."
                  className="w-full py-2.5 px-4 pl-11 pr-12 rounded-xl bg-gray-800/50 border border-gray-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300 placeholder-gray-500 text-gray-200"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            {/* Search Results Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e32] rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden z-50 max-h-96 overflow-y-auto">
                {/* Clients Section */}
                {filteredContacts.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700/50">
                      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Clients</span>
                    </div>
                    {filteredContacts.map((contact) => (
                      <Link
                        key={contact._id}
                        href="/dashboard/contacts"
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center px-4 py-3 hover:bg-gray-800/50 transition-colors border-b border-gray-700/30"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                          {contact.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{contact.firstName} {contact.lastName}</p>
                          <p className="text-gray-400 text-xs truncate">{contact.email}</p>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Client</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Users Section */}
                {filteredUsers.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700/50">
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Users</span>
                    </div>
                    {filteredUsers.map((user) => (
                      <Link
                        key={user._id}
                        href="/dashboard/users"
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center px-4 py-3 hover:bg-gray-800/50 transition-colors border-b border-gray-700/30"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{user.username}</p>
                          <p className="text-gray-400 text-xs truncate">{user.email}</p>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded capitalize">{user.userType || 'User'}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {filteredContacts.length === 0 && filteredUsers.length === 0 && searchQuery.trim() !== '' && (
                  <div className="px-4 py-6 text-center">
                    <svg className="w-10 h-10 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-400 text-sm">No results found for &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          {/* Notification Bell */}
          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={toggleNotifications}
              className="relative p-2.5 rounded-xl bg-gray-800/50 text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                </>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="fixed md:absolute right-2 md:right-0 mt-2 w-[calc(100vw-16px)] max-w-[380px] md:w-80 bg-[#1e1e32] rounded-2xl shadow-2xl border border-gray-700/50 py-2 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700/50">
                  <h3 className="text-white font-semibold text-sm md:text-base">New Contacts (Last 24 Hours)</h3>
                  <p className="text-gray-400 text-xs mt-1">{notificationCount} new contact{notificationCount !== 1 ? 's' : ''} added</p>
                </div>

                <div className="max-h-[60vh] md:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                  {newContacts.length > 0 ? (
                    newContacts.map((contact) => (
                      <div key={contact._id} className="px-3 md:px-4 py-3 hover:bg-gray-800/50 transition-colors border-b border-gray-700/30">
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 text-sm md:text-base">
                            {contact.firstName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate text-sm md:text-base">{contact.firstName} {contact.lastName}</p>
                            <p className="text-gray-400 text-xs truncate">{contact.email}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-xs text-amber-400">
                              {new Date(contact.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <svg className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-400 text-xs md:text-sm">No new contacts in the last 24 hours</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown - Desktop */}
          {isLoggedIn && (
            <div className="hidden md:block relative" ref={desktopDropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-800 transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-white">{username}</p>
                  <p className="text-xs text-gray-400">{userType}</p>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#1e1e32] rounded-2xl shadow-2xl border border-gray-700/50 py-2 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-700/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{username}</p>
                        <p className="text-amber-400 text-sm">{email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link href="/dashboard/profile">
                      <button onClick={() => setIsDropdownOpen(false)} className="w-full flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-amber-400 transition-colors">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Edit Profile
                      </button>
                    </Link>
                    <button onClick={() => setIsDropdownOpen(false)} className="w-full flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-amber-400 transition-colors">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-gray-700/50 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu */}
          {isLoggedIn && (
            <div className="md:hidden relative" ref={mobileDropdownRef}>
              <button
                onClick={toggleMobileMenu}
                className="p-2.5 rounded-xl bg-gray-800/50 text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6h.01M12 12h.01M12 18h.01" />
                </svg>
              </button>

              {isMobileMenuOpen && (
                <div className="absolute right-0 top-14 w-72 bg-[#1e1e32] rounded-2xl shadow-2xl border border-gray-700/50 py-2 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{username}</p>
                        <p className="text-amber-400 text-sm">{email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link href="/dashboard/profile">
                      <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-amber-400 transition-colors">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Edit Profile
                      </button>
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-amber-400 transition-colors">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-gray-700/50 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}