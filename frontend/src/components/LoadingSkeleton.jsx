import React from 'react';

// Base skeleton component with smooth shimmer animation
export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: 'shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
    </div>
  );
};

// Card skeleton for dashboard
export const CardSkeleton = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-gray-200 animate-fade-in">
      <div className="space-y-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
};

// Stats card skeleton
export const StatsCardSkeleton = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
};

// Chatbot card skeleton
export const ChatbotCardSkeleton = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-40 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
};

// Table row skeleton
export const TableRowSkeleton = ({ columns = 4 }) => {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

// Analytics chart skeleton
export const ChartSkeleton = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-gray-200">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="space-y-3">
        {[60, 80, 45, 90, 70, 55, 85].map((height, i) => (
          <div key={i} className="flex items-end space-x-2">
            <Skeleton className={`w-full`} style={{ height: `${height}px` }} />
          </div>
        ))}
      </div>
    </div>
  );
};

// List item skeleton
export const ListItemSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
};

// Page header skeleton
export const PageHeaderSkeleton = () => {
  return (
    <div className="mb-8 animate-fade-in">
      <Skeleton className="h-10 w-64 mb-3" />
      <Skeleton className="h-5 w-96" />
    </div>
  );
};

// Navigation skeleton
export const NavSkeleton = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-5 w-20" />
            ))}
          </div>
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </nav>
  );
};

// Full page loading skeleton for Dashboard
export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <NavSkeleton />
      <div className="p-6 max-w-7xl mx-auto">
        <PageHeaderSkeleton />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Chatbot Cards */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-gray-200 mb-8">
          <Skeleton className="h-7 w-40 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <ChatbotCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics page skeleton
export const AnalyticsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <NavSkeleton />
      <div className="p-6 max-w-7xl mx-auto">
        <PageHeaderSkeleton />
        
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Subscription page skeleton
export const SubscriptionSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <NavSkeleton />
      <div className="p-6 max-w-7xl mx-auto">
        <PageHeaderSkeleton />
        
        {/* Current Plan */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-gray-200 mb-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-gray-200">
              <Skeleton className="h-8 w-8 rounded-xl mb-4" />
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-10 w-24 mb-6" />
              <div className="space-y-3 mb-6">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
