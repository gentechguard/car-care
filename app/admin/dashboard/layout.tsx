import AdminSidebar from "@/components/admin/AdminSidebar";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { Toaster } from 'sonner';

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-[100dvh] bg-linear-to-b from-black via-[#110e30] to-[#2a2275] flex font-sans text-slate-900 sidebar-gradient overflow-hidden">
                {/* Sidebar */}
                <AdminSidebar />

                {/* Main Content Area - Stax 'Card' Effect */}
                <main className="flex-1 bg-white md:m-2.5 md:rounded-[24px] shadow-2xl relative flex flex-col overflow-hidden h-[100dvh] md:h-[calc(100vh-20px)] w-full">
                    <div className="flex-1 overflow-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
                <Toaster position="top-right" theme="light" />
            </div>
        </ProtectedRoute>
    );
}
