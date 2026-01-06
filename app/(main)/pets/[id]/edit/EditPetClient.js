'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaCamera, FaArrowRight, FaArrowLeft, FaSearch, FaDog, FaCat, FaCrow, FaDragon, FaMouse, FaEllipsisH, FaQrcode } from 'react-icons/fa';
import { updatePet } from '@/app/actions/pet';

export default function EditPetPage({ params, pet }) {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    // Initialize form with pet data
    const [formData, setFormData] = useState({
        petName: pet.pet_name || '',
        species: pet.species || 'Perro',
        breed: pet.breed || '',
        color: pet.color || '',
        sex: pet.sex || 'Macho',
        birthDate: pet.birth_date ? new Date(pet.birth_date).toISOString().split('T')[0] : '', // Format for date input
        weight: pet.weight || '',
        microchipNumber: pet.microchip_number || '',
        isSpayed: pet.spayed_neutered === 1,
        allergies: pet.allergies || '',
        medicalNotes: pet.medical_notes || ''
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(pet.pet_photo);

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
            const result = await updatePet(params.id, data);
            if (result.success) {
                router.push(`/pets/${params.id}`);
                router.refresh();
            } else {
                alert('Error al actualizar: ' + (result.error || 'Desconocido'));
            }
        } catch (error) {
            console.error(error);
            alert('Error al enviar el formulario: ' + (error.message || error.toString()));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col max-w-7xl mx-auto bg-background text-text-main font-sans overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-primary/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full grow">
                {/* Top App Bar */}
                <div className="flex items-center px-4 py-4 pt-6 justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
                    <button onClick={() => router.back()} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <FaArrowLeft />
                    </button>
                    <h2 className="text-lg font-bold leading-tight flex-1 text-center">Editar Perfil</h2>
                    <button onClick={() => router.push(`/pets/${params.id}`)} className="flex items-center justify-end px-2">
                        <span className="text-text-secondary text-sm font-semibold hover:text-text-main transition-colors">Cancelar</span>
                    </button>
                </div>

                {/* Form Content - Single Page Scrollable */}
                <div className="flex-1 overflow-y-auto pb-32 px-6 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up max-w-2xl mx-auto">

                        {/* Photo Section */}
                        <div className="flex flex-col items-center pb-4">
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
                            <p className="text-text-secondary text-sm mt-3">Toca para cambiar la foto</p>
                        </div>

                        {/* Basic Info Group */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="w-1 h-6 bg-primary rounded-full"></span>
                                Información Básica
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Nombre</label>
                                    <input
                                        name="petName"
                                        value={formData.petName}
                                        onChange={handleChange}
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                        placeholder="Ej. Max"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Raza</label>
                                    <input
                                        name="breed"
                                        value={formData.breed}
                                        onChange={handleChange}
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                        placeholder="Raza"
                                    />
                                </div>
                            </div>

                            {/* Species Selector (Compact) */}
                            <div>
                                <label className="text-sm font-medium text-text-secondary mb-2 ml-1 block">Especie</label>
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {[
                                        { id: 'Perro', icon: <FaDog /> },
                                        { id: 'Gato', icon: <FaCat /> },
                                        { id: 'Ave', icon: <FaCrow /> },
                                        { id: 'Roedor', icon: <FaMouse /> },
                                        { id: 'Otro', icon: <FaEllipsisH /> }
                                    ].map(s => (
                                        <button
                                            type="button"
                                            key={s.id}
                                            onClick={() => handleSpeciesSelect(s.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${formData.species === s.id
                                                ? 'bg-primary text-white border-primary shadow-glow'
                                                : 'bg-surface dark:bg-surface-dark border-gray-200 dark:border-white/10 text-gray-400 hover:bg-white/5'
                                                }`}
                                        >
                                            {s.icon} <span className="text-sm font-bold">{s.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Physical Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                                Datos Físicos
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Género</label>
                                    <select
                                        name="sex"
                                        value={formData.sex}
                                        onChange={handleChange}
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="Macho">Macho</option>
                                        <option value="Hembra">Hembra</option>
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Color</label>
                                    <input
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Fecha Nac.</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary"
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
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            {/* Spayed Toggle */}
                            <div className="bg-surface dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-white/10 flex items-center justify-between">
                                <span className="text-sm font-medium text-text-main">¿Está esterilizado?</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isSpayed: !formData.isSpayed })}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.isSpayed ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isSpayed ? 'translate-x-6' : 'translate-x-0'}`}></span>
                                </button>
                            </div>
                        </div>

                        {/* Medical / ID */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                Identificación y Salud
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Microchip</label>
                                <input
                                    name="microchipNumber"
                                    value={formData.microchipNumber}
                                    onChange={handleChange}
                                    className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary"
                                    placeholder="Número de chip"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Alergias</label>
                                    <textarea
                                        name="allergies"
                                        value={formData.allergies}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Notas Médicas</label>
                                    <textarea
                                        name="medicalNotes"
                                        value={formData.medicalNotes}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-8 pb-32">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-glow flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                            >
                                {loading ? 'Actualizando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
