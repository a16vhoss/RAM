'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCalendarAlt, FaEye, FaUserMd } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

export default function BlogPostViewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background-dark flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <BlogPostViewContent />
        </Suspense>
    );
}

function BlogPostViewContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPost() {
            if (!slug) {
                setError('No se proporcionó slug del artículo');
                setLoading(false);
                return;
            }

            try {
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
                const res = await fetch(`${API_BASE}/api/rpc/blog`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getBlogPost', data: { slug } })
                });

                if (res.ok) {
                    const json = await res.json();
                    if (json.success) {
                        setPost(json.data);
                    } else {
                        setError('Artículo no encontrado');
                    }
                } else {
                    setError('Error en el servidor');
                }
            } catch (err) {
                setError('Error de conexión: ' + err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">{error}</h2>
                    <Link href="/blog" className="text-primary hover:underline">Volver al Blog</Link>
                </div>
            </div>
        );
    }

    if (!post) return null;

    return (
        <article className="min-h-screen bg-white dark:bg-green-950 pb-20">
            {/* Hero Section */}
            <div className="relative h-80 md:h-screen w-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${post.image_url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=2000'})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                </div>

                <div className="absolute top-6 left-6 z-10">
                    <Link
                        href="/blog"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/20 transition-all text-sm font-medium"
                    >
                        <FaArrowLeft /> Volver al Blog
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                            {post.category || 'Blog RAM'}
                        </span>
                        <span className="flex items-center gap-1 text-slate-300 text-xs">
                            <FaCalendarAlt /> {new Date(post.published_at).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-md">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-6 text-slate-300 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/20">
                                <FaUserMd />
                            </div>
                            <span className="font-medium text-white">{post.author_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaEye /> {post.views_count} vistas
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 md:-mt-10 relative z-10">
                <div className="bg-white dark:bg-green-900 rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-12 border border-slate-100 dark:border-white/5">
                    <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 max-w-none">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>

                    {/* Tags */}
                    {post.tags && (
                        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-2">
                            {post.tags.split(',').map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium">
                                    #{tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="mt-8 md:mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl md:rounded-3xl p-6 md:p-10 text-center text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-12 -translate-y-6 group-hover:scale-110 transition-transform duration-700">
                        <FaUserMd size={140} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 relative z-10">¿Te gustó este artículo?</h3>
                    <p className="text-blue-100 mb-8 max-w-lg mx-auto relative z-10">
                        Únete a RAM para recibir más consejos veterinarios y proteger a tus mascotas con nuestra tecnología inteligente.
                    </p>
                    <Link
                        href="/pets/new"
                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        Registrar mi Mascota Gratis
                    </Link>
                </div>
            </div>
        </article>
    );
}
