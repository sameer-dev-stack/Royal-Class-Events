"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-purple-400" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
