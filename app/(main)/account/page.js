'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AccountClient from './AccountClient';
import { API_BASE } from '@/app/actions/pet'; // Re-use base URL logic

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [pets, setPets] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Get Session
                const sessionRes = await fetch(`${API_BASE || ''}/api/auth/session`, {
                    credentials: 'include'
                });
                const { session } = await sessionRes.json();

                if (!session || !session.user) {
                    router.push('/login');
                    return;
                }

                setUser(session.user);

                // 2. Get Dashboard Data via RPC
                // We use the direct fetch to rpc endpoint we just modified
                const rpcRes = await fetch(`${API_BASE || ''}/api/rpc/user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: 'getDashboardData', data: {} })
                });

                const rpcData = await rpcRes.json();

                if (rpcData.success) {
                    setPets(rpcData.data.pets || []);
                    setDocuments(rpcData.data.documents || []);
                }

            } catch (error) {
                console.error('Error loading account data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null; // Should redirect

    return (
        <AccountClient
            user={user}
            pets={pets}
            documents={documents}
        />
    );
}
