import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft, Search, Bot, Sparkles } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Animated 404 with floating bot */}
        <div className="mb-8 relative">
          <div className="relative inline-block">
            {/* Main 404 text */}
            <h1 className="text-[150px] md:text-[200px] font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent leading-none animate-gradient-x">
              404
            </h1>
            
            {/* Floating bot icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-2xl opacity-50"></div>
                <div className="relative p-6 bg-white rounded-full shadow-2xl">
                  <Bot className="w-16 h-16 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Decorative sparkles */}
          <div className="absolute top-10 left-1/4 animate-pulse animation-delay-300">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <div className="absolute top-20 right-1/4 animate-pulse animation-delay-700">
            <Sparkles className="w-6 h-6 text-pink-400" />
          </div>
          <div className="absolute bottom-10 left-1/3 animate-pulse animation-delay-1000">
            <Sparkles className="w-7 h-7 text-blue-400" />
          </div>
        </div>

        {/* Error message */}
        <div className="mb-8 space-y-4 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The page you're looking for seems to have wandered off into the digital void. 
            Don't worry, even our smartest AI couldn't find it!
          </p>
        </div>

        {/* Suggestions box */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-purple-200 shadow-xl mb-8 animate-fade-in-up animation-delay-300">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Here's what you can do:</h3>
          <ul className="text-left space-y-3 text-gray-700 max-w-md mx-auto">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span>Check if the URL is typed correctly</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
              <span>Go back to the previous page</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Visit our homepage to start fresh</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span>Try searching for what you need</span>
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-500">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="px-8 py-6 text-lg border-2 border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-400 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>
          
          <Button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 group"
          >
            <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Back to Dashboard
          </Button>
        </div>

        {/* Fun fact */}
        <div className="mt-12 p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-xl border border-purple-200 animate-fade-in-up animation-delay-700">
          <p className="text-sm text-gray-700 italic">
            💡 <span className="font-semibold">Fun Fact:</span> The 404 error code comes from Room 404 at CERN, 
            where the World Wide Web was invented. That's where they kept the first web server!
          </p>
        </div>

        {/* Help text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Still having trouble? <a href="#" className="text-purple-600 hover:text-purple-700 font-medium underline">Contact our support team</a>
          </p>
        </div>
      </div>

      {/* Additional decorative elements */}
      <div className="absolute bottom-10 left-10 opacity-20">
        <div className="w-32 h-32 border-4 border-purple-300 rounded-full animate-spin-slow"></div>
      </div>
      <div className="absolute top-10 right-10 opacity-20">
        <div className="w-24 h-24 border-4 border-pink-300 rounded-full animate-spin-slow animation-delay-1000"></div>
      </div>
    </div>
  );
};

export default NotFound;
