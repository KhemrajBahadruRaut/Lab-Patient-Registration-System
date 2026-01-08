import { useState, useEffect } from "react";
import api from "../utils/api";
import PatientSearch from "../components/Forms/PatientSearch";

import InvestigationSelector from "../components/Forms/InvestigationSelector";

const FollowUp = () => {
    const [patient, setPatient] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        department_id: "",
        doctor_id: "",
        visit_date: new Date().toISOString().split('T')[0],
        pay_type: "Cash",
        notes: ""
    });
    const [selectedInvestigations, setSelectedInvestigations] = useState([]);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        // Load departments for the dropdown
        const fetchDepts = async () => {
            try {
                const res = await api.get("/departments/list.php");
                setDepartments(res.data);
            } catch (err) {
                console.error("Failed to load departments");
            }
        };
        fetchDepts();
    }, []);

    // Load Last Visit info when patient changes
    useEffect(() => {
        if (patient) {
            
            const fetchLastVisit = async () => {
                try {
                    const res = await api.get(`/visits/last.php?patient_id=${patient.id}`);
                    if (res.data) {
                        setFormData(prev => ({
                            ...prev,
                            department_id: res.data.department_id,
                            doctor_id: res.data.doctor_id,
                            notes: "Follow-up for: " + (res.data.notes || "Previous Visit")
                            
                        }));
                    } else {
                        // No previous visit, reset or leave blank
                        setFormData(prev => ({ ...prev, department_id: "", doctor_id: "", notes: "" }));
                    }
                } catch (err) {
                    console.error("Error fetching last visit");
                }
            };
            fetchLastVisit();
        }
    }, [patient]);

    useEffect(() => {
        const fetchDoctors = async () => {
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
        fetchDoctors();
    }, [formData.department_id]);

    const handleDeptChange = (e) => {
        const deptId = e.target.value;
        setFormData(prev => ({ ...prev, department_id: deptId, doctor_id: "" }));

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!patient) return alert("Please select a patient");

        try {
            const payload = {
                ...formData,
                patient_id: patient.id,
                investigations: selectedInvestigations
            };
            const res = await api.post("/opd/followup.php", payload);
            setMessage({ type: "success", text: `Follow-up Registered! Visit ID: ${res.data.visit_id}` });
            setPatient(null);
            setFormData({ 
                department_id: "", 
                doctor_id: "", 
                visit_date: new Date().toISOString().split('T')[0],
                pay_type: "Cash", 
                notes: "" 
            });
            setSelectedInvestigations([]);
        } catch (err) {
            setMessage({ type: "error", text: "Registration Failed" });
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Follow-up Registration</h1>
            
            {message && (
                <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                 <div className="bg-white p-6 rounded shadow border">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Patient Details</h2>
                    <PatientSearch onSelect={setPatient} />
                    
                    {patient && (
                         <div className="mt-4 grid grid-cols-2 gap-4 bg-purple-50 p-4 rounded text-sm">
                            <p><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
                            <p><strong>Age/Sex:</strong> {patient.age} / {patient.gender}</p>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded shadow border">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Visit Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department (Optional)</label>
                            <select 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.department_id}
                                onChange={handleDeptChange}
                            >
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Assigned Doctor</label>
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
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.visit_date}
                                onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
                            />
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-gray-700">Pay Type</label>
                            <select 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            />
                        </div>

                        <div className="col-span-2">
                            <InvestigationSelector 
                                selectedTests={selectedInvestigations}
                                onTestsChange={setSelectedInvestigations}
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded hover:bg-purple-700 transition">
                    Register Follow-up
                </button>
            </form>
        </div>
    );
};

export default FollowUp;
