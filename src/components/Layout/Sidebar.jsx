import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUserPlus, FaUserEdit, FaNotesMedical, FaUserMd, FaSignOutAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [patientMenuOpen, setPatientMenuOpen] = useState(true);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="bg-slate-800 text-white w-64 min-h-screen flex flex-col transition-all duration-300">
            <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-blue-400">Hospital CMS</h2>
            </div>

            <nav className="flex-1 p-2 space-y-1">
                <Link to="/" className={`flex items-center space-x-3 px-4 py-1 rounded hover:bg-slate-700 transaction ${isActive('/') ? 'bg-blue-600' : ''}`}>
                    <FaHome /> <span>Dashboard</span>
                </Link>

                {user?.role === 'Super Admin' && (
                     <Link to="/super-admin" className={`flex items-center space-x-3 px-4 py-1 rounded hover:bg-slate-700 transaction ${isActive('/super-admin') ? 'bg-blue-600' : ''}`}>
                        <FaUserMd /> <span>Super Admin</span>
                    </Link>
                )}

                <div>
                    <button 
                        onClick={() => setPatientMenuOpen(!patientMenuOpen)}
                        className="w-full flex items-center justify-between px-4 py-1 rounded hover:bg-slate-700 transition"
                    >
                        <div className="flex items-center space-x-3">
                            <FaUserMd /> <span>Patient Registration</span>
                        </div>
                        {patientMenuOpen ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
                    </button>
                    
                    {patientMenuOpen && (
                        <div className="ml-8 mt-1 space-y-1">
                            <Link to="/patient/register" className={`flex items-center space-x-3 px-4 py-1 text-sm rounded hover:bg-slate-700 ${isActive('/patient/register') ? 'text-blue-300' : 'text-gray-300'}`}>
                                <FaUserPlus /> <span>Quick Registration</span>
                            </Link>
                            <Link to="/patient/edit" className={`flex items-center space-x-3 px-4 py-1 text-sm rounded hover:bg-slate-700 ${isActive('/patient/edit') ? 'text-blue-300' : 'text-gray-300'}`}>
                                <FaUserEdit /> <span>Edit Patient</span>
                            </Link>
                        </div>
                    )}
                </div>

                <Link to="/opd" className={`flex items-center space-x-3 px-4 py-1 rounded hover:bg-slate-700 transaction ${isActive('/opd') ? 'bg-blue-600' : ''}`}>
                    <FaNotesMedical /> <span>OPD Registration</span>
                </Link>

                <Link to="/followup" className={`flex items-center space-x-3 px-4 py-1 rounded hover:bg-slate-700 transaction ${isActive('/followup') ? 'bg-blue-600' : ''}`}>
                    <FaUserMd /> <span>Follow-up</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-slate-700">
                <button onClick={logout} className="flex items-center space-x-3 px-4 py-1 rounded hover:bg-red-600 w-full transition text-red-100 hover:text-white">
                    <FaSignOutAlt /> <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
