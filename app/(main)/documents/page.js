'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DocumentsClient from './DocumentsClient';
import { API_BASE } from '@/app/actions/pet';

export default function DocumentsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ session: null, pets: [], documents: [] });

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Get Session
                const sessionRes = await fetch(`${API_BASE}/api/auth/session`, { credentials: 'include' });
                const session = await sessionRes.json();

                if (!session?.user) {
                    router.push('/login');
                    return;
                }

                // 2. Get Documents and Pets via RPC
                const res = await fetch(`${API_BASE}/api/rpc/user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getDocuments' }),
                    credentials: 'include'
                });

                if (res.ok) {
                    const result = await res.json();
                    if (result.success) {
                        setData({
                            session,
                            pets: result.data.pets,
                            documents: result.data.documents
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load documents:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <DocumentsClient session={data.session} pets={data.pets} documents={data.documents} />;
}
