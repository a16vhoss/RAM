
// Client-side wrapper for User Actions
import { redirect } from 'next/navigation';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function rpc(action, data = {}) {
    try {
        const response = await fetch(`${API_BASE}/api/rpc/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, data })
        });

        // Handle 401 Unauthorized globally if needed, or return error
        if (response.status === 401) {
            return { success: false, error: 'Unauthorized' };
        }

        return await response.json();
    } catch (error) {
        console.error(`RPC error ${action}:`, error);
        return { success: false, error: 'Network error or server error' };
    }
}

export async function logoutUser() {
    const res = await rpc('logoutUser');
    if (res.success) {
        if (typeof window !== 'undefined') {
            window.location.href = '/'; // Hard navigation to clear client state
        }
    }
    return res;
}

export async function updateUserLocation(zone, lat, lng) {
    return rpc('updateUserLocation', { zone, lat, lng });
}

export async function updateUserProfile(formData) {
    return rpc('updateUserProfile', formData);
}

export async function changePassword(currentPassword, newPassword) {
    return rpc('changePassword', { currentPassword, newPassword });
}

export async function updateNotificationSettings(settings) {
    return rpc('updateNotificationSettings', { settings });
}

export async function deleteAccount() {
    const res = await rpc('deleteAccount');
    if (res.success && typeof window !== 'undefined') {
        window.location.href = '/';
    }
    return res;
}

export async function exportUserData() {
    return rpc('exportUserData');
}

export async function getNotifications() {
    return rpc('getNotifications');
}

export async function markNotificationAsRead(notificationId) {
    return rpc('markNotificationAsRead', { notificationId });
}



