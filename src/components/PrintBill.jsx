import React from 'react';
import { useAuth } from '../context/AuthContext';

const PrintBill = ({ visitData, onClose }) => {
    const { user } = useAuth();
    
    const handlePrint = () => {
        window.print();
    };

    if (!visitData) return null;

    return (
        <>
            {/* Print-only content */}
            <div className="print-bill hidden print:block">
                <div className="bill-content p-2">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-1/2">
                            <h2 className="text-base font-bold uppercase mb-1">INVOICE</h2>
                            <div className="text-xs leading-tight space-y-0">
                                <p className="mb-0"><span className="font-semibold">Name:</span> {visitData.patient_name}</p>
                                <p className="mb-0"><span className="font-semibold">Payment:</span> {visitData.pay_type}</p>
                                <p className="mb-0"><span className="font-semibold">Date:</span> {new Date(visitData.visit_date).toLocaleString()}</p>
                                <p className="mb-0"><span className="font-semibold">Doctor:</span> {visitData.doctor_name}</p>
                            </div>
                        </div>
                        <div className="w-1/2 text-right">
                            <p className="font-bold text-xs mb-1">PATIENT COPY</p>
                            <div className="text-xs leading-tight space-y-0">
                                <p className="mb-0"><span className="font-semibold">ID:</span> {visitData.patient_id || 'N/A'}</p>
                                <p className="mb-0"><span className="font-semibold">Age/Sex:</span> {visitData.patient_age || 'N/A'}/{visitData.patient_gender || 'N/A'}</p>
                                <p className="mb-0"><span className="font-semibold">Phone:</span> {visitData.patient_phone}</p>
                                <p className="mb-0"><span className="font-semibold">Invoice:</span> {visitData.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-xs mb-2">
                        <thead>
                            <tr className="border-t border-b">
                                <th className="text-left py-1 px-1">SN</th>
                                <th className="text-left py-1 px-1">Particulars</th>
                                <th className="text-right py-1 px-1">Rate</th>
                                <th className="text-right py-1 px-1">Qty</th>
                                <th className="text-right py-1 px-1">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                let sn = 1;
                                const rows = [];

                                if (visitData.registration_charge && parseFloat(visitData.registration_charge) > 0) {
                                    rows.push(
                                        <tr key="reg">
                                            <td className="py-1 px-1">{sn++}</td>
                                            <td className="py-1 px-1">{visitData.registration_desc || 'Registration Charge'}</td>
                                            <td className="text-right py-1 px-1">Rs. {parseFloat(visitData.registration_charge).toFixed(2)}</td>
                                            <td className="text-right py-1 px-1">1.00</td>
                                            <td className="text-right py-1 px-1">Rs. {parseFloat(visitData.registration_charge).toFixed(2)}</td>
                                        </tr>
                                    );
                                }

                                if (visitData.opd_charge && parseFloat(visitData.opd_charge) > 0) {
                                    rows.push(
                                        <tr key="opd">
                                            <td className="py-1 px-1">{sn++}</td>
                                            <td className="py-1 px-1">{visitData.opd_desc || 'OPD Charge'}</td>
                                            <td className="text-right py-1 px-1">Rs. {parseFloat(visitData.opd_charge).toFixed(2)}</td>
                                            <td className="text-right py-1 px-1">1.00</td>
                                            <td className="text-right py-1 px-1">Rs. {parseFloat(visitData.opd_charge).toFixed(2)}</td>
                                        </tr>
                                    );
                                }

                                if (visitData.investigations && visitData.investigations.length > 0) {
                                    visitData.investigations.forEach((test, index) => {
                                        rows.push(
                                            <tr key={`inv-${index}`}>
                                                <td className="py-1 px-1">{sn++}</td>
                                                <td className="py-1 px-1">{test.test_name}</td>
                                                <td className="text-right py-1 px-1">Rs. {parseFloat(test.rate).toFixed(2)}</td>
                                                <td className="text-right py-1 px-1">{parseFloat(test.quantity).toFixed(2)}</td>
                                                <td className="text-right py-1 px-1">Rs. {(parseFloat(test.rate) * parseFloat(test.quantity)).toFixed(2)}</td>
                                            </tr>
                                        );
                                    });
                                }

                                return rows;
                            })()}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="text-right mb-2">
                        <p className="text-sm font-bold border-t-2 border-black pt-1">Grand Total: Rs. {parseFloat(visitData.total_amount).toFixed(2)}</p>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-black pt-1 text-xs leading-tight">
                        {visitData.notes && <p className="italic mb-1">*{visitData.notes}*</p>}
                        <p className="mb-0"><span className="font-semibold">Bill by:</span> {user?.name || 'Staff'}</p>
                        <p className="mb-0"><span className="font-semibold">Print:</span> {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* screen modal */}
            <div className="print:hidden fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 border-2 border-gray-300">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Print Bill</h2>
                        <div className="bg-blue-50 p-4 rounded mb-4 border border-blue-200">
                            <p className="text-sm mb-2"><strong>Bill No:</strong> #{visitData.id}</p>
                            <p className="text-sm mb-2"><strong>Patient:</strong> {visitData.patient_name}</p>
                            <p className="text-sm mb-2"><strong>Visit Type:</strong> {visitData.visit_type}</p>
                            <p className="text-sm mb-2"><strong>Total Amount:</strong> Rs. {visitData.total_amount}</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handlePrint}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
                            >
                                🖨️ Print Bill
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx>{`
  @media print {
    @page {
      size: A5;
      margin-top: 3cm;
      margin-right: 14mm;
      margin-bottom: 8mm;
      margin-left: 14mm;
      
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
    }

    body * {
      visibility: hidden;
    }

    .print-bill,
    .print-bill * {
      visibility: visible;
    }

    .print-bill {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      background: white;
    }

    .bill-content {
      font-family: Arial, sans-serif;
      color: black;
      font-size: 10px;
      line-height: 1.3;
    }
  }
`}</style>

        </>
    );
};

export default PrintBill;
