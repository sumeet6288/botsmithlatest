import React, { useState } from 'react';
import { X, AlertTriangle, Clock, CreditCard, Zap } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SubscriptionExpiredModal = ({ 
  isOpen, 
  onClose, 
  subscriptionStatus,
  currentPlan,
  onRenewed 
}) => {
  const [isRenewing, setIsRenewing] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  if (!isOpen) return null;

  const isExpired = subscriptionStatus?.is_expired;
  const isExpiringSoon = subscriptionStatus?.is_expiring_soon;
  const daysRemaining = subscriptionStatus?.days_remaining;

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/plans/renew`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      toast.success('Subscription renewed successfully!');
      if (onRenewed) onRenewed();
      onClose();
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast.error(error.response?.data?.detail || 'Failed to renew subscription');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleUpgrade = () => {
    // Redirect to subscription page
    window.location.href = '/subscription';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`relative p-6 ${isExpired ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'} text-white rounded-t-2xl`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-start space-x-4">
            <div className={`p-3 ${isExpired ? 'bg-red-600/30' : 'bg-orange-600/30'} rounded-xl`}>
              {isExpired ? (
                <AlertTriangle className="h-8 w-8" />
              ) : (
                <Clock className="h-8 w-8" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {isExpired ? 'Subscription Expired' : 'Subscription Expiring Soon'}
              </h2>
              <p className="text-white/90 text-lg">
                {isExpired 
                  ? 'Your subscription has ended. Renew now to continue using all features.'
                  : `Your subscription expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}. Renew to avoid interruption.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Plan Info */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-purple-600 mr-2">📋</span>
              Current Plan
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan:</span>
                <span className="font-bold text-gray-900">{currentPlan?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-gray-900">
                  ${currentPlan?.price ? (currentPlan.price / 100).toFixed(2) : '0.00'}/month
                </span>
              </div>
              {subscriptionStatus?.expires_at && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-bold text-gray-900">
                    {new Date(subscriptionStatus.expires_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* What happens section */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h3 className="font-semibold text-red-900 mb-3 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              What happens if you don't renew?
            </h3>
            <ul className="space-y-2 text-sm text-red-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You'll lose access to all chatbots and features</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your data will be preserved for 30 days</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Integrations will stop working</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You won't be able to create new chatbots or conversations</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRenew}
              disabled={isRenewing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <CreditCard className="h-5 w-5" />
              <span>{isRenewing ? 'Renewing...' : `Renew ${currentPlan?.name || 'Plan'}`}</span>
            </button>
            
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Zap className="h-5 w-5" />
              <span>Upgrade to Better Plan</span>
            </button>
          </div>

          {/* Cancel button */}
          <button
            onClick={onClose}
            className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium transition-colors"
          >
            I'll decide later
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpiredModal;
