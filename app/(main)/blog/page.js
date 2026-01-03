import db from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogPage() {
    const posts = db.prepare("SELECT * FROM blog_posts WHERE status = 'Publicado' ORDER BY published_at DESC").all();

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>Blog & Tips</h1>

            <div style={{ display: 'grid', gap: '20px' }}>
                {posts.map(post => (
                    <Link href={`/blog/${post.slug}`} key={post.post_id} style={{ display: 'block', textDecoration: 'none' }}>
                        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ height: '160px', background: '#eee', position: 'relative' }}>
                                {/* <Image ... /> Placeholder */}
                                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))' }}></div>
                                <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '10px' }}>{post.category}</span>
                            </div>
                            <div style={{ padding: '16px' }}>
                                <h3 style={{ fontSize: '16px', marginBottom: '8px', lineHeight: '1.4' }}>{post.title}</h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {post.excerpt}
                                </p>
                                <div style={{ marginTop: '12px', fontSize: '12px', color: '#888' }}>
                                    {new Date(post.published_at).toLocaleDateString()} • {post.views_count} vistas
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
