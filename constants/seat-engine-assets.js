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
    LayoutGrid
} from "lucide-react";

export const ASSET_LIBRARY = [
    {
        type: 'STAGE',
        label: 'Main Stage',
        icon: MonitorSpeaker,
        width: 300,
        height: 150,
        color: '#D4AF37',
        description: "Primary performance area"
    },
    {
        type: 'BAR',
        label: 'Bar / Food',
        icon: Martini,
        width: 120,
        height: 80,
        color: '#ec4899',
        description: "Refreshment station"
    },
    {
        type: 'RESTROOM',
        label: 'Restroom',
        icon: Accessibility,
        width: 80,
        height: 80,
        color: '#3b82f6',
        description: "Public facilities"
    },
    {
        type: 'EXIT',
        label: 'Emergency Exit',
        icon: DoorOpen,
        width: 60,
        height: 40,
        color: '#ef4444',
        description: "Safety exit point"
    },
    {
        type: 'STAIRS',
        label: 'Stairs',
        icon: AlignJustify,
        width: 60,
        height: 100,
        color: '#71717a',
        description: "Access stairway"
    },
    {
        type: 'PILLAR',
        label: 'Pillar (Obstructed)',
        icon: CircleDot,
        width: 40,
        height: 40,
        color: '#27272a',
        description: "Structural column"
    },
    {
        type: 'CONSOLE',
        label: 'Sound/Light Console',
        icon: Mic2,
        width: 100,
        height: 60,
        color: '#8b5cf6',
        description: "Tech control area"
    },
    {
        type: 'VIP_BOOTH',
        label: 'VIP Booth',
        icon: Armchair,
        width: 120,
        height: 80,
        color: '#f59e0b',
        description: "Private seating area"
    },
    {
        type: 'SCREEN',
        label: 'Display Screen',
        icon: Tv,
        width: 150,
        height: 20,
        color: '#06b6d4',
        description: "LED Wall / Projection"
    },
    {
        type: 'TABLE',
        label: 'Table',
        icon: Utensils,
        width: 120,
        height: 120,
        color: '#78350f', // Wood brown
        description: "Professional table with dynamic seating",
        defaultCapacity: 6,
        maxCapacity: 20
    },
    {
        type: 'RECT_TABLE',
        label: 'Dining Table (6)',
        icon: LayoutGrid,
        width: 120,
        height: 80,
        color: '#78350f',
        description: "Rectangular table with perimeter seating",
        defaultCapacity: 6,
        maxCapacity: 12
    }
];
