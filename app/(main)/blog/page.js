'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/app/actions/pet';

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [recommendedPosts, setRecommendedPosts] = useState([]);
    const [otherPosts, setOtherPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Fetch Blog Posts
                const blogRes = await fetch(`${API_BASE || ''}/api/rpc/blog`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getBlogPosts', data: {} })
                });
                const blogData = await blogRes.json();
                const allPosts = blogData.data || [];
                setPosts(allPosts);
                setOtherPosts(allPosts); // Default to all

                // 2. Check Session & Personalize
                const sessionRes = await fetch(`${API_BASE || ''}/api/auth/session`, { credentials: 'include' });
                const { session } = await sessionRes.json();

                if (session?.user) {
                    // Fetch user pets
                    const rpcRes = await fetch(`${API_BASE || ''}/api/rpc/user`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ action: 'getDashboardData', data: {} })
                    });
                    const rpcData = await rpcRes.json();

                    if (rpcData.success && rpcData.data.pets) {
                        const userSpecies = [...new Set(rpcData.data.pets.map(p => p.species.toLowerCase()))];

                        if (userSpecies.length > 0) {
                            const recs = allPosts.filter(post => {
                                const tags = (post.tags || '').toLowerCase();
                                return userSpecies.some(species => tags.includes(species));
                            });

                            if (recs.length > 0) {
                                setRecommendedPosts(recs);
                                const recIds = new Set(recs.map(p => p.post_id));
                                setOtherPosts(allPosts.filter(p => !recIds.has(p.post_id)));
                            }
                        }
                    }
                }

            } catch (error) {
                console.error('Error loading blog data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const PostCard = ({ post }) => (
        <Link
            href={`/blog/view?slug=${post.slug}`}
            key={post.post_id}
            className="block group"
        >
            <article className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.01] h-full flex flex-col">
                {/* Image Header */}
                <div
                    className="h-40 bg-cover bg-center relative overflow-hidden"
                    style={{
                        backgroundImage: `url(${post.image_url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800'})`
                    }}
                >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>

                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                        {post.category || 'General'}
                    </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-base font-bold mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3 flex-1">
                        {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-text-secondary mt-auto">
                        <span>{new Date(post.published_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>{post.views_count || 0} vistas</span>
                    </div>
                </div>
            </article>
        </Link>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text-main px-4 py-8 max-w-7xl mx-auto pb-32">
            {/* Header */}
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-display font-bold mb-3 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent inline-block">Blog & Tips</h1>
                <p className="text-text-secondary text-base max-w-2xl">Descubre todo lo que necesitas saber para recibir a tu nuevo mejor amigo en casa. Consejos de expertos para una vida feliz con tu mascota.</p>
            </div>

            {/* Recommended Section */}
            {recommendedPosts.length > 0 && (
                <section className="mb-12 animate-fade-in">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-2xl">✨</span>
                        <h2 className="text-2xl font-bold text-text-main dark:text-white">Recomendado para ti</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedPosts.map(post => (
                            <PostCard key={post.post_id} post={post} />
                        ))}
                    </div>
                </section>
            )}

            {/* All Posts Section */}
            <section>
                <h2 className="text-xl font-bold mb-6 text-text-secondary dark:text-gray-300">
                    {recommendedPosts.length > 0 ? "Más artículos recientes" : "Publicaciones recientes"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherPosts.map(post => (
                        <PostCard key={post.post_id} post={post} />
                    ))}

                    {otherPosts.length === 0 && recommendedPosts.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-surface dark:bg-surface-dark rounded-3xl border border-white/5">
                            <p className="text-text-secondary text-lg">No hay publicaciones disponibles en este momento.</p>
                            <p className="text-sm text-text-secondary mt-2">Vuelve pronto para ver nuevos consejos.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
