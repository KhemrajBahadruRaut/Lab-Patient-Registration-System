import { useState, useEffect } from "react";
import NepaliDate from "nepali-date-converter";
import api from "../utils/api";
import PatientSearch from "../components/Forms/PatientSearch";

const EditPatient = () => {
    const [patient, setPatient] = useState(null);
    const [formData, setFormData] = useState({
        id: "",
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

    // When a patient is selected from search
    useEffect(() => {
        if (patient) {
            setFormData({
                id: patient.id,
                title: patient.title || "Mr.",
                first_name: patient.first_name,
                middle_name: patient.middle_name || "",
                last_name: patient.last_name,
                age: patient.age,
                age_type: patient.age_type || "Years", // defaulting if not in DB
                gender: patient.gender,
                dob_bs: patient.dob_bs || "",
                dob_ad: patient.dob_ad || "",
                phone: patient.phone,
                email: patient.email || "",
                address: patient.address || ""
            });
            setMessage({ type: "", text: "" });
        }
    }, [patient]);

    // Handle BS change
    const handleBsChange = (e) => {
        const bs = e.target.value;
        setFormData(prev => ({ ...prev, dob_bs: bs }));
        
        if (bs.length === 10) {
            try {
                const formattedBs = bs.replace(/\//g, "-");
                const nd = new NepaliDate(formattedBs);
                const adDate = nd.toJsDate();
                const adString = adDate.toISOString().split('T')[0];
                setFormData(prev => ({ ...prev, dob_ad: adString }));
            } catch (err) { }
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
            } catch (err) { }
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
            await api.post("/patients/update.php", formData);
            setMessage({ type: "success", text: "Patient Updated Successfully!" });
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Update Failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Patient Details</h1>
            
            <div className="bg-white p-6 rounded shadow mb-6 border">
                <h2 className="text-lg font-semibold mb-4">Search Patient to Edit</h2>
                <PatientSearch onSelect={setPatient} />
            </div>

            {patient && (
                <div className="bg-white p-6 rounded shadow border">
                     {message.text && (
                        <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded hover:bg-indigo-700 transition disabled:opacity-50">
                                {loading ? 'Updating...' : 'Update Records'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EditPatient;
