'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, Button, LoadingPage, Badge } from '@/components/ui';
import { useTheme } from '@/components/providers';
import { userService } from '@/services/userService';
import { backendAuthService } from '@/services';
import { User } from '@/types';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SystemIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const sections: SettingSection[] = [
  {
    id: 'profile',
    title: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 'account',
    title: 'Account',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-800 ${
      enabled ? 'bg-primary-600' : 'bg-secondary-300 dark:bg-secondary-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  
  // Loading and error states
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [practiceReminders, setPracticeReminders] = useState(true);
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');
  const [showActivity, setShowActivity] = useState(true);
  const [showAchievements, setShowAchievements] = useState(true);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  // Load user settings on mount
  useEffect(() => {
    async function loadUserSettings() {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingData(true);
        setError(null);
        const response = await userService.getMe();
        const data = response.data;
        setUserData(data);
        
        // Initialize form state from loaded data
        setDisplayName(data.displayName || data.firstName || '');
        setBio(data.bio || '');
        setLocation(data.location || '');
        setEmailNotifications(data.emailNotifications ?? true);
        setPushNotifications(data.pushNotifications ?? true);
        setWeeklyDigest(data.weeklyDigest ?? false);
        setInterviewReminders(data.interviewReminders ?? true);
        setPracticeReminders(data.practiceReminders ?? true);
        setProfileVisibility(data.profileVisibility || 'public');
        setShowActivity(data.showActivity ?? true);
        setShowAchievements(data.showAchievements ?? true);
      } catch (err) {
        console.error('Failed to load user settings:', err);
        setError('Failed to load settings. Please try again.');
      } finally {
        setIsLoadingData(false);
      }
    }
    
    loadUserSettings();
  }, [isAuthenticated]);

  // Save handlers
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await userService.updateMe({
        displayName,
        bio,
        location,
      });
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await userService.updateMe({
        emailNotifications,
        pushNotifications,
        weeklyDigest,
        interviewReminders,
        practiceReminders,
      });
      setSuccessMessage('Notification preferences updated!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save notifications:', err);
      setError('Failed to save notification settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await userService.updateMe({
        profileVisibility,
        showActivity,
        showAchievements,
      });
      setSuccessMessage('Privacy settings updated!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save privacy settings:', err);
      setError('Failed to save privacy settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTheme = async (newTheme: 'light' | 'dark') => {
    try {
      setTheme(newTheme);
      await userService.updateMe({
        themePreference: newTheme,
      });
    } catch (err) {
      console.error('Failed to save theme:', err);
    }
  };

  const handleExportData = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await userService.exportMyData();
      
      // Download as JSON file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-app-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setSuccessMessage('Data exported successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to export data:', err);
      setError('Failed to export data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all practice history? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      await userService.clearPracticeHistory();
      setSuccessMessage('Practice history cleared successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError('Failed to clear practice history. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.'
    );
    if (!confirmed) return;
    
    const doubleConfirm = confirm(
      'This is your last chance. Type "DELETE" in the next prompt to confirm account deletion.'
    );
    if (!doubleConfirm) return;
    
    try {
      setIsSaving(true);
      setError(null);
      await userService.deleteAccount();
      backendAuthService.clearTokens();
      await signOut({ redirect: false });
      router.push('/login');
    } catch (err) {
      console.error('Failed to delete account:', err);
      setError('Failed to delete account. Please try again.');
      setIsSaving(false);
    }
  };

  if (isLoading || isLoadingData) {
    return <LoadingPage message="Loading settings..." />;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Profile Information</h3>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">
          Update your profile information visible to other users.
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-6 p-6 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl">
        <div className="relative group">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || 'Profile'}
              width={80}
              height={80}
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-secondary-900 dark:text-white mb-1">Profile Photo</h4>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">
            JPG, GIF or PNG. Max size of 2MB.
          </p>
          <div className="flex gap-3">
            <Button size="sm">Upload Photo</Button>
            <Button size="sm" variant="outline">Remove</Button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName || user?.name || ''}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="Your display name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 cursor-not-allowed"
          />
          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">Email is managed by Google</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            placeholder="Tell us about yourself..."
          />
          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">{bio.length}/500 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="City, Country"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <Button variant="outline" disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSaveProfile} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Appearance</h3>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">
          Customize how Prephire looks on your device.
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-4">
        <h4 className="font-medium text-secondary-900 dark:text-white">Theme</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Theme */}
          <button
            onClick={() => handleSaveTheme('light')}
            className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
              theme === 'light'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-secondary-200 flex items-center justify-center shadow-sm">
                <SunIcon />
              </div>
              <span className="font-medium text-secondary-900 dark:text-white">Light</span>
            </div>
            {theme === 'light' && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* Dark Theme */}
          <button
            onClick={() => handleSaveTheme('dark')}
            className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
              theme === 'dark'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary-800 border border-secondary-600 flex items-center justify-center">
                <MoonIcon />
              </div>
              <span className="font-medium text-secondary-900 dark:text-white">Dark</span>
            </div>
            {theme === 'dark' && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* System Theme */}
          <button
            onClick={() => {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              setTheme(prefersDark ? 'dark' : 'light');
            }}
            className="relative p-4 rounded-2xl border-2 border-secondary-200 dark:border-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500 transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-secondary-800 border border-secondary-200 dark:border-secondary-600 flex items-center justify-center">
                <SystemIcon />
              </div>
              <span className="font-medium text-secondary-900 dark:text-white">System</span>
            </div>
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 p-6 rounded-2xl bg-secondary-50 dark:bg-secondary-700/50">
        <h4 className="font-medium text-secondary-900 dark:text-white mb-4">Preview</h4>
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600" />
            <div>
              <div className="h-3 w-24 bg-secondary-200 dark:bg-secondary-600 rounded" />
              <div className="h-2 w-16 bg-secondary-100 dark:bg-secondary-700 rounded mt-1" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-secondary-100 dark:bg-secondary-700 rounded" />
            <div className="h-2 w-3/4 bg-secondary-100 dark:bg-secondary-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Notifications</h3>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">
          Choose how you want to be notified about activity and updates.
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="p-6 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl">
          <h4 className="font-medium text-secondary-900 dark:text-white mb-4">Email Notifications</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">All Email Notifications</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Receive emails about your account activity</p>
              </div>
              <ToggleSwitch enabled={emailNotifications} onToggle={() => setEmailNotifications(!emailNotifications)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">Weekly Digest</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Summary of your weekly progress</p>
              </div>
              <ToggleSwitch enabled={weeklyDigest} onToggle={() => setWeeklyDigest(!weeklyDigest)} />
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="p-6 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl">
          <h4 className="font-medium text-secondary-900 dark:text-white mb-4">Push Notifications</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">Push Notifications</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Receive notifications on your device</p>
              </div>
              <ToggleSwitch enabled={pushNotifications} onToggle={() => setPushNotifications(!pushNotifications)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">Interview Reminders</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Get reminded about scheduled interviews</p>
              </div>
              <ToggleSwitch enabled={interviewReminders} onToggle={() => setInterviewReminders(!interviewReminders)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">Practice Reminders</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Daily reminders to practice concepts</p>
              </div>
              <ToggleSwitch enabled={practiceReminders} onToggle={() => setPracticeReminders(!practiceReminders)} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <Button variant="outline" disabled={isSaving}>Reset to Default</Button>
        <Button onClick={handleSaveNotifications} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Privacy & Security</h3>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">
          Manage your privacy settings and account security.
        </p>
      </div>

      <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-5 text-sm text-secondary-700 dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-secondary-200">
        <p className="font-semibold text-secondary-900 dark:text-white">Company visibility</p>
        <p className="mt-1">
          If your profile is public, companies can view your profile details and contact you to hire.
        </p>
      </div>

      {/* Profile Visibility */}
      <div className="p-6 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl">
        <h4 className="font-medium text-secondary-900 dark:text-white mb-4">Profile Visibility</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setProfileVisibility('public')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              profileVisibility === 'public'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-secondary-200 dark:border-secondary-600'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-secondary-900 dark:text-white">Public</span>
            </div>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Anyone can view your profile</p>
          </button>
          <button
            onClick={() => setProfileVisibility('private')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              profileVisibility === 'private'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-secondary-200 dark:border-secondary-600'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium text-secondary-900 dark:text-white">Private</span>
            </div>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Only you can view your profile</p>
          </button>
        </div>
      </div>

      {/* Activity Settings */}
      <div className="p-6 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl">
        <h4 className="font-medium text-secondary-900 dark:text-white mb-4">Activity & Achievements</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-secondary-900 dark:text-white">Show Activity</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Display your practice activity on profile</p>
            </div>
            <ToggleSwitch enabled={showActivity} onToggle={() => setShowActivity(!showActivity)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-secondary-900 dark:text-white">Show Achievements</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Display earned badges on profile</p>
            </div>
            <ToggleSwitch enabled={showAchievements} onToggle={() => setShowAchievements(!showAchievements)} />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="p-6 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl">
        <h4 className="font-medium text-secondary-900 dark:text-white mb-4">Security</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">Google Authentication</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Connected via Google OAuth</p>
              </div>
            </div>
            <Badge variant="success">Connected</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-700 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">Active Sessions</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Manage your active sessions</p>
              </div>
            </div>
            <Button size="sm" variant="outline">View</Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <Button onClick={handleSavePrivacy} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Account Settings</h3>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">
          Manage your account preferences and data.
        </p>
      </div>

      {/* Account Info */}
      <div className="p-6 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl">
        <h4 className="font-medium text-secondary-900 dark:text-white mb-4">Account Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-600">
            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Account Type</p>
            <div className="flex items-center gap-2">
              <p className="text-secondary-900 dark:text-white font-medium">Pro Member</p>
              <Badge variant="primary">Active</Badge>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-600">
            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Member Since</p>
            <p className="text-secondary-900 dark:text-white font-medium">January 2026</p>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="p-6 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl">
        <h4 className="font-medium text-secondary-900 dark:text-white mb-4">Data Management</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-600">
            <div>
              <p className="font-medium text-secondary-900 dark:text-white">Export Your Data</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Download a copy of all your data</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportData} disabled={isSaving}>
              {isSaving ? 'Exporting...' : 'Export'}
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-600">
            <div>
              <p className="font-medium text-secondary-900 dark:text-white">Clear Practice History</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Remove all practice session data</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleClearHistory} disabled={isSaving}>
              {isSaving ? 'Clearing...' : 'Clear'}
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
        <h4 className="font-medium text-red-700 dark:text-red-400 mb-4">Danger Zone</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-secondary-900 dark:text-white">Delete Account</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Permanently delete your account and all data</p>
          </div>
          <Button size="sm" variant="danger" onClick={handleDeleteAccount} disabled={isSaving}>
            {isSaving ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'account':
        return renderAccountSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700 dark:text-green-300 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <nav className="space-y-1 p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                        : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                    }`}
                  >
                    <span className={activeSection === section.id ? 'text-primary-600 dark:text-primary-400' : ''}>
                      {section.icon}
                    </span>
                    <span className="font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardContent>
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
