'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaHeart, FaRegHeart, FaComment, FaFlag, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { getPost, likePost, unlikePost, deletePost, reportPost } from '@/app/actions/posts';
import { getComments, addComment, deleteComment } from '@/app/actions/posts';

const postTypeLabels = {
    'general': '💬 General',
    'question': '❓ Pregunta',
    'tip': '💡 Consejo',
    'photo': '📸 Foto',
    'alert': '🚨 Alerta',
};

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [params.postId]);

    const loadData = async () => {
        setLoading(true);
        const [postRes, commentsRes] = await Promise.all([
            getPost(params.postId),
            getComments(params.postId)
        ]);

        if (postRes.success) setPost(postRes.data);
        if (commentsRes.success) setComments(commentsRes.data);
        setLoading(false);
    };

    const handleLike = async () => {
        if (!post) return;
        const res = post.isLiked ? await unlikePost(post.post_id) : await likePost(post.post_id);
        if (res.success) {
            setPost({
                ...post,
                isLiked: !post.isLiked,
                likes_count: post.isLiked ? post.likes_count - 1 : post.likes_count + 1
            });
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Eliminar este post?')) return;
        const res = await deletePost(post.post_id);
        if (res.success) {
            router.push(`/communities/${post.community_slug}`);
        }
    };

    const handleReport = async () => {
        const reason = prompt('¿Por qué deseas reportar esta publicación?');
        if (!reason) return;
        const res = await reportPost(post.post_id, reason);
        if (res.success) alert(res.message);
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        const res = await addComment(post.post_id, newComment);
        if (res.success) {
            setComments([...comments, res.data]);
            setNewComment('');
            setPost({ ...post, comments_count: post.comments_count + 1 });
        }
        setSubmitting(false);
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm('¿Eliminar este comentario?')) return;
        const res = await deleteComment(commentId);
        if (res.success) {
            setComments(comments.filter(c => c.comment_id !== commentId));
            setPost({ ...post, comments_count: post.comments_count - 1 });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Post no encontrado</h2>
                    <Link href="/communities" className="text-primary hover:underline">Volver a comunidades</Link>
                </div>
            </div>
        );
    }

    const timeAgo = getTimeAgo(post.created_at);

    return (
        <div className="min-h-screen bg-background-dark text-white pb-28">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <FaArrowLeft />
                    </button>
                    <div className="flex-1">
                        <h1 className="font-bold">Publicación</h1>
                        <Link href={`/communities/${post.community_slug}`} className="text-sm text-primary hover:underline">
                            {post.community_name}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Post */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
                    {/* Post Header */}
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                            {post.user_photo ? (
                                <img src={post.user_photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">
                                    {post.first_name?.[0] || '?'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white">{post.first_name} {post.last_name}</p>
                            <p className="text-sm text-slate-400">{timeAgo} · {postTypeLabels[post.post_type]}</p>
                        </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-4 pb-4">
                        <p className="text-white text-lg whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Media */}
                    {post.media_urls && post.media_urls.length > 0 && (
                        <div className="px-4 pb-4">
                            {post.media_urls.map((url, i) => (
                                <img key={i} src={url} alt="" className="w-full rounded-xl object-cover" />
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button onClick={handleLike} className={`flex items-center gap-2 transition-colors ${post.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}>
                                {post.isLiked ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                                <span>{post.likes_count}</span>
                            </button>
                            <span className="flex items-center gap-2 text-slate-400">
                                <FaComment size={18} />
                                <span>{post.comments_count}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {post.isOwner && (
                                <button onClick={handleDelete} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                                    <FaTrash />
                                </button>
                            )}
                            <button onClick={handleReport} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <FaFlag />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-6">
                    <h3 className="font-bold text-lg mb-4">Comentarios ({comments.length})</h3>

                    {/* Comment Input */}
                    <form onSubmit={handleSubmitComment} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escribe un comentario..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-primary/50"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            className="w-12 h-12 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
                        >
                            <FaPaperPlane />
                        </button>
                    </form>

                    {/* Comments List */}
                    {comments.length > 0 ? (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <CommentCard
                                    key={comment.comment_id}
                                    comment={comment}
                                    onDelete={() => handleDeleteComment(comment.comment_id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 py-8">Sé el primero en comentar</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function CommentCard({ comment, onDelete }) {
    const timeAgo = getTimeAgo(comment.created_at);

    return (
        <div className="bg-slate-800/40 rounded-xl p-4 group">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                    {comment.user_photo ? (
                        <img src={comment.user_photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            {comment.first_name?.[0] || '?'}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{comment.first_name}</span>
                        <span className="text-xs text-slate-500">{timeAgo}</span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{comment.content}</p>
                </div>
                <button
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                >
                    <FaTrash size={12} />
                </button>
            </div>
        </div>
    );
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)} días`;
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}
