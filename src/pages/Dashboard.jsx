import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import PrintBill from "../components/PrintBill";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [summary, setSummary] = useState({ total_patients: 0, total_visits: 0, total_revenue: 0 });
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [recentVisits, setRecentVisits] = useState([]);
    const [showPrintBill, setShowPrintBill] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get(`/reports/daily_summary.php?date=${date}`);
                setSummary(res.data);
            } catch (err) {
                console.error("Failed to load summary");
            }
        };
        
        const fetchRecentVisits = async () => {
            try {
                const res = await api.get("/visits/list.php?limit=20");
                setRecentVisits(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to load visits");
            }
        };
        
        fetchSummary();
        fetchRecentVisits();
    }, [date]);

    return (
        <div className="p-2 space-y-5">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-600">Welcome, {user?.name} ({user?.role})</p>
                </div>
                <div className="flex items-center space-x-4">
                     <input 
                        type="date" 
                        className="p-2 border rounded"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <button 
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white py-3 px-6 rounded-lg shadow border-l-1 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase">New Patients</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{summary.total_patients}</p>
                </div>
                <div className="bg-white py-3 px-6 rounded-lg shadow border-l-1 border-green-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase">OPD Visits</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{summary.total_visits}</p>
                </div>
                <div className="bg-white py-3 px-6 rounded-lg shadow border-l-1 border-purple-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">Rs. {summary.total_revenue}</p>
                </div>
            </div>
            
            <div className="bg-blue-50 px-6 py-4 rounded-lg border border-blue-100">
                <h2 className="text-xl font-bold text-blue-800 mb-2">Quick Actions</h2>
                <div className="flex space-x-4">
                    <a href="/patient/register" className="bg-white text-blue-600 px-2 py-1 shadow hover:bg-gray-50 font-semibold border">
                        + New Patient
                    </a>
                    <a href="/opd" className="bg-white text-green-600 px-2 py-1 shadow hover:bg-gray-50 font-semibold border">
                        + OPD Registration
                    </a>
                </div>
            </div>

            {/* Recent Visits */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Recent Visits</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentVisits.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No visits found</td>
                                </tr>
                            ) : (
                                recentVisits.map((visit) => (
                                    <tr key={visit.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(visit.visit_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{visit.patient_name}</div>
                                            <div className="text-sm text-gray-500">{visit.patient_phone}</div>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${visit.visit_type === 'OPD' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {visit.visit_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{visit.doctor_name || 'N/A'}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{visit.department_name || 'N/A'}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Rs. {visit.total_amount}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await api.get(`/visits/get_by_id.php?id=${visit.id}`);
                                                        setSelectedVisit(res.data);
                                                        setShowPrintBill(true);
                                                    } catch (err) {
                                                        console.error("Failed to load visit details", err);
                                                        alert("Failed to load visit details for printing.");
                                                    }
                                                }}
                                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-semibold"
                                            >
                                                Print
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showPrintBill && selectedVisit && (
                <PrintBill 
                    visitData={selectedVisit} 
                    onClose={() => {
                        setShowPrintBill(false);
                        setSelectedVisit(null);
                    }} 
                />
            )}
        </div>
    );
};

export default Dashboard;
