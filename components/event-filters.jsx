"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, MapPin, DollarSign, SlidersHorizontal, X } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/data";

export default function EventFilters({ onFilterChange, activeFilters = {} }) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        category: activeFilters.category || "all",
        location: activeFilters.location || "",
        dateFrom: activeFilters.dateFrom || null,
        dateTo: activeFilters.dateTo || null,
        priceMin: activeFilters.priceMin || "",
        priceMax: activeFilters.priceMax || "",
        ticketType: activeFilters.ticketType || "all",
        sortBy: activeFilters.sortBy || "date",
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
    };

    const handleApplyFilters = () => {
        onFilterChange(filters);
        setIsOpen(false);
    };

    const handleClearFilters = () => {
        const defaultFilters = {
            category: "all",
            location: "",
            dateFrom: null,
            dateTo: null,
            priceMin: "",
            priceMax: "",
            ticketType: "all",
            sortBy: "date",
        };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
        if (key === "sortBy") return false; // Don't count sort as a filter
        if (key === "category" && value === "all") return false;
        if (key === "ticketType" && value === "all") return false;
        if (!value) return false;
        return true;
    }).length;

    return (
        <div className="w-full">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Quick Filters */}
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                    {/* Location Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search location..."
                            value={filters.location}
                            onChange={(e) => handleFilterChange("location", e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Category Quick Select */}
                    <Select
                        value={filters.category}
                        onValueChange={(value) => handleFilterChange("category", value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {CATEGORIES.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Sort By */}
                    <Select
                        value={filters.sortBy}
                        onValueChange={(value) => handleFilterChange("sortBy", value)}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date">Date (Earliest)</SelectItem>
                            <SelectItem value="date-desc">Date (Latest)</SelectItem>
                            <SelectItem value="popular">Most Popular</SelectItem>
                            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Advanced Filters Button */}
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2 relative">
                            <SlidersHorizontal className="w-4 h-4" />
                            More Filters
                            {activeFilterCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-2 px-1.5 py-0.5 h-5 min-w-[20px] bg-[#D4AF37] text-black"
                                >
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">Advanced Filters</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="h-8 text-xs"
                                >
                                    Clear All
                                </Button>
                            </div>

                            {/* Date Range */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Date Range</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {filters.dateFrom ? (
                                                    format(filters.dateFrom, "MMM dd")
                                                ) : (
                                                    <span className="text-muted-foreground">From</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={filters.dateFrom}
                                                onSelect={(date) => handleFilterChange("dateFrom", date)}
                                                disabled={(date) => date < new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {filters.dateTo ? (
                                                    format(filters.dateTo, "MMM dd")
                                                ) : (
                                                    <span className="text-muted-foreground">To</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={filters.dateTo}
                                                onSelect={(date) => handleFilterChange("dateTo", date)}
                                                disabled={(date) =>
                                                    date < (filters.dateFrom || new Date())
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Price Range (BDT)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.priceMin}
                                        onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.priceMax}
                                        onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Ticket Type */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Ticket Type</Label>
                                <Select
                                    value={filters.ticketType}
                                    onValueChange={(value) => handleFilterChange("ticketType", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="free">Free Only</SelectItem>
                                        <SelectItem value="paid">Paid Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Apply Button */}
                            <Button
                                className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold border-none"
                                onClick={handleApplyFilters}
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {filters.category !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            {CATEGORIES.find((c) => c.id === filters.category)?.label}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => handleFilterChange("category", "all")}
                            />
                        </Badge>
                    )}
                    {filters.location && (
                        <Badge variant="secondary" className="gap-1">
                            <MapPin className="w-3 h-3" />
                            {filters.location}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => handleFilterChange("location", "")}
                            />
                        </Badge>
                    )}
                    {filters.dateFrom && (
                        <Badge variant="secondary" className="gap-1">
                            From: {format(filters.dateFrom, "MMM dd")}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => handleFilterChange("dateFrom", null)}
                            />
                        </Badge>
                    )}
                    {filters.dateTo && (
                        <Badge variant="secondary" className="gap-1">
                            To: {format(filters.dateTo, "MMM dd")}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => handleFilterChange("dateTo", null)}
                            />
                        </Badge>
                    )}
                    {(filters.priceMin || filters.priceMax) && (
                        <Badge variant="secondary" className="gap-1">
                            <DollarSign className="w-3 h-3" />
                            {filters.priceMin || "0"} - {filters.priceMax || "∞"}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => {
                                    handleFilterChange("priceMin", "");
                                    handleFilterChange("priceMax", "");
                                }}
                            />
                        </Badge>
                    )}
                    {filters.ticketType !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            {filters.ticketType === "free" ? "Free Events" : "Paid Events"}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => handleFilterChange("ticketType", "all")}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
