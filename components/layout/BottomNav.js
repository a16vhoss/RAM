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
                <FaHome size={24} style={{ marginBottom: '2px' }} />
                <span>Inicio</span>
            </Link>

            <Link href="/directory" className={`${styles.link} ${isActive('/directory') ? styles.active : ''}`}>
                <FaSearch size={22} style={{ marginBottom: '2px' }} />
                <span>Buscar</span>
            </Link>

            <div className={styles.fabContainer}>
                <Link href="/pets/new" className={styles.fab}>
                    <FaPlusCircle size={28} />
                </Link>
            </div>

            <Link href="/blog" className={`${styles.link} ${isActive('/blog') ? styles.active : ''}`}>
                <FaNewspaper size={22} style={{ marginBottom: '2px' }} />
                <span>Blog</span>
            </Link>

            <Link href="/account" className={`${styles.link} ${isActive('/account') ? styles.active : ''}`}>
                <FaUser size={22} style={{ marginBottom: '2px' }} />
                <span>Cuenta</span>
            </Link>
        </nav>
    );
}
