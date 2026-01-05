import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansAPI } from '../utils/api';
import { 
  Sparkles, Zap, Crown, Building2, Check, ArrowRight, 
  TrendingUp, AlertCircle, Loader2 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { SubscriptionSkeleton } from '../components/LoadingSkeleton';
import Footer from '../components/Footer';

const Subscription = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subResponse, usageResponse, plansResponse] = await Promise.all([
        plansAPI.getCurrentSubscription(),
        plansAPI.getUsageStats(),
        plansAPI.getAllPlans()
      ]);

      setCurrentSubscription(subResponse.data.subscription);
      setCurrentPlan(subResponse.data.plan);
      setUsageStats(usageResponse.data);
      setAllPlans(plansResponse.data);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    if (upgrading) return;
    
    setUpgrading(true);
    try {
      await plansAPI.upgradePlan(planId);
      await fetchData(); // Refresh data
      alert('Plan upgraded successfully!');
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to upgrade plan. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const getPlanIcon = (planId) => {
    const icons = {
      free: Sparkles,
      starter: Zap,
      professional: Crown,
      enterprise: Building2
    };
    return icons[planId] || Sparkles;
  };

  const getPlanGradient = (planId) => {
    const gradients = {
      free: 'from-blue-400 to-cyan-400',
      starter: 'from-pink-500 to-purple-500',
      professional: 'from-blue-600 to-indigo-600',
      enterprise: 'from-purple-600 to-pink-600'
    };
    return gradients[planId] || 'from-gray-400 to-gray-600';
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (loading) {
    return <SubscriptionSkeleton />;
  }

  const Icon = getPlanIcon(currentPlan?.id);
  const gradient = getPlanGradient(currentPlan?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Subscription & Usage</h1>
          <p className="text-gray-600">Manage your plan and monitor your usage</p>
        </div>

        {/* Current Plan Card */}
        <div className={`bg-gradient-to-br ${gradient} rounded-3xl shadow-xl p-8 mb-8 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Icon className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">{currentPlan?.name} Plan</h2>
                <p className="text-white/90">
                  {currentPlan?.price === 0 
                    ? 'Free Forever' 
                    : currentPlan?.price === -1 
                    ? 'Custom Pricing' 
                    : `$${currentPlan?.price}/month`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">Status</div>
              <div className="text-xl font-semibold capitalize">{currentSubscription?.status}</div>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold">Current Usage</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Chatbots Usage */}
            <div className="p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Chatbots</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUsageColor(usageStats?.usage?.chatbots?.percentage || 0)}`}>
                  {usageStats?.usage?.chatbots?.percentage || 0}%
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{usageStats?.usage?.chatbots?.current || 0} used</span>
                  <span>{usageStats?.usage?.chatbots?.limit === 999999 ? 'Unlimited' : `${usageStats?.usage?.chatbots?.limit || 0} limit`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressColor(usageStats?.usage?.chatbots?.percentage || 0)}`}
                    style={{ width: `${Math.min(usageStats?.usage?.chatbots?.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Messages Usage */}
            <div className="p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Messages (Monthly)</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUsageColor(usageStats?.usage?.messages?.percentage || 0)}`}>
                  {usageStats?.usage?.messages?.percentage || 0}%
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{usageStats?.usage?.messages?.current || 0} used</span>
                  <span>{usageStats?.usage?.messages?.limit === 999999999 ? 'Unlimited' : `${usageStats?.usage?.messages?.limit?.toLocaleString() || 0} limit`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressColor(usageStats?.usage?.messages?.percentage || 0)}`}
                    style={{ width: `${Math.min(usageStats?.usage?.messages?.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* File Uploads Usage */}
            <div className="p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">File Uploads</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUsageColor(usageStats?.usage?.file_uploads?.percentage || 0)}`}>
                  {usageStats?.usage?.file_uploads?.percentage || 0}%
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{usageStats?.usage?.file_uploads?.current || 0} used</span>
                  <span>{usageStats?.usage?.file_uploads?.limit === 999999 ? 'Unlimited' : `${usageStats?.usage?.file_uploads?.limit || 0} limit`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressColor(usageStats?.usage?.file_uploads?.percentage || 0)}`}
                    style={{ width: `${Math.min(usageStats?.usage?.file_uploads?.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Website Sources Usage */}
            <div className="p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Website Sources</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUsageColor(usageStats?.usage?.website_sources?.percentage || 0)}`}>
                  {usageStats?.usage?.website_sources?.percentage || 0}%
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{usageStats?.usage?.website_sources?.current || 0} used</span>
                  <span>{usageStats?.usage?.website_sources?.limit === 999999 ? 'Unlimited' : `${usageStats?.usage?.website_sources?.limit || 0} limit`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressColor(usageStats?.usage?.website_sources?.percentage || 0)}`}
                    style={{ width: `${Math.min(usageStats?.usage?.website_sources?.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Text Sources Usage */}
            <div className="p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Text Sources</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUsageColor(usageStats?.usage?.text_sources?.percentage || 0)}`}>
                  {usageStats?.usage?.text_sources?.percentage || 0}%
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{usageStats?.usage?.text_sources?.current || 0} used</span>
                  <span>{usageStats?.usage?.text_sources?.limit === 999999 ? 'Unlimited' : `${usageStats?.usage?.text_sources?.limit || 0} limit`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressColor(usageStats?.usage?.text_sources?.percentage || 0)}`}
                    style={{ width: `${Math.min(usageStats?.usage?.text_sources?.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Warning if approaching limits */}
          {Object.values(usageStats?.usage || {}).some(u => u.percentage >= 75) && (
            <div className="mt-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900">Approaching Limits</h4>
                <p className="text-sm text-orange-700">
                  You're approaching your plan limits. Consider upgrading to avoid service interruption.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allPlans.map((plan) => {
              const PlanIcon = getPlanIcon(plan.id);
              const planGradient = getPlanGradient(plan.id);
              const isCurrentPlan = plan.id === currentPlan?.id;

              return (
                <div
                  key={plan.id}
                  className={`border-2 rounded-2xl overflow-hidden hover:shadow-lg transition-all ${
                    isCurrentPlan ? 'border-purple-500 ring-4 ring-purple-200' : 'border-gray-200'
                  }`}
                >
                  {/* Plan Header */}
                  <div className={`bg-gradient-to-br ${planGradient} p-6 text-white`}>
                    <PlanIcon className="w-8 h-8 mb-3" />
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <div className="text-2xl font-bold">
                      {plan.price === 0 
                        ? 'Free' 
                        : plan.price === -1 
                        ? 'Custom' 
                        : `$${plan.price}`}
                    </div>
                    {plan.price > 0 && plan.price !== -1 && (
                      <div className="text-sm text-white/80">/month</div>
                    )}
                  </div>

                  {/* Plan Features */}
                  <div className="p-6">
                    <ul className="space-y-2 mb-6">
                      {plan.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    {isCurrentPlan ? (
                      <div className="w-full py-3 text-center bg-gray-100 text-gray-700 rounded-xl font-semibold">
                        Current Plan
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={upgrading}
                        className={`w-full py-3 rounded-xl font-semibold transition-all bg-gradient-to-r ${planGradient} hover:shadow-lg text-white border-0`}
                      >
                        {upgrading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Switch to {plan.name}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer variant="dashboard" />
    </div>
  );
};

export default Subscription;
