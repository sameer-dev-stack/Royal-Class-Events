/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Loader2, X, ChevronDown, Crosshair } from "lucide-react";
import { State, City, Country } from "country-state-city";
import { format } from "date-fns";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { createLocationSlug } from "@/lib/location-utils";
import { getCategoryIcon } from "@/lib/data";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SearchLocationBar() {
  const router = useRouter();

  // --- Global State ---
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const { mutate: updateLocation } = useConvexMutation(api.users.completeOnboarding);

  // --- Event Search State ---
  const [eventQuery, setEventQuery] = useState("");
  const [showEventResults, setShowEventResults] = useState(false);
  const eventSearchRef = useRef(null);

  const { data: searchResults, isLoading: searchLoading } = useConvexQuery(
    api.search.searchEvents,
    eventQuery.trim().length >= 2 ? { query: eventQuery, limit: 5 } : "skip"
  );

  // --- Location State ---
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("Dhaka"); // Default
  const [isLocating, setIsLocating] = useState(false);
  const locationRef = useRef(null);

  // --- Data Preparation (Bangladesh Only) ---
  // --- Data Preparation (International) ---
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // --- Location Picker State ---
  const [viewMode, setViewMode] = useState("countries"); // "countries" | "cities"
  const [selectedCountryCode, setSelectedCountryCode] = useState("BD"); // Default BD for now, or match user

  const currentCities = useMemo(() => {
    if (!selectedCountryCode) return [];
    return City.getCitiesOfCountry(selectedCountryCode);
  }, [selectedCountryCode]);

  // Set initial location from user profile
  useEffect(() => {
    if (currentUser?.location?.country) {
      // Try to find code from name if stored as name
      const c = allCountries.find(c => c.name === currentUser.location.country);
      if (c) setSelectedCountryCode(c.isoCode);
    }
    if (currentUser?.location?.city) {
      setSelectedCity(currentUser.location.city);
    }
  }, [currentUser, allCountries]);

  // --- Handlers ---

  const handleEventSearch = (e) => {
    setEventQuery(e.target.value);
    setShowEventResults(e.target.value.length >= 2);
  };

  const handleEventClick = (slug) => {
    setShowEventResults(false);
    setEventQuery("");
    router.push(`/events/${slug}`);
  };

  const handleLocationSelect = async (city, divisionName) => {
    setSelectedCity(city.name);
    setLocationOpen(false);

    // Optional: Update backend user profile
    if (currentUser) {
      try {
        await updateLocation({
          location: { city: city.name, state: divisionName, country: "Bangladesh" },
          interests: currentUser.interests || [],
        });
      } catch (err) {
        console.error(err);
      }
    }

    // Navigate
    const countryName = allCountries.find(c => c.isoCode === selectedCountryCode)?.name || divisionName || "International";
    const slug = createLocationSlug(city.name, countryName);
    router.push(`/explore/${slug}`);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        // Using BigDataCloud's free reverse geocoding API (client-side)
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();

        // data format: { city, countryName, countryCode, principalSubdivision }
        const city = data.city || data.locality;
        const countryCode = data.countryCode;
        const countryName = data.countryName;

        if (city && countryCode) {
          setSelectedCity(city);
          setSelectedCountryCode(countryCode);
          setLocationOpen(false);

          // Update backend if possible
          if (currentUser) {
            updateLocation({
              location: { city, state: data.principalSubdivision, country: countryName },
              interests: currentUser.interests || [],
            });
          }

          // Navigate
          const slug = createLocationSlug(city, countryName);
          router.push(`/explore/${slug}`);
        } else {
          alert("Could not detect your city.");
        }
      } catch (error) {
        console.error("Geolocation error:", error);
        alert("Failed to get location details.");
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      console.error("Geo error:", error);
      setIsLocating(false);
      alert("Location access denied or unavailable.");
    });
  };

  const handleCountrySelect = (countryCode) => {
    setSelectedCountryCode(countryCode);
    setLocationSearch(""); // Clear search
    setViewMode("cities");
  };

  const handleBackToCountries = () => {
    setViewMode("countries");
    setLocationSearch("");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (eventSearchRef.current && !eventSearchRef.current.contains(event.target)) {
        setShowEventResults(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="flex w-full md:max-w-3xl items-center gap-4">

      {/* 1. LEFT SIDE: EVENT SEARCH BAR */}
      <div className="relative flex-1" ref={eventSearchRef}>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {/* Sparkles Icon like the screenshot */}
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search event or category..."
            value={eventQuery}
            onChange={handleEventSearch}
            className="w-full h-12 pl-12 pr-10 rounded-full bg-white dark:bg-zinc-900/80 border border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-#D4AF37/50 transition-all shadow-sm"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {/* Event Search Results Dropdown */}
        {showEventResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            {searchLoading ? (
              <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-#D4AF37" /></div>
            ) : (
              <div>
                {searchResults?.length > 0 ? searchResults.map(event => (
                  <div
                    key={event._id}
                    onClick={() => handleEventClick(event.slug)}
                    className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                  >
                    <div className="text-xl">{getCategoryIcon(event.eventSubType || event.category)}</div>
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">{event.title?.en || event.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{event.metadata?.legacyProps?.city || event.city} • {format(new Date(event.timeConfiguration?.startDateTime || event.startDate), "MMM d")}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 text-center text-gray-500 text-sm">No events found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. RIGHT SIDE: LOCATION PICKER (The "Dubai" button style) */}
      <div className="relative shrink-0" ref={locationRef}>
        <button
          onClick={() => setLocationOpen(!locationOpen)}
          className="h-12 px-5 flex items-center gap-2 rounded-full bg-white dark:bg-zinc-900/80 border border-black/20 dark:border-white/20 text-black dark:text-white hover:border-#D4AF37/50 transition-all shadow-sm"
        >
          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="max-w-[100px] truncate">{selectedCity || "Bangladesh"}</span>
          <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Location Dropdown (International) */}
        {locationOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            {/* Search Input inside dropdown */}
            <div className="p-3 border-b border-black/10 dark:border-white/5 sticky top-0 bg-white dark:bg-zinc-900 z-10 space-y-2">
              <button
                onClick={handleGeolocation}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-#D4AF37 bg-#D4AF37/10 hover:bg-#D4AF37/20 rounded-lg transition-colors border border-#D4AF37/20"
              >
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                Use my current location
              </button>

              {viewMode === "cities" && (
                <button
                  onClick={handleBackToCountries}
                  className="text-xs text-#D4AF37 hover:text-#8C7326 flex items-center gap-1 font-medium mb-1"
                >
                  ← Change Country
                </button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  autoFocus
                  placeholder={viewMode === "countries" ? "Search country..." : "Search city..."}
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-sm bg-gray-100 dark:bg-black/30 border border-transparent dark:border-white/10 rounded-lg text-black dark:text-white placeholder:text-gray-500 focus:outline-none focus:border-#D4AF37"
                />
              </div>
            </div>

            {/* Scrollable List */}
            <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">

              {/* VIEW: COUNTRIES */}
              {viewMode === "countries" && (
                <div className="space-y-0.5">
                  {allCountries
                    .filter(c => c.name.toLowerCase().includes(locationSearch.toLowerCase()))
                    .map(country => (
                      <button
                        key={country.isoCode}
                        onClick={() => handleCountrySelect(country.isoCode)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between",
                          selectedCountryCode === country.isoCode
                            ? "bg-#D4AF37/10 text-#D4AF37 font-medium"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{country.flag}</span>
                          {country.name}
                        </span>
                        {selectedCountryCode === country.isoCode && <MapPin className="w-3 h-3 fill-current" />}
                      </button>
                    ))}
                </div>
              )}

              {/* VIEW: CITIES */}
              {viewMode === "cities" && (
                <div className="space-y-0.5">
                  {currentCities.length > 0 ? (
                    currentCities
                      .filter(c => c.name.toLowerCase().includes(locationSearch.toLowerCase()))
                      .map(city => (
                        <button
                          key={city.name}
                          onClick={() => handleLocationSelect(city, allCountries.find(c => c.isoCode === selectedCountryCode)?.name)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between",
                            selectedCity === city.name
                              ? "bg-#D4AF37/10 text-#D4AF37 font-medium"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                          )}
                        >
                          {city.name}
                          {selectedCity === city.name && <MapPin className="w-3 h-3 fill-current" />}
                        </button>
                      ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No cities found in this country.
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {(viewMode === "countries" && locationSearch && allCountries.filter(c => c.name.toLowerCase().includes(locationSearch.toLowerCase())).length === 0) && (
                <div className="p-4 text-center text-xs text-gray-500">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
