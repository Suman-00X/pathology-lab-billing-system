import React, { useState, useMemo } from 'react';
import { useBills } from '../../hooks/useApiHooks';
import { Link, useNavigate } from 'react-router-dom';
import { List, FileText, Receipt, Trash2, Search, Filter, SortAsc, SortDesc, Calendar, DollarSign } from 'lucide-react';
import DoctorDropdown from '../../components/DoctorDropdown';
import { useDoctors } from '../../hooks/useApiHooks';

function BillsList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('all');
    const [sortBy, setSortBy] = useState('billDate');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    
    // New filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [amountFilter, setAmountFilter] = useState('');
    const [amountValue, setAmountValue] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    
    const { bills, pagination, loading, error, deleteBill } = useBills({ 
        page: currentPage, 
        search: searchTerm,
        searchBy,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        amountFilter,
        amountValue,
        doctorId: selectedDoctor
    });
    
    // Get doctors list to find selected doctor name
    const { doctors } = useDoctors({ limit: 1000 });
    const selectedDoctorData = useMemo(() => 
        doctors.find(doctor => doctor._id === selectedDoctor), 
        [doctors, selectedDoctor]
    );
    
    const navigate = useNavigate();

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bill and its associated report?')) {
            try {
                await deleteBill(id);
            } catch (err) {
        
            }
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleSearchByChange = (e) => {
        setSearchBy(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setSearchBy('all');
        setSortBy('billDate');
        setSortOrder('desc');
        setStartDate('');
        setEndDate('');
        setAmountFilter('');
        setAmountValue('');
        setSelectedDoctor('');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchTerm || startDate || endDate || amountFilter || selectedDoctor;

    const searchOptions = [
        { value: 'all', label: 'All Fields' },
        { value: 'patientName', label: 'Patient Name' },
        { value: 'patientPhone', label: 'Patient Phone' },
        { value: 'doctorName', label: 'Referring Doctor' },
        { value: 'testGroup', label: 'Test Group' },
        { value: 'address', label: 'Address' }
    ];

    const sortOptions = [
        { value: 'billDate', label: 'Bill Date' },
        { value: 'patientName', label: 'Patient Name' },
        { value: 'doctorName', label: 'Doctor Name' },
        { value: 'finalAmount', label: 'Bill Amount' },
        { value: 'billNumber', label: 'Bill Number' },
        { value: 'paymentStatus', label: 'Payment Status' }
    ];

    const amountFilterOptions = [
        { value: '', label: 'No filter' },
        { value: 'greater', label: 'Greater than' },
        { value: 'less', label: 'Less than' },
        { value: 'equal', label: 'Equal to' }
    ];

    if (error) return <div className="text-red-500 text-center py-10">Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <List className="mr-3 text-primary-600" /> Bills List
                </h1>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 lg:max-w-2xl lg:flex-1 lg:justify-end">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                        <input 
                            type="text"
                            placeholder={`Search by ${searchOptions.find(opt => opt.value === searchBy)?.label.toLowerCase() || 'all fields'}...`}
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    
                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 whitespace-nowrap ${
                            hasActiveFilters ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300'
                        }`}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters {hasActiveFilters && <span className="ml-1 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">●</span>}
                    </button>
                </div>
            </div>

            {/* Filter Summary Banner */}
            {hasActiveFilters && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Active Filters:</span>
                            <div className="flex flex-wrap gap-2">
                                {searchTerm && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        {searchBy !== 'all' ? `${searchOptions.find(opt => opt.value === searchBy)?.label}: ` : 'Search: '}"{searchTerm}"
                                    </span>
                                )}
                                {startDate && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        From: {new Date(startDate).toLocaleDateString()}
                                    </span>
                                )}
                                {endDate && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        To: {new Date(endDate).toLocaleDateString()}
                                    </span>
                                )}
                                {amountFilter && amountValue && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        Amount {amountFilter === 'greater' ? '> ₹' : amountFilter === 'less' ? '< ₹' : '= ₹'}{!isNaN(parseFloat(amountValue)) ? parseFloat(amountValue).toFixed(2) : amountValue}
                                    </span>
                                )}
                                {selectedDoctor && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        Doctor: {selectedDoctorData ? selectedDoctorData.name : 'Selected'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={clearAllFilters}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="mt-2 text-sm text-blue-700">
                        Showing {pagination.total} filtered result{pagination.total !== 1 ? 's' : ''}
                    </div>
                </div>
            )}

            {/* Advanced Filters */}
            {showFilters && (
                <div className="bg-gray-50 p-6 rounded-lg border">
                    {/* Search and Sort Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Search By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search In</label>
                            <select
                                value={searchBy}
                                onChange={handleSearchByChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                {searchOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Sort Order */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => {
                                    setSortOrder(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Advanced Filters</h4>
                        
                        {/* Date Range Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="inline h-4 w-4 mr-1" />
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="inline h-4 w-4 mr-1" />
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>

                        {/* Amount Filter Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <DollarSign className="inline h-4 w-4 mr-1" />
                                    Amount Filter
                                </label>
                                <select
                                    value={amountFilter}
                                    onChange={(e) => {
                                        setAmountFilter(e.target.value);
                                        setCurrentPage(1);
                                        if (!e.target.value) {
                                            setAmountValue(''); // Clear amount value when no filter
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    {amountFilterOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount Value (₹)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter amount..."
                                    value={amountValue}
                                    onChange={(e) => {
                                        setAmountValue(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    disabled={!amountFilter}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Doctor Filter Row */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Referring Doctor
                            </label>
                            <DoctorDropdown
                                value={selectedDoctor}
                                onChange={(doctorId) => {
                                    setSelectedDoctor(doctorId);
                                    setCurrentPage(1);
                                }}
                                placeholder="Select a doctor to filter..."
                                className="w-full"
                            />
                        </div>

                        {/* Clear Filters */}
                        <div className="flex justify-end">
                            <button
                                onClick={clearAllFilters}
                                disabled={!hasActiveFilters}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto text-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSortChange('patientName')}
                            >
                                <div className="flex items-center">
                                    Patient
                                    {sortBy === 'patientName' && (
                                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSortChange('doctorName')}
                            >
                                <div className="flex items-center">
                                    Referred By
                                    {sortBy === 'doctorName' && (
                                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSortChange('finalAmount')}
                            >
                                <div className="flex items-center">
                                    Amount
                                    {sortBy === 'finalAmount' && (
                                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSortChange('paymentStatus')}
                            >
                                <div className="flex items-center">
                                    Payment Status
                                    {sortBy === 'paymentStatus' && (
                                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSortChange('billDate')}
                            >
                                <div className="flex items-center">
                                    Date
                                    {sortBy === 'billDate' && (
                                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-10">Loading...</td></tr>
                        ) : bills.length > 0 ? (
                            bills.map(bill => (
                                <tr key={bill._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{bill.patient.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-gray-900">{bill.referredBy.doctorName}</div>
                                            {bill.referredBy.phone && (
                                                <div className="text-xs text-gray-500">{bill.referredBy.phone}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">₹{bill.finalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            bill.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 
                                            bill.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {bill.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-xs">{new Date(bill.billDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                                        <button 
                                            onClick={() => navigate(`/reports/bill/${bill._id}`)} 
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                                        >
                                            <FileText size={14} className="mr-1"/>
                                            Report
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/billing/${bill._id}`)} 
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 transition-colors duration-200"
                                        >
                                            <Receipt size={14} className="mr-1"/>
                                            Bill
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(bill._id)} 
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 transition-colors duration-200"
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center py-10 text-gray-500">
                                {searchTerm ? 'No bills found matching your search.' : 'No bills found.'}
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total} bills
                    </div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setCurrentPage(p => p - 1)} 
                            disabled={currentPage === 1}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-700">
                            Page {currentPage} of {pagination.totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(p => p + 1)} 
                            disabled={currentPage === pagination.totalPages}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BillsList; 