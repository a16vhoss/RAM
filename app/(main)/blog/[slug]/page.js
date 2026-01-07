import db from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaArrowLeft, FaCalendarAlt, FaEye, FaUserMd } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

export default async function BlogPostPage({ params }) {
    const { slug } = await params;

    const post = await db.getOne('SELECT * FROM blog_posts WHERE slug = $1', [slug]);

    if (!post) {
        notFound();
    }

    // Increment view count
    await db.run('UPDATE blog_posts SET views_count = views_count + 1 WHERE slug = $1', [slug]);

    return (
        <article className="min-h-screen bg-white dark:bg-slate-900 pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full">
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
                            <FaEye /> {post.views_count + 1} vistas
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-3xl mx-auto px-6 -mt-10 relative z-10">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100 dark:border-white/5">
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
                <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-center text-white shadow-2xl relative overflow-hidden group">
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
