import React, { useState } from 'react';
import { 
  Users, Bot, BarChart3, Settings, Activity, Database, 
  Shield, MessageSquare, FileText, DollarSign, TrendingUp, 
  Mail, Search, Target, UserCheck, ChevronLeft, ChevronRight,
  LayoutDashboard, Contact, Flag, Zap, Code, CreditCard
} from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminSidebar = ({ activeTab, onTabChange, isCollapsed, setIsCollapsed }) => {

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'advanced-search', label: 'Advanced Search', icon: Search },
    { id: 'segmentation', label: 'Segmentation', icon: Target },
    { id: 'email-campaigns', label: 'Email Campaigns', icon: Mail },
    { id: 'lifecycle', label: 'Lifecycle', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'chatbots', label: 'Chatbots', icon: Bot },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'sources', label: 'Sources', icon: FileText },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Activity Logs', icon: Database },
    { id: 'leads', label: 'Leads', icon: Contact },
    { id: 'contact-sales', label: 'Contact Sales', icon: Zap },
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'tech', label: 'Tech', icon: Code },
    { id: 'payment-gateway', label: 'Payment Gateway', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div 
      className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out fixed left-0 top-0 flex flex-col z-50",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Admin
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-md mx-auto">
            <span className="text-white font-bold text-lg">A</span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar min-h-0">
        <nav className="space-y-1 px-2 pb-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-red-600"
                )}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-white" : "text-gray-600 group-hover:text-red-600"
                  )} 
                />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle Button */}
      <div className="border-t border-gray-200 p-2 flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
