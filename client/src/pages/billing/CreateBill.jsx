import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { Plus, X, Trash2, CreditCard, ChevronDown, Check } from 'lucide-react';
import { useBills, useTestGroups, usePaymentModes, useSettings, useSearchDoctor } from '../../hooks/useApiHooks';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MultiSelect = React.forwardRef(({ options, value, onChange }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOptions = useMemo(() => options.filter(o => value.includes(o._id)), [options, value]);
    const dropdownRef = React.useRef(null);

    const toggleOption = (id) => {
        if (value.includes(id)) {
            onChange(value.filter(v => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative dropdown-container" ref={dropdownRef}>
            <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full min-h-[48px] px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
            >
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        {selectedOptions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {selectedOptions.map(option => (
                                    <span 
                                        key={option._id}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                                    >
                                        {option.name}
                                        <span className="ml-1 text-primary-600">₹{option.price}</span>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-gray-500">Select Test Groups...</span>
                        )}
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    <div className="p-2">
                        {options.map(option => (
                            <div 
                                key={option._id} 
                                className="flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors duration-150"
                                onClick={() => toggleOption(option._id)}
                            >
                                <div className={`flex-shrink-0 w-5 h-5 border-2 rounded ${
                                    value.includes(option._id) 
                                        ? 'bg-primary-500 border-primary-500' 
                                        : 'border-gray-300'
                                }`}>
                                    {value.includes(option._id) && (
                                        <Check className="w-3 h-3 text-white m-0.5" />
                                    )}
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="text-sm font-medium text-gray-900">{option.name}</div>
                                    <div className="text-sm text-gray-500">₹{option.price}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

const PaymentModeDropdown = React.forwardRef(({ options, value, onChange, placeholder = "Select Payment Mode" }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = useMemo(() => options.find(o => o._id === value), [options, value]);
    const dropdownRef = React.useRef(null);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative dropdown-container" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="form-dropdown-button"
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                            {selectedOption ? selectedOption.name : placeholder}
                        </span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    <div className="p-1">
                        {options.map(option => (
                            <div
                                key={option._id}
                                className="flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors duration-150"
                                onClick={() => handleSelect(option._id)}
                            >
                                <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-900">{option.name}</span>
                                {value === option._id && (
                                    <Check className="h-4 w-4 text-primary-500 ml-auto" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

function CreateBill() {
    const { register, handleSubmit, control, watch, setValue, trigger, formState: { errors } } = useForm({
        defaultValues: {
            paymentDetails: []
        }
    });
    const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
        control,
        name: 'paymentDetails'
    });
    
    const { testGroups, loading: loadingGroups } = useTestGroups();
    const { paymentModes, loading: loadingPaymentModes } = usePaymentModes();
    const { settings } = useSettings();
    const { createBill, loading: creatingBill } = useBills();
    const { searchByMobile, loading: searchingDoctor } = useSearchDoctor();
    const navigate = useNavigate();

    // State for doctor auto-search
    const [doctorSearched, setDoctorSearched] = useState(false);
    const [foundDoctor, setFoundDoctor] = useState(null);

    // Utility function for safe numeric parsing
    const parseAmount = (value) => {
        const num = Number(value || 0);
        return isNaN(num) ? 0 : num;
    };

    // Auto-search doctor by mobile number
    const handleDoctorPhoneChange = useCallback(async (phoneNumber) => {
        // Reset previous search results
        setDoctorSearched(false);
        setFoundDoctor(null);

        // Only search when we have exactly 10 digits
        if (phoneNumber && phoneNumber.length === 10 && /^[0-9]{10}$/.test(phoneNumber)) {
            try {
                const doctor = await searchByMobile(phoneNumber);
                if (doctor) {
                    setFoundDoctor(doctor);
                    setValue('doctorName', doctor.name);
                    setValue('doctorQualification', doctor.qualification || '');
                    toast.success(`Doctor found: ${doctor.name}`);
                } else {
                    toast.info('No doctor found with this mobile number. You can add new doctor details.');
                }
                setDoctorSearched(true);
            } catch (error) {
                console.error('Error searching doctor:', error);
                setDoctorSearched(true);
            }
        }
    }, [searchByMobile, setValue]);


    const selectedGroupIds = watch('testGroups', []);
    const toBePaidAmount = watch('toBePaidAmount', 0);
    const paymentDetails = watch('paymentDetails', []);
    const doctorPhone = watch('doctorPhone', '');

    // Watch for doctor phone changes and trigger search
    useEffect(() => {
        if (doctorPhone && doctorPhone.length === 10 && /^[0-9]{10}$/.test(doctorPhone)) {
            handleDoctorPhoneChange(doctorPhone);
        } else {
            // Reset search state when phone number is invalid
            setDoctorSearched(false);
            setFoundDoctor(null);
        }
    }, [doctorPhone, handleDoctorPhoneChange]);
    
    // Watch all payment amounts specifically for real-time updates
    const watchedPaymentAmounts = watch(
        paymentDetails.map((_, index) => `paymentDetails.${index}.amount`)
    );
    
    // Alternative watching using useWatch for better reactivity
    const watchedPaymentDetails = useWatch({
        control,
        name: 'paymentDetails'
    }) || [];
    
    // Force update callback for immediate payment calculation
    const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
    const forceUpdate = useCallback(() => {
        setForceUpdateCounter(prev => prev + 1);
    }, []);

    const activeTestGroups = useMemo(() => testGroups.filter(g => g.isActive), [testGroups]);
    
    // Calculate amounts
    const totalAmount = useMemo(() => {
        return activeTestGroups
            .filter(g => selectedGroupIds.includes(g._id))
            .reduce((sum, group) => sum + group.price, 0);
    }, [selectedGroupIds, activeTestGroups]);

    const taxPercentage = settings?.taxPercentage || 0;
    const taxEnabled = settings?.taxEnabled !== false;
    const paymentModeEnabled = settings?.paymentModeEnabled !== false;
    
    const taxAmount = useMemo(() => {
      return taxEnabled ? (totalAmount * taxPercentage) / 100 : 0;
    }, [totalAmount, taxPercentage, taxEnabled]);
    const totalWithTax = useMemo(() => totalAmount + taxAmount, [totalAmount, taxAmount]);
    const discount = useMemo(() => totalWithTax - (parseFloat(toBePaidAmount) || totalWithTax), [totalWithTax, toBePaidAmount]);
    const finalAmount = useMemo(() => parseFloat(toBePaidAmount) || totalWithTax, [toBePaidAmount, totalWithTax]);

    // Calculate total payments and dues
    const totalPayments = useMemo(() => {
        const paymentsToUse = watchedPaymentDetails.length > 0 ? watchedPaymentDetails : paymentDetails;
        return paymentsToUse.reduce((sum, payment) => {
            const amount = parseAmount(payment?.amount);
            return parseAmount(sum) + (amount > 0 ? amount : 0);
        }, 0);
    }, [paymentDetails, watchedPaymentAmounts, watchedPaymentDetails, forceUpdateCounter]);

    const duesAmount = useMemo(() => {
        return Math.max(0, finalAmount - totalPayments);
    }, [finalAmount, totalPayments]);

    // Get available payment modes (exclude already used ones)
    const usedPaymentModeIds = paymentDetails
        .filter(p => p.mode && p.mode.trim() !== '') // Only include payment details with selected modes
        .map(p => p.mode);
    const availablePaymentModes = paymentModes.filter(mode => !usedPaymentModeIds.includes(mode._id));

    // Set default toBePaidAmount when totalWithTax changes
    useEffect(() => {
        if (totalWithTax > 0 && (!toBePaidAmount || toBePaidAmount === 0)) {
            setValue('toBePaidAmount', totalWithTax.toFixed(2));
        }
    }, [totalWithTax, toBePaidAmount, setValue]);

    const addPaymentDetail = () => {
        if (availablePaymentModes.length === 0) {
            toast.error('No more payment modes available');
            return;
        }
        appendPayment({
            mode: '',
            amount: '',
            reference: ''
        });
    };



    const onSubmit = async (data) => {
        // Validate payment details if payment mode is enabled
        if (paymentModeEnabled && paymentDetails.length > 0) {
            const hasInvalidPayments = paymentDetails.some(p => !p.mode || !p.amount || parseFloat(p.amount) <= 0);
            if (hasInvalidPayments) {
                toast.error('Please fill all payment details with valid amounts');
                return;
            }

            if (totalPayments > finalAmount) {
                toast.error('Total payment amounts cannot exceed the final amount');
                return;
            }
        }

        const billData = {
            patient: {
                name: data.patientName,
                age: parseInt(data.patientAge),
                gender: data.patientGender,
                phone: data.patientPhone,
                address: {
                    street: data.patientStreet || '',
                    city: data.patientCity || '',
                    state: data.patientState || '',
                    pincode: data.patientPincode || '',
                }
            },
            referredBy: {
                doctorName: data.doctorName,
                qualification: data.doctorQualification || '',
                phone: data.doctorPhone,
            },
            testGroups: data.testGroups,
            toBePaidAmount: finalAmount,
            paymentDetails: paymentModeEnabled ? data.paymentDetails.filter(p => p.mode && p.amount) : [],
            dues: paymentModeEnabled ? Number(duesAmount.toFixed(2)) : Math.max(0, finalAmount - parseFloat(data.toBePaidAmount || 0)),
            notes: data.notes || '',
        };

        try {
                  const result = await createBill(billData);
            toast.success('Bill created successfully!');
            navigate(`/billing/list`);
            } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create bill.');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Plus className="mr-3 text-primary-600" /> Create New Bill
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Patient Details */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold">Patient Information</h3>
                    </div>
                    <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                                Patient Name *
                            </label>
                            <input 
                                id="patientName"
                                {...register('patientName', { required: 'Patient name is required' })} 
                                placeholder="Enter patient name" 
                                className="form-input" 
                            />
                            {errors.patientName && <span className="text-red-500 text-sm">{errors.patientName.message}</span>}
                        </div>
                        
                        <div>
                            <label htmlFor="patientAge" className="block text-sm font-medium text-gray-700 mb-1">
                                Age *
                            </label>
                            <input 
                                id="patientAge"
                                {...register('patientAge', { required: 'Age is required', min: 1, max: 150 })} 
                                type="number" 
                                placeholder="Enter age" 
                                className="form-input" 
                            />
                            {errors.patientAge && <span className="text-red-500 text-sm">{errors.patientAge.message}</span>}
                        </div>
                        
                        <div>
                            <label htmlFor="patientGender" className="block text-sm font-medium text-gray-700 mb-1">
                                Gender *
                            </label>
                            <select id="patientGender" {...register('patientGender', { required: 'Gender is required' })} className="form-input">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.patientGender && <span className="text-red-500 text-sm">{errors.patientGender.message}</span>}
                        </div>
                        
                        <div>
                            <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input 
                                id="patientPhone"
                                {...register('patientPhone', { required: 'Phone number is required' })} 
                                placeholder="Enter phone number" 
                                className="form-input" 
                            />
                            {errors.patientPhone && <span className="text-red-500 text-sm">{errors.patientPhone.message}</span>}
                        </div>
                        
                        <div className="md:col-span-2">
                            <label htmlFor="patientStreet" className="block text-sm font-medium text-gray-700 mb-1">
                                Street Address
                            </label>
                            <input 
                                id="patientStreet"
                                {...register('patientStreet')} 
                                placeholder="Enter street address" 
                                className="form-input" 
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="patientCity" className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input 
                                id="patientCity"
                                {...register('patientCity')} 
                                placeholder="Enter city" 
                                className="form-input" 
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="patientState" className="block text-sm font-medium text-gray-700 mb-1">
                                State
                            </label>
                            <input 
                                id="patientState"
                                {...register('patientState')} 
                                placeholder="Enter state" 
                                className="form-input" 
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="patientPincode" className="block text-sm font-medium text-gray-700 mb-1">
                                Pincode
                            </label>
                            <input 
                                id="patientPincode"
                                {...register('patientPincode')} 
                                placeholder="Enter pincode" 
                                className="form-input" 
                            />
                        </div>
                    </div>
                </div>

                {/* Referred By */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold">Referring Doctor</h3>
                    </div>
                    <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="doctorPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile Number *
                            </label>
                            <div className="relative">
                                <input 
                                    id="doctorPhone"
                                    type="tel"
                                    {...register('doctorPhone', { 
                                        required: 'Doctor mobile number is required',
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: 'Please enter a valid 10-digit mobile number'
                                        },
                                    })} 
                                    placeholder="Enter 10-digit mobile number" 
                                    className={`form-input ${searchingDoctor ? 'pr-10' : ''}`}
                                />
                                {searchingDoctor && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                                    </div>
                                )}
                            </div>
                            {errors.doctorPhone && <span className="text-red-500 text-sm">{errors.doctorPhone.message}</span>}
                            {doctorSearched && foundDoctor && (
                                <span className="text-green-600 text-sm">✓ Doctor found and details filled</span>
                            )}
                            {doctorSearched && !foundDoctor && (
                                <span className="text-blue-600 text-sm">ℹ New doctor - please fill details below</span>
                            )}
                        </div>
                        
                        <div>
                            <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">
                                Doctor Name *
                            </label>
                            <input 
                                id="doctorName"
                                {...register('doctorName', { required: 'Doctor name is required' })} 
                                placeholder="Enter doctor name" 
                                className="form-input" 
                            />
                            {errors.doctorName && <span className="text-red-500 text-sm">{errors.doctorName.message}</span>}
                        </div>
                        
                        <div>
                            <label htmlFor="doctorQualification" className="block text-sm font-medium text-gray-700 mb-1">
                                Qualification
                            </label>
                            <input 
                                id="doctorQualification"
                                {...register('doctorQualification')} 
                                placeholder="Enter qualification" 
                                className="form-input" 
                            />
                        </div>
                    </div>
                </div>

                {/* Test Selection */}
                <div className="card-with-dropdown">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold">Test Selection</h3>
                    </div>
                    <div className="card-body">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Test Groups *
                            </label>
                            {loadingGroups ? (
                                <div className="flex items-center justify-center py-8 text-gray-500">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mr-2"></div>
                                    Loading test groups...
                                </div>
                            ) : (
                                <Controller
                                    name="testGroups"
                                    control={control}
                                    defaultValue={[]}
                                    rules={{ required: 'Please select at least one test group', minLength: 1 }}
                                    render={({ field }) => <MultiSelect options={activeTestGroups} {...field} />}
                                />
                            )}
                            {errors.testGroups && <span className="text-red-500 text-sm mt-1 block">{errors.testGroups.message}</span>}
                        </div>
                    </div>
                </div>

                {/* Billing Summary */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold">Billing Summary</h3>
                    </div>
                    <div className="card-body space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                                <span>Test Amount:</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                            {taxEnabled && (
                                <div className="flex justify-between">
                                    <span>Tax ({taxPercentage}%):</span>
                                    <span>₹{taxAmount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        <hr/>
                        <div className="flex justify-between items-center font-medium">
                            <span>Total Amount{taxEnabled ? ' (including tax)' : ''}:</span>
                            <span className="text-lg">₹{totalWithTax.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <label htmlFor="toBePaidAmount" className="font-medium">
                                {paymentModeEnabled ? 'To be Paid Amount:' : 'Paid Amount:'}
                            </label>
                            <div className="flex flex-col items-end">
                                <input 
                                    id="toBePaidAmount"
                                    {...register('toBePaidAmount', { 
                                        required: paymentModeEnabled ? 'To be paid amount is required' : 'Paid amount is required',
                                        min: { value: 0.01, message: 'Amount must be greater than 0' },
                                        max: { value: totalWithTax, message: 'Amount cannot be greater than total' }
                                    })} 
                                    type="number" 
                                    step="0.01"
                                    className="form-input w-32 text-right" 
                                />
                                {errors.toBePaidAmount && <span className="text-red-500 text-xs mt-1">{errors.toBePaidAmount.message}</span>}
                            </div>
                        </div>
                        
                        {discount > 0 && (
                            <div className="flex justify-between items-center text-green-600">
                                <span>Discount:</span>
                                <span>₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        
                        <hr/>
                        <div className="flex justify-between items-center font-bold text-xl">
                            <span>Final Amount:</span>
                            <span className="text-primary-600">₹{finalAmount.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-green-600 font-medium">
                            <span>Paid Amount:</span>
                            <span>₹{totalPayments.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-orange-600 font-medium">
                            <span>Dues Amount:</span>
                            <span>₹{duesAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                {paymentModeEnabled && (
                <div className="card-with-dropdown">
                    <div className="card-header flex justify-between items-center">
                        <h3 className="text-lg font-semibold flex items-center">
                            <CreditCard className="mr-2 h-5 w-5 text-primary-600" />
                            Payment Details
                        </h3>
                        <button 
                            type="button" 
                            onClick={addPaymentDetail}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Payment
                        </button>
                    </div>
                    <div className="card-body">
                        {paymentFields.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No payment details added. Add payment methods above.</p>
                        ) : (
                            <div className="space-y-4">
                                {paymentFields.map((field, index) => (
                                    <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Payment Mode *
                                                </label>
                                                <Controller
                                                    name={`paymentDetails.${index}.mode`}
                                                    control={control}
                                                    rules={{ required: 'Payment mode is required' }}
                                                    render={({ field }) => (
                                                        <PaymentModeDropdown
                                                            options={paymentModes.filter(mode => 
                                                                !usedPaymentModeIds.includes(mode._id) || 
                                                                mode._id === paymentDetails[index]?.mode
                                                            )}
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            placeholder="Select Mode"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Amount *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    {...register(`paymentDetails.${index}.amount`, { 
                                                        required: 'Amount is required',
                                                        min: { value: 0.01, message: 'Amount must be greater than 0' },
                                                        onChange: (e) => {
                                                            // Force re-calculation of totals
                                                            trigger('paymentDetails');
                                                            forceUpdate();
                                                        }
                                                    })}
                                                    className="form-input"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Reference
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register(`paymentDetails.${index}.reference`)}
                                                    className="form-input"
                                                    placeholder="Reference number"
                                                />
                                            </div>
                                            
                                            <div className="flex items-end pb-0">
                                                <button
                                                    type="button"
                                                    onClick={() => removePayment(index)}
                                                    className="btn-danger btn-sm btn-form-aligned"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Payment Summary */}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Total Payments:</span>
                                        <span className="font-bold">₹{totalPayments.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Dues Amount:</span>
                                        <span className={`font-bold ${duesAmount === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                            ₹{duesAmount.toFixed(2)}
                                        </span>
                                    </div>
                                    {duesAmount === 0 && totalPayments > 0 && (
                                        <div className="text-green-600 text-sm font-medium">
                                            ✓ Fully Paid
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                )}
                
                {/* Notes */}
                <div className="card">
                     <div className="card-body">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Notes
                        </label>
                        <textarea 
                            id="notes"
                            {...register('notes')} 
                            placeholder="Additional notes..." 
                            className="form-textarea w-full" 
                            rows="3"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="btn-primary btn-lg" disabled={creatingBill}>
                        {creatingBill ? 'Saving...' : 'Create Bill'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateBill; 