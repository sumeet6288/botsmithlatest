import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Lightbulb, Target, MessageSquare, TrendingUp, Shield, Zap } from 'lucide-react';

const BestPractices = () => {
  const navigate = useNavigate();

  const practices = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Define Clear Objectives",
      description: "Start with a clear purpose for your chatbot",
      tips: [
        "Identify specific use cases (customer support, lead generation, FAQs)",
        "Set measurable goals (response time, satisfaction rate, conversion rate)",
        "Define success metrics and KPIs",
        "Understand your target audience and their needs"
      ],
      gradient: "from-purple-500 to-indigo-600"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Craft Effective Instructions",
      description: "Write clear and specific system prompts",
      tips: [
        "Be specific about tone and personality (professional, friendly, casual)",
        "Define boundaries - what the bot should and shouldn't do",
        "Include example responses for consistency",
        "Add context about your business, products, or services",
        "Use clear, concise language"
      ],
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Optimize Knowledge Base",
      description: "Provide high-quality, relevant content",
      tips: [
        "Keep content up-to-date and accurate",
        "Organize information in clear, logical structure",
        "Remove duplicate or conflicting information",
        "Use clear headings and formatting",
        "Test with sample questions to verify coverage"
      ],
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Monitor & Iterate",
      description: "Continuously improve based on data",
      tips: [
        "Review analytics regularly (daily/weekly)",
        "Identify common questions and add to knowledge base",
        "Track user satisfaction and response times",
        "Test different AI models and temperature settings",
        "Update instructions based on user feedback"
      ],
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Handle Edge Cases",
      description: "Prepare for unexpected scenarios",
      tips: [
        "Add fallback responses for unclear questions",
        "Include escalation paths to human support",
        "Handle sensitive topics appropriately",
        "Set up error handling and retry logic",
        "Test with unusual or adversarial inputs"
      ],
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Optimize Performance",
      description: "Ensure fast and reliable responses",
      tips: [
        "Choose appropriate AI model (balance speed vs quality)",
        "Optimize knowledge base size (remove unnecessary content)",
        "Use caching for frequently asked questions",
        "Monitor response times and optimize if needed",
        "Set reasonable temperature (0.7 recommended for most use cases)"
      ],
      gradient: "from-yellow-500 to-orange-600"
    }
  ];

  const dosAndDonts = {
    dos: [
      "Test your chatbot thoroughly before deployment",
      "Use natural, conversational language",
      "Provide clear options and next steps",
      "Set user expectations about capabilities",
      "Maintain brand voice consistently",
      "Update content regularly",
      "Monitor user feedback",
      "Provide easy escalation to human support"
    ],
    donts: [
      "Don't make the bot pretend to be human",
      "Don't use overly technical jargon",
      "Don't ignore user feedback",
      "Don't overcomplicate instructions",
      "Don't forget to test edge cases",
      "Don't leave outdated information",
      "Don't ignore analytics data",
      "Don't forget about mobile users"
    ]
  };

  const modelRecommendations = [
    {
      model: "GPT-4o Mini",
      useCase: "General Purpose",
      description: "Best for most use cases - fast, cost-effective, and high quality",
      bestFor: ["Customer support", "FAQs", "General queries", "Technical support"]
    },
    {
      model: "Claude 3.5 Haiku",
      useCase: "Efficient & Balanced",
      description: "Excellent balance of speed and quality with cost-effective pricing",
      bestFor: ["Multi-turn dialogues", "Business communications", "Context-aware responses"]
    },
    {
      model: "Gemini Flash Lite",
      useCase: "Speed & Efficiency",
      description: "Ultra-fast responses with good quality, perfect for high-volume",
      bestFor: ["High-traffic sites", "Quick responses", "Simple queries", "Real-time chat"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/resources')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Button>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => navigate('/dashboard')}
          >
            Apply Best Practices
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-[90%] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                Expert Guide
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Chatbot Best Practices
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn proven strategies to create highly effective AI chatbots that delight your users
            </p>
          </div>

          {/* Best Practices */}
          <div className="mb-16 space-y-8">
            {practices.map((practice, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-200/50 hover:border-purple-400 transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${practice.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {practice.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{practice.title}</h3>
                    <p className="text-gray-600 mb-4">{practice.description}</p>
                    <ul className="space-y-2">
                      {practice.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Do's and Don'ts */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Do's and Don'ts</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Do's */}
              <div className="bg-green-50 rounded-2xl p-8 border-2 border-green-200">
                <h3 className="text-2xl font-bold mb-6 text-green-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    ✓
                  </div>
                  Do's
                </h3>
                <ul className="space-y-3">
                  {dosAndDonts.dos.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-600 font-bold mt-0.5">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-200">
                <h3 className="text-2xl font-bold mb-6 text-red-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    ✗
                  </div>
                  Don'ts
                </h3>
                <ul className="space-y-3">
                  {dosAndDonts.donts.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-red-600 font-bold mt-0.5">✗</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Model Recommendations */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">AI Model Selection Guide</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {modelRecommendations.map((rec, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{rec.model}</h3>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                      {rec.useCase}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{rec.description}</p>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Best for:</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.bestFor.map((item, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-1 shadow-2xl">
            <div className="bg-white rounded-xl p-12 text-center">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ready to Build Your Perfect Chatbot?
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Apply these best practices and start creating amazing AI chatbots today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg"
                  onClick={() => navigate('/dashboard')}
                >
                  Start Building →
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-purple-300 hover:bg-purple-50 px-8 py-6 text-lg"
                  onClick={() => navigate('/resources/getting-started')}
                >
                  View Getting Started Guide
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestPractices;
