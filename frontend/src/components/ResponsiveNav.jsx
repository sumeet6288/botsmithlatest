import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, CreditCard, FileText, Shield, Users } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationBell from './NotificationBell';
import BotSmithLogo from './BotSmithLogo';

const ResponsiveNav = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Base navigation items for all users
  const baseNavItems = [
    { path: '/dashboard', label: 'Chatbots' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/subscription', label: 'Subscription', icon: CreditCard },
  ];

  // Add admin panel only for admin users
  const navItems = user?.role === 'admin' 
    ? [...baseNavItems, { path: '/admin', label: 'Admin Panel', icon: Shield }]
    : baseNavItems;

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            {/* Premium "B" Logo */}
            <BotSmithLogo size="md" showGlow={true} animate={true} />
            
            {/* Premium Brand Typography */}
            <div className="flex flex-col -space-y-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-800 group-hover:via-fuchsia-700 group-hover:to-pink-700 transition-all duration-300 drop-shadow-sm">
                  BotSmith
                </span>
                <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-md">AI</span>
              </div>
              <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                Powered by Jyosha Solutions
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`transition-colors font-medium relative group flex items-center gap-2 ${
                  isActive(item.path)
                    ? 'text-purple-600 font-semibold'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transform transition-transform ${
                    isActive(item.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification Bell - Desktop */}
          <div className="hidden md:block">
            <NotificationBell />
          </div>
          
          <div className="hidden md:block">
            <UserProfileDropdown user={user} onLogout={onLogout} />
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-purple-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                    isActive(item.path)
                      ? 'text-purple-600 font-semibold bg-purple-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </button>
              );
            })}
            <div className="pt-3 border-t border-gray-200">
              <UserProfileDropdown user={user} onLogout={onLogout} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ResponsiveNav;
