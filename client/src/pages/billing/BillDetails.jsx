import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBill, useLab } from '../../hooks/useApiHooks';
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
    const { lab } = useLab();
    const navigate = useNavigate();

    if (loading) return <div className="text-center py-10">Loading Bill Details...</div>;
    if (error) return <div className="text-red-500 text-center py-10">Error: {error.message}</div>;
    if (!bill) return <div className="text-center py-10">Bill not found.</div>;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const printContent = generatePrintContent();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill #${bill.billNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .logo { max-height: 60px; margin-bottom: 10px; }
                    .lab-name { font-size: 24px; font-weight: bold; margin: 5px 0; }
                    .lab-info { font-size: 12px; color: #666; }
                    .bill-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .patient-info, .doctor-info { flex: 1; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .label { font-weight: bold; }
                    .tests-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    .tests-table th, .tests-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .tests-table th { background-color: #f5f5f5; }
                    .total-section { margin-top: 20px; border-top: 2px solid #333; padding-top: 15px; }
                    .total-row { font-weight: bold; font-size: 16px; }
                    .status { padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
                    .status-paid { background-color: #d4edda; color: #155724; }
                    .status-partial { background-color: #fff3cd; color: #856404; }
                    .status-pending { background-color: #f8d7da; color: #721c24; }
                    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const generatePrintContent = () => {
        const apiBaseUrl = import.meta.env.DEV 
          ? 'http://localhost:5000' 
          : 'https://pathology-lab-billing-system.onrender.com';
        
        return `
            <div class="header">
                ${lab?.logo ? `<img src="${apiBaseUrl}${lab.logo}" alt="Lab Logo" class="logo">` : ''}
                <div class="lab-name">${lab?.name || 'Pathology Lab'}</div>
                <div class="lab-info">
                    ${lab?.address ? `${lab.address.street}, ${lab.address.city}, ${lab.address.state} - ${lab.address.pincode}` : ''}<br>
                    ${lab?.contactInfo?.phone ? `Phone: ${lab.contactInfo.phone}` : ''}
                    ${lab?.contactInfo?.email ? ` | Email: ${lab.contactInfo.email}` : ''}
                </div>
            </div>

            <div class="bill-info">
                <div class="patient-info">
                    <div class="section-title">Patient Information</div>
                    <div class="row"><span class="label">Name:</span> <span>${bill.patient.name}</span></div>
                    <div class="row"><span class="label">Age:</span> <span>${bill.patient.age} years</span></div>
                    <div class="row"><span class="label">Gender:</span> <span>${bill.patient.gender}</span></div>
                    <div class="row"><span class="label">Phone:</span> <span>${bill.patient.phone}</span></div>
                    <div class="row"><span class="label">Address:</span> <span>${bill.patient.address.street}, ${bill.patient.address.city}, ${bill.patient.address.state} - ${bill.patient.address.pincode}</span></div>
                </div>
                <div class="doctor-info">
                    <div class="section-title">Referring Doctor</div>
                    <div class="row"><span class="label">Name:</span> <span>${bill.referredBy.doctorName}</span></div>
                    <div class="row"><span class="label">Qualification:</span> <span>${bill.referredBy.qualification || 'N/A'}</span></div>
                    <div class="row"><span class="label">Phone:</span> <span>${bill.referredBy.phone || 'N/A'}</span></div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Bill Information</div>
                <div class="row"><span class="label">Bill Number:</span> <span>${bill.billNumber}</span></div>
                <div class="row"><span class="label">Bill Date:</span> <span>${new Date(bill.billDate).toLocaleDateString()}</span></div>
                <div class="row"><span class="label">Sample Collection:</span> <span>${new Date(bill.sampleCollectionDate).toLocaleDateString()}</span></div>
                <div class="row"><span class="label">Report Date:</span> <span>${bill.reportDate ? new Date(bill.reportDate).toLocaleDateString() : 'Pending'}</span></div>
            </div>

            <div class="section">
                <div class="section-title">Test Groups</div>
                <table class="tests-table">
                    <thead>
                        <tr>
                            <th>Test Group</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bill.testGroups.map(group => `
                            <tr>
                                <td>${group.name}</td>
                                <td>₹${group.price.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="total-section">
                <div class="row"><span class="label">Total Amount:</span> <span>₹${bill.totalAmount.toFixed(2)}</span></div>
                ${bill.taxAmount > 0 ? `<div class="row"><span class="label">Tax:</span> <span>₹${bill.taxAmount.toFixed(2)}</span></div>` : ''}
                <div class="row"><span class="label">Total with Tax:</span> <span>₹${bill.totalWithTax.toFixed(2)}</span></div>
                ${bill.discount > 0 ? `<div class="row"><span class="label">Discount:</span> <span>- ₹${bill.discount.toFixed(2)}</span></div>` : ''}
                <div class="row total-row"><span class="label">Final Amount:</span> <span>₹${bill.finalAmount.toFixed(2)}</span></div>
                <div class="row"><span class="label">Paid Amount:</span> <span>₹${bill.paidAmount.toFixed(2)}</span></div>
                <div class="row"><span class="label">Due Amount:</span> <span>₹${(bill.dues !== undefined ? bill.dues : (bill.finalAmount - bill.paidAmount)).toFixed(2)}</span></div>
                <div class="row">
                    <span class="label">Payment Status:</span> 
                    <span class="status ${bill.paymentStatus === 'Paid' ? 'status-paid' : bill.paymentStatus === 'Partially Paid' ? 'status-partial' : 'status-pending'}">${bill.paymentStatus}</span>
                </div>
            </div>

            <div class="footer">
                <p>Thank you for choosing our services!</p>
                <p>For any queries, please contact us at ${lab?.contactInfo?.phone || ''}</p>
            </div>
        `;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Bill Details</h1>
                    <p className="font-mono text-gray-500">Bill #{bill.billNumber}</p>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={handlePrint}
                        className="btn-secondary"
                    >
                        <Printer size={18} className="mr-2" /> Print Bill
                    </button>
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