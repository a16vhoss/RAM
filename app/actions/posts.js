
// Client-side wrapper for Posts Actions
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function rpc(action, data = {}) {
    try {
        const response = await fetch(`${API_BASE}/api/rpc/posts`, {
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

export async function createPost(communityId, data) {
    return rpc('createPost', { communityId, ...data });
}

export async function getPostsFeed(communityId, page = 1, limit = 20) {
    return rpc('getPostsFeed', { communityId, page, limit });
}

export async function getPost(postId) {
    return rpc('getPost', { postId });
}

export async function likePost(postId) {
    return rpc('likePost', { postId });
}

export async function unlikePost(postId) {
    return rpc('unlikePost', { postId });
}

export async function deletePost(postId) {
    return rpc('deletePost', { postId });
}

export async function reportPost(postId, reason) {
    return rpc('reportPost', { postId, reason });
}

export async function addComment(postId, content) {
    return rpc('addComment', { postId, content });
}

export async function getComments(postId) {
    return rpc('getComments', { postId });
}

export async function deleteComment(commentId) {
    return rpc('deleteComment', { commentId });
}

export async function getRecentActivityFeed(limit = 5) {
    return rpc('getRecentActivityFeed', { limit });
}
