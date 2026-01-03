'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaPlusCircle, FaNewspaper, FaUser } from 'react-icons/fa';
import styles from './BottomNav.module.css';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    return (
        <nav className={styles.nav}>
            <Link href="/dashboard" className={`${styles.link} ${isActive('/dashboard') || isActive('/') ? styles.active : ''}`}>
                <FaHome size={24} />
                <span>Inicio</span>
            </Link>

            <Link href="/directory" className={`${styles.link} ${isActive('/directory') ? styles.active : ''}`}>
                <FaSearch size={24} />
                <span>Directorio</span>
            </Link>

            <Link href="/pets/new" className={`${styles.link} ${styles.mainAction}`}>
                <FaPlusCircle size={48} color="var(--success)" />
            </Link>

            <Link href="/blog" className={`${styles.link} ${isActive('/blog') ? styles.active : ''}`}>
                <FaNewspaper size={24} />
                <span>Blog</span>
            </Link>

            <Link href="/account" className={`${styles.link} ${isActive('/account') ? styles.active : ''}`}>
                <FaUser size={24} />
                <span>Cuenta</span>
            </Link>
        </nav>
    );
}
