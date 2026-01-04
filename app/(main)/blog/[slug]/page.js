import db from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaArrowLeft, FaCalendarAlt, FaEye } from 'react-icons/fa';

export default async function BlogPostPage({ params }) {
    const { slug } = await params;

    const post = await db.getOne('SELECT * FROM blog_posts WHERE slug = $1', [slug]);

    if (!post) {
        notFound();
    }

    // Increment view count (not ideal for strict React Server Components without actions, but okay for demo)
    await db.run('UPDATE blog_posts SET views_count = views_count + 1 WHERE slug = $1', [slug]);

    return (
        <div style={{ padding: '0 0 80px 0' }}>
            <div style={{ position: 'relative', height: '250px', background: '#eee' }}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))' }}></div>
                <Link href="/blog" style={{ position: 'absolute', top: '20px', left: '20px', background: 'white', padding: '8px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
                    <FaArrowLeft /> Regresar
                </Link>
            </div>

            <div style={{ padding: '24px', background: 'white', borderRadius: '24px 24px 0 0', marginTop: '-24px', position: 'relative' }}>
                <div style={{ display: 'inline-block', background: '#F0F7FC', color: 'var(--primary)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', marginBottom: '12px' }}>
                    {post.category}
                </div>

                <h1 style={{ fontSize: '24px', marginBottom: '16px', lineHeight: '1.3' }}>{post.title}</h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCalendarAlt /> {new Date(post.published_at).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaEye /> {post.views_count + 1} vistas
                    </div>
                </div>

                <div style={{ lineHeight: '1.8', color: '#333' }} dangerouslySetInnerHTML={{ __html: post.content }}></div>

                {/* CTA */}
                <div style={{ background: '#E8F5E9', padding: '20px', borderRadius: '12px', marginTop: '40px', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--success)', marginBottom: '8px' }}>💡 ¿Sabías que?</h3>
                    <p style={{ marginBottom: '16px' }}>Puedes proteger a tu mascota registrándola gratis en RAM.</p>
                    <Link href="/pets/new" className="btn btn-primary">Registrar ahora</Link>
                </div>
            </div>
        </div>
    );
}
