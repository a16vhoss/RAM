
// Client-side wrapper for Community Actions
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function rpc(action, data = {}) {
    try {
        const response = await fetch(`${API_BASE}/api/rpc/community`, {
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

export async function getCommunities(filters = {}) {
    return rpc('getCommunities', { filters });
}

export async function getCommunityBySlug(slug) {
    return rpc('getCommunityBySlug', { slug });
}

export async function getUserCommunities() {
    return rpc('getUserCommunities');
}

export async function isMember(communityId) {
    return rpc('isMember', { communityId });
}

export async function joinCommunity(communityId) {
    return rpc('joinCommunity', { communityId });
}

export async function leaveCommunity(communityId) {
    return rpc('leaveCommunity', { communityId });
}

export async function autoJoinUserToCommunities(userId) {
    return rpc('autoJoinUserToCommunities', { userId });
}

export async function getCommunityStats(communityId) {
    return rpc('getCommunityStats', { communityId });
}

export async function searchCommunities(query) {
    return rpc('searchCommunities', { query });
}
