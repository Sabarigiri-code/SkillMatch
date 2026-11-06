import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle, X, ArrowLeft, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
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

  // Reset Password Modal states (Real-time Email OTP Verification Flow)
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = Enter Email, 2 = Enter Code & New Password
  const [resetEmailVal, setResetEmailVal] = useState('');
  const [resetOtpVal, setResetOtpVal] = useState('');
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [confirmResetVal, setConfirmResetVal] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resetError, setResetError] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  useEffect(() => {
    let timer = null;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCountdown]);

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
        const response = await api.post('/auth/login', {
          email: formData.email.trim(),
          password: formData.password
        });
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
        if (!err.response) {
          setErrors({
            auth: 'Cannot connect to backend server',
            authDesc: 'Unable to reach the backend API. If you are viewing the live demo on GitHub Pages, the Spring Boot backend is not hosted online. Please run the project locally or deploy the backend to a cloud host (Render/Railway).'
          });
          return;
        }
        const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
        const lower = errMsg.toLowerCase();

        if (lower.includes('password')) {
          setErrors({ 
            password: 'Incorrect password',
            auth: 'Incorrect password',
            authDesc: 'The password you entered is incorrect. Please try again or use "Forgot password?" below.'
          });
        } else if (lower.includes('account') || lower.includes('not found') || lower.includes('email')) {
          setErrors({ 
            email: 'No account found with this email',
            auth: 'No account found',
            authDesc: 'No account is registered with this email address. Please check your spelling or register a new account.'
          });
        } else {
          setErrors({ 
            auth: errMsg,
            authDesc: 'Please verify your credentials and try again.'
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenResetModal = () => {
    setResetEmailVal((formData.email || '').trim());
    setResetOtpVal('');
    setResetPasswordVal('');
    setConfirmResetVal('');
    setResetStep(1);
    setResetError('');
    setResetSuccessMsg('');
    setShowResetModal(true);
  };

  const handleSendResetOtp = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = (resetEmailVal || '').trim().toLowerCase();
    if (!targetEmail) {
      setResetError('Please enter your account email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(targetEmail)) {
      setResetError('Please enter a valid email address');
      return;
    }

    setIsSendingOtp(true);
    setResetError('');
    setResetSuccessMsg('');
    try {
      const res = await api.post('/auth/forgot-password', { email: targetEmail });
      setResetSuccessMsg(res.data?.message || 'Verification code sent! Please check your email.');
      setResetStep(2);
      setResendCountdown(60);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to send verification code. Please check your email address and try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetPasswordWithOtp = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = (resetEmailVal || '').trim().toLowerCase();
    const code = (resetOtpVal || '').trim();

    if (!code || code.length < 6) {
      setResetError('Please enter the 6-digit verification code sent to your email');
      return;
    }
    if (!resetPasswordVal || resetPasswordVal.length < 6) {
      setResetError('Password must be at least 6 characters long');
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
        otp: code,
        newPassword: resetPasswordVal
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setResetSuccessMsg('Password verified & updated! Redirecting to dashboard...');

      setTimeout(() => {
        setShowResetModal(false);
        navigate(location.state?.returnTo || '/dashboard');
      }, 1000);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Invalid verification code or failed to update password. Please check your email.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="shadow-[0_20px_50px_-12px_rgba(79,70,229,0.12)] border border-slate-200/90 rounded-2xl relative bg-white">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off" data-lpignore="true">
          <Input
            label="Email"
            name="account_user_id"
            type="text"
            inputMode="email"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            placeholder="Enter your email"
            leftIcon={<Mail className="h-4 w-4" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          
          <div className="space-y-1.5">
            <Input
              label="Password"
              name="account_security_key"
              type="text"
              className={showPassword ? "secure-text-none" : "secure-text-disc"}
              style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
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
                {errors.authDesc && (
                  <p className="text-rose-600 mt-0.5 leading-relaxed">{errors.authDesc}</p>
                )}
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
                onClick={handleOpenResetModal}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer"
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

      {/* Reset Password Modal (2-Step Email OTP Verification) */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  {resetStep === 1 ? <KeyRound className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5 text-indigo-600" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {resetStep === 1 ? 'Reset Your Password' : 'Verify & Set Password'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {resetStep === 1 ? 'Step 1 of 2 · Real-Time Email OTP' : 'Step 2 of 2 · Account Verification'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error & Success Alerts */}
            {resetError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{resetError}</span>
              </div>
            )}

            {resetSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-relaxed">{resetSuccessMsg}</span>
              </div>
            )}

            {/* STEP 1: Enter Email to Send Real-Time OTP */}
            {resetStep === 1 && (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered account email. We will send a secure <strong>6-digit verification code</strong> to verify your identity before updating your password.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Registered Account Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={resetEmailVal}
                      onChange={(e) => setResetEmailVal(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingOtp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {isSendingOtp ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Verify Code & Set New Password */}
            {resetStep === 2 && (
              <form onSubmit={handleResetPasswordWithOtp} className="space-y-3.5">
                <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5 text-xs text-slate-600">
                  <div className="truncate mr-2">
                    Code sent to: <strong className="text-indigo-900">{resetEmailVal}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setResetStep(1); setResetError(''); }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold shrink-0 hover:underline cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>

                {/* 6-Digit Verification Code */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">6-Digit Verification Code</label>
                    <div className="text-[11px]">
                      {resendCountdown > 0 ? (
                        <span className="text-slate-400 font-medium">Resend in {resendCountdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendResetOtp}
                          disabled={isSendingOtp}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <RefreshCw className={`h-3 w-3 ${isSendingOtp ? 'animate-spin' : ''}`} /> Resend Code
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP (e.g. 123456)"
                    value={resetOtpVal}
                    onChange={(e) => setResetOtpVal(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 text-center text-lg font-mono tracking-[0.3em] font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-xs"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      name="modal_new_key"
                      style={{ WebkitTextSecurity: showResetPassword ? 'none' : 'disc' }}
                      placeholder="Enter new password (min 6 chars)"
                      value={resetPasswordVal}
                      onChange={(e) => setResetPasswordVal(e.target.value)}
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-10 secure-text-disc"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      name="modal_conf_key"
                      style={{ WebkitTextSecurity: showConfirmResetPassword ? 'none' : 'disc' }}
                      placeholder="Re-enter new password"
                      value={confirmResetVal}
                      onChange={(e) => setConfirmResetVal(e.target.value)}
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-10 secure-text-disc"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmResetPassword(!showConfirmResetPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => { setResetStep(1); setResetError(''); }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(false)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isResetting}
                      className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isResetting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {isResetting ? 'Verifying...' : 'Verify & Reset Password'}
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </Card>
  );
};

export default Login;
