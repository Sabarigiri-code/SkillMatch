import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Bell, Shield, Download, Trash2, Smartphone, Monitor, 
  Save, AlertTriangle, CheckCircle2, Globe, Camera, Eye, EyeOff, Lock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import api from '../utils/api';

const Settings = () => {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { name: '', email: '', role: '', experience: '' };

  // Profile State
  const [profile, setProfile] = useState({
    name: user.name || '',
    email: user.email || '',
    targetRole: user.targetRole || '',
    experience: user.experience || '',
    profilePhoto: user.profilePhoto || ''
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    theme: localStorage.getItem('theme') || 'light',
    emailUpdates: JSON.parse(localStorage.getItem('emailUpdates') || 'true'),
    pushNotifications: JSON.parse(localStorage.getItem('pushNotifications') || 'false')
  });

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark' || (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', preferences.theme);
  }, [preferences.theme]);

  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Modals State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Session Location State
  const [sessionLocation, setSessionLocation] = useState("Detecting location...");

  useEffect(() => {
    fetch('https://get.geojs.io/v1/ip/geo.json')
      .then(res => res.json())
      .then(data => {
        if (data.city && data.country) {
          setSessionLocation(`${data.city}, ${data.country}`);
        } else {
          setSessionLocation(Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1]?.replace('_', ' ') || "Unknown Location");
        }
      })
      .catch(() => {
        setSessionLocation(Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1]?.replace('_', ' ') || "Unknown Location");
      });
  }, []);
  
  // Feedback State
  const [showToast, setShowToast] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setIsUploadingPhoto(true);
      try {
        const base64String = reader.result;
        setProfile(prev => ({ ...prev, profilePhoto: base64String }));
        
        // Update Backend
        await api.put('/users/profile-photo', { profilePhoto: base64String });
        
        // Update LocalStorage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const updatedUser = { ...currentUser, profilePhoto: base64String };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Notify DashboardLayout to update the avatar instantly
        window.dispatchEvent(new Event('user-updated'));
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        console.error('Failed to upload photo', err);
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleSaveProfile = async () => {
    try {
      // 1. Send update to the new backend endpoint
      const response = await api.put('/users/profile', {
        name: profile.name,
        targetRole: profile.targetRole,
        experience: profile.experience
      });

      // 2. Update localStorage with the server's confirmed updated user data
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Notify DashboardLayout in case name/email changed
      window.dispatchEvent(new Event('user-updated'));
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Failed to save profile to backend', err);
      alert('Failed to save profile details. Please try again.');
    }
  };

  const handlePasswordChange = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPasswordStatus(null);

    if (!passwords.current) {
      setPasswordStatus({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (!passwords.new) {
      setPasswordStatus({ type: 'error', message: 'Please enter a new password.' });
      return;
    }
    if (passwords.new.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation password do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.put('/users/change-password', { 
        currentPassword: passwords.current, 
        newPassword: passwords.new 
      });
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update password. Please check your current password.";
      setPasswordStatus({ type: 'error', message: errorMsg });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion.');
      return;
    }
    setIsDeletingAccount(true);
    try {
      await api.delete('/users/me');
      localStorage.clear();
      setIsDeleteModalOpen(false);
      alert('Your account and all associated data have been permanently deleted.');
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Failed to delete account. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  const handleExportData = () => {
    setIsExportModalOpen(false);
    alert('Data export started. You will receive an email shortly (Mock Action).');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-2 text-lg">Manage your profile, preferences, and security.</p>
      </div>

      {/* Toast Notification */}
      <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span className="font-medium">Changes saved successfully.</span>
        </div>
      </div>

      {/* Profile Section */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700">
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Profile Photo Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="relative group">
              {profile.profilePhoto ? (
                <img 
                  src={profile.profilePhoto}
                  alt="Profile" 
                  onClick={() => setViewingPhoto(true)}
                  className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md object-cover bg-indigo-50 cursor-pointer hover:opacity-80 transition-opacity"
                />
              ) : (
                <div 
                  onClick={() => setViewingPhoto(true)}
                  className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-3xl cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {getInitials(profile.name)}
                </div>
              )}
              
              <label className="absolute bottom-0 right-0 h-8 w-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer z-10">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
              </label>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Profile Photo</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                {isUploadingPhoto ? 'Uploading...' : 'Click your image to view it, or click the camera icon to upload a new one.'}
              </p>
            </div>
          </div>

          {/* Photo Viewing Modal */}
          {viewingPhoto && (
            <div 
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
              onClick={() => setViewingPhoto(false)}
            >
              <div className="relative max-w-3xl max-h-[90vh] w-full flex items-center justify-center">
                {profile.profilePhoto ? (
                  <img 
                    src={profile.profilePhoto} 
                    alt="Profile Full View" 
                    className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="h-64 w-64 md:h-96 md:w-96 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-7xl md:text-9xl shadow-2xl animate-in zoom-in-95 duration-200">
                    {getInitials(profile.name)}
                  </div>
                )}
                <button 
                  onClick={() => setViewingPhoto(false)}
                  className="absolute top-0 right-0 md:-top-12 md:-right-12 text-white/70 hover:text-white p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Full Name" 
              value={profile.name} 
              onChange={(e) => setProfile({...profile, name: e.target.value})} 
            />
            <Input 
              label="Email Address" 
              type="email" 
              value={profile.email} 
              onChange={(e) => setProfile({...profile, email: e.target.value})} 
            />
            <Input 
              label="Target Role" 
              placeholder="Enter your role"
              value={profile.targetRole || ''} 
              onChange={(e) => setProfile({...profile, targetRole: e.target.value})} 
            />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Level</label>
              <Select 
                value={profile.experience || ""} 
                onChange={(e) => setProfile({...profile, experience: e.target.value})}
                className="w-full"
              >
                <option value="" disabled>Select an option...</option>
                <option value="Fresher">Fresher (0 years)</option>
                <option value="Junior">Junior (1-3 years)</option>
                <option value="Mid-Level">Mid-Level (3-5 years)</option>
                <option value="Senior">Senior (5+ years)</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveProfile} rightIcon={<Save className="h-4 w-4" />}>Save Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-xl flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" /> App Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          <div className="max-w-md">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Interface Theme</label>
            <Select 
              value={preferences.theme || ""} 
              onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
              className="w-full"
            >
              <option value="" disabled>Select theme...</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
              <option value="system">System Default</option>
            </Select>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">Push Notifications</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Receive alerts when new matching jobs are found.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={preferences.pushNotifications}
                    onChange={(e) => {
                      const newVal = e.target.checked;
                      setPreferences({...preferences, pushNotifications: newVal});
                      localStorage.setItem('pushNotifications', JSON.stringify(newVal));
                    }}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-slate-700 dark:border-slate-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">Email Updates</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Receive weekly summaries of your learning progress.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={preferences.emailUpdates}
                    onChange={(e) => {
                      const newVal = e.target.checked;
                      setPreferences({...preferences, emailUpdates: newVal});
                      localStorage.setItem('emailUpdates', JSON.stringify(newVal));
                    }}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-slate-700 dark:border-slate-600"></div>
                </label>
              </div>
          </div>
        </CardContent>
      </Card>

      {/* Security UI */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-8">
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h3>
            
            {passwordStatus && (
              <div className={`mb-5 p-3.5 rounded-lg text-sm flex items-center gap-2.5 max-w-2xl ${
                passwordStatus.type === 'error' 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {passwordStatus.type === 'error' ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                )}
                <span>{passwordStatus.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl" autoComplete="off">
              <div className="md:col-span-2">
                <Input 
                  label="Current Password" 
                  name="settings_curr_key"
                  type={showCurrentPassword ? "text" : "password"} 
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      title={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  value={passwords.current}
                  onChange={(e) => {
                    setPasswords({...passwords, current: e.target.value});
                    if (passwordStatus) setPasswordStatus(null);
                  }}
                  placeholder="Enter current password"
                />
              </div>
              <Input 
                label="New Password" 
                name="settings_new_key"
                type={showNewPassword ? "text" : "password"} 
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    title={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                value={passwords.new}
                onChange={(e) => {
                  setPasswords({...passwords, new: e.target.value});
                  if (passwordStatus) setPasswordStatus(null);
                }}
                error={passwords.new && passwords.new.length < 6 ? "Must be at least 6 characters" : undefined}
                placeholder="Enter new password (min. 6 characters)"
              />
              <Input 
                label="Confirm New Password" 
                name="settings_conf_key"
                type={showConfirmPassword ? "text" : "password"} 
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                value={passwords.confirm}
                onChange={(e) => {
                  setPasswords({...passwords, confirm: e.target.value});
                  if (passwordStatus) setPasswordStatus(null);
                }}
                error={
                  passwords.confirm && passwords.new !== passwords.confirm 
                    ? "Passwords do not match" 
                    : undefined
                }
                helperText={
                  passwords.confirm && passwords.new === passwords.confirm && passwords.new.length >= 6
                    ? "✓ Passwords match"
                    : undefined
                }
                placeholder="Confirm new password"
              />
            </div>
            <div className="mt-5">
              <Button 
                variant="primary" 
                onClick={handlePasswordChange}
                isLoading={isUpdatingPassword}
              >
                Update Password
              </Button>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Active Sessions</h3>
            <div className="space-y-4">
              {(() => {
                const ua = window.navigator.userAgent;
                let browser = "Web Browser";
                if (ua.includes("Firefox")) browser = "Firefox";
                else if (ua.includes("Edg")) browser = "Edge";
                else if (ua.includes("Chrome")) browser = "Chrome";
                else if (ua.includes("Safari")) browser = "Safari";
                
                let os = "Desktop";
                let DeviceIcon = Monitor;
                if (ua.includes("Win")) os = "Windows PC";
                else if (ua.includes("Mac")) os = "Mac";
                else if (ua.includes("Linux")) os = "Linux";
                else if (ua.includes("Android") || ua.includes("iPhone")) {
                  os = "Mobile";
                  DeviceIcon = Smartphone;
                }

                return (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <DeviceIcon className="h-6 w-6 text-slate-400" />
                      <div>
                        <p className="font-semibold text-slate-900">{os} &bull; {browser}</p>
                        <p className="text-xs text-slate-500">{sessionLocation} &bull; Current Session</p>
                      </div>
                    </div>
                    <Badge variant="success">Active Now</Badge>
                  </div>
                );
              })()}
            </div>
          </div>

        </CardContent>
      </Card>

        {/* Account / Destructive Actions */}
        <Card className="border-rose-200 shadow-sm bg-rose-50/30 dark:bg-rose-950/20 dark:border-rose-900/50">
          <CardHeader className="border-b border-rose-100 dark:border-rose-900/50 pb-4">
            <CardTitle className="text-xl flex items-center gap-2 text-rose-800 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              Account Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700">
              <div>
                <h4 className="font-semibold text-slate-900">Export Account Data</h4>
                <p className="text-sm text-slate-500">Download a copy of your resume data, assessments, and roadmap.</p>
              </div>
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={() => setIsExportModalOpen(true)}>
                Request Data Export
              </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-4 bg-white rounded-xl border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50">
              <div>
                <h4 className="font-semibold text-slate-900">Delete Account</h4>
                <p className="text-sm text-slate-500">Permanently delete your account and all associated data.</p>
              </div>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white border-none" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setIsDeleteModalOpen(true)}>
                Delete Account
              </Button>
            </div>

          </CardContent>
        </Card>


      {/* Modals */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Account Data"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
            <Button onClick={handleExportData}>Confirm Export</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            You are about to request a full export of your personal data, including:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 ml-2">
            <li>Profile Information</li>
            <li>Uploaded Resumes</li>
            <li>Assessment Scores</li>
            <li>Learning Roadmaps</li>
          </ul>
          <p className="text-sm text-slate-500 mt-4">
            A download link will be sent to <strong>{profile.email}</strong> within 24 hours.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeletingAccount && setIsDeleteModalOpen(false)}
        title="Delete Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeletingAccount}>
              Cancel
            </Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700 text-white border-none disabled:opacity-50" 
              onClick={handleDeleteAccount}
              isLoading={isDeletingAccount}
              disabled={deleteConfirmText.trim() !== 'DELETE'}
            >
              Yes, Delete My Account
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-rose-50 text-rose-800 p-4 rounded-lg border border-rose-200 flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
            <p className="text-sm font-medium">Warning: This action is permanent and cannot be undone.</p>
          </div>
          <p className="text-slate-600">
            All your data, including analyzed resumes, roadmaps, and assessment scores, will be permanently erased. 
          </p>
          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Please type <span className="font-bold select-all bg-slate-100 px-1 rounded">DELETE</span> to confirm:</label>
            <Input 
              placeholder="Type DELETE" 
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Settings;





