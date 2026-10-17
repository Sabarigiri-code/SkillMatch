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

  const [emailReadOnly, setEmailReadOnly] = useState(true);
  const [passwordReadOnly, setPasswordReadOnly] = useState(true);
  const [rememberedEmail, setRememberedEmail] = useState('');
  const [rememberedPassword, setRememberedPassword] = useState('');

  // Reset Password Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [confirmResetVal, setConfirmResetVal] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  useEffect(() => {
    // Check if the user previously checked "Remember me"
    const savedRememberMe = localStorage.getItem('skillmatch_remember_me') === 'true';
    const savedEmail = localStorage.getItem('skillmatch_remembered_email') || '';
    const savedPassword = localStorage.getItem('skillmatch_remembered_password') || '';

    if (savedRememberMe && savedEmail) {
      setRememberMe(true);
      setRememberedEmail(savedEmail);
      setRememberedPassword(savedPassword);
    } else {
      setRememberMe(false);
      setRememberedEmail('');
      setRememberedPassword('');
    }

    // Default the form inputs to completely empty so other users can enter their own ID freely
    setFormData({ email: '', password: '' });
  }, []);

  const handleEmailFocus = () => {
    setEmailReadOnly(false);
    // If a remembered email exists and the box is empty, provide auto-fill
    if (rememberedEmail && !formData.email) {
      setFormData(prev => ({ 
        email: rememberedEmail, 
        password: prev.password || rememberedPassword 
      }));
    }
  };

  const handlePasswordFocus = () => {
    setPasswordReadOnly(false);
    // If remembered password exists and matches remembered email, auto-fill password
    if (rememberedPassword && formData.email === rememberedEmail && !formData.password) {
      setFormData(prev => ({ ...prev, password: rememberedPassword }));
    }
  };

  const handleClearRemembered = (e) => {
    if (e) e.stopPropagation();
    localStorage.removeItem('skillmatch_remember_me');
    localStorage.removeItem('skillmatch_remembered_email');
    localStorage.removeItem('skillmatch_remembered_password');
    setRememberedEmail('');
    setRememberedPassword('');
    setRememberMe(false);
    setFormData({ email: '', password: '' });
  };

  const handleApplyRemembered = () => {
    setFormData({ email: rememberedEmail, password: rememberedPassword });
    setRememberMe(true);
    setEmailReadOnly(false);
    setPasswordReadOnly(false);
  };

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

        // Manage Remember Me storage
        if (rememberMe) {
          localStorage.setItem('skillmatch_remember_me', 'true');
          localStorage.setItem('skillmatch_remembered_email', formData.email);
          localStorage.setItem('skillmatch_remembered_password', formData.password);
        } else {
          localStorage.removeItem('skillmatch_remember_me');
          localStorage.removeItem('skillmatch_remembered_email');
          localStorage.removeItem('skillmatch_remembered_password');
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
      const email = formData.email;
      if (!email) {
        setResetError('Please enter your email address on the login form first');
        return;
      }
      const res = await api.post('/auth/reset-password', {
        email: email,
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
        
        {/* Remembered Account Quick Bar (if saved in localStorage) */}
        {rememberedEmail && (
          <div className="mb-4 p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs flex items-center justify-between shadow-xs">
            <div 
              onClick={handleApplyRemembered} 
              className="flex items-center gap-2 text-indigo-950 hover:text-indigo-700 cursor-pointer flex-1 truncate font-medium"
              title="Click to fill saved account"
            >
              <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="truncate">Saved account: <strong className="text-indigo-700">{rememberedEmail}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                type="button"
                onClick={handleApplyRemembered}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer shadow-xs"
              >
                Fill
              </button>
              <button
                type="button"
                onClick={handleClearRemembered}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Forget saved credentials"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <Input
            label="Email"
            name="sm_account_identifier"
            type="email"
            autoComplete="one-time-code"
            readOnly={emailReadOnly}
            onFocus={handleEmailFocus}
            onClick={handleEmailFocus}
            placeholder="Enter your email"
            leftIcon={<Mail className="h-4 w-4" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          
          <div className="space-y-1.5">
            <Input
              label="Password"
              name="sm_account_secret"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              readOnly={passwordReadOnly}
              onFocus={handlePasswordFocus}
              onClick={handlePasswordFocus}
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
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setRememberMe(isChecked);
                  if (!isChecked) {
                    localStorage.removeItem('skillmatch_remember_me');
                    localStorage.removeItem('skillmatch_remembered_email');
                    localStorage.removeItem('skillmatch_remembered_password');
                    setRememberedEmail('');
                    setRememberedPassword('');
                  }
                }}
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
                  setResetPasswordVal(formData.password || '');
                  setConfirmResetVal(formData.password || '');
                  setShowResetModal(true);
                  setResetError('');
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
              Enter your desired password for <span className="font-bold text-slate-800">{formData.email || 'your account'}</span>. Once saved, you will be logged in immediately.
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
