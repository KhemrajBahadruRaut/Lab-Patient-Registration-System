import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100%-2rem)]">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
