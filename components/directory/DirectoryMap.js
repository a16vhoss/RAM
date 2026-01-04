'use client';

import { useState, useEffect } from 'react';
import { FaMap, FaList, FaMapMarkerAlt } from 'react-icons/fa';

export default function DirectoryMap({ providers }) {
    const [view, setView] = useState('list'); // 'list' or 'map'
    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 20.6597, lng: -103.3496 }); // Default: Guadalajara

    // Get user's location
    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(userLoc);
                    setMapCenter(userLoc);
                },
                (error) => {
                    console.log('Geolocation not available, using default location');
                }
            );
        }
    }, []);

    // Calculate distance between two points (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Get nearby providers if user location is available
    const nearbyProviders = userLocation
        ? providers
            .map(p => ({
                ...p,
                distance: calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    p.latitude || mapCenter.lat,
                    p.longitude || mapCenter.lng
                )
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10)
        : providers;

    return (
        <div>
            {/* View Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', background: '#f0f0f0', padding: '4px', borderRadius: '12px' }}>
                <button
                    onClick={() => setView('list')}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        border: 'none',
                        background: view === 'list' ? 'white' : 'transparent',
                        fontWeight: view === 'list' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: '0.3s'
                    }}
                >
                    <FaList /> Lista
                </button>
                <button
                    onClick={() => setView('map')}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        border: 'none',
                        background: view === 'map' ? 'white' : 'transparent',
                        fontWeight: view === 'map' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: '0.3s'
                    }}
                >
                    <FaMap /> Mapa
                </button>
            </div>

            {/* Map View */}
            {view === 'map' && (
                <>
                    {userLocation && (
                        <div style={{
                            padding: '8px 12px',
                            background: '#E3F2FD',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <FaMapMarkerAlt color="var(--primary)" />
                            Mostrando lugares cerca de tu ubicación
                        </div>
                    )}

                    <div style={{
                        height: '400px',
                        background: '#eee',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        position: 'relative',
                        marginBottom: '16px'
                    }}>
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://maps.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>

                        {/* Map Overlay Info */}
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            {nearbyProviders.length} lugares encontrados
                        </div>
                    </div>

                    {/* Nearby Providers List */}
                    {userLocation && nearbyProviders.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                            <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                Lugares Cercanos
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {nearbyProviders.slice(0, 3).map(p => (
                                    <div key={p.provider_id} style={{
                                        background: 'white',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '13px',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{p.business_name}</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{p.provider_type}</div>
                                        </div>
                                        <div style={{
                                            background: '#E8F5E9',
                                            color: 'var(--success)',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: 'bold'
                                        }}>
                                            {p.distance.toFixed(1)} km
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
