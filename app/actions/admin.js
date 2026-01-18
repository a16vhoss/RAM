
// Client-side wrapper for Admin Actions
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function rpc(action, data = {}) {
    try {
        const response = await fetch(`${API_BASE}/api/rpc/admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, data })
        });
        if (response.status === 401 || response.status === 403) return { success: false, error: 'Unauthorized' };
        return await response.json();
    } catch (error) {
        console.error(`RPC error ${action}:`, error);
        return { success: false, error: 'Network error' };
    }
}

export async function getReportedPosts() {
    return rpc('getReportedPosts');
}

export async function dismissReport(reportId) {
    return rpc('dismissReport', { reportId });
}

export async function deletePostAsAdmin(postId) {
    return rpc('deletePostAsAdmin', { postId });
}
