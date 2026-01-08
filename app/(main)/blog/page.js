import db from '@/lib/db';
import Link from 'next/link';
import { getSession } from '@/lib/auth';

export default async function BlogPage() {
    const session = await getSession();
    const posts = await db.getAll("SELECT * FROM blog_posts WHERE status = 'Publicado' ORDER BY published_at DESC");

    let recommendedPosts = [];
    let otherPosts = posts;

    // Personalization Logic
    if (session?.user) {
        // Fetch user's pet species
        const userPets = await db.getAll("SELECT DISTINCT species FROM pets WHERE user_id = $1", [session.user.user_id]);
        const userSpecies = userPets.map(p => p.species.toLowerCase()); // e.g., ['perro', 'gato']

        if (userSpecies.length > 0) {
            recommendedPosts = posts.filter(post => {
                const tags = (post.tags || '').toLowerCase();
                return userSpecies.some(species => tags.includes(species));
            });

            // Filter out recommended from "others" to avoid duplicates (optional, but cleaner)
            const recommendedIds = new Set(recommendedPosts.map(p => p.post_id));
            otherPosts = posts.filter(p => !recommendedIds.has(p.post_id));
        }
    }

    const PostCard = ({ post }) => (
        <Link
            href={`/blog/${post.slug}`}
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
