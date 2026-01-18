
// Client-side wrapper for Family Actions
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function rpc(action, data = {}) {
    try {
        const response = await fetch(`${API_BASE}/api/rpc/family`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, data })
        });
        if (response.status === 401) return { success: false, error: 'Unauthorized' };
        return await response.json();
    } catch (error) {
        console.error(`RPC error ${action}:`, error);
        return { success: false, error: 'Network error' };
    }
}

export async function getPetOwners(petId) {
    return rpc('getPetOwners', { petId });
}

export async function createInvite(petId) {
    return rpc('createInvite', { petId });
}

export async function joinFamily(code) {
    return rpc('joinFamily', { code });
}

export async function removeUser(petId, targetUserId) {
    return rpc('removeUser', { petId, targetUserId });
}

export async function getActiveInvite(petId) {
    return rpc('getActiveInvite', { petId });
}

