"use client";

import React from "react";
import { MousePointer2, Hand, Box, Circle as CircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOOLS = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "hand", icon: Hand, label: "Pan" },
    { id: "rect", icon: Box, label: "Rectangle" },
    { id: "circle", icon: CircleIcon, label: "Circle" },
];

export default function Toolbar({ activeTool, onSelectTool }) {
    return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col gap-2 shadow-2xl z-20 animate-in slide-in-from-left duration-500">
            {TOOLS.map((tool) => (
                <Button
                    key={tool.id}
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectTool(tool.id)}
                    className={`
                        w-10 h-10 rounded-xl transition-all
                        ${activeTool === tool.id
                            ? "bg-[#fac529] text-black shadow-lg shadow-[#fac529]/20"
                            : "text-white/50 hover:text-white hover:bg-white/10"}
                    `}
                    title={tool.label}
                >
                    <tool.icon className="w-5 h-5" />
                </Button>
            ))}
        </div>
    );
}
