'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaLocationArrow, FaList, FaMap } from 'react-icons/fa';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '24px'
};

const defaultCenter = {
    lat: 19.4326, // Mexico City
    lng: -99.1332
};

const libraries = ['places'];

export default function ClientMap({ onPlacesFound }) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries
    });

    const [map, setMap] = useState(null);
    const [center, setCenter] = useState(defaultCenter);
    const [userLocation, setUserLocation] = useState(null);
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);

    const mapRef = useRef(null);

    const searchNearby = useCallback((location) => {
        if (!mapRef.current || !window.google) return;

        const service = new window.google.maps.places.PlacesService(mapRef.current);
        const request = {
            location: location,
            radius: '2000', // 2km
            type: ['veterinary_care'] // Base type
        };

        service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                // Filter and map results
                const cleanResults = results.map(place => ({
                    provider_id: place.place_id,
                    business_name: place.name,
                    provider_type: 'Google Maps',
                    rating_average: place.rating,
                    total_reviews: place.user_ratings_total,
                    address: place.vicinity,
                    is_open: place.opening_hours?.isOpen(),
                    geometry: place.geometry,
                    photo: place.photos ? place.photos[0].getUrl() : null
                }));
                setPlaces(cleanResults);
                if (onPlacesFound) onPlacesFound(cleanResults);
            }
        });
    }, [onPlacesFound]);

    // Get User Location on Mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCenter(pos);
                    setUserLocation(pos);
                    // If map is already loaded, panto
                    if (mapRef.current) {
                        mapRef.current.panTo(pos);
                        searchNearby(pos); // Auto search on location found
                    }
                },
                () => {
                    console.error("Error getting location");
                }
            );
        }
    }, [searchNearby]);

    const onLoad = useCallback(function callback(map) {
        mapRef.current = map;
        setMap(map);
        // If we already have user location when map loads
        if (userLocation) {
            map.panTo(userLocation);
            searchNearby(userLocation);
        }
    }, [userLocation, searchNearby]);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
        mapRef.current = null;
    }, []);

    if (loadError || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="w-full h-full bg-surface-dark rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-white/10">
                <div className="bg-white/5 p-4 rounded-full mb-4">
                    <FaMap className="text-slate-500 text-3xl" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Mapa no disponible</h3>
                <p className="text-slate-400 text-sm mb-4">
                    {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                        ? "Falta la API Key de Google Maps."
                        : "Error al cargar el mapa."}
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-500 text-left w-full max-w-xs">
                    <p className="font-bold mb-1">Configuración requerida:</p>
                    <code className="block break-all">.env / NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
                </div>
            </div>
        );
    }

    if (!isLoaded) return <div className="w-full h-full animate-pulse bg-gray-800 rounded-2xl flex items-center justify-center"><span className="text-slate-500 text-sm">Cargando mapa...</span></div>;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: true,
                    styles: [ // Dark mode style
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "geometry",
                            stylers: [{ color: "#263c3f" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#6b9a76" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry",
                            stylers: [{ color: "#38414e" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#212a37" }],
                        },
                        {
                            featureType: "road",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#9ca5b3" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry",
                            stylers: [{ color: "#746855" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#1f2835" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#f3d19c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "geometry",
                            stylers: [{ color: "#17263c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#515c6d" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#17263c" }],
                        },
                    ],
                }}
            >
                {/* User Marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "white",
                        }}
                    />
                )}

                {/* Place Markers */}
                {places.map(place => (
                    <Marker
                        key={place.provider_id}
                        position={place.geometry.location}
                        onClick={() => setSelectedPlace(place)}
                    />
                ))}
            </GoogleMap>

            {/* Recenter Button */}
            <button
                onClick={() => {
                    if (userLocation && map) {
                        map.panTo(userLocation);
                        map.setZoom(15);
                    }
                }}
                className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg text-primary z-10"
            >
                <FaLocationArrow />
            </button>
        </div>
    );
}
