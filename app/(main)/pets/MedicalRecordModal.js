'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSyringe, FaNotesMedical, FaPills, FaStethoscope, FaPaperclip, FaTrash } from 'react-icons/fa';
import { addMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '@/app/actions/medical';
import { useRouter } from 'next/navigation';
import FilePreview from '@/app/components/FilePreview';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Client-side Supabase instance for file uploads
function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return null;
    return createClient(supabaseUrl, supabaseKey);
}

export default function MedicalRecordModal({ petId, isOpen, onClose, onRecordAdded, editRecord = null }) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [recordType, setRecordType] = useState('Vacuna');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [uploadProgress, setUploadProgress] = useState('');

    // Form field states for edit mode
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
    const [formVetName, setFormVetName] = useState('');
    const [formDescription, setFormDescription] = useState('');

    const isEditMode = !!editRecord;

    // Initialize form when editing
    useEffect(() => {
        if (editRecord) {
            setRecordType(editRecord.record_type || 'Vacuna');
            setFormDate(editRecord.date ? new Date(editRecord.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setFormVetName(editRecord.vet_name || '');
            setFormDescription(editRecord.description || '');
            // Parse existing attachments
            const attachments = editRecord.attachments || [];
            setExistingAttachments(Array.isArray(attachments) ? attachments : []);
        } else {
            // Reset form for new record
            setRecordType('Vacuna');
            setFormDate(new Date().toISOString().split('T')[0]);
            setFormVetName('');
            setFormDescription('');
            setExistingAttachments([]);
        }
        setSelectedFiles([]);
    }, [editRecord, isOpen]);

    if (!isOpen) return null;

    const handleFileSelect = (e) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingAttachment = (index) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Upload files directly to Supabase Storage from client
    async function uploadFilesToStorage(files) {
        const attachments = [];
        const supabase = getSupabaseClient();

        if (!supabase || files.length === 0) return attachments;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file || file.size === 0) continue;

            setUploadProgress(`Subiendo archivo ${i + 1} de ${files.length}...`);

            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${petId}/${uuidv4()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('Medical-records')
                    .upload(fileName, file, { contentType: file.type, upsert: false });

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('Medical-records')
                        .getPublicUrl(fileName);

                    attachments.push({
                        name: file.name,
                        type: file.type,
                        url: publicUrl
                    });
                } else {
                    console.error('Upload error:', uploadError.message);
                }
            } catch (err) {
                console.error('File upload failed:', err);
            }
        }

        setUploadProgress('');
        return attachments;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Upload new files to Supabase Storage
            const newAttachments = await uploadFilesToStorage(selectedFiles);

            // 2. Combine with existing attachments
            const allAttachments = [...existingAttachments, ...newAttachments];

            // 3. Create form data
            const formData = new FormData();
            formData.append('pet_id', petId);
            formData.append('type', recordType);
            formData.append('date', formDate);
            formData.append('vet_name', formVetName);
            formData.append('description', formDescription);
            formData.append('attachments_json', JSON.stringify(allAttachments));

            let res;
            if (isEditMode) {
                formData.append('record_id', editRecord.record_id);
                res = await updateMedicalRecord(formData);
            } else {
                res = await addMedicalRecord(formData);
            }

            setSubmitting(false);

            if (res.success) {
                setSelectedFiles([]);
                setExistingAttachments([]);
                onRecordAdded && onRecordAdded();
                router.refresh();
                onClose();
            } else {
                alert('Error al guardar: ' + (res.error || 'Error desconocido'));
            }
        } catch (err) {
            console.error('Submit error:', err);
            setSubmitting(false);
            alert('Error de conexión. Por favor intenta de nuevo.');
        }
    }

    async function handleDelete() {
        if (!editRecord?.record_id) return;

        if (!confirm('¿Estás seguro de eliminar este registro médico? Esta acción no se puede deshacer.')) {
            return;
        }

        setDeleting(true);
        try {
            const res = await deleteMedicalRecord(editRecord.record_id, petId);
            setDeleting(false);

            if (res.success) {
                onRecordAdded && onRecordAdded();
                router.refresh();
                onClose();
            } else {
                alert('Error al eliminar: ' + (res.error || 'Error desconocido'));
            }
        } catch (err) {
            console.error('Delete error:', err);
            setDeleting(false);
            alert('Error de conexión.');
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
            <div className="animate-fade-in w-full max-w-md bg-surface-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="bg-green-950/50 p-6 flex justify-between items-center border-b border-white/5">
                    <h3 className="text-xl font-bold text-white">
                        {isEditMode ? 'Editar Registro' : 'Nuevo Registro Médico'}
                    </h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">

                    {/* Record Type Selection */}
                    <div className="flex gap-2 p-1 bg-black/20 rounded-xl">
                        {['Vacuna', 'Desparasitación', 'Cirugía', 'Consulta'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setRecordType(type)}
                                className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${recordType === type ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {type === 'Vacuna' && <FaSyringe size={14} />}
                                {type === 'Desparasitación' && <FaPills size={14} />}
                                {type === 'Cirugía' && <FaNotesMedical size={14} />}
                                {type === 'Consulta' && <FaStethoscope size={14} />}
                                {type === 'Desparasitación' ? 'Despar.' : type}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-slate-400">Fecha</label>
                            <input
                                type="date"
                                required
                                value={formDate}
                                onChange={(e) => setFormDate(e.target.value)}
                                className="w-full bg-green-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-slate-400">Veterinario / Clínica</label>
                            <input
                                type="text"
                                placeholder="Ej. Dr. García / VetCare"
                                value={formVetName}
                                onChange={(e) => setFormVetName(e.target.value)}
                                className="w-full bg-green-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary placeholder-slate-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-slate-400">Descripción / Producto</label>
                            <textarea
                                rows={3}
                                placeholder="Ej. Rabia Refuerzo Anual o Detalles de la consulta..."
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="w-full bg-green-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary placeholder-slate-500 resize-none"
                            />
                        </div>

                        {/* Existing Attachments (edit mode) */}
                        {existingAttachments.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-slate-400">Archivos Actuales</label>
                                <div className="flex flex-col gap-2">
                                    {existingAttachments.map((att, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-green-900 rounded-xl border border-white/10">
                                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm truncate flex-1">
                                                {att.name}
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingAttachment(index)}
                                                className="text-red-400 hover:text-red-500 p-1"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* File Attachments */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase text-slate-400">
                                    {isEditMode ? 'Añadir Archivos' : 'Archivos Adjuntos'}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('file-upload').click()}
                                    className="text-primary text-xs font-bold hover:text-primary-hover flex items-center gap-1"
                                >
                                    <FaPaperclip /> Adjuntar
                                </button>
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    {selectedFiles.map((file, index) => (
                                        <FilePreview
                                            key={index}
                                            file={file}
                                            onRemove={() => handleRemoveFile(index)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={submitting || deleting}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {submitting ? (uploadProgress || 'Guardando...') : <><FaSave /> {isEditMode ? 'Guardar Cambios' : 'Guardar Registro'}</>}
                        </button>

                        {isEditMode && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={submitting || deleting}
                                className="w-full border border-red-500/30 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {deleting ? 'Eliminando...' : <><FaTrash /> Eliminar Registro</>}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
