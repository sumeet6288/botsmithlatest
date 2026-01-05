import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Shield, Users, Zap, HeadphonesIcon, CheckCircle, Building2, Globe2, Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Enterprise = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/public/contact-sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Request Submitted!',
          description: data.message || 'Our team will contact you within 24 hours'
        });
        setFormData({ name: '', email: '', company: '', message: '' });
      } else {
        throw new Error(data.detail || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit form. Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: 'SOC 2 compliance, SSO, and advanced security features',
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Dedicated Support',
      description: '24/7 support with dedicated account manager',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Custom Integration',
      description: 'Custom integrations and API development',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8" />,
      title: 'Priority Support',
      description: 'Fastest response times and priority bug fixes',
      gradient: 'from-green-500 to-emerald-600'
    }
  ];

  const benefits = [
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Unlimited chatbots' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Custom AI model training' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Advanced analytics' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'White-label options' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Priority feature requests' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'SLA guarantees' }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated background elements */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-transform duration-1000 ${isLoaded ? 'scale-100' : 'scale-110'}`}>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <nav className={`fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50 shadow-sm transform transition-all duration-700 ${isLoaded ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">BotSmith</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/pricing')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Pricing</button>
            <button onClick={() => navigate('/enterprise')} className="text-purple-600 font-semibold">Scale Up</button>
            <button onClick={() => navigate('/resources')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Learn</button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/signin')} className="hover:bg-purple-50">Sign in</Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300" onClick={() => navigate('/signup')}>
              Try for Free
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className={`mb-6 animate-fade-in-up transform transition-all duration-700 delay-100 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="group hover:bg-purple-50 text-gray-700 hover:text-purple-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </div>
          
          {/* Hero Section */}
          <div className={`text-center mb-20 animate-fade-in-up transform transition-all duration-700 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium inline-flex items-center gap-2 animate-bounce-subtle">
                <Building2 className="w-4 h-4" />
                For Large Organizations
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Scale Up Solutions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Powerful AI chatbots with enterprise-grade security, scalability, and dedicated support</p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`group bg-white/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-purple-200/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                style={{ animationDelay: `${index * 100}ms`, transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">{feature.title}</h3>
                <p className="text-gray-600 text-lg">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className={`bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-1 mb-20 shadow-2xl animate-fade-in-up transform transition-all duration-700 delay-500 ${isLoaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">What's Included</h2>
                <p className="text-gray-600">Everything you need for enterprise-scale deployments</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200/50 hover:border-purple-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg shadow-green-500/30">
                      {benefit.icon}
                      <span className="text-white"></span>
                    </div>
                    <span className="font-medium text-gray-900">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-10 shadow-2xl animate-fade-in-up transform transition-all duration-700 delay-600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">Contact Sales</h2>
              <p className="text-gray-600 text-lg">Get in touch with our team to discuss your needs</p>
            </div>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="font-medium text-gray-700">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-2 border-2 border-purple-200 focus:border-purple-600 transition-colors"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="font-medium text-gray-700">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-2 border-2 border-purple-200 focus:border-purple-600 transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company" className="font-medium text-gray-700">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="mt-2 border-2 border-purple-200 focus:border-purple-600 transition-colors"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message" className="font-medium text-gray-700">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="mt-2 min-h-[150px] border-2 border-purple-200 focus:border-purple-600 transition-colors"
                  placeholder="Tell us about your requirements..."
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg rounded-xl shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300"
              >
                Submit Request
              </Button>
              <p className="text-center text-sm text-gray-500 mt-4">
                <Lock className="w-4 h-4 inline mr-1" />
                Your information is secure and confidential
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enterprise;