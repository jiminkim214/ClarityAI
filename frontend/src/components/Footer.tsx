import React from 'react';
import { Brain, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative">
      {/* Gradient separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
      
      <div className="bg-gray-950/90 backdrop-blur-xl border-t border-white/10">
        <div className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Column - Brand & Description */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium text-xl">Clarity</div>
                  <div className="text-gray-400 text-xs tracking-wider">AI • POWERED</div>
                </div>
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed max-w-md font-light">
                Empowering mental wellness through intelligent, compassionate AI therapy assistance. 
                Available 24/7 to support your emotional well-being and personal growth.
              </p>
              
              <div className="flex gap-4">
                <a 
                  href="https://github.com/jiminkim214/ClarityAI" 
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-500/50 rounded-xl flex items-center justify-center transition-all group"
                >
                  <Github className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/jiminkim214" 
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-500/50 rounded-xl flex items-center justify-center transition-all group"
                >
                  <Linkedin className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors" />
                </a>
                <a 
                  href="mailto:jiminkim214@gmail.com" 
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-500/50 rounded-xl flex items-center justify-center transition-all group"
                >
                  <Mail className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors" />
                </a>
              </div>
            </div>

            {/* Right Column - Links */}
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-white font-medium text-lg">Product</h3>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-light">Features</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-light">Security</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-light">API</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-light">Documentation</a></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h3 className="text-white font-medium text-lg">Support</h3>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-light">Help Center</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-light">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-light">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-light">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-gray-400 text-sm font-light">
                © 2025 Clarity AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}