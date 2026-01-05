import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, Zap, Crown, Check, ArrowRight, 
  TrendingUp, AlertCircle, Loader2, CreditCard, CheckCircle, Building2, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import Footer from '../components/Footer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const SubscriptionNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [checkingOut, setCheckingOut] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Define plans matching the Pricing page
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: '/month',
      description: 'Perfect for trying out BotSmith',
      icon: Sparkles,
      gradient: 'from-blue-400 to-cyan-400',
      features: [
        '1 chatbot',
        '100 messages/month',
        'Basic analytics',
        'Community support',
        'Standard AI models'
      ],
      cta: 'Current Plan',
      isFree: true
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '₹7,999',
      period: '/month',
      description: 'For growing businesses',
      icon: Zap,
      gradient: 'from-pink-500 to-purple-500',
      popular: true,
      features: [
        '5 chatbots',
        '15,000 messages/month',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access',
        'All AI models'
      ],
      cta: 'Subscribe Now'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '₹24,999',
      period: '/month',
      description: 'For large teams & high volume',
      icon: Crown,
      gradient: 'from-blue-600 to-indigo-600',
      features: [
        '25 chatbots',
        '1,25,000 messages/month',
        'Advanced analytics',
        '24/7 priority support',
        'Custom branding',
        'Full API access',
        'All AI models',
        'Custom integrations',
        'Dedicated account manager'
      ],
      cta: 'Subscribe Now'
    },
    {
      id: 'enterprise',
      name: 'Scale Up',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for your needs',
      icon: Building2,
      gradient: 'from-purple-600 to-pink-600',
      features: [
        'Unlimited chatbots',
        'Unlimited messages',
        'Custom analytics',
        'Dedicated 24/7 support',
        'White-label solution',
        'Custom AI model training',
        'On-premise deployment',
        'SLA guarantee',
        'Custom contracts',
        'Enterprise security'
      ],
      cta: 'Contact Sales'
    }
  ];

  useEffect(() => {
    fetchData();
    
    // Check for success parameter or returning from payment
    const success = searchParams.get('success');
    const fromPayment = searchParams.get('from_payment');
    const error = searchParams.get('error');
    
    if (success === 'true' || fromPayment === 'true') {
      setShowSuccess(true);
      setRedirectCountdown(5);
      
      // Countdown timer for redirect
      const countdownInterval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Redirect to dashboard after countdown
            navigate('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Sync subscription after successful payment with retry
      setTimeout(() => syncSubscription(), 2000); // Wait 2s for webhook to process
      setTimeout(() => syncSubscription(), 5000); // Retry after 5s
      setTimeout(() => syncSubscription(), 10000); // Retry after 10s
      
      return () => clearInterval(countdownInterval);
    }
    
    // Handle payment failure/error
    if (error) {
      setShowError(true);
      setRedirectCountdown(5);
      
      // Set error message based on error type
      const errorMessages = {
        'sync_failed': 'Payment processed but sync failed. Please click "Sync Subscription" or contact support.',
        'payment_failed': 'Payment failed. Please try again or contact support.',
        'cancelled': 'Payment was cancelled. You can try again whenever you\'re ready.'
      };
      setErrorMessage(errorMessages[error] || 'An error occurred during payment. Please try again.');
      
      // Countdown timer for redirect
      const countdownInterval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Redirect to dashboard after countdown
            navigate('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, [searchParams, navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('botsmith_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch subscription status using new plan service
      try {
        const usageResponse = await axios.get(`${BACKEND_URL}/api/plans/usage`, {
          headers
        });
        
        const statusResponse = await axios.get(`${BACKEND_URL}/api/plans/subscription-status`, {
          headers
        });
        
        // Combine both responses
        const combinedData = {
          has_subscription: true,
          plan: usageResponse.data.plan.name,
          plan_id: usageResponse.data.plan.id,
          status: usageResponse.data.subscription.status,
          expires_at: usageResponse.data.subscription.expires_at,
          is_expired: statusResponse.data.is_expired,
          is_expiring_soon: statusResponse.data.is_expiring_soon,
          days_remaining: statusResponse.data.days_remaining,
          auto_renew: usageResponse.data.subscription.auto_renew,
          billing_cycle: usageResponse.data.subscription.billing_cycle
        };
        
        setSubscriptionStatus(combinedData);
      } catch (error) {
        console.log('No active subscription:', error);
        setSubscriptionStatus({ has_subscription: false, plan: 'free', plan_id: 'free' });
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncSubscription = async () => {
    try {
      setSyncing(true);
      const token = localStorage.getItem('botsmith_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(
        `${BACKEND_URL}/api/razorpay/subscription/sync`,
        {},
        { headers }
      );
      
      console.log('Subscription synced:', response.data);
      
      // Refresh subscription status after sync
      await fetchData();
    } catch (error) {
      console.error('Error syncing subscription:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleRenewSubscription = async () => {
    if (renewing) return;
    
    try {
      setRenewing(true);
      const token = localStorage.getItem('botsmith_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(
        `${BACKEND_URL}/api/plans/renew`,
        {},
        { headers }
      );
      
      console.log('Subscription renewed:', response.data);
      
      // Show success message
      alert('🎉 Subscription renewed successfully for 30 days!');
      
      // Refresh subscription status
      await fetchData();
    } catch (error) {
      console.error('Error renewing subscription:', error);
      alert(error.response?.data?.detail || 'Failed to renew subscription. Please try again or contact support.');
    } finally {
      setRenewing(false);
    }
  };

  const handleCheckout = async (planId) => {
    if (checkingOut) return;

    // Handle Enterprise plan differently
    if (planId === 'enterprise') {
      navigate('/enterprise');
      return;
    }
    
    // Handle Free plan
    if (planId === 'free') {
      alert('You are already on the Free plan');
      return;
    }
    
    setCheckingOut(planId);
    try {
      const token = localStorage.getItem('botsmith_token');
      if (!token) {
        alert('Please log in to subscribe');
        navigate('/signin');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      // Create Razorpay subscription - backend will use authenticated user's data
      const response = await axios.post(
        `${BACKEND_URL}/api/razorpay/create-subscription`,
        {
          plan_id: planId
        },
        { headers }
      );

      if (response.data.success && response.data.checkout_url) {
        // Open Razorpay checkout in new tab
        window.open(response.data.checkout_url, '_blank');
        setCheckingOut(null); // Reset loading state since we're not redirecting
      } else {
        throw new Error('Failed to create checkout');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to create checkout. Please try again.';
      alert(errorMessage);
      setCheckingOut(null);
    }
    // Don't reset checkingOut here as we're redirecting
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 overflow-hidden relative p-4 sm:p-6 animate-fade-in">
      {/* Advanced Animated background matching Pricing Page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ willChange: 'transform' }}>
        {/* Main gradient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob" style={{ transform: 'translateZ(0)' }}></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000" style={{ transform: 'translateZ(0)' }}></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000" style={{ transform: 'translateZ(0)' }}></div>
        
        {/* Secondary animated layers */}
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-12 animate-blob animation-delay-1000" style={{ transform: 'translateZ(0)' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-12 animate-blob animation-delay-3000" style={{ transform: 'translateZ(0)' }}></div>
        
        {/* Geometric floating shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-3xl rotate-45 animate-float-rotate blur-sm"></div>
        <div className="absolute bottom-40 left-32 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-2xl rotate-12 animate-float-rotate animation-delay-2000 blur-sm"></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-gradient-to-br from-orange-400/15 to-rose-400/15 rounded-full animate-float animation-delay-1000 blur-md"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back to Dashboard Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 text-gray-700 hover:text-purple-600 font-medium group text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg animate-bounce-in">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 text-base mb-1">Payment Successful!</h3>
                <p className="text-sm text-green-700 mb-2">Your subscription has been activated. Welcome aboard! 🎉</p>
                <p className="text-xs text-green-600 font-medium">
                  Redirecting to dashboard in {redirectCountdown} seconds...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg animate-bounce-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 text-base mb-1">Payment Failed</h3>
                <p className="text-sm text-red-700 mb-2">{errorMessage}</p>
                <p className="text-xs text-red-600 font-medium">
                  Redirecting to dashboard in {redirectCountdown} seconds...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header - Match Pricing Page */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-3">
            <h1 className="text-4xl font-bold text-gray-900">
              Choose Your Perfect Plan
            </h1>
            <button
              onClick={syncSubscription}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-purple-700 text-sm font-medium"
              title="Sync subscription from Lemon Squeezy"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
          <p className="text-base text-gray-600">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscriptionStatus?.has_subscription && (
          <div className={`mb-6 p-4 rounded-xl border ${
            subscriptionStatus.is_expired 
              ? 'bg-red-50 border-red-300' 
              : subscriptionStatus.is_expiring_soon 
                ? 'bg-orange-50 border-orange-300' 
                : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {subscriptionStatus.is_expired ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <Crown className="w-5 h-5 text-purple-600" />
              )}
              <h2 className="text-base font-bold text-gray-900">Current Subscription</h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-700 text-sm mb-1">
                  <span className="font-semibold">Plan:</span> {subscriptionStatus.plan}
                </p>
                <p className="text-gray-700 text-sm mb-1">
                  <span className="font-semibold">Status:</span>{' '}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    subscriptionStatus.is_expired 
                      ? 'bg-red-100 text-red-800'
                      : subscriptionStatus.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subscriptionStatus.is_expired ? 'Expired' : subscriptionStatus.status}
                  </span>
                </p>
                {subscriptionStatus.billing_cycle && (
                  <p className="text-gray-600 text-xs">
                    <span className="font-semibold">Billing:</span> {subscriptionStatus.billing_cycle}
                  </p>
                )}
              </div>
              {subscriptionStatus.expires_at && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {subscriptionStatus.is_expired ? 'Expired on' : 'Expires on'}
                  </p>
                  <p className="font-semibold text-gray-700 text-sm">
                    {new Date(subscriptionStatus.expires_at).toLocaleDateString()}
                  </p>
                  {!subscriptionStatus.is_expired && subscriptionStatus.days_remaining !== null && (
                    <p className={`text-xs mt-1 font-medium ${
                      subscriptionStatus.is_expiring_soon ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {subscriptionStatus.days_remaining} {subscriptionStatus.days_remaining === 1 ? 'day' : 'days'} left
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Expiration Warning */}
            {(subscriptionStatus.is_expired || subscriptionStatus.is_expiring_soon) && (
              <div className={`mt-3 p-3 rounded-lg ${
                subscriptionStatus.is_expired ? 'bg-red-100' : 'bg-orange-100'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm font-medium flex-1 ${
                    subscriptionStatus.is_expired ? 'text-red-900' : 'text-orange-900'
                  }`}>
                    {subscriptionStatus.is_expired 
                      ? '⚠️ Your subscription has expired. Renew now to continue using all features.'
                      : `⏰ Your subscription is expiring in ${subscriptionStatus.days_remaining} ${subscriptionStatus.days_remaining === 1 ? 'day' : 'days'}!`
                    }
                  </p>
                  {/* Renew Now Button */}
                  <Button
                    onClick={handleRenewSubscription}
                    disabled={renewing}
                    className={`${
                      subscriptionStatus.is_expired 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-orange-600 hover:bg-orange-700'
                    } text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 whitespace-nowrap`}
                  >
                    {renewing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Renewing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Renew Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pricing Cards - Match Pricing Page Design */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            const isFree = plan.isFree;
            const currentPlan = subscriptionStatus?.plan_id?.toLowerCase() === plan.id.toLowerCase();

            return (
              <div
                key={plan.id}
                className={`relative ${isPopular ? 'lg:-mt-2' : ''}`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Expiration Badge for Current Plan */}
                {currentPlan && subscriptionStatus?.is_expired && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Expired
                    </span>
                  </div>
                )}
                {currentPlan && subscriptionStatus?.is_expiring_soon && !subscriptionStatus?.is_expired && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Expiring Soon
                    </span>
                  </div>
                )}

                {/* Card */}
                <div className={`h-full bg-white rounded-xl border-2 hover:shadow-lg transition-all duration-300 ${
                  isPopular 
                    ? 'border-purple-500' 
                    : currentPlan && subscriptionStatus?.is_expired
                      ? 'border-red-500'
                      : currentPlan && subscriptionStatus?.is_expiring_soon
                        ? 'border-orange-500'
                        : currentPlan 
                          ? 'border-green-500' 
                          : 'border-gray-200'
                }`}>
                  {/* Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className={`w-10 h-10 bg-gradient-to-br ${plan.gradient} rounded-lg flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                    <p className="text-gray-600 text-xs mb-3">{plan.description}</p>
                    
                    <div>
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-500 text-sm">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-5">
                    <ul className="space-y-2 mb-5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-xs">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    {currentPlan && (subscriptionStatus?.is_expired || subscriptionStatus?.is_expiring_soon) ? (
                      <Button 
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                          subscriptionStatus?.is_expired 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 text-white border-0' 
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 text-white border-0'
                        }`}
                        onClick={handleRenewSubscription}
                        disabled={renewing}
                      >
                        {renewing ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin mr-1.5 inline" />
                            Renewing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1.5 inline" />
                            Renew Now
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                          isFree || currentPlan
                            ? 'border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                            : `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white border-0`
                        }`}
                        onClick={() => handleCheckout(plan.id)}
                        disabled={isFree || currentPlan || checkingOut !== null}
                      >
                        {checkingOut === plan.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin mr-1.5 inline" />
                            Processing...
                          </>
                        ) : (
                          currentPlan ? '✓ Current Plan' : plan.cta
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Section - Match Pricing Page */}
        <div className="mt-12 text-center">
          <div className="bg-gray-50 rounded-xl p-6 max-w-2xl mx-auto border border-gray-200">
            <h2 className="text-xl font-bold mb-2">
              Need help choosing?
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Not sure which plan is right for you? Our team is here to help.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-2 text-sm"
                onClick={() => navigate('/enterprise')}
              >
                Talk to Sales
              </Button>
              <Button 
                variant="outline"
                className="border rounded-lg px-6 py-2 text-sm"
                onClick={() => navigate('/resources')}
              >
                View Documentation
              </Button>
            </div>
          </div>
        </div>

        {/* Secure Payment Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Secure Payment Processing</h3>
              <p className="text-gray-700 text-xs mb-2">
                All payments are processed securely through Razorpay Payment Gateway. We never store your payment information.
              </p>
              <ul className="space-y-0.5 text-xs text-gray-600">
                <li>✓ Real Payment mode enabled - real charges Applied</li>
                <li>✓ Cancel anytime</li>
                <li>✓ Instant activation</li>
                <li>✓ 24/7 support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubscriptionNew;
