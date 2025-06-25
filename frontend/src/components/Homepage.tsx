import React from 'react';
import { MessageCircle, Shield, Clock, Heart, ArrowRight, CheckCircle, Star, Users } from 'lucide-react';

interface HomepageProps {
  onStartChat: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onStartChat }) => {
  const features = [
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your conversations are stored locally and never transmitted to external servers"
    },
    {
      icon: Clock,
      title: "Available 24/7",
      description: "Get support whenever you need it, day or night"
    },
    {
      icon: Heart,
      title: "Empathetic AI",
      description: "Advanced AI trained on therapeutic best practices and empathetic responses"
    },
    {
      icon: Users,
      title: "Professional Guidance",
      description: "Based on evidence-based therapeutic approaches and techniques"
    }
  ];

  const benefits = [
    "Judgment-free environment for open expression",
    "Immediate support when you need it most",
    "Develop coping strategies and insights",
    "Track your emotional journey over time",
    "Complement to traditional therapy"
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      text: "ClarityAI helped me work through my anxiety when I couldn't get an appointment with my regular therapist.",
      rating: 5
    },
    {
      name: "Michael R.",
      text: "Having someone to talk to at 3 AM when my thoughts were racing was incredibly valuable.",
      rating: 5
    },
    {
      name: "Emma L.",
      text: "The responses feel genuine and thoughtful. It's like having a caring professional always available.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">ClarityAI</h1>
                <p className="text-xs text-slate-600">Professional AI Therapy Support</p>
              </div>
            </div>
            
            <button
              onClick={onStartChat}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>Start Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Your Personal
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> AI Therapist</span>
            </h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Get professional therapeutic support powered by advanced AI. Available 24/7, completely private, 
              and designed to help you navigate life's challenges with empathy and understanding.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onStartChat}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Start Your Session</span>
              </button>
              
              <div className="flex items-center space-x-2 text-slate-600">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm">100% Private & Secure</span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No Registration Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Completely Free</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Available Instantly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">Why Choose ClarityAI?</h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experience the future of mental health support with our advanced AI therapist
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-6">
                Professional Support When You Need It Most
              </h3>
              <p className="text-lg text-slate-600 mb-8">
                Our AI therapist is trained on evidence-based therapeutic approaches and provides 
                empathetic, professional responses to help you work through challenges.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-6 opacity-80" />
                <h4 className="text-2xl font-bold mb-4">Your AI Therapist</h4>
                <p className="text-blue-100 mb-6">
                  Specializing in anxiety, depression, and emotional wellness. 
                  Available 24/7 to provide professional, empathetic support.
                </p>
                <div className="bg-white/20 rounded-xl p-4">
                  <p className="text-sm text-blue-100">
                    "I'm here to create a safe, judgment-free space where you can explore your 
                    thoughts and feelings at your own pace."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">What People Are Saying</h3>
            <p className="text-lg text-slate-600">Real experiences from people who found support</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="text-slate-500 text-sm font-medium">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Take the first step towards better mental health. Your AI therapist is ready to listen.
          </p>
          
          <button
            onClick={onStartChat}
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Begin Your Session Now</span>
          </button>
          
          <p className="text-blue-200 text-sm mt-4">
            No signup required • Completely free • Start immediately
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">ClarityAI</span>
              </div>
              <p className="text-sm text-slate-400">
                Professional AI therapy support available 24/7. Your mental health matters.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Important Notice</h4>
              <p className="text-sm text-slate-400">
                This AI therapist is designed to provide support and guidance. For emergencies, 
                please contact 988 (Suicide & Crisis Lifeline) or 911.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Privacy</h4>
              <p className="text-sm text-slate-400">
                Your conversations are stored locally on your device and are never transmitted 
                to external servers. Your privacy is our priority.
              </p>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-sm text-slate-400">
              © 2025 ClarityAI. Designed to support your mental health journey.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};