import BottomNav from "@/components/layout/BottomNav";

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {children}
            <BottomNav />
        </div>
    );
}
