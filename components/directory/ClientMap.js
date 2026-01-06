'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { FaLocationArrow, FaMapMarkerAlt, FaStar, FaPhone, FaClock } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for user location
const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2791e7">
            <circle cx="12" cy="12" r="8" fill="#2791e7" stroke="white" stroke-width="3"/>
        </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

// Custom marker icon for veterinaries
const vetIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="#10b981"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
    `),
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
});

// Component to handle map centering
function LocationMarker({ center, onLocationFound }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.flyTo(center, 14);
        } else {
            // Try to get user's current position
            map.locate({ setView: true, maxZoom: 14 });
        }

        map.on('locationfound', (e) => {
            if (onLocationFound) {
                onLocationFound(e.latlng);
            }
        });

        map.on('locationerror', () => {
            console.log('Location access denied or unavailable');
        });

        return () => {
            map.off('locationfound');
            map.off('locationerror');
        };
    }, [map, center, onLocationFound]);

    return null;
}

export default function ClientMap({ onPlacesFound }) {
    const [userLocation, setUserLocation] = useState(null);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState([19.4326, -99.1332]); // Mexico City default
    const mapRef = useRef(null);

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

    // Fetch providers from database
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const response = await fetch('/api/providers');
                const data = await response.json();

                // Filter providers that have valid coordinates
                const validProviders = data.filter(p => p.latitude && p.longitude);
                setProviders(validProviders);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching providers:', error);
                setLoading(false);
            }
        };

        fetchProviders();
    }, []);

    // Handle location found
    const handleLocationFound = (latlng) => {
        setUserLocation([latlng.lat, latlng.lng]);
        setMapCenter([latlng.lat, latlng.lng]);

        // Calculate distances and update nearby providers
        if (providers.length > 0) {
            const providersWithDistance = providers.map(p => ({
                ...p,
                distance: calculateDistance(latlng.lat, latlng.lng, p.latitude, p.longitude)
            })).sort((a, b) => a.distance - b.distance);

            if (onPlacesFound) {
                onPlacesFound(providersWithDistance.slice(0, 20)); // Top 20 nearest
            }
        }
    };

    // Recenter to user location
    const recenterMap = () => {
        if (mapRef.current && userLocation) {
            mapRef.current.flyTo(userLocation, 14);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full animate-pulse bg-gray-800 rounded-2xl flex items-center justify-center">
                <span className="text-slate-500 text-sm">Cargando mapa...</span>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '24px', overflow: 'hidden' }}>
            <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationMarker center={mapCenter} onLocationFound={handleLocationFound} />

                {/* User location marker and radius */}
                {userLocation && (
                    <>
                        <Marker position={userLocation} icon={userIcon}>
                            <Popup>
                                <div className="text-center">
                                    <p className="font-bold text-sm">Tu ubicación</p>
                                    <p className="text-xs text-gray-600">Mostrando veterinarias cercanas</p>
                                </div>
                            </Popup>
                        </Marker>
                        <Circle
                            center={userLocation}
                            radius={2000} // 2km radius
                            pathOptions={{
                                fillColor: '#2791e7',
                                fillOpacity: 0.1,
                                color: '#2791e7',
                                weight: 2,
                                opacity: 0.5
                            }}
                        />
                    </>
                )}

                {/* Provider markers */}
                {providers.map((provider) => (
                    <Marker
                        key={provider.provider_id}
                        position={[provider.latitude, provider.longitude]}
                        icon={vetIcon}
                    >
                        <Popup>
                            <div className="min-w-[200px] p-2">
                                <h3 className="font-bold text-base mb-2">{provider.business_name}</h3>

                                {provider.rating_average && (
                                    <div className="flex items-center gap-1 mb-2">
                                        <FaStar className="text-yellow-500 text-xs" />
                                        <span className="text-sm font-semibold">{provider.rating_average}</span>
                                        {provider.total_reviews && (
                                            <span className="text-xs text-gray-500">({provider.total_reviews} reseñas)</span>
                                        )}
                                    </div>
                                )}

                                <div className="text-sm text-gray-700 mb-1 flex items-start gap-2">
                                    <FaMapMarkerAlt className="mt-0.5 text-gray-500" />
                                    <span>{provider.address}</span>
                                </div>

                                {provider.phone && (
                                    <div className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                                        <FaPhone className="text-gray-500" />
                                        <a href={`tel:${provider.phone}`} className="text-blue-600 hover:underline">
                                            {provider.phone}
                                        </a>
                                    </div>
                                )}

                                <div className="mt-2">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${provider.is_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {provider.is_open ? 'Abierto' : 'Cerrado'}
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Recenter button */}
            {userLocation && (
                <button
                    onClick={recenterMap}
                    className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg text-primary z-[1000] hover:scale-110 transition-transform"
                    title="Volver a mi ubicación"
                >
                    <FaLocationArrow />
                </button>
            )}

            {/* Provider count badge */}
            <div className="absolute top-4 left-4 z-[1000] bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <span className="text-xs font-bold text-white">
                    {providers.length} {providers.length === 1 ? 'veterinaria encontrada' : 'veterinarias encontradas'}
                </span>
            </div>
        </div>
    );
}
