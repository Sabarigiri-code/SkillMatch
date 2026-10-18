import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Reset Password Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmailVal, setResetEmailVal] = useState('');
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [confirmResetVal, setConfirmResetVal] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  useEffect(() => {
    // Clean up any legacy saved credentials for privacy and security
    localStorage.removeItem('skillmatch_remember_me');
    localStorage.removeItem('skillmatch_remembered_email');
    localStorage.removeItem('skillmatch_remembered_password');
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setErrors({});
      try {
        const checkRes = await api.get(`/auth/check-email?email=${encodeURIComponent(formData.email)}`);
        
        if (!checkRes.data.exists) {
          navigate('/register', { state: { returnTo: location.state?.returnTo } });
          return;
        }

        const response = await api.post('/auth/login', formData);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Never store passwords in localStorage
        if (rememberMe) {
          localStorage.setItem('skillmatch_remember_me', 'true');
        } else {
          localStorage.removeItem('skillmatch_remember_me');
        }

        navigate(location.state?.returnTo || '/dashboard');
      } catch (err) {
        setErrors({ 
          auth: err.response?.data?.message || 'Incorrect email or password. Please verify your credentials and try again.' 
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResetPassword = async () => {
    const targetEmail = (resetEmailVal || formData.email || '').trim();
    if (!targetEmail) {
      setResetError('Please enter your account email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(targetEmail)) {
      setResetError('Please enter a valid email address');
      return;
    }
    if (!resetPasswordVal || resetPasswordVal.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }
    if (resetPasswordVal !== confirmResetVal) {
      setResetError('Passwords do not match');
      return;
    }

    setIsResetting(true);
    setResetError('');
    try {
      const res = await api.post('/auth/reset-password', {
        email: targetEmail,
        newPassword: resetPasswordVal
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setResetSuccessMsg('Password updated! Redirecting to dashboard...');

      setTimeout(() => {
        navigate(location.state?.returnTo || '/dashboard');
      }, 600);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="shadow-xl shadow-slate-200/50 relative">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <Input
            label="Email"
            name="user_login_email"
            type="email"
            autoComplete="off"
            readOnly={!isEmailFocused}
            onFocus={() => setIsEmailFocused(true)}
            placeholder="Enter your email"
            leftIcon={<Mail className="h-4 w-4" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          
          <div className="space-y-1.5">
            <Input
              label="Password"
              name="user_login_password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              readOnly={!isPasswordFocused}
              onFocus={() => setIsPasswordFocused(true)}
              placeholder="Enter your password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
            />
          </div>

          {/* Clean Error Box */}
          {errors.auth && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs flex items-start gap-2.5 text-rose-800 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">{errors.auth}</p>
                <p className="text-rose-600 mt-0.5">Please check your email and password, or use "Forgot password?" to reset it.</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => {
                  setResetEmailVal(formData.email || '');
                  setResetPasswordVal('');
                  setConfirmResetVal('');
                  setShowResetModal(true);
                  setResetError('');
                  setResetSuccessMsg('');
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            Sign in
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <NavLink to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Register now
          </NavLink>
        </div>
      </CardContent>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Set New Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your registered account email and your new password. Once updated, you will be signed in securely.
            </p>

            {resetError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Email</label>
                <input
                  type="email"
                  placeholder="Enter your account email"
                  value={resetEmailVal}
                  onChange={(e) => setResetEmailVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min 6 chars)"
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmResetVal}
                  onChange={(e) => setConfirmResetVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isResetting}
                className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                {isResetting ? 'Saving...' : 'Set Password & Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Login;
