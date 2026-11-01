import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import api from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', colorClass: 'bg-rose-500' });

  useEffect(() => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false
    });
  }, []);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Calculate password strength
  useEffect(() => {
    const pwd = formData.password;
    let score = 0;
    
    if (pwd.length > 0) {
      if (pwd.length >= 8) score += 25;
      if (pwd.match(/[A-Z]/)) score += 25;
      if (pwd.match(/[0-9]/)) score += 25;
      if (pwd.match(/[^A-Za-z0-9]/)) score += 25;
    }

    let label = 'Weak';
    let colorClass = 'bg-rose-500';

    if (score >= 100) {
      label = 'Strong';
      colorClass = 'bg-emerald-500';
    } else if (score >= 50) {
      label = 'Medium';
      colorClass = 'bg-amber-500';
    }

    setPasswordStrength({ score, label, colorClass });
  }, [formData.password]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const checkRes = await api.get(`/auth/check-email?email=${encodeURIComponent(formData.email)}`);
        if (checkRes.data.exists) {
          setErrors(prev => ({ ...prev, email: 'This email is already registered.' }));
          setToastMessage({ type: 'error', message: 'User already exists with this email! Please sign in.' });
          
          setTimeout(() => {
            setToastMessage(null);
            setFormData(prev => ({ ...prev, email: '' }));
            setErrors(prev => ({ ...prev, email: undefined }));
          }, 3000);
          
          setIsLoading(false);
          return;
        }

        // 1. Send OTP to email
        await api.post('/auth/send-otp', { email: formData.email });
        setShowOtpModal(true);
      } catch (err) {
        console.error("Registration error:", err);
        const serverMsg = err.response?.data?.message;
        const msg = serverMsg || (err.message === 'Network Error' ? 'Cannot reach server. Is backend running on port 8080?' : 'Failed to send OTP. Try again.');
        setErrors({ email: msg });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    setOtpError('');
    try {
      // 2. Verify OTP
      await api.post('/auth/verify-otp', { email: formData.email, otp: otp });

      // 3. Register user
      await api.post('/auth/register', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      
      // 4. Auto-login after registration
      const loginRes = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('token', loginRes.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));
      setShowOtpModal(false);
      navigate(location.state?.returnTo || '/dashboard');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP or Registration Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailBlur = async () => {
    if (!formData.email) return;
    if (!/\S+@\S+\.\S+/.test(formData.email)) return;
    
    try {
      const checkRes = await api.get(`/auth/check-email?email=${encodeURIComponent(formData.email)}`);
      if (checkRes.data.exists) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered.' }));
        setToastMessage({ type: 'error', message: 'User already exists with this email! Please sign in.' });
        
        setTimeout(() => {
          setToastMessage(null);
          setFormData(prev => ({ ...prev, email: '' }));
          setErrors(prev => ({ ...prev, email: undefined }));
        }, 3000);
      }
    } catch (err) {
      console.error('Email check failed', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Card className="shadow-[0_20px_50px_-12px_rgba(79,70,229,0.12)] border border-slate-200/90 rounded-2xl my-8 relative bg-white">
      
      {/* Toast Notification */}
      <div className={`fixed top-4 right-4 z-[100] transition-all duration-300 transform ${toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border ${
          toastMessage?.type === 'error' 
            ? 'bg-rose-50 text-rose-800 border-rose-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {toastMessage?.type === 'error' ? <AlertTriangle className="h-5 w-5 text-rose-500" /> : <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          <span className="font-medium">{toastMessage?.message}</span>
        </div>
      </div>

      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* Hidden dummy inputs to absorb browser autofill */}
          <input type="text" name="prevent_autofill_user" style={{ display: 'none' }} tabIndex="-1" readOnly />
          <input type="password" name="prevent_autofill_pwd" style={{ display: 'none' }} tabIndex="-1" readOnly />

          <Input
            label="Full Name"
            name="fullName"
            autoComplete="off"
            placeholder="Enter Your Name"
            leftIcon={<User className="h-4 w-4" />}
            value={formData.fullName}
            onChange={handleInputChange}
            error={errors.fullName}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="Enter your email"
            leftIcon={<Mail className="h-4 w-4" />}
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleEmailBlur}
            error={errors.email}
          />
          
          <div className="space-y-3">
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Enter your password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
            />
            
            {formData.password && (
              <div className="space-y-1.5 pl-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Password strength:</span>
                  <span className={`font-semibold ${passwordStrength.colorClass.replace('bg-', 'text-')}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <ProgressBar 
                  value={passwordStrength.score} 
                  max={100} 
                  heightClass="h-1.5"
                  colorClass={passwordStrength.colorClass} 
                />
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Confirm your password"
            leftIcon={<ShieldCheck className="h-4 w-4" />}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
          />

          <div className="pt-2">
            <div className="flex items-start">
              <input
                id="termsAccepted"
                name="termsAccepted"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className={`mt-1 h-4 w-4 focus:ring-indigo-500 rounded cursor-pointer ${errors.termsAccepted ? 'border-rose-500 text-rose-600' : 'border-slate-300 text-indigo-600'}`}
              />
              <label htmlFor="termsAccepted" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                I agree to the <Link to="/terms" target="_blank" className="font-medium text-indigo-600 hover:text-indigo-500">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="font-medium text-indigo-600 hover:text-indigo-500">Privacy Policy</Link>.
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="mt-1.5 text-xs text-rose-500 pl-6">{errors.termsAccepted}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            Create account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <NavLink to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign in
          </NavLink>
        </div>
      </CardContent>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Verify Your Email</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              We've sent a 6-digit code to <span className="font-semibold text-slate-700">{formData.email}</span>
            </p>
            
            <div className="space-y-4">
              <Input
                label="Enter OTP"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                error={otpError}
                className="text-center text-xl tracking-widest"
              />
              <Button onClick={handleVerifyOtp} className="w-full" isLoading={isLoading}>
                Verify & Create Account
              </Button>
              <button 
                onClick={() => setShowOtpModal(false)}
                className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Register;
