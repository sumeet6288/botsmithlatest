import { useState, useEffect } from 'react';
import axios from 'axios';

const useSubscriptionCheck = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Check subscription status
      const statusResponse = await axios.get(
        `${backendUrl}/api/plans/subscription-status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSubscriptionStatus(statusResponse.data);

      // Get current plan info
      const planResponse = await axios.get(
        `${backendUrl}/api/plans/current`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCurrentPlan(planResponse.data.plan);

      // Show modal if expired or expiring soon
      const shouldShowModal = statusResponse.data.is_expired || 
                             (statusResponse.data.is_expiring_soon && statusResponse.data.days_remaining <= 3);
      
      // Check if user has dismissed the modal in this session
      const dismissedKey = `subscription-modal-dismissed-${new Date().toDateString()}`;
      const isDismissed = sessionStorage.getItem(dismissedKey);

      if (shouldShowModal && !isDismissed) {
        setShowExpirationModal(true);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();

    // Check every 5 minutes
    const interval = setInterval(checkSubscription, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleModalClose = () => {
    setShowExpirationModal(false);
    
    // Don't show again today unless expired
    if (!subscriptionStatus?.is_expired) {
      const dismissedKey = `subscription-modal-dismissed-${new Date().toDateString()}`;
      sessionStorage.setItem(dismissedKey, 'true');
    }
  };

  const handleRenewed = () => {
    // Refresh subscription status
    checkSubscription();
  };

  return {
    subscriptionStatus,
    currentPlan,
    showExpirationModal,
    loading,
    setShowExpirationModal,
    handleModalClose,
    handleRenewed,
    checkSubscription
  };
};

export default useSubscriptionCheck;
