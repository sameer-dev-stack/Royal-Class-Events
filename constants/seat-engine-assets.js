import {
    MonitorSpeaker,
    Martini,
    Accessibility,
    DoorOpen,
    AlignJustify,
    CircleDot,
    Armchair,
    Mic2,
    Speaker,
    Tv,
    Utensils,
    LayoutGrid,
    BrickWall,
    Construction
} from "lucide-react";

export const ASSET_LIBRARY = [
    {
        type: 'STAGE_THRUST',
        label: 'Concert Stage (Thrust)',
        icon: MonitorSpeaker,
        width: 400,
        height: 300,
        color: '#D4AF37',
        description: "T-Shaped performance stage"
    },
    {
        type: 'STAGE_OPERA',
        label: 'Opera Stage (Semi-Circle)',
        icon: MonitorSpeaker,
        width: 400,
        height: 150,
        color: '#71717a',
        description: "Orchestra/Opera curved stage"
    },
    {
        type: 'MIX_POSITION',
        label: 'FOH / Mix',
        icon: Mic2,
        width: 150,
        height: 100,
        color: '#52525b', // Zinc-600 (Dark Grey)
        description: "Front of House / Tech Control"
    },
    {
        type: 'PILLAR',
        label: 'Pillar (Obstructed)',
        icon: CircleDot,
        width: 40,
        height: 40,
        color: '#27272a', // Zinc-800
        description: "Structural column blocking view"
    },
    {
        type: 'VOMITORY',
        label: 'Vomitory (Tunnel)',
        icon: DoorOpen,
        width: 120,
        height: 80,
        color: '#3f3f46',
        description: "Entrance/Exit Tunnel"
    },
    {
        type: 'ACCESSIBLE_SEAT',
        label: 'Accessible / ADA',
        icon: Accessibility,
        width: 60,
        height: 60,
        color: '#2563eb', // Blue
        description: "Wheelchair accessible zone"
    },
    {
        type: 'STAIRS',
        label: 'Stairs',
        icon: AlignJustify,
        width: 60,
        height: 120,
        color: '#71717a',
        description: "Aisle stairs"
    },
    {
        type: 'BAR',
        label: 'Bar / Food',
        icon: Martini,
        width: 150,
        height: 80,
        color: '#ec4899',
        description: "Refreshment station"
    },
    {
        type: 'RESTROOM',
        label: 'Restroom',
        icon: Accessibility,
        width: 100,
        height: 80,
        color: '#3b82f6',
        description: "Public facilities"
    },
    {
        type: 'EXIT',
        label: 'Emergency Exit',
        icon: DoorOpen,
        width: 80,
        height: 40,
        color: '#ef4444',
        description: "Safety exit point"
    },
    {
        type: 'VIP_BOOTH',
        label: 'VIP Booth',
        icon: Armchair,
        width: 140,
        height: 100,
        color: '#D4AF37',
        description: "Private luxury seating"
    },
    {
        type: 'SCREEN',
        label: 'Display Screen',
        icon: Tv,
        width: 200,
        height: 20,
        color: '#06b6d4',
        description: "LED Wall / Projection"
    },
    {
        type: 'TABLE',
        label: 'Round Table',
        icon: Utensils,
        width: 120,
        height: 120,
        color: '#78350f', // Wood brown
        description: "Round dining table",
        defaultCapacity: 6,
        maxCapacity: 12
    },
    {
        type: 'RECT_TABLE',
        label: 'Rect Table',
        icon: LayoutGrid,
        width: 140,
        height: 80,
        color: '#78350f',
        description: "Rectangular dining table",
        defaultCapacity: 6,
        maxCapacity: 12
    },
    {
        type: 'OBSTRUCTION',
        label: 'Generic Obstruction',
        icon: Construction,
        width: 50,
        height: 50,
        color: '#ef4444',
        description: "Dead kill / Blocked view"
    }
];

