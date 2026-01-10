"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ModeToggle() {
    const { setTheme, theme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef(null);

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const options = [
        { id: "system", label: "Default", icon: Monitor, color: "text-blue-400", bg: "focus:bg-blue-500/10" },
        { id: "dark", label: "Dark", icon: Moon, color: "text-purple-400", bg: "focus:bg-purple-500/10" },
        { id: "light", label: "White", icon: Sun, color: "text-amber-500", bg: "focus:bg-amber-500/10" },
    ];

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "rounded-full w-10 h-10 bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300 relative overflow-hidden group z-50",
                    isOpen && "bg-accent border-amber-500/30 ring-2 ring-amber-500/20"
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-amber-500" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-purple-400" />
                <span className="sr-only">Toggle theme</span>
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-40 rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl z-[100] overflow-hidden py-1.5"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    setTheme(opt.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-foreground/5 relative group/item",
                                    theme === opt.id && "bg-foreground/5 text-foreground"
                                )}
                            >
                                <opt.icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover/item:scale-110", opt.color)} />
                                <span>{opt.label}</span>
                                {theme === opt.id && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute left-0 w-0.5 h-4 bg-amber-500 rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
