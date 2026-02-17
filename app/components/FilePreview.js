'use client';

import { FaFilePdf, FaImage, FaTimes } from 'react-icons/fa';

export default function FilePreview({ file, onRemove }) {
    const isImage = file.type.startsWith('image/');

    return (
        <div className="relative group flex items-center gap-3 p-3 bg-slate-50 dark:bg-green-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {isImage ? (
                    <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <FaFilePdf className="text-red-500 text-xl" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {file.name}
                </p>
                <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
            </div>

            <button
                type="button"
                onClick={onRemove}
                className="p-1.5 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
            >
                <FaTimes size={14} />
            </button>
        </div>
    );
}
