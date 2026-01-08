import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-4rem)]">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
