'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { FaLocationArrow, FaStar, FaPhone, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const libraries = ['places'];

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '24px'
};

const defaultCenter = {
    lat: 19.4326,
    lng: -99.1332
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        }
    ]
};

export default function ClientMap({ onPlacesFound, onLocationDetected }) {
    const [map, setMap] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [loadingPlaces, setLoadingPlaces] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey || '',
        libraries
    });

    // Calculate distance between two points
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Search for nearby veterinarians using Places API
    const searchNearbyVets = useCallback((location) => {
        if (!map || !window.google) return;

        setLoadingPlaces(true);
        const service = new window.google.maps.places.PlacesService(map);

        const request = {
            location: location,
            radius: 5000, // 5km radius
            type: 'veterinary_care',
            keyword: 'veterinaria'
        };

        service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                // Process results and add distance
                const processedPlaces = results.map(place => {
                    const distance = calculateDistance(
                        location.lat,
                        location.lng,
                        place.geometry.location.lat(),
                        place.geometry.location.lng()
                    );

                    return {
                        place_id: place.place_id,
                        business_name: place.name,
                        address: place.vicinity,
                        latitude: place.geometry.location.lat(),
                        longitude: place.geometry.location.lng(),
                        rating_average: place.rating,
                        total_reviews: place.user_ratings_total,
                        is_open: place.opening_hours?.open_now,
                        photo: place.photos?.[0]?.getUrl({ maxWidth: 400 }),
                        distance: distance,
                        types: place.types
                    };
                }).sort((a, b) => a.distance - b.distance);

                setPlaces(processedPlaces);

                // --- FIX: Auto-zoom to show all markers ---
                // Create bounds object
                const bounds = new window.google.maps.LatLngBounds();
                // Extend bounds with user location
                bounds.extend(location);
                // Extend bounds with all found places
                processedPlaces.forEach(place => {
                    bounds.extend({ lat: place.latitude, lng: place.longitude });
                });
                setPlaces(processedPlaces);

                // --- FIX: Auto-zoom to show all markers ---
                // Create bounds object
                const bounds = new window.google.maps.LatLngBounds();
                // Extend bounds with user location
                bounds.extend(location);
                // Extend bounds with all found places
                processedPlaces.forEach(place => {
                    bounds.extend({ lat: place.latitude, lng: place.longitude });
                });
                // Fit map to these bounds
                map.fitBounds(bounds);
                // ------------------------------------------

                // --- Fallback: Infer location name from first result ---
                // If Geocoding API fails, this ensures we at least show "Zapopan" or similar
                if (processedPlaces.length > 0 && onLocationDetected) {
                    const bestGuess = processedPlaces[0];
                    if (bestGuess && bestGuess.address) {
                        try {
                            // Extract last part of address (often city/municipality)
                            const parts = bestGuess.address.split(',');
                            const cityLike = parts[parts.length - 1].trim();
                            // If it's too short (like a zip code), try the second to last
                            const finalName = (cityLike.length < 3 && parts.length > 1)
                                ? parts[parts.length - 2].trim()
                                : cityLike;

                            // We pass this. If Geocoder succeeds later/parallel, it will overwrite with precise City, State.
                            // If Geocoder fails (REQUEST_DENIED), this persists.
                            onLocationDetected(finalName, location.lat, location.lng);
                        } catch (e) { console.warn('Fallback location parsing failed', e); }
                    }
                }
                // -----------------------------------------------------

                if (onPlacesFound) {
                    onPlacesFound(processedPlaces);
                }
                setLoadingPlaces(false);
            } else {
                console.error('Places search failed:', status);
                setLoadingPlaces(false);
            }
        });
    }, [map, onPlacesFound, onLocationDetected]);

    // Get user location and search for nearby vets
    useEffect(() => {
        if (!isLoaded || !map) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(location);
                    // Initial pan, search will re-fit bounds shortly
                    map.panTo(location);

                    searchNearbyVets(location);

                    // --- Inverse Geocoding to get "City, State" ---
                    if (window.google?.maps?.Geocoder) {
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode({ location }, (results, status) => {
                            if (status === 'OK' && results?.[0]) {
                                // Find locality (City) and admin_area_level_1 (State)
                                let city = '';
                                let state = '';

                                // Iterate address components to find meaningful names
                                // We prefer "locality" or "sublocality" for city
                                // We prefer "administrative_area_level_1" for state
                                const addressComponents = results[0].address_components;

                                const localityComp = addressComponents.find(c => c.types.includes('locality')) ||
                                    addressComponents.find(c => c.types.includes('sublocality'));
                                const stateComp = addressComponents.find(c => c.types.includes('administrative_area_level_1'));

                                if (localityComp) city = localityComp.short_name;
                                if (stateComp) state = stateComp.short_name;

                                // Fallback to formatted address if specific components missing
                                const zoneName = (city && state) ? `${city}, ${state}` :
                                    (city || state || results[0].formatted_address.split(',')[0]);

                                if (onLocationDetected) {
                                    onLocationDetected(zoneName, location.lat, location.lng);
                                }
                            } else {
                                console.warn('Geocoder failed:', status);
                                // Fallback: Try to infer location from the first place result
                                fallbackToPlaceLocation(location);
                            }
                        }).catch(e => {
                            console.error('Geocoder error:', e);
                            fallbackToPlaceLocation(location);
                        });
                    } else {
                        fallbackToPlaceLocation(location);
                    }

                    // Helper for fallback location
                    const fallbackToPlaceLocation = (loc) => {
                        // We rely on searchNearbyVets to eventually populate places
                        // But since searchNearbyVets is async, we might need to hook into the results there.
                        // Actually, let's just trigger a one-off logic inside searchNearbyVets to notify if Geocoder hasn't run yet.
                        // For now, if Geocoder fails, we accept we might need to wait for search results.
                    };
                    // ----------------------------------------------
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLocationError('No se pudo obtener tu ubicación. Usando ubicación por defecto.');
                    setUserLocation(defaultCenter);
                    searchNearbyVets(defaultCenter);
                }
            );
        } else {
            setLocationError('Tu navegador no soporta geolocalización.');
            setUserLocation(defaultCenter);
            searchNearbyVets(defaultCenter);
        }
    }, [isLoaded, map, searchNearbyVets]);

    // Recenter map to user location
    const recenterMap = () => {
        if (map && userLocation) {
            map.panTo(userLocation);
            map.setZoom(14);
        }
    };

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    if (loadError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#1c252e] rounded-3xl">
                <div className="text-center p-6">
                    <p className="text-red-500 font-bold mb-2">Error al cargar Google Maps</p>
                    <p className="text-gray-400 text-sm">
                        {!apiKey ? 'API key no configurada' : 'Error de conexión'}
                    </p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#1c252e] rounded-3xl">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2791e7] mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando mapa...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation || defaultCenter}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
            >
                {/* User location marker */}
                {userLocation && (
                    <>
                        <Marker
                            position={userLocation}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 10,
                                fillColor: '#2791e7',
                                fillOpacity: 1,
                                strokeColor: 'white',
                                strokeWeight: 3,
                            }}
                            title="Tu ubicación"
                            zIndex={999} // Always on top
                        />
                        <Circle
                            center={userLocation}
                            radius={2000}
                            options={{
                                fillColor: '#2791e7',
                                fillOpacity: 0.1,
                                strokeColor: '#2791e7',
                                strokeWeight: 2,
                                strokeOpacity: 0.5
                            }}
                        />
                    </>
                )}

                {/* Veterinary markers - USING DEFAULT RED PINS FOR VISIBILITY STABILITY */}
                {places.map((place) => (
                    <Marker
                        key={place.place_id}
                        position={{ lat: place.latitude, lng: place.longitude }}
                        onClick={() => setSelectedPlace(place)}
                        title={place.business_name}
                    // icon property removed to use default red pin
                    />
                ))}

                {/* Info Window */}
                {selectedPlace && (
                    <InfoWindow
                        position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }}
                        onCloseClick={() => setSelectedPlace(null)}
                    >
                        <div className="min-w-[200px] max-w-[300px]">
                            <h3 className="font-bold text-base mb-2 text-gray-900">{selectedPlace.business_name}</h3>

                            {selectedPlace.rating_average && (
                                <div className="flex items-center gap-1 mb-2">
                                    <FaStar className="text-yellow-500 text-xs" />
                                    <span className="text-sm font-semibold text-gray-900">{selectedPlace.rating_average}</span>
                                    {selectedPlace.total_reviews && (
                                        <span className="text-xs text-gray-500">({selectedPlace.total_reviews} reseñas)</span>
                                    )}
                                </div>
                            )}

                            <div className="text-sm text-gray-700 mb-2 flex items-start gap-2">
                                <FaMapMarkerAlt className="mt-0.5 text-gray-500 flex-shrink-0" />
                                <span>{selectedPlace.address}</span>
                            </div>

                            {selectedPlace.distance && (
                                <div className="text-sm text-gray-600 mb-2">
                                    📍 {selectedPlace.distance.toFixed(2)} km de distancia
                                </div>
                            )}

                            {selectedPlace.is_open !== undefined && (
                                <div className="mt-2">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${selectedPlace.is_open
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {selectedPlace.is_open ? 'Abierto ahora' : 'Cerrado'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Recenter button */}
            {userLocation && (
                <button
                    onClick={recenterMap}
                    className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg text-[#2791e7] hover:scale-110 transition-transform z-10"
                    title="Volver a mi ubicación"
                >
                    <FaLocationArrow />
                </button>
            )}

            {/* Loading/Count badge */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <span className="text-xs font-bold text-white">
                    {loadingPlaces ? 'Buscando veterinarias...' :
                        `${places.length} ${places.length === 1 ? 'veterinaria encontrada' : 'veterinarias encontradas'}`
                    }
                </span>
            </div>

            {/* Location error message */}
            {locationError && (
                <div className="absolute bottom-4 left-4 z-10 bg-yellow-500/90 backdrop-blur-md px-4 py-2 rounded-lg border border-yellow-600/30">
                    <span className="text-xs font-medium text-yellow-900">⚠️ {locationError}</span>
                </div>
            )}
        </div>
    );
}
