'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface UserData {
  _id: string;
  username: string;
  email: string;
  phone: string;
  userType: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserData>({ _id: '', username: '', email: '', phone: '', userType: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!userData || !token) {
        setError('Please log in to access this page.');
        router.push('/auth/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser._id) {
          try {
            const response = await axios.get(`/api/user/${parsedUser._id}`);
            if (response.data.user) {
              setUser({
                _id: response.data.user._id,
                username: response.data.user.username || '',
                email: response.data.user.email || '',
                phone: response.data.user.phone?.toString() || '',
                userType: response.data.user.userType || '',
              });
            }
          } catch {
            setUser({
              _id: parsedUser._id || '',
              username: parsedUser.username || '',
              email: parsedUser.email || '',
              phone: parsedUser.phone?.toString() || '',
              userType: parsedUser.userType || '',
            });
          }
        } else {
          setUser({
            _id: parsedUser._id || '',
            username: parsedUser.username || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone?.toString() || '',
            userType: parsedUser.userType || '',
          });
        }
      } catch {
        setError('Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user.username) {
      setError('Username is required.');
      return;
    }

    try {
      const response = await axios.put(`/api/user/${user._id}`, {
        username: user.username,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
      });

      if (response.status === 200) {
        const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify({
          _id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
        }));
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#1e1e32] to-[#1a1a2e] rounded-2xl border border-gray-800 overflow-hidden">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-amber-500 to-orange-500 relative">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Profile Content */}
            <div className="px-6 pb-6">
              <div className="relative -mt-16 mb-4">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-[#1e1e32]">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="absolute bottom-2 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-[#1e1e32]"></div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">{user.username || 'User'}</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-500/20 text-amber-400 capitalize">
                {user.userType || 'Member'}
              </span>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex items-center space-x-3 text-gray-400 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{user.email || 'No email'}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{user.phone || 'No phone'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#1e1e32] to-[#1a1a2e] rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Account Information</h3>
                <p className="text-gray-400 text-sm">Update your personal details</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {success}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                      isEditing
                        ? 'bg-gray-800/50 border-gray-700 text-white focus:outline-none focus:border-amber-500'
                        : 'bg-gray-800/30 border-gray-800 text-gray-400'
                    }`} 
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                      isEditing
                        ? 'bg-gray-800/50 border-gray-700 text-white focus:outline-none focus:border-amber-500'
                        : 'bg-gray-800/30 border-gray-800 text-gray-400'
                    }`}
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                      isEditing
                        ? 'bg-gray-800/50 border-gray-700 text-white focus:outline-none focus:border-amber-500'
                        : 'bg-gray-800/30 border-gray-800 text-gray-400'
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                  <select
                    value={user.userType}
                    onChange={(e) => setUser({ ...user, userType: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                      isEditing
                        ? 'bg-gray-800/50 border-gray-700 text-white focus:outline-none focus:border-amber-500'
                        : 'bg-gray-800/30 border-gray-800 text-gray-400'
                    }`}
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Security Section */}
          <div className="bg-gradient-to-br from-[#1e1e32] to-[#1a1a2e] rounded-2xl border border-gray-800 p-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-2">Security</h3>
            <p className="text-gray-400 text-sm mb-6">Manage your security preferences</p>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Password</p>
                  <p className="text-gray-400 text-sm">Last changed 30 days ago</p>
                </div>
              </div>
              <button className="px-4 py-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
