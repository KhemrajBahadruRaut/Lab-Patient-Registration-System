import { useState, useEffect } from "react";
import api from "../../utils/api";
import { FaSearch } from "react-icons/fa";

const PatientSearch = ({ onSelect }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 1) {
                try {
                    const res = await api.get(`/patients/search.php?q=${query}`);
                    setResults(res.data);
                    setShowResults(true);
                } catch (err) {
                    setResults([]);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (patient) => {
        onSelect(patient);
        setQuery(`${patient.first_name} ${patient.last_name} (${patient.id})`);
        setShowResults(false);
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Search Patient (ID, Name, Phone)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <input
                    type="text"
                    className="block w-full pl-3 pr-10 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                </div>
            </div>
            
            {showResults && results.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {results.map((patient) => (
                        <li
                            key={patient.id}
                            className="text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-100"
                            onClick={() => handleSelect(patient)}
                        >
                            <span className="font-medium">{patient.first_name} {patient.last_name}</span>
                            <span className="text-gray-500 ml-2">ID: {patient.id} | Ph: {patient.phone}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PatientSearch;
