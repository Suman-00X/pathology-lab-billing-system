import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useReport, useBill, useLab } from '../hooks/useApiHooks';
import { FileHeart, Save, Edit, X, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

function ReportDetails() {
    const { billId } = useParams();
    const { report, loading: loadingReport, error, updateReport } = useReport(billId);
    const { bill, loading: loadingBill } = useBill(billId);
    const { lab } = useLab();
    const [results, setResults] = useState([]);
    const [reportDate, setReportDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [originalResults, setOriginalResults] = useState([]);
    const [originalReportDate, setOriginalReportDate] = useState('');
    const [activeTestGroupTab, setActiveTestGroupTab] = useState(0);
    const [groupedResults, setGroupedResults] = useState({});

    // Print functionality
    const handlePrintTestGroup = async () => {
        // Set report date automatically if not already set
        if (!report.reportDate) {
            try {
                const response = await fetch(`/api/reports/bill/${billId}/set-report-date`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setReportDate(new Date(data.reportDate).toISOString().split('T')[0]);
                    setOriginalReportDate(new Date(data.reportDate).toISOString().split('T')[0]);
                    toast.success('Report date set automatically');
                }
            } catch (error) {
                console.error('Error setting report date:', error);
            }
        }
        
        const activeGroup = groupedResults[activeTestGroupTab];
        if (!activeGroup) return;
        
        const printWindow = window.open('', '_blank');
        const printContent = generateTestGroupPrintContent(activeGroup);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>.</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 12px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .logo { max-height: 60px; margin-bottom: 10px; }
                    .lab-name { font-size: 24px; font-weight: bold; margin: 5px 0; }
                    .lab-info { font-size: 12px; color: #666; }
                    .patient-info { margin-bottom: 30px; }
                    .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .label { font-weight: bold; }
                    .tests-table { width: 100%; border-collapse: collapse; margin-top: 15px; page-break-inside: auto; }
                    .tests-table th, .tests-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .tests-table th { background-color: #f5f5f5; }
                    .tests-table tr { page-break-inside: avoid; page-break-after: auto; }
                    .flag-normal { background-color: #d4edda; color: #155724; }
                    .flag-high { background-color: #f8d7da; color: #721c24; }
                    .flag-low { background-color: #d1ecf1; color: #0c5460; }
                    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                    .signature-section { margin-top: 30px; text-align: right; }
                    .signature-line { border-top: 1px solid #333; width: 200px; margin-left: auto; margin-bottom: 5px; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                        .page-break { page-break-before: always; }
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
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 100);
    };

    const generateTestGroupPrintContent = (activeGroup) => {
        const apiBaseUrl = import.meta.env.DEV 
          ? 'http://localhost:5000' 
          : 'https://pathology-lab-billing-system.onrender.com';
        
        // Calculate how many tests per page (approximately 15-20 tests per page)
        const testsPerPage = 15;
        const totalPages = Math.ceil(activeGroup.tests.length / testsPerPage);
        
        let content = `
            <div class="header">
                <div class="lab-info" style="margin-bottom: 10px; text-align: right;">
                    <strong>Bill Number:</strong> ${bill.billNumber}
                </div>
                ${lab?.logo ? `<img src="${apiBaseUrl}${lab.logo}" alt="Lab Logo" class="logo">` : ''}
                <div class="lab-name">${lab?.name || 'Pathology Lab'}</div>
                <div class="lab-info">
                    ${lab?.address ? `${lab.address.street}, ${lab.address.city}, ${lab.address.state} - ${lab.address.pincode}` : ''} | 
                    ${lab?.contactInfo?.phone ? `Phone: ${lab.contactInfo.phone}` : ''}
                    ${lab?.contactInfo?.email ? ` | Email: ${lab.contactInfo.email}` : ''}
                </div>
            </div>

            <div class="patient-info">
                <div class="row"><span class="label">Patient Details:</span> <span>${bill.patient.name} | Age: ${bill.patient.age} years | Gender: ${bill.patient.gender}</span></div>
                <div class="row"><span class="label">Referred Doctor:</span> <span>${bill.referredBy.doctorName}${bill.referredBy.qualification ? ` (${bill.referredBy.qualification})` : ''}</span></div>
                ${bill.referringCustomer ? `<div class="row"><span class="label">Referring Customer:</span> <span>${bill.referringCustomer}</span></div>` : ''}
                <div class="row"><span class="label">Dates:</span> <span>Sample Collection: ${new Date(bill.sampleCollectionDate).toLocaleDateString()} | Sample Received: ${new Date(bill.sampleReceivedDate).toLocaleDateString()} | Report: ${report.reportDate ? new Date(report.reportDate).toLocaleDateString() : 'Pending'}</span></div>
            </div>
        `;

        // Generate test results with pagination
        for (let page = 0; page < totalPages; page++) {
            if (page > 0) {
                content += '<div class="page-break"></div>';
            }
            
            const startIndex = page * testsPerPage;
            const endIndex = Math.min(startIndex + testsPerPage, activeGroup.tests.length);
            const pageTests = activeGroup.tests.slice(startIndex, endIndex);
            
            content += `
                <div class="section">
                    <div class="section-title">${activeGroup.name} - Test Results${totalPages > 1 ? ` (Page ${page + 1} of ${totalPages})` : ''}</div>
                    <div class="row" style="margin-bottom: 10px;">
                        <span class="label">Sample Type:</span> <span>${activeGroup.sampleType || 'N/A'}</span>
                    </div>
                    <div class="row" style="margin-bottom: 15px;">
                        <span class="label">Sample Tested In (Reagent):</span> <span>${activeGroup.sampleTestedIn || 'N/A'}</span>
                    </div>
                    <table class="tests-table">
                        <thead>
                            <tr>
                                <th>Test Name</th>
                                <th>Result</th>
                                <th>Flag</th>
                                <th>Normal Range</th>
                                <th>Units</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pageTests.map(test => `
                                <tr>
                                    <td>${test.test.name}</td>
                                    <td>${test.result || '-'}</td>
                                    <td class="${test.flag === 'High' ? 'flag-high' : test.flag === 'Low' ? 'flag-low' : test.flag === 'Normal' ? 'flag-normal' : ''}">${test.flag || '-'}</td>
                                    <td>${test.test.normalRange || 'N/A'}</td>
                                    <td>${test.test.units || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Add footer with signature on last page
        content += `
            <div class="footer">
                <p>Thank you for choosing our services!</p>
                <p>For any queries, please contact us at ${lab?.contactInfo?.phone || ''}</p>
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <span>Pathologist</span>
                </div>
            </div>
        `;

        return content;
    };

    useEffect(() => {
        if (report && report.results && bill && bill.testGroups) {
            const mappedResults = report.results.map(r => ({ 
                ...r, 
                testId: r.test._id,
                result: r.result || '',
                flag: r.flag || calculateFlag(r.result || '', r.test.normalRange || '')
            }));
            
            // Group results by test groups
            const grouped = {};
            bill.testGroups.forEach((testGroup, index) => {
                const groupTests = mappedResults.filter(result => 
                    testGroup.tests.some(test => test._id === result.testId)
                );
                // Include all test groups from bill, even if they have no results yet
                grouped[testGroup._id] = {
                    name: testGroup.name,
                    tests: groupTests,
                    index: index,
                    totalTests: testGroup.tests.length,
                    sampleType: testGroup.sampleType,
                    sampleTestedIn: testGroup.sampleTestedIn
                };
            });
            
            setGroupedResults(grouped);
            setResults(mappedResults);
            setOriginalResults([...mappedResults]);
            
            // Set active tab to first test group
            const firstGroupId = Object.keys(grouped)[0];
            if (firstGroupId) {
                setActiveTestGroupTab(firstGroupId);
            }
            
            // Set report date if it exists
            const reportDateStr = report.reportDate ? new Date(report.reportDate).toISOString().split('T')[0] : '';
            setReportDate(reportDateStr);
            setOriginalReportDate(reportDateStr);
        }
    }, [report, bill]);

    // Function to calculate flag based on result and normal range
    const calculateFlag = (result, normalRange) => {
        if (!result || !result.toString().trim() || !normalRange) {
            return '';
        }

        const resultStr = result.toString().trim().toLowerCase();
        const normalStr = normalRange.toString().trim().toLowerCase();

        // If result is non-numeric (text), check for common patterns
        if (isNaN(parseFloat(resultStr))) {
            if (resultStr.includes('high') || resultStr.includes('elevated') || resultStr.includes('increased')) {
                return 'High';
            }
            if (resultStr.includes('low') || resultStr.includes('decreased') || resultStr.includes('reduced')) {
                return 'Low';
            }
            if (resultStr.includes('normal') || resultStr.includes('negative') || resultStr.includes('within')) {
                return 'Normal';
            }
            return 'Normal'; // Default for text results
        }

        const resultValue = parseFloat(resultStr);
        
        // Handle different normal range formats
        if (normalRange.includes('-')) {
            // Range format: "10-20", "10.5-20.8", etc.
            const rangeParts = normalStr.split('-').map(part => part.trim());
            if (rangeParts.length === 2) {
                const minValue = parseFloat(rangeParts[0]);
                const maxValue = parseFloat(rangeParts[1]);
                
                if (!isNaN(minValue) && !isNaN(maxValue)) {
                    if (resultValue < minValue) return 'Low';
                    if (resultValue > maxValue) return 'High';
                    return 'Normal';
                }
            }
        } else if (normalStr.includes('upto') || normalStr.includes('up to') || normalStr.includes('<')) {
            // Upper limit format: "upto 10", "< 5.5", etc.
            const match = normalStr.match(/[\d.]+/);
            if (match) {
                const maxValue = parseFloat(match[0]);
                if (!isNaN(maxValue)) {
                    if (resultValue > maxValue) return 'High';
                    return 'Normal';
                }
            }
        } else if (normalStr.includes('>') || normalStr.includes('above')) {
            // Lower limit format: "> 5", "above 10", etc.
            const match = normalStr.match(/[\d.]+/);
            if (match) {
                const minValue = parseFloat(match[0]);
                if (!isNaN(minValue)) {
                    if (resultValue < minValue) return 'Low';
                    return 'Normal';
                }
            }
        } else {
            // Single value or other formats - try to extract number
            const match = normalStr.match(/[\d.]+/);
            if (match) {
                const normalValue = parseFloat(match[0]);
                if (!isNaN(normalValue)) {
                    // If it's exactly equal or very close, consider normal
                    const tolerance = normalValue * 0.1; // 10% tolerance
                    if (Math.abs(resultValue - normalValue) <= tolerance) {
                        return 'Normal';
                    }
                    if (resultValue > normalValue) return 'High';
                    if (resultValue < normalValue) return 'Low';
                }
            }
        }

        return 'Normal'; // Default fallback
    };

    const handleResultChange = (testId, value) => {
        setResults(prev => {
            const updatedResults = prev.map(r => {
                const currentTestId = r.testId || r.test._id;
                if (currentTestId === testId) {
                    const newFlag = calculateFlag(value, r.test.normalRange || '');
                    return { ...r, result: value, flag: newFlag };
                }
                return r;
            });
            
            // Update grouped results as well
            if (bill && bill.testGroups) {
                const grouped = {};
                bill.testGroups.forEach((testGroup, index) => {
                    const groupTests = updatedResults.filter(result => 
                        testGroup.tests.some(test => test._id === result.testId)
                    );
                    grouped[testGroup._id] = {
                        name: testGroup.name,
                        tests: groupTests,
                        index: index,
                        totalTests: testGroup.tests.length,
                        sampleType: testGroup.sampleType,
                        sampleTestedIn: testGroup.sampleTestedIn
                    };
                });
                setGroupedResults(grouped);
            }
            
            return updatedResults;
        });
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setResults([...originalResults]);
        setReportDate(originalReportDate);
        
        // Rebuild grouped results with original data
        if (bill && bill.testGroups) {
            const grouped = {};
            bill.testGroups.forEach((testGroup, index) => {
                const groupTests = originalResults.filter(result => 
                    testGroup.tests.some(test => test._id === result.testId)
                );
                if (groupTests.length > 0) {
                    grouped[testGroup._id] = {
                        name: testGroup.name,
                        tests: groupTests,
                        index: index
                    };
                }
            });
            setGroupedResults(grouped);
        }
        
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Set report date automatically if not already set
            if (!report.reportDate && !reportDate) {
                try {
                    const response = await fetch(`/api/reports/bill/${billId}/set-report-date`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const newReportDate = new Date(data.reportDate).toISOString().split('T')[0];
                        setReportDate(newReportDate);
                        setOriginalReportDate(newReportDate);
                    }
                } catch (error) {
                    console.error('Error setting report date:', error);
                }
            }

            // Update results with calculated flags
            const updatedResults = results.map(r => ({
                test: r.test._id,
                result: r.result || '',
                flag: r.flag || ''
            }));

            // Prepare update data with results and report date
            const updateData = {
                results: updatedResults,
                reportDate: reportDate || null
            };

            const response = await updateReport(report._id, updateData);
            
            // Update local state with the response from server
            if (response && response.report && response.report.results) {
                const updatedMappedResults = response.report.results.map(r => ({ 
                    ...r, 
                    testId: r.test._id,
                    result: r.result || '',
                    flag: r.flag || calculateFlag(r.result || '', r.test.normalRange || '')
                }));
                setResults(updatedMappedResults);
                setOriginalResults([...updatedMappedResults]);
                setOriginalReportDate(reportDate);
                
                // Rebuild grouped results with updated data
                if (bill && bill.testGroups) {
                    const grouped = {};
                    bill.testGroups.forEach((testGroup, index) => {
                        const groupTests = updatedMappedResults.filter(result => 
                            testGroup.tests.some(test => test._id === result.testId)
                        );
                        if (groupTests.length > 0) {
                            grouped[testGroup._id] = {
                                name: testGroup.name,
                                tests: groupTests,
                                index: index
                            };
                        }
                    });
                    setGroupedResults(grouped);
                }
            }
            
            setIsEditing(false);
            toast.success('Report saved successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save report.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loadingReport || loadingBill) return <div className="text-center py-10">Loading Report...</div>;
    if (error) return <div className="text-red-500 text-center py-10">Error: {error.message}</div>;
    if (!report || !bill) return <div className="text-center py-10">Report not found.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FileHeart className="mr-3 text-primary-600" /> Patient Report
                </h1>
                <div className="flex items-center space-x-2">
                    {!isEditing ? (
                        <button 
                            onClick={handleEdit}
                            className="btn-secondary flex items-center"
                        >
                            <Edit size={18} className="mr-2" /> 
                            Edit Report
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={handleCancel}
                                className="btn-secondary flex items-center"
                            >
                                <X size={18} className="mr-2" /> 
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="btn-primary flex items-center"
                            >
                                <Save size={18} className="mr-2" /> 
                                {isSaving ? 'Saving...' : 'Save Report'}
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Patient and Bill Info Header */}
            <div className="card">
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div><strong>Patient:</strong> {bill.patient.name} ({bill.patient.age} / {bill.patient.gender})</div>
                        <div><strong>Bill #:</strong> {bill.billNumber}</div>
                        <div><strong>Referred By:</strong> Dr. {bill.referredBy.doctorName}{bill.referredBy.qualification && `, ${bill.referredBy.qualification}`} {bill.referredBy.phone && `(${bill.referredBy.phone})`}</div>
                    </div>
                    
                    {/* Report Date Section */}
                    <div className="border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div>
                                <label htmlFor="reportDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Report Date
                                </label>
                                <input
                                    type="date"
                                    id="reportDate"
                                    value={reportDate}
                                    onChange={(e) => setReportDate(e.target.value)}
                                    disabled={!isEditing}
                                    className={`form-input w-full md:w-auto ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            <div className="text-sm text-gray-600">
                                <div><strong>Sample Collection:</strong> {new Date(bill.sampleCollectionDate).toLocaleDateString()}</div>
                                <div><strong>Bill Date:</strong> {new Date(bill.billDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Group Tabs */}
            {Object.keys(groupedResults).length > 0 && (
                <div className="card">
                    <div className="card-body">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                            Test Groups ({Object.keys(groupedResults).length})
                        </h4>
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8 overflow-x-auto">
                                {Object.entries(groupedResults).map(([groupId, group]) => (
                                    <button
                                        key={groupId}
                                        onClick={() => setActiveTestGroupTab(groupId)}
                                        className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                                            activeTestGroupTab === groupId
                                                ? 'border-primary-500 text-primary-600 bg-primary-50'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="mr-2">{group.name}</span>
                                        <span className={`py-1 px-2 rounded-full text-xs ${
                                            activeTestGroupTab === groupId
                                                ? 'bg-primary-100 text-primary-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {group.tests.length}/{group.totalTests}
                                        </span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                        {Object.keys(groupedResults).length === 1 && (
                            <div className="mt-3 text-sm text-gray-500">
                                This bill contains {Object.values(groupedResults)[0]?.totalTests} tests from 1 test group 
                                ({Object.values(groupedResults)[0]?.tests.length} with results).
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Test Results Table */}
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                {Object.keys(groupedResults).length > 0 && (
                    <div className="bg-primary-50 px-6 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="text-sm font-medium text-primary-800">
                                    Currently viewing: {groupedResults[activeTestGroupTab]?.name}
                                </span>
                                <span className="ml-2 bg-primary-100 text-primary-700 py-1 px-2 rounded text-xs">
                                    {groupedResults[activeTestGroupTab]?.tests.length}/{groupedResults[activeTestGroupTab]?.totalTests} tests
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                {Object.keys(groupedResults).length > 1 && (
                                    <span className="text-xs text-primary-600">
                                        {Object.keys(groupedResults).indexOf(activeTestGroupTab) + 1} of {Object.keys(groupedResults).length} groups
                                    </span>
                                )}
                                <button
                                    onClick={handlePrintTestGroup}
                                    className="btn-secondary flex items-center text-xs"
                                    title="Print this test group"
                                >
                                    <Printer size={14} className="mr-1" />
                                    Print
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flag</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Normal Range</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                            // Show tests from active test group
                            const testsToShow = groupedResults[activeTestGroupTab]?.tests || results;
                            
                            if (testsToShow.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <span className="text-lg mb-2">📋</span>
                                                <span>No test results available yet for {groupedResults[activeTestGroupTab]?.name}</span>
                                                <span className="text-sm mt-1">Click "Edit Report" to add results</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }
                            
                            return testsToShow.map((res, index) => {
                                const testId = res.testId || res.test._id;
                                return (
                                    <tr key={testId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{res.test.name}</td>
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={res.result || ''}
                                                    onChange={(e) => handleResultChange(testId, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                                                    placeholder="Enter result"
                                                    autoComplete="off"
                                                />
                                            ) : (
                                                <div className="w-full px-3 py-2 text-gray-900 font-medium">
                                                    {res.result || '-'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                res.flag === 'High' ? 'bg-red-100 text-red-800' :
                                                res.flag === 'Low' ? 'bg-blue-100 text-blue-800' :
                                                res.flag === 'Normal' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {res.flag || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{res.test.normalRange || 'Not specified'}</td>
                                        <td className="px-6 py-4 text-gray-600">{res.test.units || 'N/A'}</td>
                                    </tr>
                                );
                            });
                        })()}
                    </tbody>
                </table>
            </div>

            {/* Flag Legend */}
            <div className="card">
                <div className="card-body">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Flag Legend:</h4>
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mr-2">Normal</span>
                            <span className="text-gray-600">Result within normal range</span>
                        </div>
                        <div className="flex items-center">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mr-2">High</span>
                            <span className="text-gray-600">Result above normal range</span>
                        </div>
                        <div className="flex items-center">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">Low</span>
                            <span className="text-gray-600">Result below normal range</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportDetails; 