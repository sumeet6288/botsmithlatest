import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Settings, Users, LogOut, Bell, ChevronDown, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { plansAPI } from '../utils/api';

const UserProfileDropdown = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('Free Plan');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        const response = await plansAPI.getCurrentSubscription();
        // Extract plan name from the response
        const planName = response.data.plan?.name || response.data.plan_name || 'Free Plan';
        setCurrentPlan(planName);
      } catch (error) {
        console.error('Error fetching current plan:', error);
        setCurrentPlan('Free Plan');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCurrentPlan();
    }

    // Refresh plan when window gains focus (e.g., user returns from another tab/page)
    const handleFocus = () => {
      if (user) {
        fetchCurrentPlan();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg px-2.5 py-1.5 transition-all duration-200 cursor-pointer border border-transparent hover:border-purple-200 group">
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">{user.name}</p>
            <p className="text-[10px] text-gray-500 group-hover:text-purple-600 transition-colors">{user.email}</p>
          </div>
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
          </div>
          <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5 bg-white shadow-xl border-0 rounded-xl">
        {/* User Info Header */}
        <DropdownMenuLabel className="font-normal p-0 mb-1.5">
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-lg p-2.5 border border-purple-100">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-purple-100">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 bg-white/80 backdrop-blur-sm rounded px-2 py-1 border border-purple-200/50">
                <p className="text-[10px] font-semibold text-purple-700">
                  {loading ? 'Loading...' : currentPlan}
                </p>
              </div>
              <button 
                onClick={() => navigate('/subscription')}
                className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-semibold rounded hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Upgrade
              </button>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="my-1 bg-gray-100" />
        
        {/* Menu Items */}
        <DropdownMenuItem 
          onClick={() => navigate('/dashboard')} 
          className="cursor-pointer rounded px-2 py-1.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group mb-0.5"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="w-6 h-6 rounded bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
              <MessageSquare className="h-3 w-3 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-700 group-hover:text-purple-700 transition-colors">Dashboard</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigate('/account-settings')} 
          className="cursor-pointer rounded px-2 py-1.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group mb-0.5"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="w-6 h-6 rounded bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
              <Settings className="h-3 w-3 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700 transition-colors">Account Settings</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigate('/notification-preferences')} 
          className="cursor-pointer rounded px-2 py-1.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group mb-0.5"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="w-6 h-6 rounded bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
              <Bell className="h-3 w-3 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-gray-700 group-hover:text-amber-700 transition-colors">Notifications</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigate('/workspace')} 
          className="cursor-pointer rounded px-2 py-1.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group mb-0.5"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="w-6 h-6 rounded bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
              <Users className="h-3 w-3 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">Workspace</span>
          </div>
        </DropdownMenuItem>
        
        {/* Only show Admin Panel for admin users */}
        {user?.role === 'admin' && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin')} 
            className="cursor-pointer rounded px-2 py-1.5 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-200 group mb-0.5"
          >
            <div className="flex items-center gap-2 w-full">
              <div className="w-6 h-6 rounded bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                <Shield className="h-3 w-3 text-red-600" />
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-red-700 transition-colors">Admin Panel</span>
            </div>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator className="my-1 bg-gray-100" />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer rounded px-2 py-1.5 hover:bg-red-50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="w-6 h-6 rounded bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
              <LogOut className="h-3 w-3 text-red-600" />
            </div>
            <span className="text-xs font-medium text-red-600 group-hover:text-red-700 transition-colors">Sign Out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
