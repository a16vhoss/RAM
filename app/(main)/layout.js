import BottomNav from "@/components/layout/BottomNav";

export default function MainLayout({ children }) {
    return (
        <>
            <main style={{ paddingBottom: '80px', minHeight: '100vh', background: 'var(--surface)' }}>
                {children}
            </main>
            <BottomNav />
        </>
    );
}
