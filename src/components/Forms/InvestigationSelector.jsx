import { useState, useEffect } from "react";
import api from "../../utils/api";

const InvestigationSelector = ({ selectedTests, onTestsChange }) => {
    const [availableTests, setAvailableTests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await api.get("/investigations/list.php");
            setAvailableTests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to load tests");
            setAvailableTests([]);
        }
    };

    const filteredTests = availableTests.filter(test =>
        test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedTests.find(st => st.id === test.id)
    );

    const addTest = (test) => {
        const newTest = {
            id: test.id,
            test_id: test.id,
            test_name: test.test_name,
            rate: parseFloat(test.rate),
            quantity: 1
        };
        onTestsChange([...selectedTests, newTest]);
        setSearchTerm("");
        setShowDropdown(false);
    };

    const removeTest = (testId) => {
        onTestsChange(selectedTests.filter(t => t.id !== testId));
    };

    const updateQuantity = (testId, quantity) => {
        onTestsChange(selectedTests.map(t =>
            t.id === testId ? { ...t, quantity: parseInt(quantity) || 1 } : t
        ));
    };

    const calculateTotal = () => {
        return selectedTests.reduce((sum, test) => sum + (test.rate * test.quantity), 0);
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investigation Tests
                </label>
                <div className="relative">
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Search and select tests..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                    />
                    {showDropdown && filteredTests.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredTests.map(test => (
                                <div
                                    key={test.id}
                                    className="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                    onClick={() => addTest(test)}
                                >
                                    <span>{test.test_name}</span>
                                    <span className="text-green-600 font-semibold">₹{test.rate}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedTests.length > 0 && (
                <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="font-semibold mb-3 text-gray-700">Selected Tests</h4>
                    <div className="space-y-2">
                        {selectedTests.map(test => (
                            <div key={test.id} className="flex items-center justify-between bg-white p-2 rounded border">
                                <div className="flex-1">
                                    <span className="font-medium">{test.test_name}</span>
                                    <span className="text-sm text-gray-500 ml-2">@ ₹{test.rate}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-600">Qty:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-16 p-1 border rounded text-center"
                                            value={test.quantity}
                                            onChange={(e) => updateQuantity(test.id, e.target.value)}
                                        />
                                    </div>
                                    <span className="font-semibold text-green-600 w-20 text-right">
                                        ₹{test.rate * test.quantity}
                                    </span>
                                    <button
                                        type="button"
                                        className="text-red-600 hover:text-red-800 font-bold"
                                        onClick={() => removeTest(test.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                        <span className="font-bold text-gray-700">Investigation Subtotal:</span>
                        <span className="font-bold text-lg text-green-600">₹{calculateTotal()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestigationSelector;
