import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBill } from '../../hooks/useApiHooks';
import { FileText, User, Stethoscope, Calendar, IndianRupee, Printer, Edit, Trash2, FileHeart } from 'lucide-react';

const InfoCard = ({ title, children, className }) => (
    <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">{title}</h3>
        <div className="space-y-2">{children}</div>
    </div>
);

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-gray-600">{label}:</span>
        <span className="font-medium text-gray-900">{value}</span>
    </div>
);

function BillDetails() {
    const { id } = useParams();
    const { bill, loading, error } = useBill(id);
    const navigate = useNavigate();

    if (loading) return <div className="text-center py-10">Loading Bill Details...</div>;
    if (error) return <div className="text-red-500 text-center py-10">Error: {error.message}</div>;
    if (!bill) return <div className="text-center py-10">Bill not found.</div>;



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Bill Details</h1>
                    <p className="font-mono text-gray-500">Bill #{bill.billNumber}</p>
                </div>
                <div className="flex space-x-2">
                    <Link to={`/billing/edit/${bill._id}`} className="btn-secondary">
                        <Edit size={18} className="mr-2" /> Edit
                    </Link>
                    <Link to={`/reports/bill/${bill._id}`} className="btn-primary">
                        <FileHeart size={18} className="mr-2" /> View Report
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <InfoCard title="Patient Information">
                        <InfoRow label="Name" value={bill.patient.name} />
                        <InfoRow label="Age" value={`${bill.patient.age} years`} />
                        <InfoRow label="Gender" value={bill.patient.gender} />
                        <InfoRow label="Phone" value={bill.patient.phone} />
                        <InfoRow label="Address" value={`${bill.patient.address.street}, ${bill.patient.address.city}, ${bill.patient.address.state} - ${bill.patient.address.pincode}`} />
                    </InfoCard>
                    <InfoCard title="Referring Doctor">
                        <InfoRow label="Name" value={bill.referredBy.doctorName} />
                        <InfoRow label="Qualification" value={bill.referredBy.qualification || 'N/A'} />
                        <InfoRow label="Phone" value={bill.referredBy.phone || 'N/A'} />
                    </InfoCard>
                </div>

                <div className="space-y-6">
                    <InfoCard title="Billing Summary">
                        <InfoRow label="Total Amount" value={`₹${bill.totalAmount.toFixed(2)}`} />
                        <InfoRow label="Discount" value={`- ₹${bill.discount.toFixed(2)}`} />
                        <hr />
                        <InfoRow label="Final Amount" value={`₹${bill.finalAmount.toFixed(2)}`} />
                        <InfoRow label="Paid Amount" value={`₹${bill.paidAmount.toFixed(2)}`} />
                        <InfoRow label="Due Amount" value={`₹${(bill.dues !== undefined ? bill.dues : (bill.finalAmount - bill.paidAmount)).toFixed(2)}`} />
                        <div className="pt-2">
                             <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                bill.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                bill.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {bill.paymentStatus}
                            </span>
                        </div>
                    </InfoCard>
                    <InfoCard title="Dates">
                        <InfoRow label="Bill Date" value={new Date(bill.billDate).toLocaleDateString()} />
                        <InfoRow label="Sample Collection" value={new Date(bill.sampleCollectionDate).toLocaleDateString()} />
                        <InfoRow label="Report Date" value={bill.reportDate ? new Date(bill.reportDate).toLocaleDateString() : 'Pending'} />
                    </InfoCard>
                </div>
            </div>
            
            <InfoCard title="Selected Test Groups">
                <ul className="divide-y divide-gray-200">
                    {bill.testGroups.map(group => (
                        <li key={group._id} className="py-3 flex justify-between items-center">
                            <span className="font-medium text-gray-800">{group.name}</span>
                            <span className="font-semibold text-gray-900">₹{group.price.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </InfoCard>
        </div>
    );
}

export default BillDetails; 