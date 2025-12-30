"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Plus, Minus, MapPin } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function UniversalMapViewer({ imageUrl }) {
    if (!imageUrl) return null;

    return (
        <div className="relative w-full h-[350px] md:h-full bg-[#181611] overflow-hidden group">
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        {/* Map Background Image (Transformable) */}
                        <TransformComponent
                            wrapperStyle={{ width: "100%", height: "100%" }}
                            contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Main Venue Image */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageUrl}
                                    alt="Venue Map"
                                    className="w-full h-full object-contain pointer-events-none select-none opacity-80"
                                />

                                {/* SVG Zone Overlays (Matching Mockup) */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-2xl" viewBox="0 0 800 600">
                                    {/* Zone A: Purple Rectangle */}
                                    <rect
                                        x="280" y="200" width="120" height="180" rx="20"
                                        className="fill-purple-500/30 stroke-purple-400 stroke-2"
                                    />
                                    {/* Zone B: Gold Circle */}
                                    <circle
                                        cx="520" cy="350" r="60"
                                        className="fill-amber-500/30 stroke-amber-400 stroke-2"
                                    />
                                    {/* Zone C: Blue Oval */}
                                    <ellipse
                                        cx="180" cy="350" rx="80" ry="120"
                                        className="fill-blue-500/30 stroke-blue-400 stroke-2"
                                    />
                                </svg>
                            </div>
                        </TransformComponent>

                        {/* Gradient Overlay (Pointer events none) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#231e0f]/80 via-transparent to-transparent pointer-events-none z-10" />

                        {/* Bottom-Right Zoom Controls (Rounded-LG, Dark Brown) */}
                        <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
                            <Button
                                size="icon"
                                onClick={() => zoomIn()}
                                className="h-10 w-10 rounded-lg bg-[#2c2615] hover:bg-white/10 text-white border border-white/10 shadow-lg transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                            <Button
                                size="icon"
                                onClick={() => zoomOut()}
                                className="h-10 w-10 rounded-lg bg-[#2c2615] hover:bg-white/10 text-white border border-white/10 shadow-lg transition-colors"
                                variant="ghost"
                            >
                                <Minus className="h-5 w-5" />
                            </Button>
                        </div>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
}
