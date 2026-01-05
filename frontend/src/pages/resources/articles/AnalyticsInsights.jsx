import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, MessageSquare, Users, Clock, Star, CheckCircle2 } from 'lucide-react';

const AnalyticsInsights = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50 shadow-sm">
        <div className="max-w-[95%] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-semibold">BotSmith</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/resources/documentation')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Button>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-[85%] mx-auto">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Analytics & Insights
          </h1>
          <p className="text-xl text-gray-600 mb-8">Track performance and understand user engagement</p>

          <div className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                BotSmith provides comprehensive analytics to help you understand how users interact with your chatbot, 
                identify areas for improvement, and measure success. Access analytics from the <strong>Analytics</strong> and 
                <strong>Insights</strong> tabs in your chatbot builder.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                Key Metrics Overview
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-3 text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Total Conversations
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">Number of unique chat sessions initiated by users</p>
                  <p className="text-xs text-gray-600"><strong>Why it matters:</strong> Shows overall chatbot usage and popularity</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Total Messages
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">Combined user messages and bot responses</p>
                  <p className="text-xs text-gray-600"><strong>Why it matters:</strong> Indicates engagement depth and interaction quality</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <h3 className="font-bold text-green-900 mb-3 text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Active Users
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">Users who engaged with your bot in selected period</p>
                  <p className="text-xs text-gray-600"><strong>Why it matters:</strong> Measures reach and audience size</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200">
                  <h3 className="font-bold text-orange-900 mb-3 text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Avg Response Time
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">Average time bot takes to respond to queries</p>
                  <p className="text-xs text-gray-600"><strong>Why it matters:</strong> Faster responses improve user satisfaction</p>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                Advanced Insights
              </h2>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Volume Trends</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Track conversation and message volume over time with interactive line charts:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>View trends for 7, 30, or 90 days</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Identify peak usage days and patterns</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Compare conversation starts vs. total messages</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Top Asked Questions</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                See what users ask most frequently:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Bar chart showing top 5-10 questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Identify knowledge gaps in your sources</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Optimize FAQs based on actual user queries</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Response Time Trends</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Monitor bot performance over time:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Line chart showing response time history</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Spot performance issues early</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Ensure consistent fast responses</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Hourly Activity Distribution</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Understand when users engage most:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>24-hour bar chart of message activity</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Identify peak hours for user engagement</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Optimize support availability times</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                User Satisfaction
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Pie chart showing conversation ratings distribution (1-5 stars):
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Visual breakdown of user ratings</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Average satisfaction score displayed prominently</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Track improvement over time</span>
                </li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
                <p className="text-sm text-blue-900">
                  <strong>💡 Pro Tip:</strong> Users can rate conversations from 1-5 stars in the chat interface. 
                  Encourage rating by asking "Was this helpful?" at the end of conversations.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8">Conversation History</h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Access detailed chat logs in the Analytics tab:
              </p>

              <ol className="space-y-3 mb-6">
                <li>Click <strong>"Load Chat Logs"</strong> button</li>
                <li>View list of all conversations with:
                  <ul className="ml-6 mt-2 space-y-1">
                    <li>• User information (name, email, avatar)</li>
                    <li>• Conversation status (Active, Resolved, Escalated)</li>
                    <li>• Message count</li>
                    <li>• Timestamp</li>
                  </ul>
                </li>
                <li>Click on any conversation to expand and read full message thread</li>
                <li>User messages appear in purple bubbles (right side)</li>
                <li>Bot responses appear in white bubbles (left side)</li>
              </ol>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-8">
                <p className="text-sm text-purple-900">
                  <strong>Use Case:</strong> Review conversations to identify common questions, improve bot responses, 
                  and find opportunities to expand your knowledge base.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8">Using Analytics Effectively</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 text-lg">📈 Growth Strategies</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Monitor daily trends to spot growth</li>
                    <li>• Identify successful marketing campaigns</li>
                    <li>• Track seasonal patterns</li>
                    <li>• Set engagement goals and measure progress</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 text-lg">🔧 Optimization Tips</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Add sources for frequently asked questions</li>
                    <li>• Improve response time if consistently slow</li>
                    <li>• Review low-rated conversations</li>
                    <li>• Adjust availability for peak hours</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4 mt-8">Dashboard Analytics</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your main dashboard also shows aggregated analytics across all chatbots:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Total conversations across all bots</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Combined message count</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Number of active chatbots</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Quick access to individual bot analytics</span>
                </li>
              </ul>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mt-8">
                <h3 className="text-xl font-bold text-purple-900 mb-3">🎯 Success Metrics to Track</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✅ Growing conversation count month-over-month</li>
                  <li>✅ High satisfaction ratings (4+ stars average)</li>
                  <li>✅ Fast response times (under 3 seconds)</li>
                  <li>✅ Increasing active user base</li>
                  <li>✅ Consistent engagement throughout business hours</li>
                  <li>✅ Declining top questions (means users find answers)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => navigate('/resources/documentation')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documentation
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              View Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsInsights;