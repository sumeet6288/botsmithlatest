import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, Infinity, Clock, RefreshCw, AlertCircle, CheckCircle, Zap, Award, TrendingUp } from 'lucide-react';

const ManageSubscriptionModal = ({ user, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [extendDays, setExtendDays] = useState(30);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscriptionDetails();
      fetchAvailablePlans();
    }
  }, [user]);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching subscription for user:', user);
      console.log('User ID:', user.user_id);
      console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/admin/subscriptions/${user.user_id}`;
      console.log('Full URL:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Subscription data received:', data);
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/subscriptions/plans`);
      const data = await response.json();
      setAvailablePlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleExtendSubscription = async () => {
    if (!extendDays || extendDays < 1) {
      alert('Please enter a valid number of days');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/subscriptions/${user.user_id}/extend`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days: parseInt(extendDays) })
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Subscription extended by ${extendDays} days successfully!`);
        fetchSubscriptionDetails();
        if (onUpdate) onUpdate();
      } else {
        alert(`❌ Error: ${data.detail || 'Failed to extend subscription'}`);
      }
    } catch (error) {
      console.error('Error extending subscription:', error);
      alert('❌ Failed to extend subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleRenewSubscription = async () => {
    try {
      setProcessing(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/subscriptions/${user.user_id}/renew`,
        { method: 'POST' }
      );

      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Subscription renewed for 30 days successfully!');
        fetchSubscriptionDetails();
        if (onUpdate) onUpdate();
      } else {
        alert(`❌ Error: ${data.detail || 'Failed to renew subscription'}`);
      }
    } catch (error) {
      console.error('Error renewing subscription:', error);
      alert('❌ Failed to renew subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleLifetimeAccess = async (grant) => {
    try {
      setProcessing(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/subscriptions/${user.user_id}/lifetime`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grant_lifetime: grant })
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Lifetime access ${grant ? 'granted' : 'revoked'} successfully!`);
        fetchSubscriptionDetails();
        if (onUpdate) onUpdate();
      } else {
        alert(`❌ Error: ${data.detail || 'Failed to update lifetime access'}`);
      }
    } catch (error) {
      console.error('Error updating lifetime access:', error);
      alert('❌ Failed to update lifetime access');
    } finally {
      setProcessing(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) {
      alert('Please select a plan');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/subscriptions/${user.user_id}/plan`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan_id: selectedPlan })
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Plan changed successfully!');
        fetchSubscriptionDetails();
        if (onUpdate) onUpdate();
      } else {
        alert(`❌ Error: ${data.detail || 'Failed to change plan'}`);
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      alert('❌ Failed to change plan');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.active;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-lg">Loading subscription details...</span>
          </div>
        </div>
      </div>
    );
  }

  const subscription = subscriptionData?.subscription;
  const plan = subscriptionData?.plan;
  const hasLifetimeAccess = subscription?.lifetime_access;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Manage Subscription
              </h2>
              <p className="text-purple-100 mt-1">
                {user?.name} - {user?.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'actions'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Actions
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Current Plan Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold">Current Plan</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{plan?.name || 'N/A'}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    ₹{plan?.price === -1 ? 'Custom' : plan?.price || 0}/month
                  </p>
                </div>

                {/* Status Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Status</span>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(subscription?.status)}`}>
                    {subscription?.status || 'N/A'}
                  </span>
                  {hasLifetimeAccess && (
                    <div className="flex items-center gap-1 mt-2 text-green-700">
                      <Infinity className="w-4 h-4" />
                      <span className="text-sm font-medium">Lifetime Access</span>
                    </div>
                  )}
                </div>

                {/* Days Remaining Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Days Remaining</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {hasLifetimeAccess ? (
                      <span className="flex items-center gap-1">
                        <Infinity className="w-6 h-6" /> Lifetime
                      </span>
                    ) : (
                      subscription?.days_remaining || 0
                    )}
                  </p>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Started At</p>
                      <p className="text-gray-900">{formatDate(subscription?.started_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expires At</p>
                      <p className="text-gray-900">
                        {hasLifetimeAccess ? (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <Infinity className="w-4 h-4" /> Never Expires
                          </span>
                        ) : (
                          formatDate(subscription?.expires_at)
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Auto Renew</p>
                      <p className="text-gray-900">{subscription?.auto_renew ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Plan ID</p>
                      <p className="text-gray-900">{subscription?.plan_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              {plan?.features && plan.features.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Extend Subscription */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Extend Subscription</h3>
                </div>
                <p className="text-gray-600 mb-4">Add extra days to the current subscription period</p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    value={extendDays}
                    onChange={(e) => setExtendDays(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Number of days"
                    disabled={hasLifetimeAccess || processing}
                  />
                  <button
                    onClick={handleExtendSubscription}
                    disabled={hasLifetimeAccess || processing}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Extend
                  </button>
                </div>
                {hasLifetimeAccess && (
                  <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Cannot extend - User has lifetime access
                  </p>
                )}
              </div>

              {/* Quick Renew */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Quick Renew (30 Days)</h3>
                </div>
                <p className="text-gray-600 mb-4">Renew subscription for another 30 days</p>
                <button
                  onClick={handleRenewSubscription}
                  disabled={hasLifetimeAccess || processing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Renew for 30 Days
                </button>
                {hasLifetimeAccess && (
                  <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Cannot renew - User has lifetime access
                  </p>
                )}
              </div>

              {/* Lifetime Access */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-orange-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Infinity className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Lifetime Access</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {hasLifetimeAccess 
                    ? 'User currently has lifetime access. Click to revoke.' 
                    : 'Grant permanent access to this user (no expiration)'}
                </p>
                <button
                  onClick={() => handleToggleLifetimeAccess(!hasLifetimeAccess)}
                  disabled={processing}
                  className={`px-6 py-2 ${
                    hasLifetimeAccess 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                  } text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2`}
                >
                  {processing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Infinity className="w-4 h-4" />
                  )}
                  {hasLifetimeAccess ? 'Revoke Lifetime Access' : 'Grant Lifetime Access'}
                </button>
              </div>

              {/* Change Plan */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Change Plan</h3>
                </div>
                <p className="text-gray-600 mb-4">Switch user to a different subscription plan</p>
                <div className="flex gap-3">
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={processing}
                  >
                    <option value="">Select a plan...</option>
                    {availablePlans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{p.price === -1 ? 'Custom' : p.price}/month
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleChangePlan}
                    disabled={!selectedPlan || processing}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                    Change Plan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSubscriptionModal;
