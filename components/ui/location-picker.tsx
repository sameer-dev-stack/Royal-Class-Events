"use client";

import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/mapbox';
import { Search, MapPin, Loader2, X, LocateFixed } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "sonner";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface LocationData {
    address: string;
    coordinates: [number, number];
    name?: string;
    city?: string;
    country?: string;
}

interface LocationPickerProps {
    value?: {
        address: string;
        coordinates?: [number, number];
        name?: string;
    };
    onChange: (value: LocationData) => void;
    className?: string;
}

interface GeoFeature {
    id: string;
    place_name: string;
    center: [number, number];
    text: string;
    context?: Array<{ id: string; text: string; short_code?: string }>;
}

// Extract city and country from Mapbox context
const extractLocationDetails = (feature: GeoFeature) => {
    let city = "";
    let country = "";

    if (feature.context) {
        for (const ctx of feature.context) {
            if (ctx.id.startsWith("place")) {
                city = ctx.text;
            }
            if (ctx.id.startsWith("country")) {
                country = ctx.text;
            }
        }
    }

    // If no city in context, use the feature text itself if it's a place
    if (!city && feature.id?.startsWith("place")) {
        city = feature.text;
    }

    return { city, country };
};

export default function LocationPicker({ value, onChange, className }: LocationPickerProps) {
    const mapRef = useRef<MapRef>(null);
    const geolocateRef = useRef<mapboxgl.GeolocateControl | null>(null);

    const [viewState, setViewState] = useState({
        longitude: value?.coordinates?.[0] || 90.4125,
        latitude: value?.coordinates?.[1] || 23.8103,
        zoom: 13
    });

    const [marker, setMarker] = useState<{ longitude: number; latitude: number } | null>(
        value?.coordinates ? { longitude: value.coordinates[0], latitude: value.coordinates[1] } : null
    );

    const [query, setQuery] = useState(value?.address || "");
    const [suggestions, setSuggestions] = useState<GeoFeature[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        if (value?.coordinates) {
            setMarker({ longitude: value.coordinates[0], latitude: value.coordinates[1] });
        }
        if (value?.address && !query) {
            setQuery(value.address);
        }
    }, [value?.coordinates, value?.address]);

    const handleSearch = async (text: string) => {
        setQuery(text);

        if (text.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsSearching(true);
        setShowSuggestions(true);

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&limit=5`
            );
            const data = await response.json();
            setSuggestions(data.features || []);
        } catch (error) {
            console.error("Geocoding error:", error);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelect = (feature: GeoFeature) => {
        const [lng, lat] = feature.center;
        const { city, country } = extractLocationDetails(feature);

        setViewState({
            longitude: lng,
            latitude: lat,
            zoom: 16
        });

        setMarker({ longitude: lng, latitude: lat });

        onChange({
            address: feature.place_name,
            coordinates: [lng, lat],
            name: feature.text,
            city,
            country
        });

        setQuery(feature.place_name);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    // Reverse geocode and update all location data
    const reverseGeocode = async (lng: number, lat: number) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
            );
            const data = await response.json();
            const feature = data.features?.[0];

            if (feature) {
                const { city, country } = extractLocationDetails(feature);
                setQuery(feature.place_name);
                onChange({
                    address: feature.place_name,
                    coordinates: [lng, lat],
                    name: feature.text,
                    city,
                    country
                });
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
        }
    };

    const handleMarkerDragEnd = async (event: { lngLat: { lng: number; lat: number } }) => {
        const { lng, lat } = event.lngLat;
        setMarker({ longitude: lng, latitude: lat });
        await reverseGeocode(lng, lat);
    };

    // Get current location using browser Geolocation API
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { longitude, latitude } = position.coords;

                setViewState({
                    longitude,
                    latitude,
                    zoom: 16
                });

                setMarker({ longitude, latitude });
                await reverseGeocode(longitude, latitude);
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error.code, error.message);
                let message = "Unable to get your location.";

                switch (error.code) {
                    case 1: // PERMISSION_DENIED
                        message = "Location access denied. Please enable location in your browser settings.";
                        break;
                    case 2: // POSITION_UNAVAILABLE
                        message = "Your precise location is currently unavailable. Trying low-accuracy mode...";
                        // Retry with low accuracy if high accuracy failed
                        navigator.geolocation.getCurrentPosition(
                            async (pos) => {
                                const { longitude, latitude } = pos.coords;
                                setViewState({ longitude, latitude, zoom: 14 });
                                setMarker({ longitude, latitude });
                                await reverseGeocode(longitude, latitude);
                                setIsLocating(false);
                            },
                            () => {
                                toast.error("Location unavailable. Please search for your venue manually.");
                                setIsLocating(false);
                            },
                            { enableHighAccuracy: false, timeout: 5000 }
                        );
                        return; // Exit early as retry is handled
                    case 3: // TIMEOUT
                        message = "Location request timed out. Please try again.";
                        break;
                }

                toast.error(message);
                setIsLocating(false);
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
        );
    };

    const clearSearch = () => {
        setQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
    };

    if (!MAPBOX_TOKEN) {
        return (
            <div className="p-4 border border-red-500/30 rounded-xl bg-red-950/20 text-red-400 text-sm">
                <strong>⚠️ Mapbox Token Missing</strong>
                <p className="mt-1 text-red-400/70">Add <code className="bg-red-950/50 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your .env.local file.</p>
            </div>
        );
    }

    return (
        <div className={cn("relative rounded-xl overflow-hidden border border-border/50", className)}>
            {/* Map Container */}
            <div className="h-[350px] w-full">
                <Map
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    ref={mapRef}
                >
                    <NavigationControl position="bottom-right" />

                    {marker && (
                        <Marker
                            longitude={marker.longitude}
                            latitude={marker.latitude}
                            draggable
                            onDragEnd={handleMarkerDragEnd}
                            anchor="bottom"
                        >
                            <div className="relative cursor-grab active:cursor-grabbing group">
                                <div className="relative">
                                    <MapPin
                                        className="w-10 h-10 text-[#D4AF37] fill-[#D4AF37]/30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 group-active:scale-125 transition-transform"
                                    />
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/40 rounded-full blur-[2px]" />
                                </div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Drag to fine-tune 🎯
                                </div>
                            </div>
                        </Marker>
                    )}
                </Map>
            </div>

            {/* Search Overlay - Top */}
            <div className="absolute top-3 left-3 right-3 z-10">
                <div className="relative">
                    <div className="flex gap-2">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                            <Input
                                type="text"
                                value={query}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => {
                                    if (suggestions.length > 0) setShowSuggestions(true);
                                }}
                                placeholder="Search venue or address..."
                                className="pl-10 pr-10 h-11 bg-black/80 backdrop-blur-md border-[#D4AF37]/30 text-white placeholder:text-zinc-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 rounded-xl shadow-xl"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#D4AF37]" />
                            )}
                            {!isSearching && query && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Get Current Location Button */}
                        <button
                            type="button"
                            onClick={handleGetCurrentLocation}
                            disabled={isLocating}
                            className="h-11 w-11 flex items-center justify-center bg-black/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl hover:bg-[#D4AF37]/20 hover:border-[#D4AF37] transition-all disabled:opacity-50"
                            title="Use my current location"
                        >
                            {isLocating ? (
                                <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
                            ) : (
                                <LocateFixed className="w-5 h-5 text-[#D4AF37]" />
                            )}
                        </button>
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl shadow-2xl overflow-hidden">
                            <ScrollArea className="max-h-[200px]">
                                <div className="p-1">
                                    {suggestions.map((feature) => (
                                        <button
                                            key={feature.id}
                                            onClick={() => handleSelect(feature)}
                                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-[#D4AF37]/10 rounded-lg transition-colors flex items-start gap-3 group"
                                        >
                                            <MapPin className="w-4 h-4 mt-0.5 text-[#D4AF37] shrink-0 group-hover:scale-110 transition-transform" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-white leading-tight truncate">{feature.text}</p>
                                                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{feature.place_name}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </div>

            {/* Instruction Badge - Bottom Left */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-[#D4AF37]/20">
                <p className="text-[10px] text-zinc-300 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#D4AF37]" />
                    Drag the pin to refine location
                </p>
            </div>
        </div>
    );
}
