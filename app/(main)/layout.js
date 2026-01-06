import BottomNav from "@/components/layout/BottomNav";

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-slate-950 flex justify-center">
            <div className="w-full max-w-[560px] bg-background-light dark:bg-background-dark min-h-screen shadow-2xl relative">
                <main className="pb-28">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
}
