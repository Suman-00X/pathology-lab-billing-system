import React, { useState } from 'react';
import { useBills } from '../../hooks/useApiHooks';
import { Link, useNavigate } from 'react-router-dom';
import { List, FileText, Receipt, Trash2, Search } from 'lucide-react';

function BillsList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { bills, pagination, loading, error, deleteBill } = useBills({ page: currentPage, search: searchTerm });
    const navigate = useNavigate();

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bill and its associated report?')) {
            try {
                await deleteBill(id);
            } catch (err) {
        
            }
        }
    };

    if (error) return <div className="text-red-500 text-center py-10">Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <List className="mr-3 text-primary-600" /> Bills List
                </h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                    <input 
                        type="text"
                        placeholder="Search by patient, doctor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg"
                    />
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-10">Loading...</td></tr>
                        ) : bills.length > 0 ? (
                            bills.map(bill => (
                                <tr key={bill._id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">{bill.billNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{bill.patient.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{bill.referredBy.doctorName}</td>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">{new Date(bill.billDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
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
                            <tr><td colSpan="7" className="text-center py-10 text-gray-500">No bills found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
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

export default BillsList; 