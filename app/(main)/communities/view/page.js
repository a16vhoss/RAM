'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaUsers, FaPlus, FaHeart, FaRegHeart, FaComment, FaFlag, FaTrash, FaEllipsisV, FaTimes, FaDog, FaCat, FaDove, FaPaw } from 'react-icons/fa';
import { getCommunityBySlug, joinCommunity, leaveCommunity, isMember } from '@/app/actions/community';
import { getPostsFeed, createPost, likePost, unlikePost, deletePost, reportPost } from '@/app/actions/posts';

const postTypeLabels = {
    'general': '💬 General',
    'question': '❓ Pregunta',
    'tip': '💡 Consejo',
    'photo': '📸 Foto',
    'alert': '🚨 Alerta',
};

const postTypeColors = {
    'general': 'bg-slate-500/20 text-slate-300',
    'question': 'bg-blue-500/20 text-blue-400',
    'tip': 'bg-yellow-500/20 text-yellow-400',
    'photo': 'bg-purple-500/20 text-purple-400',
    'alert': 'bg-red-500/20 text-red-400',
};

export default function CommunityViewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background-dark flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <CommunityViewContent />
        </Suspense>
    );
}

function CommunityViewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');

    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isUserMember, setIsUserMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!slug) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const communityRes = await getCommunityBySlug(slug);

            if (communityRes.success) {
                setCommunity(communityRes.data);

                // Check membership with actual community ID
                const memberCheck = await isMember(communityRes.data.community_id);
                setIsUserMember(memberCheck.isMember);

                // Load posts
                const postsRes = await getPostsFeed(communityRes.data.community_id);
                if (postsRes.success) setPosts(postsRes.data);
            }
            setLoading(false);
        };

        loadData();
    }, [slug]);

    const handleJoin = async () => {
        const res = await joinCommunity(community.community_id);
        if (res.success) {
            setIsUserMember(true);
            setCommunity({ ...community, member_count: community.member_count + 1 });
        }
    };

    const handleLeave = async () => {
        if (!confirm('¿Seguro que quieres salir de esta comunidad?')) return;
        const res = await leaveCommunity(community.community_id);
        if (res.success) {
            setIsUserMember(false);
            setCommunity({ ...community, member_count: community.member_count - 1 });
        }
    };

    const handleLike = async (postId, isLiked) => {
        const res = isLiked ? await unlikePost(postId) : await likePost(postId);
        if (res.success) {
            setPosts(posts.map(p =>
                p.post_id === postId
                    ? { ...p, isLiked: !isLiked, likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1 }
                    : p
            ));
        }
    };

    const handleDelete = async (postId) => {
        if (!confirm('¿Eliminar este post?')) return;
        const res = await deletePost(postId);
        if (res.success) {
            setPosts(posts.filter(p => p.post_id !== postId));
        }
    };

    const handleReport = async (postId, reason) => {
        const res = await reportPost(postId, reason);
        if (res.success) {
            alert(res.message);
            setShowReportModal(null);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
        setShowCreateModal(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Comunidad no encontrada</h2>
                    <Link href="/communities" className="text-primary hover:underline">Volver a comunidades</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-white pb-28">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <FaArrowLeft />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold">{community.name}</h1>
                            <p className="text-sm text-slate-400">{community.member_count} miembros · {community.post_count} posts</p>
                        </div>
                        {isUserMember ? (
                            <button
                                onClick={handleLeave}
                                className="px-4 py-2 bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-xl text-sm font-bold transition-colors"
                            >
                                Salir
                            </button>
                        ) : (
                            <button
                                onClick={handleJoin}
                                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold transition-colors"
                            >
                                Unirme
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Community Description */}
            {community.description && (
                <div className="max-w-4xl mx-auto px-4 py-4 border-b border-white/5">
                    <p className="text-slate-300 text-sm">{community.description}</p>
                </div>
            )}

            {/* Create Post Button (if member) */}
            {isUserMember && (
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full bg-slate-800/60 hover:bg-slate-800 border border-white/5 rounded-2xl p-4 text-left text-slate-400 transition-colors flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <FaPlus />
                        </div>
                        <span>¿Qué quieres compartir?</span>
                    </button>
                </div>
            )}

            {/* Posts Feed */}
            <div className="max-w-4xl mx-auto px-4 py-2">
                {posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <PostCard
                                key={post.post_id}
                                post={post}
                                onLike={() => handleLike(post.post_id, post.isLiked)}
                                onDelete={() => handleDelete(post.post_id)}
                                onReport={() => setShowReportModal(post.post_id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaComment className="text-4xl text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Sin publicaciones</h3>
                        <p className="text-slate-400">Sé el primero en compartir algo con la comunidad.</p>
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <CreatePostModal
                    communityId={community.community_id}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handlePostCreated}
                />
            )}

            {/* Report Modal */}
            {showReportModal && (
                <ReportModal
                    postId={showReportModal}
                    onClose={() => setShowReportModal(null)}
                    onReport={handleReport}
                />
            )}
        </div>
    );
}

function PostCard({ post, onLike, onDelete, onReport }) {
    const [showMenu, setShowMenu] = useState(false);
    const timeAgo = getTimeAgo(post.created_at);

    return (
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                    {post.user_photo ? (
                        <img src={post.user_photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            {post.first_name?.[0] || '?'}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{post.first_name} {post.last_name}</p>
                    <p className="text-xs text-slate-400">{timeAgo}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${postTypeColors[post.post_type]}`}>
                    {postTypeLabels[post.post_type]?.split(' ')[0]}
                </span>
                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <FaEllipsisV className="text-slate-400" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 bg-slate-700 rounded-xl shadow-xl border border-white/10 py-1 min-w-[140px] z-10">
                            {post.canDelete && (
                                <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/5 flex items-center gap-2 text-sm">
                                    <FaTrash /> Eliminar
                                </button>
                            )}
                            <button onClick={() => { onReport(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-slate-300 hover:bg-white/5 flex items-center gap-2 text-sm">
                                <FaFlag /> Reportar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
                <p className="text-white whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
                <div className="px-4 pb-3">
                    <div className="grid gap-2" style={{ gridTemplateColumns: post.media_urls.length > 1 ? 'repeat(2, 1fr)' : '1fr' }}>
                        {post.media_urls.map((url, i) => (
                            <img key={i} src={url} alt="" className="w-full rounded-xl object-cover max-h-80" />
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="px-4 py-3 border-t border-white/5 flex items-center gap-6">
                <button onClick={onLike} className={`flex items-center gap-2 transition-colors ${post.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}>
                    {post.isLiked ? <FaHeart /> : <FaRegHeart />}
                    <span className="text-sm">{post.likes_count}</span>
                </button>
                <Link href={`/communities/post-view?id=${post.post_id}`} className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                    <FaComment />
                    <span className="text-sm">{post.comments_count}</span>
                </Link>
            </div>
        </div>
    );
}

function CreatePostModal({ communityId, onClose, onCreated }) {
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('general');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        const res = await createPost(communityId, { content, postType });
        if (res.success) {
            onCreated(res.data);
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="font-bold text-lg text-white">Nueva publicación</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    {/* Post Type Selector */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(postTypeLabels).map(([type, label]) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setPostType(type)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${postType === type ? postTypeColors[type] + ' ring-2 ring-white/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="¿Qué quieres compartir?"
                        rows={5}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:border-primary/50 resize-none"
                    />

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="w-full mt-4 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-colors"
                    >
                        {loading ? 'Publicando...' : 'Publicar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function ReportModal({ postId, onClose, onReport }) {
    const [reason, setReason] = useState('');
    const reasons = [
        'Spam o publicidad',
        'Contenido inapropiado',
        'Información falsa',
        'Acoso o bullying',
        'Otro'
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <FaFlag className="text-red-400" /> Reportar publicación
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-4">
                    <p className="text-slate-300 text-sm mb-4">¿Por qué deseas reportar esta publicación?</p>
                    <div className="space-y-2">
                        {reasons.map((r) => (
                            <button
                                key={r}
                                onClick={() => setReason(r)}
                                className={`w-full text-left p-3 rounded-xl transition-colors ${reason === r ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => onReport(postId, reason)}
                        disabled={!reason}
                        className="w-full mt-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-colors"
                    >
                        Enviar Reporte
                    </button>
                </div>
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
