import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../utils/api';
import UserProfileDropdown from '../components/UserProfileDropdown';
import ResponsiveNav from '../components/ResponsiveNav';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, updateUser } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Email form state
  const [emailData, setEmailData] = useState({
    email: user?.email || '',
  });
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully',
    });
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await userAPI.updateProfile({ name: profileData.name });
      updateUser(response.data);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!emailData.email.trim()) {
      toast({
        title: 'Error',
        description: 'Email cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingEmail(true);
    try {
      const response = await userAPI.updateProfile({ email: emailData.email });
      updateUser(response.data);
      toast({
        title: 'Success',
        description: 'Email updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update email',
        variant: 'destructive',
      });
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingPassword(true);
    try {
      await userAPI.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userAPI.deleteAccount();
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted',
      });
      logout();
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete account',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-purple-400 via-pink-400 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/4 -left-40 w-[700px] h-[700px] bg-gradient-to-br from-pink-400 via-rose-400 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Top Navigation */}
      <ResponsiveNav user={user} onLogout={handleLogout} />

      <div className="p-6 max-w-4xl mx-auto relative z-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Account Settings</h1>

        {/* Profile Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-md hover:shadow-xl transition-all duration-500 hover-lift">
          <h2 className="text-xl font-bold mb-2 text-gray-900">Profile Information</h2>
          <p className="text-gray-600 text-sm mb-6">
            Update your personal information and profile picture.
          </p>

          <div className="mb-6">
            <Label className="text-sm font-semibold mb-2">Profile picture</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl shadow-lg transition-transform duration-300 hover:scale-110">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Avatar generated from your name
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="name" className="mb-2">
              Name
            </Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              placeholder="Enter your name"
              className="max-w-md transition-all duration-300"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isSavingProfile ? 'Saving...' : 'Save changes'}
          </Button>
        </div>

        {/* Email */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-md hover:shadow-xl transition-all duration-500 hover-lift">
          <h2 className="text-xl font-bold mb-2 text-gray-900">Email</h2>
          <p className="text-gray-600 text-sm mb-6">
            Please enter the email address you want to sign in with
          </p>

          <div className="mb-4">
            <Input
              type="email"
              value={emailData.email}
              onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
              placeholder="Enter your email"
              className="max-w-md transition-all duration-300"
            />
          </div>

          <Button
            onClick={handleSaveEmail}
            disabled={isSavingEmail}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isSavingEmail ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {/* Password */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-md hover:shadow-xl transition-all duration-500 hover-lift">
          <h2 className="text-xl font-bold mb-2 text-gray-900">Password</h2>
          <p className="text-gray-600 text-sm mb-6">Change your password</p>

          <div className="space-y-4 mb-4">
            <div>
              <Label htmlFor="currentPassword" className="mb-2">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                placeholder="Enter current password"
                className="max-w-md transition-all duration-300"
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="mb-2">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                placeholder="Enter new password"
                className="max-w-md transition-all duration-300"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="mb-2">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                placeholder="Confirm new password"
                className="max-w-md transition-all duration-300"
              />
            </div>
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={isSavingPassword}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isSavingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="mb-6 animate-scale-in">
          <div className="text-center mb-4">
            <span className="text-red-600 font-bold text-sm tracking-wider">⚠️ DANGER ZONE ⚠️</span>
          </div>

          <div className="bg-white rounded-xl border-2 border-red-200 p-6 shadow-md hover:shadow-xl transition-all duration-500 hover:border-red-400">
            <h2 className="text-xl font-bold text-red-600 mb-2">Delete account</h2>
            <p className="text-gray-600 text-sm mb-6">
              Once you delete your account, there is no going back. Please be certain. All
              your uploaded data and trained agents will be deleted.{' '}
              <span className="font-semibold text-red-600">This action is not reversible</span>
            </p>

            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-300"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-2xl">⚠️ Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-base pt-2">
              <div>
                <p className="mb-2">
                  This action cannot be undone. This will permanently delete your account and
                  remove all your data from our servers including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>All your chatbots</li>
                  <li>All uploaded sources and files</li>
                  <li>All conversation history</li>
                  <li>Your profile information</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 transition-all duration-300"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountSettings;
