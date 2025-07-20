import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  setMode: (mode: 'signin' | 'signup') => void;
}

export function AuthModal({ isOpen, onClose, mode, setMode }: AuthModalProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (showResetPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Password reset email sent! Check your inbox.');
          setShowResetPassword(false);
        }
      } else if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } else {
        const { error } = await signUp(email, password, { full_name: fullName });
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created! Please check your email to verify your account.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
    setSuccess('');
    setShowResetPassword(false);
  };

  const handleModeSwitch = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-light text-white">
              {showResetPassword ? 'Reset Password' : mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {showResetPassword 
                ? 'Enter your email to reset your password'
                : mode === 'signin' 
                  ? 'Sign in to continue your therapy journey'
                  : 'Start your personalized therapy experience'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name - Only for signup */}
          {mode === 'signup' && !showResetPassword && (
            <div className="relative">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Password - Hidden for reset password */}
          {!showResetPassword && (
            <div className="relative">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none relative overflow-hidden group"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>
                  {showResetPassword ? 'Sending...' : mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                </span>
              </div>
            ) : (
              <span className="relative z-10">
                {showResetPassword ? 'Send Reset Email' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </span>
            )}
            
            {/* Ripple Effect */}
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-xl"></div>
          </button>
        </form>

        {/* Footer Actions */}
        <div className="mt-6 text-center space-y-3">
          {!showResetPassword ? (
            <>
              {mode === 'signin' && (
                <button
                  onClick={() => setShowResetPassword(true)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Forgot your password?
                </button>
              )}
              
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-400">
                  {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                </span>
                <button
                  onClick={() => handleModeSwitch(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowResetPassword(false)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
