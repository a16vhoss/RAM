import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-0">
            <Sidebar />
            <div className="md:ml-64 min-h-screen transition-all">
                {children}
            </div>
            <div className="md:hidden">
                <BottomNav />
            </div>
        </div>
    );
}
