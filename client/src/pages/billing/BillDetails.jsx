import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBill, useLab } from '../../hooks/useApiHooks';
import { FileText, User, Stethoscope, Calendar, IndianRupee, Printer, Edit, Trash2, FileHeart } from 'lucide-react';
import QRCode from 'qrcode';

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

    // Generate bill information for QR code
    const generateBillInfoForQRCode = () => {
        if (!bill) return '';
        
        const billInfo = {
            billId: bill._id,
            billNumber: bill.billNumber,
            patientName: bill.patient.name,
            patientAge: bill.patient.age,
            patientGender: bill.patient.gender,
            patientPhone: bill.patient.phone,
            doctorName: bill.referredBy.doctorName,
            doctorQualification: bill.referredBy.qualification,
            billDate: new Date(bill.billDate).toISOString().split('T')[0],
            sampleCollectionDate: new Date(bill.sampleCollectionDate).toISOString().split('T')[0],
            sampleReceivedDate: new Date(bill.sampleReceivedDate).toISOString().split('T')[0],
            totalAmount: bill.totalAmount,
            finalAmount: bill.finalAmount,
            paymentStatus: bill.paymentStatus,
            totalTestGroups: bill.testGroups.length,
            labName: lab?.name || 'Pathology Lab'
        };
        
        return JSON.stringify(billInfo);
    };

    // Generate QR code
    const generateQRCode = async (data) => {
        try {
            const qrDataURL = await QRCode.toDataURL(data, {
                width: 120,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            return qrDataURL;
        } catch (error) {
            console.error('Error generating QR code:', error);
            return null;
        }
    };

    if (loading) return <div className="text-center py-10">Loading Bill Details...</div>;
    if (error) return <div className="text-red-500 text-center py-10">Error: {error.message}</div>;
    if (!bill) return <div className="text-center py-10">Bill not found.</div>;

    const handlePrint = async () => {
        // Generate QR code data
        const qrData = generateBillInfoForQRCode();
        const qrCodeImage = await generateQRCode(qrData);
        
        const printWindow = window.open('', '_blank');
        const printContent = generatePrintContent(qrCodeImage);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill #${bill.billNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 60%; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; position: relative; }
                    .bill-number { position: absolute; top: 0; right: 0; font-size: 10.8px; font-weight: bold; }
                    .logo { max-height: 36px; margin-bottom: 6px; }
                    .lab-name { font-size: 14.4px; font-weight: bold; margin: 3px 0; }
                    .lab-info { font-size: 7.2px; color: #666; }
                    .bill-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .patient-info, .doctor-info { flex: 1; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-size: 10.8px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .label { font-weight: bold; }
                    .tests-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    .tests-table th, .tests-table td { border: 1px solid #ddd; padding: 4.8px; text-align: left; }
                    .tests-table th { background-color: #f5f5f5; }
                    .total-section { margin-top: 20px; border-top: 2px solid #333; padding-top: 15px; }
                    .total-row { font-weight: bold; font-size: 9.6px; }
                    .status { padding: 3px 6px; border-radius: 9px; font-size: 7.2px; font-weight: bold; }
                    .status-paid { background-color: #d4edda; color: #155724; }
                    .status-partial { background-color: #fff3cd; color: #856404; }
                    .status-pending { background-color: #f8d7da; color: #721c24; }
                    .payment-method { font-size: 7.2px; font-weight: 500; color: #374151; }
                    .footer { margin-top: 40px; text-align: center; font-size: 7.2px; color: #666; }
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

    const generatePrintContent = (qrCodeImage) => {
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
                <div class="lab-info" style="margin-top: 10px;">
                    <strong>Bill Date:</strong> ${new Date(bill.billDate).toLocaleDateString()} | 
                    <strong>Sample Collection:</strong> ${new Date(bill.sampleCollectionDate).toLocaleDateString()}
                </div>
            </div>

            <div class="bill-info" style="display: flex; gap: 20px; margin-bottom: 30px;">
                <div class="patient-info" style="flex: 1; border: 2px solid #333; padding: 15px; border-radius: 8px; background-color: #f9f9f9;">
                    <div class="section-title">Patient Information</div>
                    <div class="row"><span class="label">Patient Details:</span> <span>${bill.patient.name} | Age: ${bill.patient.age} years | Gender: ${bill.patient.gender}</span></div>
                    <div class="row"><span class="label">Contact Details:</span> <span>Phone: ${bill.patient.phone} | Address: ${bill.patient.address}</span></div>
                    <div class="row"><span class="label">Referred Doctor:</span> <span>${bill.referredBy.doctorName}${bill.referredBy.qualification ? ` (${bill.referredBy.qualification})` : ''}</span></div>
                </div>
                <div class="qr-code-space" style="flex: 0 0 150px; border: 2px solid #333; padding: 15px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background-color: #ffffff;">
                    <div style="text-align: center;">
                        ${qrCodeImage ? `
                            <img src="${qrCodeImage}" alt="Bill QR Code" style="max-width: 100%; height: auto; margin-bottom: 5px;" />
                        ` : `
                            <div style="width: 120px; height: 120px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
                                <div style="color: #666; font-size: 12px;">QR Code</div>
                            </div>
                        `}
                        <div style="font-size: 8px; color: #333; margin-top: 5px;">Bill ID: ${bill._id.slice(-8)}</div>
                    </div>
                </div>
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
                <div class="row">
                    <span class="label">Payment Method:</span> 
                    <span class="payment-method">${bill.isPaymentModeEnabled ? 'Payment Modes' : 'Direct Payment'}</span>
                </div>
            </div>

            <div class="footer">
                <p>Thank you for choosing our services!</p>
                <p>For any queries, please contact us at ${lab?.contactInfo?.phone || ''}</p>
                <div style="margin-top: 20px; text-align: right;">
                    <div style="border-top: 1px solid #333; width: 150px; margin-left: auto; margin-bottom: 5px;"></div>
                    <span style="font-size: 7.2px;">Biller</span>
                </div>
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
                        <InfoRow label="Address" value={bill.patient.address} />
                    </InfoCard>
                    <InfoCard title="Referring Doctor">
                        <InfoRow label="Name" value={bill.referredBy.doctorName} />
                        <InfoRow label="Qualification" value={bill.referredBy.qualification || 'N/A'} />
                        <InfoRow label="Phone" value={bill.referredBy.phone || 'N/A'} />
                        {bill.referringCustomer && <InfoRow label="Referring Customer" value={bill.referringCustomer} />}
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
                        <div className="pt-2 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                    bill.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                    bill.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {bill.paymentStatus}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                    bill.isPaymentModeEnabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {bill.isPaymentModeEnabled ? 'Payment Modes' : 'Direct Payment'}
                                </span>
                            </div>
                        </div>
                    </InfoCard>
                    <InfoCard title="Dates">
                        <InfoRow label="Bill Date" value={new Date(bill.billDate).toLocaleDateString()} />
                        <InfoRow label="Sample Collection" value={new Date(bill.sampleCollectionDate).toLocaleDateString()} />
                        <InfoRow label="Sample Received" value={new Date(bill.sampleReceivedDate).toLocaleDateString()} />
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