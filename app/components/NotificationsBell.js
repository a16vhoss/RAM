'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaBell, FaInfoCircle, FaExclamationTriangle, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { getNotifications, markNotificationAsRead } from '@/app/actions/user';
import Link from 'next/link';

export default function NotificationsBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        async function fetchNotifications() {
            const res = await getNotifications();
            if (res.success) {
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.is_read).length);
            }
        }

        fetchNotifications();
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);


    // ...
    const handleMarkAsRead = async (notification) => {
        if (!notification.is_read) {
            await markNotificationAsRead(notification.notification_id);
            // Optimistic update
            const updated = notifications.map(n =>
                n.notification_id === notification.notification_id ? { ...n, is_read: true } : n
            );
            setNotifications(updated);
            setUnreadCount(updated.filter(n => !n.is_read).length);
        }

        // Navigation Logic
        if ((notification.type === 'amber_alert' || notification.type === 'pet_found') && notification.related_id) {
            setIsOpen(false); // Close dropdown
            router.push(`/public/pet/${notification.related_id}`);
        }
    };

    const toggleOpen = () => setIsOpen(!isOpen);

    const getIcon = (type) => {
        if (type === 'amber_alert') return <FaExclamationTriangle className="text-red-500" />;
        if (type === 'pet_found') return <FaCheckCircle className="text-green-500" />;
        return <FaInfoCircle className="text-primary" />;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleOpen}
                className="relative p-2 rounded-full hover:bg-white/5 transition-colors"
            >
                <FaBell size={24} className="text-slate-400 hover:text-white transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-slate-900 animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-green-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in origin-top-right">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-green-900/50 backdrop-blur-md">
                        <h3 className="font-bold text-white">Notificaciones</h3>
                        {unreadCount > 0 && <span className="text-xs text-primary font-bold">{unreadCount} nuevas</span>}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                <FaBell className="mx-auto mb-2 opacity-20" size={32} />
                                No tienes notificaciones
                            </div>
                        ) : (
                            notifications.map((note) => (
                                <div
                                    key={note.notification_id}
                                    onClick={() => handleMarkAsRead(note)}
                                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!note.is_read ? 'bg-white/[0.02]' : ''}`}
                                >
                                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${note.type === 'amber_alert' ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                                        {getIcon(note.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm font-bold ${!note.is_read ? 'text-white' : 'text-slate-400'}`}>{note.title}</h4>
                                            {!note.is_read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5"></span>}
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed">{note.message}</p>
                                        <p className="text-[10px] text-slate-500 mt-2">
                                            {new Date(note.created_at).toLocaleDateString()} • {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>

                                        {note.type === 'amber_alert' && note.related_id && (
                                            <span className="block mt-2 text-xs font-bold text-red-400 hover:underline cursor-pointer">
                                                Ver Mascota
                                            </span>
                                        )}
                                        {note.type === 'pet_found' && note.related_id && (
                                            <span className="block mt-2 text-xs font-bold text-green-400 hover:underline cursor-pointer">
                                                Ver Mascota
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
