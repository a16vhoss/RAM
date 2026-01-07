import db from '@/lib/db';
import Link from 'next/link';

export default async function BlogPage() {
    const posts = await db.getAll("SELECT * FROM blog_posts WHERE status = 'Publicado' ORDER BY published_at DESC");

    return (
        <div className="min-h-screen bg-background text-text-main px-4 py-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Blog & Tips</h1>
                <p className="text-text-secondary text-sm">Descubre todo lo que necesitas saber para recibir a tu nuevo mejor amigo en casa.</p>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                    <Link
                        href={`/blog/${post.slug}`}
                        key={post.post_id}
                        className="block group"
                    >
                        <article className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.01]">
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
                            <div className="p-4">
                                <h3 className="text-base font-bold mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                                    {post.excerpt}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center justify-between text-xs text-text-secondary">
                                    <span>{new Date(post.published_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    <span>{post.views_count || 0} vistas</span>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}

                {posts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-text-secondary">No hay publicaciones disponibles en este momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
