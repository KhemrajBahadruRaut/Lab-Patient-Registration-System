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
    <div className="space-y-5">
        {/* Search / Selector */}
        <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
                Investigation Tests
            </label>

            <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Type to search investigation tests..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
            />

            {showDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredTests.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">
                            No tests found
                        </div>
                    ) : (
                        filteredTests.map(test => (
                            <div
                                key={test.id}
                                onClick={() => addTest(test)}
                                className="px-4 py-2 flex justify-between items-center hover:bg-blue-50 cursor-pointer transition"
                            >
                                <span className="font-medium text-gray-700">
                                    {test.test_name}
                                </span>
                                <span className="text-sm font-semibold text-green-600">
                                    NPR {test.rate}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>

        {/* Selected Tests */}
        {selectedTests.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-700">
                    Selected Investigations
                </h4>

                {selectedTests.map(test => (
                    <div
                        key={test.id}
                        className="bg-white border rounded-lg p-3 flex justify-between items-center"
                    >
                        {/* Test Info */}
                        <div>
                            <p className="font-medium text-gray-800">
                                {test.test_name}
                            </p>
                            <p className="text-sm text-gray-500">
                                NPR {test.rate} / test
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            {/* Quantity */}
                            <div className="flex items-center border rounded">
                                <button
                                    type="button"
                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                    onClick={() =>
                                        updateQuantity(test.id, test.quantity - 1)
                                    }
                                >
                                    −
                                </button>
                                <span className="px-3 text-sm font-medium">
                                    {test.quantity}
                                </span>
                                <button
                                    type="button"
                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                    onClick={() =>
                                        updateQuantity(test.id, test.quantity + 1)
                                    }
                                >
                                    +
                                </button>
                            </div>

                            {/* Price */}
                            <span className="w-24 text-right font-semibold text-green-600">
                                NPR {test.rate * test.quantity}
                            </span>

                            {/* Remove */}
                            <button
                                type="button"
                                onClick={() => removeTest(test.id)}
                                className="text-red-500 hover:text-red-700 text-lg"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}

                {/* Subtotal */}
                <div className="pt-3 mt-3 border-t flex justify-between items-center">
                    <span className="font-semibold text-gray-700">
                        Investigation Total
                    </span>
                    <span className="text-xl font-bold text-green-700">
                        NPR {calculateTotal()}
                    </span>
                </div>
            </div>
        )}
    </div>
);

};

export default InvestigationSelector;
