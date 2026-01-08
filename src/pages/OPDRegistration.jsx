import { useState, useEffect } from "react";
import api from "../utils/api";
import PatientSearch from "../components/Forms/PatientSearch";
import PrintBill from "../components/PrintBill";
import InvestigationSelector from "../components/Forms/InvestigationSelector";

const OPDRegistration = () => {
    const [patient, setPatient] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        department_id: "",
        doctor_id: "",
        visit_date: new Date().toISOString().split('T')[0],
        pay_type: "Cash",
        registration_charge: 100,
        registration_desc: "Registration Fee",
        opd_charge: 0,
        opd_desc: "Consultation",
        notes: ""
    });
    const [selectedInvestigations, setSelectedInvestigations] = useState([]);
    const [message, setMessage] = useState(null);
    const [showPrintBill, setShowPrintBill] = useState(false);
    const [lastVisit, setLastVisit] = useState(null);

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await api.get("/departments/list.php");
                setDepartments(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to load departments");
            }
        };
        fetchDepts();
    }, []);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const url = formData.department_id 
                    ? `/doctors/list.php?department_id=${formData.department_id}`
                    : '/doctors/list.php';
                const res = await api.get(url);
                setDoctors(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setDoctors([]);
            }
        };
        fetchDocs();
    }, [formData.department_id]);

    const handleDepartmentChange = (e) => {
        const newDeptId = e.target.value;
        setFormData(prev => ({
            ...prev,
            department_id: newDeptId,
            doctor_id: ""
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!patient) return alert("Please select a patient");

        try {
            const investigationTotal = selectedInvestigations.reduce(
                (sum, test) => sum + (test.rate * test.quantity), 0
            );
            
            const payload = {
                ...formData,
                patient_id: patient.id,
                investigations: selectedInvestigations
            };
            const res = await api.post("/opd/register.php", payload);
            
            // Store visit data for printing
            setLastVisit({
                id: res.data.visit_id,
                visit_date: formData.visit_date,
                visit_type: 'OPD',
                patient_name: `${patient.first_name} ${patient.last_name}`,
                patient_phone: patient.phone,
                patient_age: patient.age,
                patient_gender: patient.gender,
                doctor_name: doctors.find(d => d.id == formData.doctor_id)?.name,
                department_name: departments.find(d => d.id == formData.department_id)?.name,
                registration_charge: formData.registration_charge,
                registration_desc: formData.registration_desc,
                opd_charge: formData.opd_charge,
                opd_desc: formData.opd_desc,
                investigations: selectedInvestigations,
                total_amount: parseInt(formData.registration_charge) + parseInt(formData.opd_charge) + investigationTotal,
                pay_type: formData.pay_type,
                notes: formData.notes
            });
            
            setMessage({ type: "success", text: `OPD Ticket Generated! Visit ID: ${res.data.visit_id}` });
            setFormData({
                department_id: "",
                doctor_id: "",
                visit_date: new Date().toISOString().split('T')[0],
                pay_type: "Cash",
                registration_charge: 100,
                registration_desc: "Registration Fee",
                opd_charge: 0,
                opd_desc: "Consultation",
                notes: ""
            });
            setSelectedInvestigations([]);
            setPatient(null);
        } catch (err) {
            setMessage({ type: "error", text: "Registration Failed" });
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">OPD Registration</h1>
            
            {message && (
                <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    <div className="flex justify-between items-center">
                        <span>{message.text}</span>
                        {message.type === 'success' && lastVisit && (
                            <button
                                onClick={() => setShowPrintBill(true)}
                                className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-semibold"
                            >
                                Print Bill
                            </button>
                        )}
                    </div>
                </div>
            )}

            {showPrintBill && lastVisit && (
                <PrintBill 
                    visitData={lastVisit} 
                    onClose={() => setShowPrintBill(false)} 
                />
            )}

            <form onSubmit={handleSubmit} className="max-w-3xl">
                <div className="bg-white p-2 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2 border-b ">Patient Details</h2>
                    <PatientSearch onSelect={setPatient} />
                    
                    {patient && (
                         <div className=" flex gap-14 bg-blue-50 p-4 rounded text-sm">
                            <p><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
                            <p><strong>Age/Sex:</strong> {patient.age} / {patient.gender}</p>
                            <p><strong>Phone:</strong> {patient.phone}</p>
                            <p><strong>Address:</strong> {patient.address}</p>
                        </div>
                    )}
                </div>

                <div className="bg-white p-2 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Visit Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department (Optional)</label>
                            <select 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
                                value={formData.department_id}
                                onChange={handleDepartmentChange}
                            >
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Doctor</label>
                            <select 
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
                                value={formData.doctor_id}
                                onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Visit Date</label>
                            <input 
                                type="date"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
                                value={formData.visit_date}
                                onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Payment Type</label>
                            <select 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
                                value={formData.pay_type}
                                onChange={(e) => setFormData({...formData, pay_type: e.target.value})}
                            >
                                <option>Cash</option>
                                <option>Card</option>
                                <option>Online</option>
                                <option>Insurance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <input 
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1"
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-2 rounded shadow">
                     <h2 className="text-lg font-semibold mb-4 border-b pb-2">Charges</h2>
                     <div className="space-y-4">
                        {/* Registration Charge */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reg. Charge</label>
                                <input 
                                    type="number" 
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-1" 
                                    value={formData.registration_charge}
                                    onChange={(e) => setFormData(prev => ({...prev, registration_charge: e.target.value}))}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <input 
                                    type="text" 
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-1" 
                                    value={formData.registration_desc}
                                    onChange={(e) => setFormData(prev => ({...prev, registration_desc: e.target.value}))}
                                    placeholder="e.g., Registration Fee"
                                />
                            </div>
                        </div>

                        {/* OPD Charge */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">OPD Charge</label>
                                <input 
                                    type="number" 
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-1" 
                                    value={formData.opd_charge}
                                    onChange={(e) => setFormData(prev => ({...prev, opd_charge: e.target.value}))}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <input 
                                    type="text" 
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-1" 
                                    value={formData.opd_desc}
                                    onChange={(e) => setFormData(prev => ({...prev, opd_desc: e.target.value}))}
                                    placeholder="e.g., Consultation, Blood Test, X-Ray"
                                />
                            </div>
                        </div>

                        {/* Investigation Tests */}
                        <div className="col-span-full">
                            <InvestigationSelector 
                                selectedTests={selectedInvestigations}
                                onTestsChange={setSelectedInvestigations}
                            />
                        </div>

                        {/* Total */}
                        <div className="border-t pt-4 col-span-full">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Registration:</span>
                                    <span>NPR {formData.registration_charge}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>OPD Charge:</span>
                                    <span>NPR {formData.opd_charge}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Investigations:</span>
                                    <span>NPR {selectedInvestigations.reduce((sum, t) => sum + (t.rate * t.quantity), 0)}</span>
                                </div>
                                <div className="flex justify-between items-center border-t pt-2">
                                    <label className="text-lg font-bold text-gray-700">Total Amount</label>
                                    <span className="text-2xl font-bold text-green-600">
                                        NPR {parseInt(formData.registration_charge) + parseInt(formData.opd_charge) + selectedInvestigations.reduce((sum, t) => sum + (t.rate * t.quantity), 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>

                <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded hover:bg-green-700 transition">
                    Confirm Registration
                </button>
            </form>
        </div>
    );
};

export default OPDRegistration;
