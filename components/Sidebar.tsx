'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HiOutlineChartSquareBar,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineCog,
} from 'react-icons/hi';

export default function Sidebar({ collapsed, onLinkClick }: { collapsed: boolean; onLinkClick?: () => void }) {
  const pathname = usePathname();
  const [username, setUsername] = useState('User');
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUsername(user.username || 'User');
      setUserType(user.userType || 'Admin');
    }
  }, []);

  const isActive = (path: string) => pathname === path;

  const linkClasses = (path: string) => `
    flex items-center p-3 rounded-xl transition-all duration-300 group
    ${isActive(path)
      ? 'bg-gradient-to-r from-[#ff3d00] to-[#fe7956] text-white shadow-lg shadow-[#ff3d00]/30'
      : 'text-gray-400 hover:bg-gray-800/50 hover:text-[#fe7956]'
    }
  `;

  const menuItems = [
    { path: '/dashboard/admin', icon: HiOutlineChartSquareBar, label: 'Dashboard' },
    { path: '/dashboard/contacts', icon: HiOutlineUsers, label: 'Clients' },
    { path: '/dashboard/users', icon: HiOutlineUser, label: 'Users' },
    // { path: '/dashboard/profile', icon: HiOutlineCog, label: 'Settings' },
  ];

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
        padding: collapsed ? '16px 8px' : '24px 16px',
        transition: 'all 0.3s ease-in-out',
        width: collapsed ? '80px' : '280px'
      }}
    >
      {/* Logo Section */}
      <Link href="/dashboard/admin" className={`flex flex-col items-center ${collapsed ? 'mb-4' : 'mb-6'} cursor-pointer hover:opacity-80 transition-opacity duration-300`}>
        <div className={`relative ${collapsed ? 'w-10 h-10' : 'w-16 h-16'} transition-all duration-300`}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff3d00] to-[#fe7956] rounded-xl opacity-20 blur-xl"></div>
          <Image
            src="/PaylandLogo1.png"
            alt="Logo"
            width={collapsed ? 40 : 64}
            height={collapsed ? 40 : 64}
            className="relative z-10 rounded-xl"
          />
        </div>
        {!collapsed && (
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#ff3d00] to-[#fe7956] bg-clip-text text-transparent mt-3">
            PayLand
          </h2>
        )}
      </Link>

      {/* User Profile Section */}
      {!collapsed && (
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#ff3d00] to-[#fe7956] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{username}</p>
              <p className="text-[#fe7956] text-sm capitalize">{userType}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed User Avatar */}
      {collapsed && (
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ff3d00] to-[#fe7956] flex items-center justify-center text-white font-bold shadow-lg">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
          </div>
        </div>
      )}

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {!collapsed && (
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
            Main Menu
          </p>
        )}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={linkClasses(item.path)}
              onClick={onLinkClick}
            >
              <item.icon className={`text-xl ${collapsed ? 'mx-auto' : ''}`} />
              {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
              {!collapsed && isActive(item.path) && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white"></div>
              )}
            </Link>
          ))}
        </nav>
        
      </div>

      {!collapsed && (
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <div className="bg-gradient-to-r from-[#ff3d00]/10 to-[#fe7956]/10 rounded-xl p-4 border border-[#ff3d00]/20">
            <p className="text-[#fe7956] font-semibold text-sm">PayLand</p>
            <p className="text-gray-400 text-xs mt-1">Open Over Website</p>
            <a
              href="https://www.payland.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full bg-gradient-to-r from-[#ff3d00] to-[#fe7956] text-white py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-[#ff3d00]/30 transition-all duration-300 flex items-center justify-center"
            >
              Go
            </a>
          </div>
        </div>
      )}
    </div>
  );
}