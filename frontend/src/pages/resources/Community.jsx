import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Users2, Github, MessageSquare, Home, ExternalLink, Star, GitFork } from 'lucide-react';

const Community = () => {
  const navigate = useNavigate();

  const communityChannels = [
    {
      icon: <Github className="w-6 h-6" />,
      title: 'GitHub',
      description: 'Contribute to our open-source project',
      stats: '2.5k stars • 450 forks',
      gradient: 'from-gray-700 to-gray-900',
      link: '#'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Discord',
      description: 'Join our community chat',
      stats: '5.2k members online',
      gradient: 'from-indigo-500 to-purple-600',
      link: '#'
    },
    {
      icon: <Users2 className="w-6 h-6" />,
      title: 'Forum',
      description: 'Ask questions and share knowledge',
      stats: '12k+ discussions',
      gradient: 'from-orange-500 to-red-600',
      link: '#'
    },
  ];

  const showcaseProjects = [
    {
      title: 'E-commerce Support Bot',
      author: 'Sarah Johnson',
      description: 'Automated customer support handling 1000+ daily queries',
      image: 'from-blue-400 to-cyan-500',
      stats: { messages: '50k+', rating: '4.8' }
    },
    {
      title: 'HR Onboarding Assistant',
      author: 'Michael Chen',
      description: 'Streamlined employee onboarding process',
      image: 'from-purple-400 to-pink-500',
      stats: { messages: '25k+', rating: '4.9' }
    },
    {
      title: 'Technical Documentation Bot',
      author: 'Emma Wilson',
      description: 'Instant answers from 500+ doc pages',
      image: 'from-green-400 to-emerald-500',
      stats: { messages: '100k+', rating: '4.7' }
    },
    {
      title: 'Lead Generation Bot',
      author: 'David Martinez',
      description: 'Qualified 2000+ leads in 3 months',
      image: 'from-orange-400 to-red-500',
      stats: { messages: '75k+', rating: '4.8' }
    },
  ];

  const upcomingEvents = [
    {
      date: 'Feb 15',
      title: 'Webinar: Advanced Chatbot Strategies',
      time: '2:00 PM EST',
      type: 'Online'
    },
    {
      date: 'Feb 22',
      title: 'Community Office Hours',
      time: '11:00 AM EST',
      type: 'Live Q&A'
    },
    {
      date: 'Mar 5',
      title: 'AI & Customer Service Summit',
      time: '9:00 AM EST',
      type: 'Virtual Conference'
    },
  ];

  const contributors = [
    { name: 'Alex Rivera', contributions: 127, avatar: 'from-blue-400 to-blue-600' },
    { name: 'Priya Patel', contributions: 98, avatar: 'from-purple-400 to-purple-600' },
    { name: 'James Kim', contributions: 85, avatar: 'from-green-400 to-green-600' },
    { name: 'Maria Garcia', contributions: 72, avatar: 'from-pink-400 to-pink-600' },
    { name: 'Chen Wei', contributions: 64, avatar: 'from-orange-400 to-orange-600' },
    { name: 'Sophie Brown', contributions: 56, avatar: 'from-teal-400 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50 shadow-sm">
        <div className="max-w-[95%] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">BotSmith</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/resources')} className="hover:bg-purple-50">
              <Home className="w-4 h-4 mr-2" />
              Resources Home
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4 md:px-8 lg:px-12 relative z-10">
        <div className="max-w-[90%] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full mb-4">
              <Users2 className="w-4 h-4" />
              <span className="font-medium">Community</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-teal-900 to-purple-900 bg-clip-text text-transparent">
              Join Our Community
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Connect with developers, share knowledge, and build amazing things together</p>
          </div>

          {/* Community Channels */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {communityChannels.map((channel, index) => (
              <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-6 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                <div className={`w-14 h-14 bg-gradient-to-br ${channel.gradient} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  {channel.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{channel.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{channel.description}</p>
                <p className="text-purple-600 font-medium text-sm mb-4">{channel.stats}</p>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Join Now <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>

          {/* Community Showcase */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">Community Showcase</h2>
            <p className="text-center text-gray-600 mb-8">Inspiring projects built by our community</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {showcaseProjects.map((project, index) => (
                <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 overflow-hidden hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                  <div className={`h-32 bg-gradient-to-br ${project.image} flex items-center justify-center text-white text-4xl font-bold`}>
                    {project.title.charAt(0)}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1 group-hover:text-purple-600 transition-colors">{project.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">by {project.author}</p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{project.stats.messages} messages</span>
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-3 h-3 fill-current" />
                        {project.stats.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Top Contributors */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Top Contributors
              </h3>
              <div className="space-y-3">
                {contributors.map((contributor, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 bg-gradient-to-br ${contributor.avatar} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {contributor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{contributor.name}</p>
                      <p className="text-xs text-gray-500">{contributor.contributions} contributions</p>
                    </div>
                    <GitFork className="w-4 h-4 text-purple-600" />
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-6">
              <h3 className="text-xl font-bold mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200/50 hover:border-purple-400 hover:shadow-lg transition-all duration-300">
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                          <span className="text-xs font-semibold">{event.date.split(' ')[0]}</span>
                          <span className="text-lg font-bold">{event.date.split(' ')[1]}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{event.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{event.time}</p>
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">{event.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-teal-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to contribute?</h2>
            <p className="text-lg mb-6 opacity-90">Join thousands of developers building the future of AI chatbots</p>
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" className="bg-white text-teal-600 hover:bg-gray-100">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                Join Discord
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;