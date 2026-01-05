import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ArrowRight, Check, Sparkles, Zap, Crown } from 'lucide-react';
import { plansAPI } from '../utils/api';
import { Button } from './ui/button';

const UpgradeModal = ({ isOpen, onClose, limitType, currentUsage, maxUsage }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const response = await plansAPI.getAllPlans();
      // Filter out free plan for upgrades
      setPlans(response.data.filter(p => p.id !== 'free'));
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    // Redirect to subscription page for payment
    window.location.href = '/subscription';
  };

  const getPlanIcon = (planId) => {
    const icons = {
      starter: Zap,
      professional: Crown,
      enterprise: Sparkles
    };
    return icons[planId] || Sparkles;
  };

  const getPlanGradient = (planId) => {
    const gradients = {
      starter: 'from-pink-500 to-purple-500',
      professional: 'from-blue-600 to-indigo-600',
      enterprise: 'from-purple-600 to-pink-600'
    };
    return gradients[planId] || 'from-gray-400 to-gray-600';
  };

  const getLimitLabel = (type) => {
    const labels = {
      chatbots: 'Chatbots',
      messages: 'Messages per Month',
      file_uploads: 'File Uploads',
      website_sources: 'Website Sources',
      text_sources: 'Text Sources'
    };
    return labels[type] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
            <p className="text-gray-600 mt-1">Unlock more features and higher limits</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Limit Warning */}
        <div className="p-6 bg-orange-50 border-b border-orange-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">
                {getLimitLabel(limitType)} Limit Reached
              </h3>
              <p className="text-sm text-orange-700">
                You've used {currentUsage} of {maxUsage} available {getLimitLabel(limitType).toLowerCase()}.
                Upgrade your plan to continue using this feature.
              </p>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const Icon = getPlanIcon(plan.id);
                const gradient = getPlanGradient(plan.id);

                return (
                  <div
                    key={plan.id}
                    className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all"
                  >
                    {/* Plan Header */}
                    <div className={`bg-gradient-to-br ${gradient} p-6 text-white`}>
                      <Icon className="w-10 h-10 mb-3" />
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold mb-1">
                        {plan.price === -1 ? 'Custom' : `₹${plan.price.toLocaleString('en-IN')}`}
                      </div>
                      {plan.price > 0 && plan.price !== -1 && (
                        <div className="text-sm text-white/80">/month</div>
                      )}
                    </div>

                    {/* Plan Features */}
                    <div className="p-6">
                      <ul className="space-y-3 mb-6">
                        {plan.features.slice(0, 6).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        className={`w-full py-3 rounded-xl font-semibold bg-gradient-to-r ${gradient} hover:shadow-lg text-white border-0`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          View {plan.name} Plan
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Need help choosing the right plan?
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('/pricing', '_blank')}
              className="border-2"
            >
              Compare All Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
