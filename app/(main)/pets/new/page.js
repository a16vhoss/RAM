'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCamera, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

export default function NewPetPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        petName: '', species: 'Perro', breed: '', color: '',
        sex: 'Macho', birthDate: '', weight: '',
        microchipNumber: '', isSpayed: false,
        allergies: '', medicalNotes: ''
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleNext = () => setStep(step + 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/pets/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                // Show success modal or redirect
                router.push('/dashboard');
                router.refresh();
            } else {
                alert('Error al registrar');
            }
        } catch (e) {
            alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const SpeciesOptions = ['Perro', 'Gato', 'Ave', 'Reptil', 'Roedor', 'Otro'];

    return (
        <div style={{ padding: '20px' }}>
            <h1>Registrar Mascota</h1>
            <div style={{ margin: '20px 0', height: '4px', background: '#eee', borderRadius: '2px' }}>
                <div style={{ width: `${(step / 3) * 100}%`, height: '100%', background: 'var(--success)', borderRadius: '2px', transition: 'width 0.3s' }}></div>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                {step === 1 && (
                    <div className="fade-in">
                        <div style={{ width: '100px', height: '100px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', cursor: 'pointer', border: '2px dashed #ccc' }}>
                            <FaCamera size={30} color="#aaa" />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Nombre</label>
                            <input name="petName" className="input-control" value={formData.petName} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Especie</label>
                            <select name="species" className="input-control" value={formData.species} onChange={handleChange}>
                                {SpeciesOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Raza</label>
                            <input name="breed" className="input-control" value={formData.breed} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Color</label>
                            <input name="color" className="input-control" value={formData.color} onChange={handleChange} required placeholder="Ej: Café" />
                        </div>

                        <button onClick={handleNext} className="btn btn-primary btn-block">
                            Siguiente <FaArrowRight style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="fade-in">
                        <div className="input-group">
                            <label className="input-label">Sexo</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className={`btn btn-block ${formData.sex === 'Macho' ? 'btn-primary' : ''}`} style={{ background: formData.sex !== 'Macho' && '#eee', color: formData.sex !== 'Macho' && '#333' }} onClick={() => setFormData({ ...formData, sex: 'Macho' })}>Macho</button>
                                <button className={`btn btn-block ${formData.sex === 'Hembra' ? 'btn-primary' : ''}`} style={{ background: formData.sex !== 'Hembra' && '#eee', color: formData.sex !== 'Hembra' && '#333' }} onClick={() => setFormData({ ...formData, sex: 'Hembra' })}>Hembra</button>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Fecha de Nacimiento</label>
                            <input name="birthDate" type="date" className="input-control" value={formData.birthDate} onChange={handleChange} />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Peso (kg)</label>
                            <input name="weight" type="number" step="0.1" className="input-control" value={formData.weight} onChange={handleChange} />
                        </div>

                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label className="input-label" style={{ marginBottom: 0 }}>¿Esterilizado?</label>
                            <input name="isSpayed" type="checkbox" checked={formData.isSpayed} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>Atrás</button>
                            <button onClick={handleNext} className="btn btn-primary" style={{ flex: 1 }}>Siguiente</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="fade-in">
                        <div className="input-group">
                            <label className="input-label">Número de Microchip (Opcional)</label>
                            <input name="microchipNumber" className="input-control" value={formData.microchipNumber} onChange={handleChange} />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Alergias</label>
                            <textarea name="allergies" className="input-control" value={formData.allergies} onChange={handleChange} rows={3} placeholder="Opcional"></textarea>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Notas Médicas</label>
                            <textarea name="medicalNotes" className="input-control" value={formData.medicalNotes} onChange={handleChange} rows={3} placeholder="Opcional"></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1 }}>Atrás</button>
                            <button onClick={handleSubmit} className="btn btn-success" style={{ flex: 2 }} disabled={loading}>
                                {loading ? 'Guardando...' : 'Finalizar Registro'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
