import React, { useState, useMemo } from 'react';
import { useReferredDoctors, useDoctorBills } from '../../hooks/useApiHooks';
import { Users, Search, Edit, Eye, Plus, X, Calendar, FileText, PhoneCall, Award, IndianRupee, List, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function DoctorManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showBills, setShowBills] = useState(false);
    const [billsPage, setBillsPage] = useState(1);

    // Form state for add/edit
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        qualification: ''
    });

    // API params for doctors list
    const doctorsParams = useMemo(() => ({
        page: currentPage,
        search: searchTerm,
        startDate: startDate || undefined,
        endDate: endDate || undefined
    }), [currentPage, searchTerm, startDate, endDate]);

    // API params for doctor bills
    const billsParams = useMemo(() => ({
        page: billsPage,
        startDate: startDate || undefined,
        endDate: endDate || undefined
    }), [billsPage, startDate, endDate]);

    const { doctors, pagination, loading, error, createDoctor, updateDoctor, deleteDoctor } = useReferredDoctors(doctorsParams);
    const { bills, doctor: billsDoctor, pagination: billsPagination, loading: billsLoading } = useDoctorBills(
        selectedDoctor?._id,
        billsParams
    );

    const resetForm = () => {
        setFormData({ name: '', phone: '', qualification: '' });
        setEditingDoctor(null);
        setShowAddForm(false);
    };

    const handleEdit = (doctor) => {
        setFormData({
            name: doctor.name,
            phone: doctor.phone,
            qualification: doctor.qualification || ''
        });
        setEditingDoctor(doctor);
        setShowAddForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.phone.trim()) {
            toast.error('Name and phone number are required');
            return;
        }

        if (!/^[0-9]{10}$/.test(formData.phone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            if (editingDoctor) {
                await updateDoctor(editingDoctor._id, formData);
            } else {
                await createDoctor(formData);
            }
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save doctor');
        }
    };

    const handleDelete = async (doctor) => {
        if (window.confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) {
            try {
                await deleteDoctor(doctor._id);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete doctor');
            }
        }
    };

    const handleViewBills = (doctor) => {
        setSelectedDoctor(doctor);
        setShowBills(true);
        setBillsPage(1);
    };

    const formatCurrency = (amount) => `₹${(amount || 0).toFixed(2)}`;

    if (showBills) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowBills(false)}
                            className="btn-secondary flex items-center"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Back to Doctors
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                            <FileText className="mr-3 text-primary-600" />
                            Bills by Dr. {billsDoctor?.name}
                        </h1>
                    </div>
                </div>

                {/* Doctor Info Card */}
                {billsDoctor && (
                    <div className="card">
                        <div className="card-body">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-3">
                                    <Users className="h-5 w-5 text-primary-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Doctor Name</p>
                                        <p className="font-semibold">{billsDoctor.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <PhoneCall className="h-5 w-5 text-primary-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-semibold">{billsDoctor.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Award className="h-5 w-5 text-primary-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Qualification</p>
                                        <p className="font-semibold">{billsDoctor.qualification || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <List className="h-5 w-5 text-primary-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Total Bills</p>
                                        <p className="font-semibold">{billsPagination.total}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bills Table */}
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {billsLoading ? (
                                <tr><td colSpan="6" className="text-center py-10">Loading bills...</td></tr>
                            ) : bills.length > 0 ? (
                                bills.map(bill => (
                                    <tr key={bill._id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">{bill.billNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{bill.patient.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">{formatCurrency(bill.finalAmount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                bill.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 
                                                bill.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {bill.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">{new Date(bill.billDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a href={`/billing/${bill._id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                                                <Eye size={18}/>
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-500">No bills found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Bills Pagination */}
                {billsPagination.totalPages > 1 && (
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={() => setBillsPage(p => p - 1)} 
                            disabled={billsPage === 1}
                            className="btn-secondary"
                        >
                            Previous
                        </button>
                        <span>Page {billsPagination.currentPage} of {billsPagination.totalPages}</span>
                        <button 
                            onClick={() => setBillsPage(p => p + 1)} 
                            disabled={billsPage === billsPagination.totalPages}
                            className="btn-secondary"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Users className="mr-3 text-primary-600" /> Referred Doctors Management
                </h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Doctor
                </button>
            </div>

            {/* Search and Filters */}
            <div className="card">
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input 
                                    type="text"
                                    placeholder="Search doctors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-input pl-10 w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18}/>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="form-input pl-10 w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18}/>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="form-input pl-10 w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    setSearchTerm('');
                                }}
                                className="form-input w-full bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 font-medium transition-colors duration-200 flex items-center justify-center"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                            </h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Doctor Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="form-input w-full"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="form-input w-full"
                                    placeholder="10-digit phone number"
                                    pattern="[0-9]{10}"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Qualification
                                </label>
                                <input
                                    type="text"
                                    value={formData.qualification}
                                    onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                                    className="form-input w-full"
                                    placeholder="e.g., MBBS, MD"
                                />
                            </div>
                            
                            <div className="flex space-x-3 pt-4">
                                <button type="submit" className="btn-primary flex-1">
                                    {editingDoctor ? 'Update' : 'Create'}
                                </button>
                                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Doctors Table */}
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualification</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bills</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-10">Loading doctors...</td></tr>
                        ) : error ? (
                            <tr><td colSpan="6" className="text-center py-10 text-red-500">Error: {error.message}</td></tr>
                        ) : doctors.length > 0 ? (
                            doctors.map(doctor => (
                                <tr key={doctor._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{doctor.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{doctor.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{doctor.qualification || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{doctor.totalBillsReferred || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                                        {formatCurrency(doctor.totalReferredAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleViewBills(doctor)}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                                        >
                                            <Eye size={14} className="mr-1"/>
                                            Bills
                                        </button>
                                        <button
                                            onClick={() => handleEdit(doctor)}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 transition-colors duration-200"
                                        >
                                            <Edit size={14} className="mr-1"/>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doctor)}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 transition-colors duration-200"
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center py-10 text-gray-500">No doctors found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center">
                    <button 
                        onClick={() => setCurrentPage(p => p - 1)} 
                        disabled={currentPage === 1}
                        className="btn-secondary"
                    >
                        Previous
                    </button>
                    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(p => p + 1)} 
                        disabled={currentPage === pagination.totalPages}
                        className="btn-secondary"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default DoctorManagement; 