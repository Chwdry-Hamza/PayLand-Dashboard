'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isAuthPage = pathname === '/auth/login' || pathname === '/auth/signup' || pathname === '/auth/forgot-password';

  const handleLinkClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <html lang="en">
      <body className="bg-[#0f0f1a]">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Only show if not on auth pages */}
          {!isAuthPage && (
            <div
              className={`fixed inset-y-0 left-0 z-30 transition-all duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:z-0
                ${sidebarCollapsed ? 'md:w-20' : 'md:w-[280px]'}`}
            >
              <Sidebar collapsed={sidebarCollapsed} onLinkClick={handleLinkClick} />
            </div>
          )}

          {/* Mobile Overlay */}
          {!isAuthPage && sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            {/* Navbar - Only show if not on auth pages */}
            {!isAuthPage && (
              <Navbar
                onMobileToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onDesktopToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                isCollapsed={sidebarCollapsed}
              />
            )}

            {/* Main Content */}
            <main className={`flex-1 overflow-auto ${isAuthPage ? '' : 'bg-[#0f0f1a]'}`}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
