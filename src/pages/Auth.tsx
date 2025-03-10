import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Mail, Lock, LayoutGrid } from 'lucide-react';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (session) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [session, navigate, location]);

  const getErrorMessage = (err: { code?: string }) => {
    if (!err?.code) return 'An unexpected error occurred';
    
    // Handle specific error codes
    if (err.code.includes('invalid_credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (err.code.includes('user_not_found')) {
      return 'No account found with this email. Please sign up first.';
    }
    if (err.code.includes('email_exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (err.code.includes('weak_password')) {
      return 'Password is too weak. Please use a stronger password with at least 6 characters.';
    }
    if (err.code.includes('signup_disabled')) {
      return 'Sign ups are currently disabled. Please contact support.';
    }
    if (err.code.includes('too_many_requests') || err.code.includes('429')) {
      return 'Too many attempts. Please try again in a few minutes.';
    }
    if (err.code.includes('email_not_confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    if (err.code.includes('user_banned')) {
      return 'This account has been temporarily suspended. Please contact support.';
    }
    if (err.code.includes('validation_failed')) {
      if (err.code.includes('email')) {
        return 'Please enter a valid email address.';
      }
      if (err.code.includes('password')) {
        return 'Password must be at least 6 characters long.';
      }
      return 'Please check your input and try again.';
    }

    // Server/connection errors
    if (err.code.includes('500')) {
      return 'Server error. Please try again later.';
    }
    if (err.code.includes('network') || err.code.includes('connection')) {
      return 'Connection error. Please check your internet connection.';
    }

    return 'An error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setError('Account created! Please check your email for verification.');
        setIsSignUp(false);
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err as { code?: string });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = `
    pl-10 pr-4 py-3 h-12
    block w-full 
    rounded-xl 
    border border-gray-200 dark:border-gray-700 
    bg-gray-50 dark:bg-gray-900 
    text-gray-900 dark:text-white 
    shadow-sm 
    focus:border-purple-500 dark:focus:border-purple-400 
    focus:ring-purple-500 dark:focus:ring-purple-400
    focus:ring-2
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    transition-colors
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30 mb-4 group">
              <LayoutGrid className="w-6 h-6 text-white transform group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
            </p>
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className={`p-4 rounded-xl text-sm font-medium animate-fade-in ${
                  error.includes('created') || error.includes('verification')
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                    required
                    disabled={isLoading}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClasses}
                    required
                    disabled={isLoading}
                    minLength={6}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="relative w-full h-12 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 transition-all duration-100 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Please wait...
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium transition-colors"
                  disabled={isLoading}
                >
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};