"use client";

import { useMemo } from "react";
import { Plus, Minus, Ticket, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ZoneTicketList({ zones, tickets = [], onUpdateQuantity }) {

    return (
        <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
            {zones.map((zone) => {
                // Find the matching ticket tier for this zone
                const ticket = tickets?.find(t => t.id === zone.id || t.name === zone.id || t._id === zone.id || t.name === zone.name);

                // If no matching ticket is found, we skip this zone or show it as unavailable
                if (!ticket) return null;

                const price = ticket.price || zone.price || 0;
                const capacity = ticket.limit || zone.capacity || 100;
                const sold = ticket.sold || 0;
                const remaining = Math.max(0, capacity - sold);
                const isSoldOut = remaining <= 0;
                const isSelected = quantity > 0;

                // Helper to get a shadow color from the zone color (simple approximation)
                const shadowColor = zone.color || 'transparent';

                const quantity = ticket.quantity || 0;

                return (
                    <div
                        key={zone.id}
                        className={cn(
                            "group relative flex items-center p-5 border-b border-white/5 transition-colors cursor-pointer rounded-lg mx-2 mb-1",
                            isSelected ? 'bg-white/[0.03]' : 'hover:bg-white/5',
                            isSoldOut ? 'opacity-60' : ''
                        )}
                    >
                        {/* Vertical Color Bar */}
                        <div
                            className="w-1.5 h-16 rounded-full mr-4 shrink-0"
                            style={{
                                backgroundColor: zone.color,
                                color: zone.color,
                                boxShadow: `0 0 10px ${shadowColor}`
                            }}
                        />

                        <div className="flex-1 flex flex-col justify-center min-w-0">
                            <h3 className="text-white text-lg font-bold leading-tight mb-0.5">
                                {zone.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "font-mono text-base",
                                    isSoldOut ? 'text-gray-400 line-through' : 'text-[#fac529]'
                                )}>
                                    ৳{price.toFixed(2)}
                                </span>
                            </div>

                            {/* Status Badges */}
                            {!isSoldOut && remaining < 20 && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                                    Low availability
                                </p>
                            )}
                            {!isSoldOut && remaining >= 20 && remaining < 50 && (
                                <p className="text-orange-400 text-xs mt-1 font-medium">Selling fast</p>
                            )}
                            {!isSoldOut && remaining >= 50 && (
                                <p className="text-white/40 text-xs mt-1">Available</p>
                            )}
                            {isSoldOut && (
                                <p className="text-gray-500 text-xs mt-1 uppercase tracking-wide font-bold">Sold Out</p>
                            )}
                        </div>

                        {/* Counter Controls */}
                        <div className={cn("flex items-center gap-3", isSoldOut && "opacity-50 pointer-events-none")}>
                            <button
                                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(zone.id, -1); }}
                                disabled={quantity <= 0 || isSoldOut}
                                className="h-8 w-8 rounded-full bg-[#2c2615] text-white hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50 border border-white/10"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="text-white font-mono w-4 text-center text-base">
                                {quantity}
                            </span>

                            <button
                                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(zone.id, 1); }}
                                disabled={quantity >= remaining || isSoldOut}
                                className="h-8 w-8 rounded-full bg-[#fac529] text-black hover:bg-yellow-400 flex items-center justify-center transition-colors border border-transparent shadow-lg shadow-[#fac529]/20"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
