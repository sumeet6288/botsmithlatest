import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Check, Sparkles, Zap, Crown, Building2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const plans = [
    {
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
      cta: 'Start Free',
      ctaVariant: 'outline'
    },
    {
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
      cta: 'Get Started',
      ctaVariant: 'default'
    },
    {
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
      cta: 'Get Started',
      ctaVariant: 'default'
    },
    {
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
      cta: 'Contact Sales',
      ctaVariant: 'default'
    }
  ];

  return (
    <div className={`min-h-screen bg-white transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className={`border-b border-gray-200 transform transition-all duration-700 ${isLoaded ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-lg font-semibold">BotSmith</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/pricing')} className="text-black text-sm font-medium">Pricing</button>
            <button onClick={() => navigate('/enterprise')} className="text-gray-600 hover:text-black transition-colors text-sm">Scale Up</button>
            <button onClick={() => navigate('/resources')} className="text-gray-600 hover:text-black transition-colors text-sm">Learn</button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/signin')} className="text-sm">Sign in</Button>
            <Button className="bg-black hover:bg-gray-800 text-white rounded-lg text-sm" onClick={() => navigate('/dashboard')}>
              Try for Free
            </Button>
          </div>
        </div>
      </nav>

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className={`mb-6 transform transition-all duration-700 delay-100 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="group hover:bg-purple-50 text-gray-700 hover:text-purple-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </div>
          
          {/* Header */}
          <div className={`text-center mb-10 transform transition-all duration-700 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl font-bold mb-3 text-gray-900">
              Choose Your Perfect Plan
            </h1>
            <p className="text-base text-gray-600">
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div 
                  key={index} 
                  className={`relative ${plan.popular ? 'lg:-mt-2' : ''} transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Card */}
                  <div className={`h-full bg-white rounded-xl border-2 hover:shadow-lg transition-all duration-300 ${
                    plan.popular ? 'border-purple-500' : 'border-gray-200'
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
                      <Button 
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                          plan.ctaVariant === 'default'
                            ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white border-0`
                            : 'border border-gray-300 hover:border-gray-400 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (plan.name === 'Scale Up') {
                            navigate('/enterprise');
                          } else {
                            // Store selected plan in localStorage
                            localStorage.setItem('selectedPlan', JSON.stringify({
                              name: plan.name,
                              price: plan.price,
                              period: plan.period
                            }));
                            
                            // If user is authenticated, go to subscription page
                            // If not authenticated, redirect to signup
                            if (user) {
                              navigate('/subscription');
                            } else {
                              navigate('/signup');
                            }
                          }
                        }}
                      >
                        {plan.cta}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Help Section */}
          <div className={`mt-12 text-center transform transition-all duration-700 delay-700 ${isLoaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
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
        </div>
      </div>
    </div>
  );
};

export default Pricing;