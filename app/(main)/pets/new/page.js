'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaCamera, FaArrowRight, FaArrowLeft, FaSearch, FaDog, FaCat, FaCrow, FaDragon, FaMouse, FaEllipsisH, FaQrcode } from 'react-icons/fa';
import { createPet } from '@/app/actions/pet';

export default function NewPetPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        petName: '', species: 'Perro', breed: '', color: '',
        sex: 'Macho', birthDate: '', weight: '', city: '',
        microchipNumber: '', isSpayed: false,
        allergies: '', medicalNotes: ''
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSpeciesSelect = (species) => {
        setFormData({ ...formData, species });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleNext = () => setStep(step + 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        if (photoFile) {
            data.append('photo', photoFile);
        }

        try {
            const result = await createPet(data);
            if (result.success) {
                router.push('/dashboard');
                router.refresh(); // Refresh to see the new pet
            } else {
                alert('Error al registrar: ' + (result.error || 'Desconocido'));
            }
        } catch (error) {
            console.error(error);
            alert('Error al enviar el formulario: ' + (error.message || error.toString()));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background text-text-main font-sans overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-primary/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full grow">
                {/* Top App Bar */}
                <div className="flex items-center px-4 py-4 pt-6 justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md">
                    <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <FaArrowLeft />
                    </button>
                    <h2 className="text-lg font-bold leading-tight flex-1 text-center">Nueva Mascota</h2>
                    <button onClick={() => router.push('/dashboard')} className="flex items-center justify-end px-2">
                        <span className="text-text-secondary text-sm font-semibold hover:text-text-main transition-colors">Cancelar</span>
                    </button>
                </div>

                {/* Progress Stepper */}
                <div className="px-6 pb-2">
                    <div className="flex w-full items-center gap-2">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? 'bg-primary shadow-glow' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
                        ))}
                    </div>
                    <p className="text-xs text-center text-primary mt-2 font-medium tracking-wide uppercase">Paso {step}: {step === 1 ? 'Identidad' : step === 2 ? 'Detalles Fisicos' : 'Datos Médicos'}</p>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto pb-32 px-6">
                    {step === 1 && (
                        <div className="animate-fade-in-up">
                            {/* Photo Upload */}
                            <div className="flex flex-col items-center pt-6 pb-8">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <div
                                    className="relative group cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse group-hover:bg-primary/50 transition-all duration-500"></div>
                                    <div className="relative z-10 w-32 h-32 rounded-full border-4 border-surface dark:border-background-dark bg-surface-dark overflow-hidden flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <FaCamera className="text-white text-4xl drop-shadow-md z-20" />
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 z-20 bg-primary text-white p-1.5 rounded-full border-4 border-background flex items-center justify-center shadow-md">
                                        <FaCamera size={12} />
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <h3 className="text-2xl font-bold tracking-tight">¿A quién agregamos?</h3>
                                    <p className="text-text-secondary text-sm mt-1">Sube una foto para empezar</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Nombre</label>
                                    <input
                                        name="petName"
                                        value={formData.petName}
                                        onChange={handleChange}
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                        placeholder="Ej. Max, Luna, Thor"
                                    />
                                </div>

                                {/* Species */}
                                <div>
                                    <label className="text-sm font-medium text-text-secondary mb-3 ml-1 block">Especie</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                        {[
                                            { id: 'Perro', icon: <FaDog size={24} /> },
                                            { id: 'Gato', icon: <FaCat size={24} /> },
                                            { id: 'Ave', icon: <FaCrow size={24} /> },
                                            { id: 'Roedor', icon: <FaMouse size={24} /> },
                                            { id: 'Otro', icon: <FaEllipsisH size={24} /> }
                                        ].map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => handleSpeciesSelect(s.id)}
                                                className={`flex flex-col items-center justify-center min-w-[5.5rem] h-20 rounded-2xl border transition-all ${formData.species === s.id
                                                    ? 'bg-primary text-white border-primary shadow-glow scale-[1.02]'
                                                    : 'bg-surface dark:bg-surface-dark border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-primary/50'
                                                    }`}
                                            >
                                                <span className="mb-1">{s.icon}</span>
                                                <span className="text-xs font-bold">{s.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Breed */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Raza</label>
                                    <div className="relative">
                                        <input
                                            name="breed"
                                            value={formData.breed}
                                            onChange={handleChange}
                                            className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                            placeholder="Buscar raza..."
                                        />
                                        <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                {/* City / Birthplace */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Lugar de Origen (Ciudad)</label>
                                    <input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                        placeholder="Ej. Guadalajara, CDMX"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in-up space-y-6 pt-4">
                            {/* Sex */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Género</label>
                                <div className="flex bg-surface dark:bg-surface-dark p-1 rounded-xl border border-gray-200 dark:border-white/10">
                                    {['Macho', 'Hembra'].map(sex => (
                                        <button
                                            key={sex}
                                            onClick={() => setFormData({ ...formData, sex })}
                                            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${formData.sex === sex
                                                ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-text-main'
                                                }`}
                                        >
                                            {sex}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Color Principal</label>
                                <input
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    placeholder="Ej. Café, Blanco, Negro"
                                    className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Fecha Nac.</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Peso (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Spayed Toggle */}
                            <div className="bg-surface dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-white/10 flex items-center justify-between">
                                <span className="text-sm font-medium text-text-main">¿Está esterilizado?</span>
                                <button
                                    onClick={() => setFormData({ ...formData, isSpayed: !formData.isSpayed })}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.isSpayed ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isSpayed ? 'translate-x-6' : 'translate-x-0'}`}></span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in-up space-y-6 pt-4">
                            {/* Microchip */}
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <FaQrcode className="text-primary" />
                                        <label className="text-sm font-bold text-text-main">Datos Oficiales</label>
                                    </div>
                                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md font-medium">Recomendado</span>
                                </div>
                                <div className="relative">
                                    <label className="text-xs text-text-secondary mb-1 block ml-1">Número de Microchip</label>
                                    <input
                                        name="microchipNumber"
                                        value={formData.microchipNumber}
                                        onChange={handleChange}
                                        className="w-full bg-surface dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="Escanea o escribe el número"
                                    />
                                </div>
                            </div>

                            {/* Allergies */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Alergias</label>
                                <textarea
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                    placeholder="Opcional"
                                ></textarea>
                            </div>

                            {/* Medical Notes */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Notas Médicas</label>
                                <textarea
                                    name="medicalNotes"
                                    value={formData.medicalNotes}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                    placeholder="Opcional"
                                ></textarea>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background via-background to-transparent z-40">
                    <button
                        onClick={step === 3 ? handleSubmit : handleNext}
                        disabled={loading}
                        className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-glow flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                    >
                        <span>{step === 3 ? (loading ? 'Guardando...' : 'Finalizar') : 'Continuar'}</span>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

