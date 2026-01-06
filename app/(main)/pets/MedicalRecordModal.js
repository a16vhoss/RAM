'use client';

import { useState } from 'react';
import { FaTimes, FaSave, FaSyringe, FaNotesMedical, FaPills, FaStethoscope } from 'react-icons/fa';
import { addMedicalRecord } from '@/app/actions/medical';
import { useRouter } from 'next/navigation';

export default function MedicalRecordModal({ petId, isOpen, onClose, onRecordAdded }) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [recordType, setRecordType] = useState('Vacuna');

    if (!isOpen) return null;

    async function handleSubmit(formData) {
        setSubmitting(true);
        // Append petId manually since it's passed as prop
        formData.append('pet_id', petId);
        formData.append('type', recordType);

        const res = await addMedicalRecord(formData);

        setSubmitting(false);

        if (res.success) {
            onRecordAdded && onRecordAdded(); // Callback to refresh parent list
            router.refresh(); // Refresh Data Cache
            onClose();
        } else {
            alert('Error al guardar: ' + res.error);
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
            <div className="animate-fade-in w-full max-w-md bg-surface-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="bg-slate-900/50 p-6 flex justify-between items-center border-b border-white/5">
                    <h3 className="text-xl font-bold text-white">Nuevo Registro Médico</h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 flex flex-col gap-6">

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
                                name="date"
                                type="date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-slate-400">Veterinario / Clínica</label>
                            <input
                                name="vet_name"
                                type="text"
                                placeholder="Ej. Dr. García / VetCare"
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary placeholder-slate-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-slate-400">Descripción / Producto</label>
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="Ej. Rabia Refuerzo Anual o Detalles de la consulta..."
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary placeholder-slate-500 resize-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {submitting ? 'Guardando...' : <><FaSave /> Guardar Registro</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
