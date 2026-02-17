'use client';

import { useState, useEffect } from 'react';
import { getReportedPosts, dismissReport, deletePostAsAdmin } from '@/app/actions/admin';
import { FaEye, FaCheck, FaTrash, FaExclamationTriangle, FaUser } from 'react-icons/fa';
import Link from 'next/link';

export default function ReportedPostsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // id of report being processed

    const loadReports = async () => {
        try {
            const res = await getReportedPosts();
            if (res.success) {
                setReports(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const handleDismiss = async (reportId) => {
        if (!confirm('¿Descartar este reporte? El post se mantendrá visible.')) return;
        setActionLoading(reportId);
        try {
            const res = await dismissReport(reportId);
            if (res.success) {
                setReports(reports.filter(r => r.report_id !== reportId));
            } else {
                alert('Error: ' + res.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeletePost = async (postId, reportId) => {
        if (!confirm('¿ELIMINAR POST DEFINITIVAMENTE? Esta acción no se puede deshacer.')) return;
        setActionLoading(reportId);
        try {
            const res = await deletePostAsAdmin(postId);
            if (res.success) {
                // Remove all reports related to this post from UI or just refresh
                setReports(reports.filter(r => r.post_id !== postId));
            } else {
                alert('Error: ' + res.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Reportes Pendientes</h1>
                <p className="text-slate-400">Revisa el contenido reportado por la comunidad.</p>
            </header>

            {reports.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/5">
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheck size={30} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">¡Todo limpio!</h3>
                    <p className="text-slate-400">No hay reportes pendientes de revisión.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reports.map((report) => (
                        <div key={report.report_id} className="bg-green-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row">
                            {/* Report Details Sidebar */}
                            <div className="p-6 md:w-80 bg-red-500/5 border-b md:border-b-0 md:border-r border-white/5 flex flex-col gap-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-1 rounded">
                                        Motivo
                                    </span>
                                    <p className="mt-2 text-white font-medium">{report.reason || 'Sin motivo especificado'}</p>
                                </div>

                                <div className="text-sm text-slate-400">
                                    <p className="flex items-center gap-2 mb-1">
                                        <FaUser size={12} /> Reportado por:
                                    </p>
                                    <p className="text-white ml-5">{report.reporter_name || 'Anónimo'}</p>
                                    <p className="text-xs ml-5 mt-1 opacity-60">
                                        {new Date(report.report_date).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2">
                                    <button
                                        onClick={() => handleDismiss(report.report_id)}
                                        disabled={actionLoading === report.report_id}
                                        className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                    >
                                        <FaCheck className="inline mr-2" /> Mantener (Descartar)
                                    </button>
                                    <button
                                        onClick={() => handleDeletePost(report.post_id, report.report_id)}
                                        disabled={actionLoading === report.report_id}
                                        className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                    >
                                        <FaTrash className="inline mr-2" /> Eliminar Post
                                    </button>
                                </div>
                            </div>

                            {/* Post Content Preview */}
                            <div className="flex-1 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Link href={`/communities/view?slug=${report.community_slug}`} className="text-xs font-bold text-primary hover:underline">
                                            {report.community_name}
                                        </Link>
                                        <span className="text-slate-600">•</span>
                                        <span className="text-sm text-slate-300">Autor: {report.author_name}</span>
                                    </div>
                                    <Link
                                        href={`/communities/post-view?id=${report.post_id}`}
                                        target="_blank"
                                        className="text-primary hover:text-white transition-colors text-sm flex items-center gap-2"
                                    >
                                        Ver original <FaEye />
                                    </Link>
                                </div>

                                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-slate-300">
                                    <p className="whitespace-pre-wrap">{report.post_content}</p>

                                    {report.media_urls && JSON.parse(report.media_urls).length > 0 && (
                                        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                            {JSON.parse(report.media_urls).map((url, i) => (
                                                <img key={i} src={url} className="h-24 rounded-lg border border-white/10" alt="Evidence" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
