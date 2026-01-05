import React, { useState, useEffect, useRef } from 'react';
import { Palette, Image, Type, Layout, Eye, Upload, X, Sparkles, Lock } from 'lucide-react';
import { chatbotAPI, plansAPI } from '../utils/api';
import { toast } from 'sonner';

const AppearanceTab = ({ chatbot, onUpdate }) => {
  const [customization, setCustomization] = useState({
    primary_color: chatbot?.primary_color || '#7c3aed',
    secondary_color: chatbot?.secondary_color || '#a78bfa',
    accent_color: chatbot?.accent_color || '#ec4899',
    logo_url: chatbot?.logo_url || '',
    avatar_url: chatbot?.avatar_url || '',
    widget_position: chatbot?.widget_position || 'bottom-right',
    widget_theme: chatbot?.widget_theme || 'light',
    font_family: chatbot?.font_family || 'Inter, system-ui, sans-serif',
    font_size: chatbot?.font_size || 'medium',
    bubble_style: chatbot?.bubble_style || 'rounded',
    widget_size: chatbot?.widget_size || 'medium',
    auto_expand: chatbot?.auto_expand || false,
    powered_by_text: chatbot?.powered_by_text || '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [userPlan, setUserPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const logoInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Sync customization state when chatbot prop changes
  useEffect(() => {
    if (chatbot) {
      setCustomization({
        primary_color: chatbot?.primary_color || '#7c3aed',
        secondary_color: chatbot?.secondary_color || '#a78bfa',
        accent_color: chatbot?.accent_color || '#ec4899',
        logo_url: chatbot?.logo_url || '',
        avatar_url: chatbot?.avatar_url || '',
        widget_position: chatbot?.widget_position || 'bottom-right',
        widget_theme: chatbot?.widget_theme || 'light',
        font_family: chatbot?.font_family || 'Inter, system-ui, sans-serif',
        font_size: chatbot?.font_size || 'medium',
        bubble_style: chatbot?.bubble_style || 'rounded',
        widget_size: chatbot?.widget_size || 'medium',
        auto_expand: chatbot?.auto_expand || false,
        powered_by_text: chatbot?.powered_by_text || '',
      });
    }
  }, [chatbot]);

  // Fetch user's plan to check if they have custom branding
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await plansAPI.getUsageStats();
        setUserPlan(response.data.plan);
      } catch (error) {
        console.error('Error fetching user plan:', error);
      } finally {
        setLoadingPlan(false);
      }
    };
    fetchUserPlan();
  }, []);

  const handleChange = (field, value) => {
    setCustomization(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await chatbotAPI.update(chatbot.id, customization);
      toast.success('Appearance updated successfully! Open the live preview to see changes.');
      // Non-blocking refresh - don't wait for it
      if (onUpdate) {
        onUpdate().catch(err => console.error('Error refreshing chatbot:', err));
      }
    } catch (error) {
      console.error('Error updating appearance:', error);
      toast.error('Failed to update appearance');
    } finally {
      setSaving(false);
    }
  };

  const handleViewLivePreview = () => {
    // Add timestamp to force reload and bypass cache
    const previewUrl = `/public-chat/${chatbot.id}?t=${Date.now()}`;
    window.open(previewUrl, '_blank');
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PNG, JPEG, JPG, GIF, WEBP, or SVG');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(`Image size exceeds 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setUploadingLogo(true);
    try {
      const response = await chatbotAPI.uploadBrandingImage(chatbot.id, file, 'logo');

      if (response.data.success) {
        setCustomization(prev => ({ ...prev, logo_url: response.data.url }));
        toast.success('Logo uploaded successfully!');
        // Non-blocking refresh
        if (onUpdate) {
          onUpdate().catch(err => console.error('Error refreshing chatbot:', err));
        }
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      // Reset file input
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PNG, JPEG, JPG, GIF, WEBP, or SVG');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(`Image size exceeds 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setUploadingAvatar(true);
    try {
      const response = await chatbotAPI.uploadBrandingImage(chatbot.id, file, 'avatar');

      if (response.data.success) {
        setCustomization(prev => ({ ...prev, avatar_url: response.data.url }));
        toast.success('Avatar uploaded successfully!');
        // Non-blocking refresh
        if (onUpdate) {
          onUpdate().catch(err => console.error('Error refreshing chatbot:', err));
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setCustomization(prev => ({ ...prev, logo_url: '' }));
      await chatbotAPI.update(chatbot.id, { logo_url: '' });
      toast.success('Logo removed successfully!');
      // Non-blocking refresh
      if (onUpdate) {
        onUpdate().catch(err => console.error('Error refreshing chatbot:', err));
      }
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Failed to remove logo');
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setCustomization(prev => ({ ...prev, avatar_url: '' }));
      await chatbotAPI.update(chatbot.id, { avatar_url: '' });
      toast.success('Avatar removed successfully!');
      // Non-blocking refresh
      if (onUpdate) {
        onUpdate().catch(err => console.error('Error refreshing chatbot:', err));
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Color Customization */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Color Theme</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={customization.primary_color}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customization.primary_color}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="#7c3aed"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={customization.secondary_color}
                onChange={(e) => handleChange('secondary_color', e.target.value)}
                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customization.secondary_color}
                onChange={(e) => handleChange('secondary_color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="#a78bfa"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={customization.accent_color}
                onChange={(e) => handleChange('accent_color', e.target.value)}
                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customization.accent_color}
                onChange={(e) => handleChange('accent_color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="#ec4899"
              />
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="mt-4 p-4 rounded-lg border-2 border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <div className="flex space-x-2">
            <div 
              className="w-20 h-20 rounded-lg shadow-md"
              style={{ backgroundColor: customization.primary_color }}
            />
            <div 
              className="w-20 h-20 rounded-lg shadow-md"
              style={{ backgroundColor: customization.secondary_color }}
            />
            <div 
              className="w-20 h-20 rounded-lg shadow-md"
              style={{ backgroundColor: customization.accent_color }}
            />
          </div>
        </div>
      </div>

      {/* Font Customization */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Type className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Font Customization</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={customization.font_family}
              onChange={(e) => handleChange('font_family', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Inter, system-ui, sans-serif">Inter (Default)</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="Verdana, sans-serif">Verdana</option>
              <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <select
              value={customization.font_size}
              onChange={(e) => handleChange('font_size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="small">Small (14px)</option>
              <option value="medium">Medium (16px)</option>
              <option value="large">Large (18px)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Bubble Style */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Layout className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Chat Bubble Style</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleChange('bubble_style', 'rounded')}
            className={`p-4 border-2 rounded-lg transition-all ${
              customization.bubble_style === 'rounded'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-2"></div>
            <p className="text-sm font-medium text-center">Rounded</p>
          </button>
          
          <button
            onClick={() => handleChange('bubble_style', 'smooth')}
            className={`p-4 border-2 rounded-lg transition-all ${
              customization.bubble_style === 'smooth'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-2"></div>
            <p className="text-sm font-medium text-center">Smooth</p>
          </button>
          
          <button
            onClick={() => handleChange('bubble_style', 'square')}
            className={`p-4 border-2 rounded-lg transition-all ${
              customization.bubble_style === 'square'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded mb-2"></div>
            <p className="text-sm font-medium text-center">Square</p>
          </button>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Image className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Branding</h3>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 Add your company logo and bot avatar to personalize the chat experience. These will appear in the public chat header and messages.
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            
            {!customization.logo_url ? (
              <div className="relative">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingLogo ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Click to upload logo</span>
                    </>
                  )}
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, GIF, WEBP, or SVG (max 5MB)
                </p>
              </div>
            ) : (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium">Logo Preview:</p>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    title="Remove logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-center p-3 bg-white rounded-lg border border-gray-200">
                  <img 
                    src={customization.logo_url} 
                    alt="Logo preview" 
                    className="h-16 object-contain max-w-[250px]"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="mt-3 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  <span>Change Logo</span>
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo}
                />
              </div>
            )}
          </div>
          
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar
            </label>
            
            {!customization.avatar_url ? (
              <div className="relative">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingAvatar ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Click to upload avatar</span>
                    </>
                  )}
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, GIF, WEBP, or SVG (max 5MB)
                </p>
              </div>
            ) : (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium">Avatar Preview:</p>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    title="Remove avatar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-center p-3 bg-white rounded-lg border border-gray-200">
                  <img 
                    src={customization.avatar_url} 
                    alt="Avatar preview" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="mt-3 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  <span>Change Avatar</span>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* White Label Branding - Custom "Powered by" */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">White Label Branding</h3>
            {(!userPlan?.limits?.custom_branding && !loadingPlan) && (
              <span className="ml-2 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                PRO
              </span>
            )}
          </div>
        </div>

        {loadingPlan ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : userPlan?.limits?.custom_branding ? (
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-800">
                ✨ Customize the "Powered by" text that appears at the bottom of your chatbot widget. Leave empty to hide it completely.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom "Powered by" Text
              </label>
              <input
                type="text"
                value={customization.powered_by_text || ''}
                onChange={(e) => handleChange('powered_by_text', e.target.value)}
                placeholder="e.g., Your Brand Name (leave empty to hide)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={50}
              />
              <p className="mt-1 text-xs text-gray-500">
                {customization.powered_by_text 
                  ? `Preview: "Powered by ${customization.powered_by_text}"` 
                  : 'Branding will be hidden when empty'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Upgrade to Customize Your Branding
                </h4>
                <p className="text-sm text-gray-700 mb-4">
                  White label branding is available on <strong>Starter, Professional, and Enterprise</strong> plans. 
                  Customize or remove the "Powered by" text to match your brand identity.
                </p>
                <button
                  onClick={() => window.location.href = '/subscription'}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md font-semibold text-sm"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Widget Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Layout className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Widget Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <select
              value={customization.widget_position}
              onChange={(e) => handleChange('widget_position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={customization.widget_theme}
              onChange={(e) => handleChange('widget_theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Widget Size
            </label>
            <select
              value={customization.widget_size}
              onChange={(e) => handleChange('widget_size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="small">Small (360px)</option>
              <option value="medium">Medium (420px)</option>
              <option value="large">Large (500px)</option>
            </select>
          </div>
        </div>

        {/* Auto-expand Toggle */}
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div>
            <p className="font-medium text-gray-900">Auto-expand Widget</p>
            <p className="text-sm text-gray-600">Automatically open chat widget when page loads</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={customization.auto_expand}
              onChange={(e) => handleChange('auto_expand', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* Live Preview Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Live Preview</h4>
            <p className="text-sm text-blue-700">
              After saving, click "View Live Preview" below to see your changes in action. The preview will open in a new tab with the latest appearance settings.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleViewLivePreview}
          className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all shadow-md font-semibold flex items-center space-x-2"
        >
          <Eye className="w-5 h-5" />
          <span>View Live Preview</span>
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 font-semibold"
        >
          {saving ? 'Saving...' : 'Save Appearance'}
        </button>
      </div>
    </div>
  );
};

export default AppearanceTab;
