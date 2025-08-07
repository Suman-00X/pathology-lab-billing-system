import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { Plus, X, Trash2, CreditCard, ChevronDown, Check } from 'lucide-react';
import { useBills, useTestGroups, useBill, usePaymentModes, useSettings, useSearchDoctor } from '../../hooks/useApiHooks';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

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
        <div className="relative" ref={dropdownRef}>
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

function EditBill() {
    const { id } = useParams();
    const { bill, loading: loadingBill } = useBill(id);
    const { register, handleSubmit, control, watch, setValue, trigger, formState: { errors } } = useForm({
        defaultValues: {
            paymentDetails: []
        }
    });
    const { fields: paymentFields, append: appendPayment, remove: removePayment, replace: replacePayments } = useFieldArray({
        control,
        name: 'paymentDetails'
    });
    
    const { testGroups, loading: loadingGroups } = useTestGroups();
    const { paymentModes, loading: loadingPaymentModes } = usePaymentModes();
    const { settings } = useSettings();
    const { updateBill, loading: updatingBill } = useBills();
    const { searchByMobile, loading: searchingDoctor } = useSearchDoctor();
    const navigate = useNavigate();

    // State for doctor auto-search
    const [foundDoctor, setFoundDoctor] = useState(null);
    const lastSearchedPhoneRef = useRef('');

    // Utility function for safe numeric parsing
    const parseAmount = (value) => {
        const num = Number(value || 0);
        return isNaN(num) ? 0 : num;
    };

    // Auto-search doctor by mobile number
    const handleDoctorPhoneChange = useCallback(async (phoneNumber) => {
        // Only search when we have exactly 10 digits
        if (phoneNumber && phoneNumber.length === 10 && /^[0-9]{10}$/.test(phoneNumber)) {
            // Check if we've already searched this phone number
            if (lastSearchedPhoneRef.current === phoneNumber) {
                return;
            }
            
            // Reset previous search results
            setFoundDoctor(null);
            lastSearchedPhoneRef.current = phoneNumber;

            try {
                const doctor = await searchByMobile(phoneNumber);
                if (doctor) {
                    setFoundDoctor(doctor);
                    setValue('doctorName', doctor.name);
                    setValue('doctorQualification', doctor.qualification || '');
                    toast.success(`Doctor found: ${doctor.name}`);
                } else {
                    toast('No doctor found with this mobile number. You can add new doctor details.');
                }
            } catch (error) {
                console.error('Error searching doctor:', error);
                if (error.message?.includes('timeout')) {
                    toast.error('Search timed out. Please try again.');
                } else {
                    toast.error('Error searching for doctor. Please try again.');
                }
            }
        } else {
            // Reset search state when phone number is invalid
            setFoundDoctor(null);
            lastSearchedPhoneRef.current = '';
        }
    }, [searchByMobile, setValue]);

    // Watch for doctor phone changes
    const doctorPhone = watch('doctorPhone', '');

    // Add debounce for doctor phone changes
    const [debouncedDoctorPhone, setDebouncedDoctorPhone] = useState('');

    // Debounce doctor phone changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedDoctorPhone(doctorPhone);
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [doctorPhone]);

    // Watch for debounced doctor phone changes and trigger search
    useEffect(() => {
        if (debouncedDoctorPhone && debouncedDoctorPhone.length === 10 && /^[0-9]{10}$/.test(debouncedDoctorPhone)) {
            handleDoctorPhoneChange(debouncedDoctorPhone);
        } else {
            // Reset search state when phone number is invalid
            setFoundDoctor(null);
            lastSearchedPhoneRef.current = '';
        }
    }, [debouncedDoctorPhone, handleDoctorPhoneChange]);

    // Watch form values
    const selectedGroupIds = watch('testGroups', []);
    const toBePaidAmount = watch('toBePaidAmount', 0);
    const paidAmount = watch('paidAmount', 0);
    const paymentDetails = watch('paymentDetails', []);
    
    // State for custom test selections when checklist is enabled
    const [customSelections, setCustomSelections] = useState({});
    
    // Auto-select all tests when a checklist-enabled test group is selected (only for new selections)
    useEffect(() => {
        if (!bill) return; // Don't run until bill is loaded
        
        const checklistGroups = activeTestGroups.filter(group => 
            selectedGroupIds.includes(group._id) && group.isChecklistEnabled
        );
        
        const newSelections = { ...customSelections };
        
        checklistGroups.forEach(group => {
            // Only auto-select if this group doesn't have selections yet and it's a new addition
            if (!newSelections[group._id] && group.tests?.length > 0) {
                // Check if this group has existing custom selections from the bill
                const existingSelection = bill.customSelections?.find(cs => 
                    (cs.testGroupId._id || cs.testGroupId) === group._id
                );
                
                if (existingSelection) {
                    // Use existing selections
                    newSelections[group._id] = {
                        selectedTests: existingSelection.selectedTests
                    };
                } else {
                    // Auto-select all tests for new groups
                    newSelections[group._id] = {
                        selectedTests: group.tests.map(test => ({
                            test: test._id,
                            customPrice: test.price || (group.price / group.tests.length)
                        }))
                    };
                }
            }
        });
        
        // Remove selections for groups that are no longer selected or not checklist-enabled
        Object.keys(newSelections).forEach(groupId => {
            const group = activeTestGroups.find(g => g._id === groupId);
            if (!group || !selectedGroupIds.includes(groupId) || !group.isChecklistEnabled) {
                delete newSelections[groupId];
            }
        });
        
        setCustomSelections(newSelections);
    }, [selectedGroupIds, activeTestGroups, bill]);

    // Settings variables
    const taxPercentage = settings?.taxPercentage || 0;
    const taxEnabled = settings?.taxEnabled !== false;
    // Use bill's payment mode setting if available, otherwise fall back to global setting
    const paymentModeEnabled = bill?.isPaymentModeEnabled !== undefined ? bill.isPaymentModeEnabled : (settings?.paymentModeEnabled !== false);

    // Force update callback for immediate payment calculation
    const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
    const forceUpdate = useCallback(() => {
        setForceUpdateCounter(prev => prev + 1);
    }, []);



    useEffect(() => {
        if (bill) {
            setValue('patientName', bill.patient.name);
            setValue('patientAge', bill.patient.age);
            setValue('patientGender', bill.patient.gender);
            setValue('patientPhone', bill.patient.phone);
            setValue('patientAddress', bill.patient.address || '');
            setValue('doctorName', bill.referredBy.doctorName);
            setValue('doctorQualification', bill.referredBy.qualification || '');
            setValue('doctorPhone', bill.referredBy.phone || '');
            setValue('referringCustomer', bill.referringCustomer || '');
            setValue('sampleCollectionDate', bill.sampleCollectionDate ? new Date(bill.sampleCollectionDate).toISOString().split('T')[0] : '');
            setValue('sampleReceivedDate', bill.sampleReceivedDate ? new Date(bill.sampleReceivedDate).toISOString().split('T')[0] : '');
            setValue('testGroups', bill.testGroups.map(g => g._id));
            setValue('toBePaidAmount', bill.toBePaidAmount || bill.finalAmount);
            setValue('paidAmount', bill.paidAmount || 0);
            setValue('notes', bill.notes || '');
            
            // Initialize custom selections from existing bill data
            if (bill.customSelections && bill.customSelections.length > 0) {
                const initialCustomSelections = {};
                bill.customSelections.forEach(cs => {
                    initialCustomSelections[cs.testGroupId._id || cs.testGroupId] = {
                        selectedTests: cs.selectedTests
                    };
                });
                setCustomSelections(initialCustomSelections);
            }
        }
    }, [bill, setValue]);

    // Separate useEffect for payment details when paymentModes become available
    useEffect(() => {
        if (bill && paymentModes.length > 0) {
            const formattedPayments = (bill.paymentDetails || []).map(payment => ({
                mode: payment.mode._id || payment.mode,
                amount: payment.amount,
                reference: payment.reference || ''
            }));
            replacePayments(formattedPayments);
        }
    }, [bill, paymentModes, replacePayments]);

    // Watch for paidAmount changes to trigger re-calculation
    useEffect(() => {
        if (!paymentModeEnabled && paidAmount !== undefined) {
            // Force re-calculation when paidAmount changes
            forceUpdate();
        }
    }, [paidAmount, paymentModeEnabled, forceUpdate]);
    
    // Watch all payment amounts specifically for real-time updates
    const watchedPaymentAmounts = watch(
        paymentDetails.map((_, index) => `paymentDetails.${index}.amount`)
    );
    
    // Alternative watching using useWatch for better reactivity
    const watchedPaymentDetails = useWatch({
        control,
        name: 'paymentDetails'
    }) || [];

    const activeTestGroups = useMemo(() => testGroups.filter(g => g.isActive), [testGroups]);

    // Calculate amounts
    const totalAmount = useMemo(() => {
        if (!selectedGroupIds) return 0;
        return activeTestGroups
            .filter(g => selectedGroupIds.includes(g._id))
            .reduce((sum, group) => {
                // If it's a checklist-enabled group, use custom selection pricing
                if (group.isChecklistEnabled && customSelections[group._id]?.selectedTests?.length > 0) {
                    return sum + customSelections[group._id].selectedTests.reduce((total, t) => total + (t.customPrice || 0), 0);
                }
                // Otherwise use the group's original price
                return sum + group.price;
            }, 0);
    }, [selectedGroupIds, activeTestGroups, customSelections]);
    
    const taxAmount = useMemo(() => {
      return taxEnabled ? (totalAmount * taxPercentage) / 100 : 0;
    }, [totalAmount, taxPercentage, taxEnabled]);
    const totalWithTax = useMemo(() => totalAmount + taxAmount, [totalAmount, taxAmount]);
    
    // Calculate discount based on toBePaidAmount
    const discount = useMemo(() => {
        const toBePaid = parseFloat(toBePaidAmount) || totalWithTax;
        return Math.max(0, totalWithTax - toBePaid);
    }, [totalWithTax, toBePaidAmount]);
    
    // Final amount is the amount to be paid (after discount)
    const finalAmount = useMemo(() => {
        return parseFloat(toBePaidAmount) || totalWithTax;
    }, [toBePaidAmount, totalWithTax]);

    // Calculate total payments from payment modes
    const totalPayments = useMemo(() => {
        const paymentsToUse = watchedPaymentDetails.length > 0 ? watchedPaymentDetails : paymentDetails;
        return paymentsToUse
            .filter(p => p.mode && p.mode.trim() !== '' && parseFloat(p.amount) > 0)
            .reduce((sum, payment) => {
                const amount = parseAmount(payment?.amount);
                return parseAmount(sum) + amount;
            }, 0);
    }, [paymentDetails, watchedPaymentAmounts, watchedPaymentDetails, forceUpdateCounter]);

    // Calculate dues amount based on payment mode
    const duesAmount = useMemo(() => {
        if (paymentModeEnabled) {
            // When payment mode is enabled, dues = finalAmount - totalPayments
            return Math.max(0, finalAmount - totalPayments);
        } else {
            // When payment mode is disabled, dues = finalAmount - paidAmount
            return Math.max(0, finalAmount - parseFloat(paidAmount || 0));
        }
    }, [finalAmount, totalPayments, paidAmount, paymentModeEnabled, forceUpdateCounter]);

    // Get available payment modes (exclude already used ones)
    const usedPaymentModeIds = paymentDetails
        .filter(p => p.mode && p.mode.trim() !== '') // Only include payment details with selected modes
        .map(p => p.mode);
    const availablePaymentModes = paymentModes.filter(mode => !usedPaymentModeIds.includes(mode._id));

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
            const hasInvalidPayments = paymentDetails.some(p => !p.mode || p.mode.trim() === '' || !p.amount || parseFloat(p.amount) <= 0);
            if (hasInvalidPayments) {
                toast.error('Please fill all payment details with valid amounts');
                return;
            }

            if (totalPayments > finalAmount) {
                toast.error('Total payment amounts cannot exceed the to-be-paid amount');
                return;
            }
        }

        const billData = {
            patient: {
                name: data.patientName,
                age: parseInt(data.patientAge),
                gender: data.patientGender,
                phone: data.patientPhone,
                address: data.patientAddress || '',
            },
            referredBy: {
                doctorName: data.doctorName,
                qualification: data.doctorQualification || '',
                phone: data.doctorPhone,
            },
            referringCustomer: data.referringCustomer || '',
            testGroups: data.testGroups,
            customSelections: Object.keys(customSelections).map(groupId => ({
                testGroupId: groupId,
                selectedTests: customSelections[groupId].selectedTests,
                totalPrice: customSelections[groupId].selectedTests.reduce((sum, t) => sum + (t.customPrice || 0), 0)
            })).filter(cs => cs.selectedTests.length > 0),
            sampleCollectionDate: data.sampleCollectionDate,
            sampleReceivedDate: data.sampleReceivedDate,
            toBePaidAmount: finalAmount,
            ...(paymentModeEnabled ? {} : { paidAmount: parseFloat(data.paidAmount || 0) }),
            paymentDetails: paymentModeEnabled ? data.paymentDetails.filter(p => p.mode && p.mode.trim() !== '' && parseFloat(p.amount) > 0) : [],
            dues: Number(duesAmount.toFixed(2)),
            isPaymentModeEnabled: paymentModeEnabled,
            notes: data.notes || '',
        };

        try {
            const result = await updateBill(id, billData);
            navigate(`/billing/${id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update bill.');
        }
    };
    
    if (loadingBill) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Bill #{bill?.billNumber}</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Patient Information */}
                <div className="card">
                    <div className="card-header"><h3 className="text-lg font-semibold">Patient Information</h3></div>
                    <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                                Patient Name *
                            </label>
                            <input 
                                id="patientName"
                                {...register('patientName', { required: 'Patient name is required' })} 
                                placeholder="Enter patient name" 
                                className="input-editable" 
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
                                className="input-editable" 
                            />
                            {errors.patientAge && <span className="text-red-500 text-sm">{errors.patientAge.message}</span>}
                        </div>
                        
                        <div>
                            <label htmlFor="patientGender" className="block text-sm font-medium text-gray-700 mb-1">
                                Gender *
                            </label>
                            <select id="patientGender" {...register('patientGender', { required: 'Gender is required' })} className="input-editable">
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
                                    className="input-editable" 
                                />
                            {errors.patientPhone && <span className="text-red-500 text-sm">{errors.patientPhone.message}</span>}
                        </div>
                        
                        <div className="md:col-span-2">
                            <label htmlFor="patientAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                Address *
                            </label>
                            <textarea 
                                id="patientAddress"
                                {...register('patientAddress', { required: 'Address is required' })} 
                                placeholder="Enter complete address" 
                                className="input-editable" 
                                rows="3"
                            />
                            {errors.patientAddress && <span className="text-red-500 text-sm">{errors.patientAddress.message}</span>}
                        </div>
                    </div>
                </div>

                {/* Referring Doctor */}
                <div className="card">
                    <div className="card-header"><h3 className="text-lg font-semibold">Referring Doctor</h3></div>
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
                                        }
                                    })} 
                                    placeholder="Enter 10-digit mobile number" 
                                    className={`input ${searchingDoctor ? 'pr-10' : ''}`}
                                />
                                {searchingDoctor && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                                    </div>
                                )}
                            </div>
                            {errors.doctorPhone && <span className="text-red-500 text-sm">{errors.doctorPhone.message}</span>}
                            {foundDoctor && (
                                <span className="text-green-600 text-sm">✓ Doctor found and details filled</span>
                            )}
                            {lastSearchedPhoneRef.current && !foundDoctor && (
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
                                className="input-editable" 
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
                                className="input-editable" 
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="referringCustomer" className="block text-sm font-medium text-gray-700 mb-1">
                                Referring Customer
                            </label>
                            <input 
                                id="referringCustomer"
                                {...register('referringCustomer')} 
                                placeholder="Enter referring customer name" 
                                className="input-editable" 
                            />
                        </div>
                    </div>
                </div>

                {/* Date Information */}
                <div className="card">
                    <div className="card-header"><h3 className="text-lg font-semibold">Date Information</h3></div>
                    <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="sampleCollectionDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Sample Collection Date *
                            </label>
                            <input 
                                id="sampleCollectionDate"
                                type="date"
                                {...register('sampleCollectionDate', { required: 'Sample collection date is required' })} 
                                className="input-editable" 
                            />
                            {errors.sampleCollectionDate && <span className="text-red-500 text-sm">{errors.sampleCollectionDate.message}</span>}
                        </div>
                        
                        <div>
                            <label htmlFor="sampleReceivedDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Sample Received Date *
                            </label>
                            <input 
                                id="sampleReceivedDate"
                                type="date"
                                {...register('sampleReceivedDate', { required: 'Sample received date is required' })} 
                                className="input-editable" 
                            />
                            {errors.sampleReceivedDate && <span className="text-red-500 text-sm">{errors.sampleReceivedDate.message}</span>}
                        </div>
                    </div>
                </div>

                {/* Test Selection */}
                <div className="card-with-dropdown">
                    <div className="card-header"><h3 className="text-lg font-semibold">Test Selection</h3></div>
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

                        {/* Custom Test Selection for Checklist-Enabled Test Groups */}
                        {activeTestGroups
                            .filter(group => selectedGroupIds.includes(group._id) && group.isChecklistEnabled)
                            .map(group => (
                                <div key={group._id} className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-blue-900">
                                            Select Tests from {group.name}
                                        </h4>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSelections = { ...customSelections };
                                                    const allSelected = group.tests?.every(test => 
                                                        newSelections[group._id]?.selectedTests?.some(t => t.test === test._id)
                                                    );
                                                    
                                                    if (allSelected) {
                                                        // Deselect all
                                                        newSelections[group._id] = { selectedTests: [] };
                                                    } else {
                                                        // Select all
                                                        newSelections[group._id] = {
                                                            selectedTests: group.tests?.map(test => ({
                                                                test: test._id,
                                                                customPrice: test.price || (group.price / group.tests.length)
                                                            })) || []
                                                        };
                                                    }
                                                    setCustomSelections(newSelections);
                                                }}
                                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                                            >
                                                {group.tests?.every(test => 
                                                    customSelections[group._id]?.selectedTests?.some(t => t.test === test._id)
                                                ) ? 'Deselect All' : 'Select All'}
                                            </button>
                                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                Checklist Mode
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {group.tests?.map(test => {
                                            const isSelected = customSelections[group._id]?.selectedTests?.some(t => t.test === test._id);
                                            const customPrice = customSelections[group._id]?.selectedTests?.find(t => t.test === test._id)?.customPrice || test.price || group.price / (group.tests?.length || 1);
                                            
                                            return (
                                                <div key={test._id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                const newSelections = { ...customSelections };
                                                                if (!newSelections[group._id]) {
                                                                    newSelections[group._id] = { selectedTests: [] };
                                                                }
                                                                
                                                                if (e.target.checked) {
                                                                    newSelections[group._id].selectedTests.push({
                                                                        test: test._id,
                                                                        customPrice: test.price || group.price / (group.tests?.length || 1)
                                                                    });
                                                                } else {
                                                                    newSelections[group._id].selectedTests = newSelections[group._id].selectedTests.filter(t => t.test !== test._id);
                                                                }
                                                                
                                                                setCustomSelections(newSelections);
                                                            }}
                                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-900">{test.name}</span>
                                                        {test.units && (
                                                            <span className="text-xs text-gray-500">({test.units})</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-500">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={customPrice}
                                                            onChange={(e) => {
                                                                const newSelections = { ...customSelections };
                                                                if (!newSelections[group._id]) {
                                                                    newSelections[group._id] = { selectedTests: [] };
                                                                }
                                                                
                                                                const testIndex = newSelections[group._id].selectedTests.findIndex(t => t.test === test._id);
                                                                if (testIndex >= 0) {
                                                                    newSelections[group._id].selectedTests[testIndex].customPrice = parseFloat(e.target.value) || 0;
                                                                } else if (isSelected) {
                                                                    newSelections[group._id].selectedTests.push({
                                                                        test: test._id,
                                                                        customPrice: parseFloat(e.target.value) || 0
                                                                    });
                                                                }
                                                                
                                                                setCustomSelections(newSelections);
                                                            }}
                                                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                                                            disabled={!isSelected}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
                                        <span className="font-medium text-blue-900">Total for {group.name}: ₹</span>
                                        <span className="text-blue-900">
                                            {(customSelections[group._id]?.selectedTests?.reduce((sum, t) => sum + (t.customPrice || 0), 0) || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Billing Summary */}
                <div className="card">
                    <div className="card-header"><h3 className="text-lg font-semibold">Billing Summary</h3></div>
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
                                To be Paid Amount:
                            </label>
                            <div className="flex flex-col items-end">
                                <input 
                                    id="toBePaidAmount"
                                    {...register('toBePaidAmount', { 
                                        required: 'To be paid amount is required',
                                        min: { value: 0.01, message: 'Amount must be greater than 0' },
                                        max: { value: totalWithTax, message: 'Amount cannot be greater than total' }
                                    })} 
                                    type="number" 
                                    step="0.01"
                                    className="input-editable w-32 text-right" 
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
                        
                        {paymentModeEnabled ? (
                            <>
                                <div className="flex justify-between items-center text-green-600 font-medium">
                                    <span>Paid Amount:</span>
                                    <span>₹{totalPayments.toFixed(2)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center text-orange-600 font-medium">
                                    <span>Dues Amount:</span>
                                    <span>₹{duesAmount.toFixed(2)}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="paidAmount" className="font-medium">
                                        Paid Amount:
                                    </label>
                                    <div className="flex flex-col items-end">
                                        <input 
                                            id="paidAmount"
                                            {...register('paidAmount', { 
                                                required: 'Paid amount is required',
                                                min: { value: 0, message: 'Amount cannot be negative' },
                                                max: { value: finalAmount, message: 'Amount cannot exceed final amount' }
                                            })} 
                                            type="number" 
                                            step="0.01"
                                            className="input-editable w-32 text-right" 
                                            placeholder="0.00"
                                        />
                                        {errors.paidAmount && <span className="text-red-500 text-xs mt-1">{errors.paidAmount.message}</span>}
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center text-green-600 font-medium">
                                    <span>Paid Amount:</span>
                                    <span>₹{parseFloat(paidAmount || 0).toFixed(2)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center text-orange-600 font-medium">
                                    <span>Dues Amount:</span>
                                    <span>₹{duesAmount.toFixed(2)}</span>
                                </div>
                            </>
                        )}
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
                                                    className="input-editable"
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
                                                    className="input-editable"
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
                                        <span className="font-medium">Remaining:</span>
                                        <span className={`font-bold ${finalAmount - totalPayments === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ₹{Math.max(0, finalAmount - totalPayments).toFixed(2)}
                                        </span>
                                    </div>
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
                            className="input-editable w-full" 
                            rows="3"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="button" onClick={() => navigate(-1)} className="btn-secondary mr-3">Cancel</button>
                    <button type="submit" className="btn-primary btn-lg" disabled={updatingBill}>
                        {updatingBill ? 'Saving...' : 'Update Bill'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditBill; 