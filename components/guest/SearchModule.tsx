import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, X, Search } from 'lucide-react';
import { POPULAR_CITIES } from '../../constants';
import { parseSearchQuery } from '../../services/geminiService';

export const SearchModule = ({ onSearch, t, initialQuery, isResultView }: { onSearch: (q: string) => void, t: any, initialQuery: string, isResultView: boolean }) => {
    const [query, setQuery] = useState(initialQuery);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    
    // Expanded vs Minimized State
    const [isExpanded, setIsExpanded] = useState(!isResultView);
    
    const [pickupDate, setPickupDate] = useState("");
    const [dropoffDate, setDropoffDate] = useState("");
    const [pickupTime, setPickupTime] = useState("10:00");
    const [dropoffTime, setDropoffTime] = useState("10:00");
    
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initialize dates
    useEffect(() => {
        const today = new Date();
        const threeDays = new Date();
        threeDays.setDate(today.getDate() + 3);
        const formatDateLocal = (date: Date) => {
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            return localDate.toISOString().split('T')[0];
        };
        setPickupDate(formatDateLocal(today));
        setDropoffDate(formatDateLocal(threeDays));
    }, []);

    // Sync expanded state with view mode, but only when view mode changes
    useEffect(() => {
        if (isResultView) {
            setIsExpanded(false);
        } else {
            setIsExpanded(true);
        }
    }, [isResultView]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const updateSuggestions = (input: string) => {
        if (!input.trim()) {
            setSuggestions(POPULAR_CITIES.slice(0, 5));
        } else {
            const filtered = POPULAR_CITIES.filter(city => 
                city.toLowerCase().includes(input.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
        }
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        updateSuggestions(val);
        if (val === "") onSearch("");
    };

    const handleFocus = () => {
        setShowSuggestions(true);
        updateSuggestions(query);
    };

    const handleSelectCity = (city: string) => {
        setQuery(city);
        setShowSuggestions(false);
    };

    const handleSearchClick = async () => {
        if (query.split(' ').length > 3) {
            const result = await parseSearchQuery(query);
            if (result && result.location) {
                setQuery(result.location);
                onSearch(result.location);
                return;
            }
        }
        onSearch(query);
    };

    // --- MINIMIZED VIEW (SUMMARY) ---
    if (!isExpanded) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-tubo-blue dark:text-white font-bold text-sm">
                        <MapPin size={14} className="text-tubo-orange" />
                        {query || "Select Location"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium ml-0.5">
                        <Calendar size={12} />
                        <span>{pickupDate}, {pickupTime}</span>
                        <span className="text-gray-300">|</span>
                        <span>{dropoffDate}, {dropoffTime}</span>
                    </div>
                </div>
                <button 
                    onClick={() => setIsExpanded(true)}
                    className="text-tubo-orange font-bold text-xs border border-tubo-orange/30 px-3 py-1.5 rounded-lg hover:bg-tubo-orange/5 active:scale-95 transition-all"
                >
                    Modify
                </button>
            </div>
        );
    }

    // --- EXPANDED VIEW (FULL FORM) ---
    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none p-5 border border-gray-100 dark:border-gray-700 relative z-30 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Location Input */}
            <div className="mb-4 relative" ref={wrapperRef}>
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 block">{t.locationLabel}</label>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center px-3 py-3 border border-transparent focus-within:border-tubo-orange focus-within:bg-white dark:focus-within:bg-gray-700 transition-all">
                    <MapPin className="text-tubo-orange h-5 w-5 mr-3 flex-shrink-0" />
                    <input 
                        type="text"
                        value={query}
                        onChange={handleLocationChange}
                        onFocus={handleFocus}
                        placeholder={t.locationPlaceholder}
                        className="bg-transparent w-full outline-none text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    {query && <button onClick={() => {setQuery(""); onSearch("");}}><X size={16} className="text-gray-400" /></button>}
                </div>

                {/* Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-600 overflow-hidden z-50">
                        <div className="py-1">
                            {suggestions.map((city, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectCity(city)}
                                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-gray-400">
                                        <MapPin size={14} />
                                    </div>
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
                {/* Pick-up */}
                <div>
                     <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 block">{t.pickup}</label>
                     <div className="space-y-2">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5 flex items-center border border-transparent focus-within:border-tubo-orange transition-all">
                            <Calendar className="text-gray-400 h-4 w-4 mr-2" />
                            <input 
                                type="date" 
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                className="bg-transparent w-full outline-none text-xs font-bold text-gray-900 dark:text-white uppercase"
                            />
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5 flex items-center border border-transparent focus-within:border-tubo-orange transition-all">
                            <Clock className="text-gray-400 h-4 w-4 mr-2" />
                            <input 
                                type="time" 
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="bg-transparent w-full outline-none text-xs font-bold text-gray-900 dark:text-white"
                            />
                        </div>
                     </div>
                </div>

                {/* Drop-off */}
                <div>
                     <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 block">{t.dropoff}</label>
                     <div className="space-y-2">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5 flex items-center border border-transparent focus-within:border-tubo-orange transition-all">
                            <Calendar className="text-gray-400 h-4 w-4 mr-2" />
                            <input 
                                type="date" 
                                value={dropoffDate}
                                onChange={(e) => setDropoffDate(e.target.value)}
                                className="bg-transparent w-full outline-none text-xs font-bold text-gray-900 dark:text-white uppercase"
                            />
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5 flex items-center border border-transparent focus-within:border-tubo-orange transition-all">
                            <Clock className="text-gray-400 h-4 w-4 mr-2" />
                            <input 
                                type="time" 
                                value={dropoffTime}
                                onChange={(e) => setDropoffTime(e.target.value)}
                                className="bg-transparent w-full outline-none text-xs font-bold text-gray-900 dark:text-white"
                            />
                        </div>
                     </div>
                </div>
            </div>

            <button 
                onClick={handleSearchClick}
                className="w-full bg-gradient-to-r from-tubo-blue to-slate-900 hover:from-slate-900 hover:to-black text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-[0.98] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-sm"
            >
                <Search size={18} strokeWidth={3} />
                {t.searchBtn}
            </button>
        </div>
    );
};