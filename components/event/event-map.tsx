"use client";

import React from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";
import "mapbox-gl/dist/mapbox-gl.css";

// Ensure Mapbox token is available
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface EventMapProps {
    coordinates?: [number, number];
    venueName?: string;
    address?: string;
    className?: string;
}

export default function EventMap({ coordinates, venueName, address, className }: EventMapProps) {
    if (!coordinates || !MAPBOX_TOKEN) {
        return null;
    }

    const [longitude, latitude] = coordinates;

    return (
        <div className={cn("rounded-xl overflow-hidden border border-border/50 relative group", className)}>
            <Map
                initialViewState={{
                    longitude,
                    latitude,
                    zoom: 14
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
                scrollZoom={false} // Disable scroll zoom for better page scrolling experience
            >
                <NavigationControl position="top-right" />

                <Marker longitude={longitude} latitude={latitude} anchor="bottom">
                    <div className="relative group/pin">
                        <MapPin className="w-8 h-8 text-[#D4AF37] fill-[#D4AF37]/20 drop-shadow-lg" />
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/50 blur-[2px] rounded-full" />

                        {(venueName || address) && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg text-xs text-white border border-white/10 whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none">
                                <p className="font-semibold text-[#D4AF37]">{venueName || "Event Location"}</p>
                                {address && <p className="text-white/70 max-w-[200px] truncate">{address}</p>}
                            </div>
                        )}
                    </div>
                </Marker>
            </Map>

            {/* Overlay for inactive state interaction hint */}
            <div className="absolute inset-0 bg-transparent pointer-events-none border-2 border-transparent group-hover:border-[#D4AF37]/20 transition-colors rounded-xl" />
        </div>
    );
}
