import { useState, useEffect } from "react";
import NepaliDate from "nepali-date-converter";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const PatientRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "Mr.",
        first_name: "",
        middle_name: "",
        last_name: "",
        age: "",
        age_type: "Years",
        gender: "Male",
        dob_bs: "",
        dob_ad: "",
        phone: "",
        email: "",
        address: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [recentPatients, setRecentPatients] = useState([]);

    useEffect(() => {
        fetchRecentPatients();
    }, []);

    const fetchRecentPatients = async () => {
        try {
            const res = await api.get("/patients/recent.php");
            setRecentPatients(res.data);
        } catch (err) {
            console.error("Failed to fetch recent patients");
        }
    };

    // Handle BS change
    const handleBsChange = (e) => {
        const bs = e.target.value;
        setFormData(prev => ({ ...prev, dob_bs: bs }));
        
        // Simple regex check for YYYY-MM-DD or similar
        // We will try to convert only if it looks valid
        if (bs.length === 10) {
            try {
                // NepaliDate expects YYYY-MM-DD string or similar
                // Note: The library format parsing might vary. 
                // We'll replace separators with dashes just in case.
                const formattedBs = bs.replace(/\//g, "-");
                const nd = new NepaliDate(formattedBs);
                const adDate = nd.toJsDate();
                const adString = adDate.toISOString().split('T')[0];
                setFormData(prev => ({ ...prev, dob_ad: adString }));
            } catch (err) {
                // Invalid date, ignore
            }
        }
    };

    // Handle AD change
    const handleAdChange = (e) => {
        const ad = e.target.value;
        setFormData(prev => ({ ...prev, dob_ad: ad }));
        
        if (ad) {
            try {
                const jsDate = new Date(ad);
                const nd = new NepaliDate(jsDate);
                const bsString = nd.format('YYYY-MM-DD');
                setFormData(prev => ({ ...prev, dob_bs: bsString }));
            } catch (err) {
                // Invalid date
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await api.post("/patients/create.php", formData);
            if (res.data.patient_id) {
                setMessage({ type: "success", text: `Patient Registered! ID: ${res.data.patient_id}` });
                fetchRecentPatients(); // Refresh list
                // Reset form or navigate
                setTimeout(() => setFormData({
                    title: "Mr.",
                    first_name: "",
                    middle_name: "",
                    last_name: "",
                    age: "",
                    age_type: "Years",
                    gender: "Male",
                    dob_bs: "",
                    dob_ad: "",
                    phone: "",
                    email: "",
                    address: ""
                }), 2000);
            }
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Registration Failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Quick Patient Registration</h1>
            
            {message.text && (
                <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Row 1 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <select name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                        <option>Mr.</option>
                        <option>Mrs.</option>
                        <option>Ms.</option>
                        <option>Dr.</option>
                        <option>Prof.</option>
                    </select>
                </div>
                
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">First Name *</label>
                    <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>

                {/* Row 2 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                    <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                    <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>

                {/* Row 3 - Age & Gender */}
                <div className="flex space-x-2">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700">Age *</label>
                        <input type="number" name="age" required value={formData.age} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select name="age_type" value={formData.age_type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option>Years</option>
                            <option>Months</option>
                            <option>Days</option>
                        </select>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Gender *</label>
                    <div className="mt-2 space-x-4">
                        <label className="inline-flex items-center">
                            <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} className="form-radio text-blue-600" />
                            <span className="ml-2">Male</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} className="form-radio text-pink-600" />
                            <span className="ml-2">Female</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" name="gender" value="Other" checked={formData.gender === 'Other'} onChange={handleChange} className="form-radio text-green-600" />
                            <span className="ml-2">Other</span>
                        </label>
                    </div>
                </div>

                {/* Row 4 - Dates */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">DOB (BS)</label>
                    <input type="text" name="dob_bs" placeholder="YYYY-MM-DD" value={formData.dob_bs} onChange={handleBsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">DOB (AD)</label>
                    <input type="date" name="dob_ad" value={formData.dob_ad} onChange={handleAdChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone *</label>
                    <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>

                {/* Row 5 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>

                <div className="md:col-span-3 mt-4">
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50">
                        {loading ? 'Registering...' : 'Register Patient'}
                    </button>
                </div>

            </form>

            {/* Recent Patients Table */}
            <div className="bg-white rounded shadow p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Patients</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Sex</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentPatients.length > 0 ? (
                                recentPatients.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {p.title} {p.first_name} {p.middle_name} {p.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.age} / {p.gender}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.address}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No patients found recently.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatientRegister;
