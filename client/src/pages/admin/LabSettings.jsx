import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Upload, Save, Plus, Edit2, Trash2, CreditCard, Settings } from 'lucide-react';
import { usePaymentModes, useSettings, useLab } from '../../hooks/useApiHooks';
import toast from 'react-hot-toast';

function LabSettings() {
  const [loading, setLoading] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Lab state
  const { lab, loading: labLoading, createOrUpdateLab } = useLab();

  // Payment modes state
  const { paymentModes, loading: paymentModesLoading, createPaymentMode, updatePaymentMode, deletePaymentMode } = usePaymentModes();
  const [paymentModeForm, setPaymentModeForm] = useState({ name: '', editing: null });
  const [showPaymentModeForm, setShowPaymentModeForm] = useState(false);
  
  // Settings state
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [paymentModeEnabled, setPaymentModeEnabled] = useState(true);



  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  // Populate form when lab data is available
  useEffect(() => {
    if (lab) {
      setValue('name', lab.name || '');
      setValue('address.street', lab.address?.street || '');
      setValue('address.city', lab.address?.city || '');
      setValue('address.state', lab.address?.state || '');
      setValue('address.pincode', lab.address?.pincode || '');
      setValue('gstNumber', lab.gstNumber || '');
      setValue('pathologistName', lab.pathologistName || '');
      setValue('contactInfo.phone', lab.contactInfo?.phone || '');
      setValue('contactInfo.email', lab.contactInfo?.email || '');
      
      if (lab.logo) {
        const apiBaseUrl = import.meta.env.DEV 
          ? 'http://localhost:5000' 
          : 'https://pathology-lab-billing-system.onrender.com';
        setCurrentLogo(`${apiBaseUrl}${lab.logo}`);
      }
    }
  }, [lab, setValue]);

  useEffect(() => {
    if (settings) {
      setTaxPercentage(settings.taxPercentage || 0);
      setTaxEnabled(settings.taxEnabled !== false);
      // If no payment modes exist, force disable payment mode
      const shouldEnablePaymentMode = settings.paymentModeEnabled !== false && paymentModes.length > 0;
      setPaymentModeEnabled(shouldEnablePaymentMode);
    }
  }, [settings, paymentModes.length]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add form fields
      formData.append('name', data.name);
      formData.append('address', JSON.stringify(data.address));
      formData.append('gstNumber', data.gstNumber);
      formData.append('pathologistName', data.pathologistName);
      formData.append('contactInfo', JSON.stringify(data.contactInfo));
      
      // Add logo file if selected
      if (data.logo && data.logo[0]) {
        formData.append('logo', data.logo[0]);
      }

      // Add lab ID if updating existing lab
      if (lab && lab._id) {
        formData.append('_id', lab._id);
      }

      await createOrUpdateLab(formData);
      
      // Clear logo preview
      setLogoPreview(null);
    } catch (error) {
      
      toast.error(error.response?.data?.message || 'Failed to save lab settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  // Payment Mode handlers
  const handlePaymentModeSubmit = async (e) => {
    e.preventDefault();
    if (!paymentModeForm.name.trim()) {
      toast.error('Payment mode name is required');
      return;
    }

    try {
      if (paymentModeForm.editing) {
        await updatePaymentMode(paymentModeForm.editing, { name: paymentModeForm.name });
      } else {
        await createPaymentMode({ name: paymentModeForm.name });
      }
      setPaymentModeForm({ name: '', editing: null });
      setShowPaymentModeForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save payment mode');
    }
  };

  const handleEditPaymentMode = (mode) => {
    setPaymentModeForm({ name: mode.name, editing: mode._id });
    setShowPaymentModeForm(true);
  };

  const handleDeletePaymentMode = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment mode?')) {
      try {
        await deletePaymentMode(id);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete payment mode');
      }
    }
  };

  // Tax settings handler
  const handleTaxUpdate = async () => {
    try {
      await updateSettings({ 
        taxPercentage: parseFloat(taxPercentage) || 0,
        taxEnabled,
        paymentModeEnabled
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update tax settings');
    }
  };

  // Show loading if any of the main data is still loading
  if (labLoading || paymentModesLoading || settingsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="card">
            <div className="card-body space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Building2 className="h-8 w-8 mr-3 text-primary-600" />
          Lab Settings
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Configure your laboratory information and settings
        </p>
      </div>

      {/* Global Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-primary-600" />
            Global Settings
          </h3>
        </div>
        <div className="card-body space-y-6">
          {/* Tax Settings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-md font-medium text-gray-900">Tax Settings</h4>
                <p className="text-sm text-gray-500">Enable or disable tax calculation in bills</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            {taxEnabled && (
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label htmlFor="taxPercentage" className="block text-sm font-medium text-gray-700">
                    Tax Percentage (%)
                  </label>
                  <input
                    type="number"
                    id="taxPercentage"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                    className="form-input mt-1"
                    placeholder="Enter tax percentage"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Mode Settings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-md font-medium text-gray-900">Payment Mode Settings</h4>
                <p className="text-sm text-gray-500">Enable or disable payment mode selection in bills</p>
              </div>
              <label className={`relative inline-flex items-center ${paymentModes.length === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={paymentModeEnabled}
                  onChange={(e) => setPaymentModeEnabled(e.target.checked)}
                  disabled={paymentModes.length === 0}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${paymentModeEnabled ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              </label>
            </div>
            
            {paymentModes.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Payment mode is disabled because no payment modes are configured. 
                  Add at least one payment mode to enable this feature.
                </p>
              </div>
            )}

            {/* Payment Mode Management */}
            <div className="space-y-4">
              {/* Add Payment Mode Form */}
              {showPaymentModeForm && (
                <form onSubmit={handlePaymentModeSubmit} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={paymentModeForm.name}
                      onChange={(e) => setPaymentModeForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Payment mode name"
                      className="form-input flex-1"
                      autoFocus
                    />
                    <button type="submit" className="btn-primary btn-sm">
                      {paymentModeForm.editing ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentModeForm(false);
                        setPaymentModeForm({ name: '', editing: null });
                      }}
                      className="btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Payment Modes List */}
              {paymentModesLoading ? (
                <div className="text-center py-4 text-sm text-gray-500">Loading payment modes...</div>
              ) : (
                <div className="space-y-2">
                  {paymentModes.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">No payment modes configured</p>
                      <button
                        onClick={() => {
                          setPaymentModeForm({ name: '', editing: null });
                          setShowPaymentModeForm(true);
                        }}
                        className="btn-primary btn-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Payment Mode
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Configured Payment Modes:</span>
                        <button
                          onClick={() => {
                            setPaymentModeForm({ name: '', editing: null });
                            setShowPaymentModeForm(true);
                          }}
                          className="btn-primary btn-sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Payment Mode
                        </button>
                      </div>
                      {paymentModes.map((mode) => (
                        <div key={mode._id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <span className="font-medium text-gray-900">{mode.name}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditPaymentMode(mode)}
                              className="btn-secondary btn-sm"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePaymentMode(mode._id)}
                              className="btn-danger btn-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleTaxUpdate}
              disabled={settingsLoading}
              className="btn-primary"
            >
              {settingsLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>



      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          <div className="card-body space-y-6">
            {/* Lab Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Lab Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Lab name is required' })}
                className="form-input mt-1"
                placeholder="Enter lab name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lab Logo
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {(logoPreview || currentLogo) && (
                  <div className="flex-shrink-0">
                    <img
                      className="h-20 w-20 object-contain border border-gray-300 rounded-lg"
                      src={logoPreview || currentLogo}
                      alt="Lab logo"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center">
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      <Upload className="h-4 w-4 mr-2 inline" />
                      Choose file
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        {...register('logo')}
                        onChange={handleLogoChange}
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Pathologist Name */}
            <div>
              <label htmlFor="pathologistName" className="block text-sm font-medium text-gray-700">
                Pathologist Name *
              </label>
              <input
                type="text"
                id="pathologistName"
                {...register('pathologistName', { required: 'Pathologist name is required' })}
                className="form-input mt-1"
                placeholder="Enter pathologist name"
              />
              {errors.pathologistName && (
                <p className="mt-1 text-sm text-red-600">{errors.pathologistName.message}</p>
              )}
            </div>

            {/* GST Number */}
            <div>
              <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
                GST Number
              </label>
              <input
                type="text"
                id="gstNumber"
                {...register('gstNumber', { 
                  pattern: {
                    value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                    message: 'Please enter a valid GST number format'
                  }
                })}
                className="form-input mt-1"
                placeholder="Enter GST number (optional, e.g., 27AAAAA0000A1Z5)"
              />
              {errors.gstNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.gstNumber.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
          </div>
          <div className="card-body space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Street */}
              <div className="sm:col-span-2">
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="address.street"
                  {...register('address.street', { required: 'Street address is required' })}
                  className="form-input mt-1"
                  placeholder="Enter street address"
                />
                {errors.address?.street && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  id="address.city"
                  {...register('address.city', { required: 'City is required' })}
                  className="form-input mt-1"
                  placeholder="Enter city"
                />
                {errors.address?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                  State *
                </label>
                <input
                  type="text"
                  id="address.state"
                  {...register('address.state', { required: 'State is required' })}
                  className="form-input mt-1"
                  placeholder="Enter state"
                />
                {errors.address?.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
                )}
              </div>

              {/* Pincode */}
              <div>
                <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700">
                  Pincode *
                </label>
                <input
                  type="text"
                  id="address.pincode"
                  {...register('address.pincode', { 
                    required: 'Pincode is required',
                    pattern: {
                      value: /^[1-9][0-9]{5}$/,
                      message: 'Please enter a valid 6-digit pincode'
                    }
                  })}
                  className="form-input mt-1"
                  placeholder="Enter pincode"
                />
                {errors.address?.pincode && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.pincode.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          </div>
          <div className="card-body space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Phone */}
              <div>
                <label htmlFor="contactInfo.phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="contactInfo.phone"
                  {...register('contactInfo.phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Please enter a valid 10-digit phone number'
                    }
                  })}
                  className="form-input mt-1"
                  placeholder="Enter phone number"
                />
                {errors.contactInfo?.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactInfo.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="contactInfo.email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="contactInfo.email"
                  {...register('contactInfo.email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className="form-input mt-1"
                  placeholder="Enter email address"
                />
                {errors.contactInfo?.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactInfo.email.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LabSettings; 