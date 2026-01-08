import { useState, useEffect } from "react";
import api from "../utils/api";
import { FaUserMd, FaUsers, FaHospital, FaUserNurse, FaPlus } from "react-icons/fa";

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        patients: 0,
        visits: 0,
        doctors: 0,
        departments: 0
    });
    const [activeTab, setActiveTab] = useState("stats");
    const [message, setMessage] = useState({ type: "", text: "" });

    // Forms State
    const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "", role: "Doctor" });
    const [docForm, setDocForm] = useState({ name: "", department_id: "", mobile: "", email: "" });
    const [deptForm, setDeptForm] = useState({ name: "" });
    const [testForm, setTestForm] = useState({ test_name: "", rate: "" });
    const [editingTest, setEditingTest] = useState(null);

    const [staffList, setStaffList] = useState([]);
    const [doctorList, setDoctorList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [testsList, setTestsList] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchDepartments();
        fetchStaff();
        fetchDoctors();
        fetchTests();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await api.get("/users/list.php");
            setStaffList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setStaffList([]);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await api.get("/doctors/list.php");
            setDoctorList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setDoctorList([]);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get("/admin/stats.php");
            setStats(res.data || { patients: 0, visits: 0, doctors: 0, departments: 0 });
        } catch (err) {
            console.error("Stats error", err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get("/departments/list.php");
            setDepartments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setDepartments([]);
        }
    };

    const fetchTests = async () => {
        try {
            const res = await api.get("/investigations/list_all.php");
            setTestsList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setTestsList([]);
        }
    };

    const handleStaffSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/users/create.php", staffForm);
            setMessage({ type: "success", text: "Staff Created Successfully!" });
            setStaffForm({ name: "", email: "", password: "", role: "Doctor" });
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed" });
        }
    };

    const handleDocSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/doctors/create.php", docForm);
            setMessage({ type: "success", text: "Doctor Added Successfully!" });
            setDocForm({ name: "", department_id: "", mobile: "", email: "" });
            fetchStats();
            fetchDoctors();
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed" });
        }
    };

    const handleDeptSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/departments/create.php", deptForm);
            setMessage({ type: "success", text: "Department Created Successfully!" });
            setDeptForm({ name: "" });
            fetchStats();
            fetchDepartments();
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed" });
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;
        try {
            await api.post(`/${type}/delete.php`, { id });
            setMessage({ type: "success", text: "Deleted Successfully" });
            // Refresh lists
            fetchStaff();
            fetchDoctors();
            fetchDepartments();
            fetchStats();
        } catch (err) {
            setMessage({ type: "error", text: "Failed to delete" });
        }
    };

    const handleTestSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTest) {
                await api.post("/investigations/update.php", { ...testForm, id: editingTest });
                setMessage({ type: "success", text: "Test Updated Successfully!" });
                setEditingTest(null);
            } else {
                await api.post("/investigations/create.php", testForm);
                setMessage({ type: "success", text: "Test Added Successfully!" });
            }
            setTestForm({ test_name: "", rate: "" });
            fetchTests();
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed" });
        }
    };

    const handleToggleTestStatus = async (id) => {
        try {
            await api.post("/investigations/toggle_status.php", { id });
            setMessage({ type: "success", text: "Test status toggled!" });
            fetchTests();
        } catch (err) {
            setMessage({ type: "error", text: "Failed to toggle status" });
        }
    };

    const startEditTest = (test) => {
        setEditingTest(test.id);
        setTestForm({ test_name: test.test_name, rate: test.rate });
        setActiveTab("tests");
    };

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow border border-l-2 border-l-blue-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Total Patients</p>
                        <h3 className="text-2xl font-bold">{stats.patients}</h3>
                    </div>
                    <FaUsers className="text-blue-500 text-3xl" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-l-2 border-l-green-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Total Visits</p>
                        <h3 className="text-2xl font-bold">{stats.visits}</h3>
                    </div>
                    <FaHospital className="text-green-500 text-3xl" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-l-2 border-l-purple-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Active Doctors</p>
                        <h3 className="text-2xl font-bold">{stats.doctors}</h3>
                    </div>
                    <FaUserMd className="text-purple-500 text-3xl" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-l-2 border-l-orange-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Departments</p>
                        <h3 className="text-2xl font-bold">{stats.departments}</h3>
                    </div>
                    <FaHospital className="text-orange-500 text-3xl" />
                </div>
            </div>

            {/* Quick Actions / Tabs */}
            <div className="bg-white rounded shadow p-6">
                <div className="flex space-x-4 border-b pb-4 mb-4">
                    <button 
                        onClick={() => setActiveTab("staff")}
                        className={`pb-2 px-4 font-semibold ${activeTab === "staff" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                    >
                        Create Staff
                    </button>
                    <button 
                         onClick={() => setActiveTab("doctor")}
                         className={`pb-2 px-4 font-semibold ${activeTab === "doctor" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                    >
                        Add Doctor
                    </button>
                    <button 
                         onClick={() => setActiveTab("dept")}
                         className={`pb-2 px-4 font-semibold ${activeTab === "dept" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                    >
                        Add Department
                    </button>
                    <button 
                         onClick={() => setActiveTab("tests")}
                         className={`pb-2 px-4 font-semibold ${activeTab === "tests" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                    >
                        Manage Tests
                    </button>
                </div>

                {message.text && (
                    <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* Create Staff Form */}
                {activeTab === "staff" && (
                    <form onSubmit={handleStaffSubmit} className="max-w-lg space-y-4">
                        <h2 className="text-lg font-bold mb-4">Create New Staff User</h2>
                        <input 
                            type="text" placeholder="Full Name" required 
                            className="w-full p-2 border rounded"
                            value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})}
                        />
                        <input 
                            type="email" placeholder="Email" required 
                            className="w-full p-2 border rounded"
                            value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})}
                        />
                        <input 
                            type="password" placeholder="Password" required 
                            className="w-full p-2 border rounded"
                            value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})}
                        />
                        <select 
                            className="w-full p-2 border rounded"
                            value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})}
                        >
                            <option>Doctor</option>
                            <option>Receptionist</option>
                            <option>Sub Admin</option>
                            <option>Super Admin</option>
                        </select>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create User</button>
                    </form>
                )}

                {/* Add Doctor Form */}
                {activeTab === "doctor" && (
                     <form onSubmit={handleDocSubmit} className="max-w-lg space-y-4">
                        <h2 className="text-lg font-bold mb-4">Add Doctor</h2>
                        <input 
                            type="text" placeholder="Doctor Name" required 
                            className="w-full p-2 border rounded"
                            value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})}
                        />
                        <input 
                            type="text" placeholder="Mobile Number" 
                            className="w-full p-2 border rounded"
                            value={docForm.mobile} onChange={e => setDocForm({...docForm, mobile: e.target.value})}
                        />
                        <input 
                            type="email" placeholder="Email Address" 
                            className="w-full p-2 border rounded"
                            value={docForm.email} onChange={e => setDocForm({...docForm, email: e.target.value})}
                        />
                        <select 
                            className="w-full p-2 border rounded"
                            value={docForm.department_id} onChange={e => setDocForm({...docForm, department_id: e.target.value})}
                        >
                            <option value="">No Department (Independent)</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Add Doctor</button>
                    </form>
                )}

                {/* Add Department Form */}
                {activeTab === "dept" && (
                     <form onSubmit={handleDeptSubmit} className="max-w-lg space-y-4">
                        <h2 className="text-lg font-bold mb-4">Add New Department</h2>
                        <input 
                            type="text" placeholder="Department Name" required 
                            className="w-full p-2 border rounded"
                            value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})}
                        />
                        <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">Create Department</button>
                    </form>
                )}

                {/* Manage Tests Form */}
                {activeTab === "tests" && (
                    <div className="space-y-6">
                        <form onSubmit={handleTestSubmit} className="max-w-lg space-y-4 bg-blue-50 p-4 rounded">
                            <h2 className="text-lg font-bold mb-4">{editingTest ? "Edit Test" : "Add New Test"}</h2>
                            <input 
                                type="text" placeholder="Test Name" required 
                                className="w-full p-2 border rounded"
                                value={testForm.test_name} onChange={e => setTestForm({...testForm, test_name: e.target.value})}
                            />
                            <input 
                                type="number" placeholder="Rate" required step="0.01"
                                className="w-full p-2 border rounded"
                                value={testForm.rate} onChange={e => setTestForm({...testForm, rate: e.target.value})}
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                    {editingTest ? "Update Test" : "Add Test"}
                                </button>
                                {editingTest && (
                                    <button 
                                        type="button" 
                                        onClick={() => { setEditingTest(null); setTestForm({ test_name: "", rate: "" }); }}
                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="bg-white rounded shadow overflow-x-auto">
                            <h3 className="text-lg font-bold p-4 border-b">All Investigation Tests</h3>
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {testsList.map((test) => (
                                        <tr key={test.id} className={test.status === 'inactive' ? 'bg-gray-100' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">{test.test_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">₹{test.rate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded ${test.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {test.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                <button 
                                                    onClick={() => startEditTest(test)} 
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleTestStatus(test.id)} 
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                >
                                                    {test.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                
                {/* Staff List */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Staff List</h2>
                    <div className="bg-white rounded shadow overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {staffList.map((staff) => (
                                    <tr key={staff.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{staff.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{staff.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{staff.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => handleDelete('users', staff.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Doctors List */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Doctors List</h2>
                    <div className="bg-white rounded shadow overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {doctorList.map((doc) => (
                                    <tr key={doc.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{doc.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {doc.mobile || <span className="text-gray-400 text-sm">-</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {doc.email || <span className="text-gray-400 text-sm">-</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {doc.department_id ? (departments.find(d => d.id === doc.department_id)?.name || doc.department_id) : <span className="text-gray-500 italic">Independent</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => handleDelete('doctors', doc.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                 {/* Departments List */}
                 <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Departments List</h2>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {departments.map((dept) => (
                            <div key={dept.id} className="bg-white p-4 rounded shadow border text-center flex flex-col justify-between">
                                <h3 className="font-bold text-lg text-gray-800">{dept.name}</h3>
                                <button onClick={() => handleDelete('departments', dept.id)} className="text-red-500 text-sm mt-2 hover:underline">Delete</button>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
