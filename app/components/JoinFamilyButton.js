'use client';

import { useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import JoinFamilyModal from './JoinFamilyModal';

export default function JoinFamilyButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors flex items-center justify-center text-slate-600 dark:text-white border border-transparent dark:border-white/10"
                title="Unirse a una familia"
            >
                <FaUsers size={14} />
            </button>

            <JoinFamilyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
