
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Clock, Star, ChevronRight, Plus, ShieldCheck, Headphones, CarFront, CarTaxiFront, Bus, Gem, Zap, Car as CarIconIcon, X, Wind, Bluetooth, Users, Settings2, Fuel, Music, Edit2, Heart, ArrowLeft, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { POPULAR_CITIES, EXCHANGE_RATES, CATEGORIES, FEATURES, TESTIMONIALS, TRANSLATIONS, EMAIL_REGEX, PHONE_REGEX } from '../constants';
import { Car, Currency } from '../types';
import { parseSearchQuery, getCarHighlights, generateCarDescription } from '../services/geminiService';

// Helper to render Lucide icons dynamically
const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
    const icons: any = { CarFront, CarTaxiFront, Bus, Gem, Zap, Car: CarIconIcon, ShieldCheck, Clock: Headphones };
    const Icon = icons[name] || CarIconIcon;
    return <Icon className={className} />;
};

// Helper to map feature strings to icons
const FeatureIcon = ({ name, className }: { name: string, className?: string }) => {
    const lower = name.toLowerCase();
    let Icon = Settings2; // Default

    if (lower.includes('ac') || lower.includes('climate')) Icon = Wind;
    else if (lower.includes('bluetooth') || lower.includes('carplay') || lower.includes('android')) Icon = Bluetooth;
    else if (lower.includes('seat') || lower.includes('family')) Icon = Users;
    else if (lower.includes('auto') || lower.includes('manual')) Icon = Settings2;
    else if (lower.includes('electric') || lower.includes('hybrid')) Icon = Zap;
    else if (lower.includes('diesel') || lower.includes('petrol')) Icon = Fuel;
    else if (lower.includes('audio') || lower.includes('sound')) Icon = Music;

    return (
        <div className="flex items-center gap-1">
            <Icon className={className} />
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{name}</span>
        </div>
    );
};

interface GuestHomeProps {
    cars: Car[];
    currency: Currency;
    onCurrencyChange: (c: Currency) => void;
    language: string;
    onSearch: (loc: string) => void;
    searchLocation: string;
    onCarSelect: (car: Car) => void;
}

export const GuestHome: React.FC<GuestHomeProps> = ({ cars, currency, onCurrencyChange, language, onSearch, searchLocation, onCarSelect }) => {
    const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS['English'];

    // --- SEARCH MODE VIEW ---
    if (searchLocation) {
        // Logic: Sponsored first, then others, but all same size.
        const sponsoredMatches = cars.filter(c => c.isSponsored);
        const otherMatches = cars.filter(c => !c.isSponsored);
        
        // Combine lists: Sponsored on top
        const sortedList = [...sponsoredMatches, ...otherMatches];

        return (
            <div className="space-y-6 pb-10 pt-4 md:pt-8">
                <div className="px-5 md:px-0 max-w-3xl mx-auto">
                    {/* Search Module in Result Mode (Starts Minimized) */}
                    <SearchModule onSearch={onSearch} t={t} initialQuery={searchLocation} isResultView={true} />
                </div>

                {/* Search Badge/Filter Clearer */}
                <div className="px-5 md:px-0 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{sortedList.length} {t.cars} found</span>
                     </div>
                     <div className="bg-tubo-orange/10 text-tubo-orange px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        {searchLocation}
                        <button onClick={() => onSearch("")}><X size={12} /></button>
                     </div>
                </div>

                {/* Unified Results List */}
                <div className="px-5 md:px-0">
                     {sortedList.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            No cars found in {searchLocation}. Try another city.
                        </div>
                     ) : (
                        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                            {sortedList.map(car => (
                                <PopularCarCard key={car.id} car={car} currency={currency} t={t} onSelect={() => onCarSelect(car)} />
                            ))}
                        </div>
                     )}
                </div>
            </div>
        );
    }

    // --- DEFAULT HOME VIEW ---
    const sponsoredCars = cars.filter(c => c.isSponsored);
    const popularCars = cars.filter(c => !c.isSponsored);

    return (
        <div className="space-y-8 pb-10 pt-4 md:pt-10">
            {/* Hero Section - Only visible when NOT searching */}
            <div className="px-5 md:px-0 relative">
                {/* Desktop: Hero Image or Banner Design could go here */}
                <div className="mb-5 mt-2 text-center md:text-left">
                    <h1 className="text-2xl md:text-4xl font-black text-tubo-blue dark:text-white leading-tight md:leading-tight md:max-w-2xl">
                        {t.findPerfectRide}
                    </h1>
                    <p className="text-gray-500 mt-2 text-xs md:text-base font-medium">{t.exploreThousands}</p>
                </div>
                <div className="max-w-3xl">
                     <SearchModule onSearch={onSearch} t={t} initialQuery={searchLocation} isResultView={false} />
                </div>
            </div>

            {/* Sponsored Cars (List) */}
            {sponsoredCars.length > 0 && (
                <div className="px-5 md:px-0">
                    <h2 className="text-lg font-black text-tubo-blue dark:text-white mb-4 flex items-center gap-2">
                        {t.sponsored} <span className="text-xs bg-tubo-orange text-white px-2 py-0.5 rounded-md font-medium uppercase tracking-wider">Ad</span>
                    </h2>
                    <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {sponsoredCars.map(car => (
                            <PopularCarCard key={car.id} car={car} currency={currency} t={t} onSelect={() => onCarSelect(car)} />
                        ))}
                    </div>
                </div>
            )}

            {/* Features */}
            <div className="px-5 md:px-0">
                <h2 className="text-lg font-black text-tubo-blue dark:text-white mb-4">{t.whyChoose}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {FEATURES.map((feat, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`h-10 w-10 rounded-full ${feat.color} flex items-center justify-center text-white mb-3 shadow-md`}>
                                <IconRenderer name={feat.icon} className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{feat.title}</h3>
                            <p className="text-[10px] md:text-xs leading-tight text-gray-500">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Cars (List) */}
            <div className="px-5 md:px-0">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-black text-tubo-blue dark:text-white">
                        {t.popular}
                    </h2>
                    <button className="text-xs font-bold text-tubo-orange hover:text-orange-700 transition-colors">{t.viewAll}</button>
                </div>
                <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                    {popularCars.slice(0, 8).map(car => (
                         <PopularCarCard key={car.id} car={car} currency={currency} t={t} onSelect={() => onCarSelect(car)} />
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="px-5 md:px-0">
                <h2 className="text-lg font-black text-tubo-blue dark:text-white mb-4">{t.browseCategory}</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                    {CATEGORIES.map((cat) => (
                        <div key={cat.id} className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center aspect-square hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                            <div className={`h-10 w-10 rounded-xl ${cat.color} flex items-center justify-center mb-2`}>
                                <IconRenderer name={cat.icon} className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{cat.name}</span>
                            <span className="text-[10px] text-gray-400">{cat.count}</span>
                        </div>
                    ))}
                </div>
            </div>

             {/* Testimonials */}
             <div className="px-5 md:px-0">
                <h2 className="text-lg font-black text-tubo-blue dark:text-white mb-4">{t.testimonials}</h2>
                <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible no-scrollbar pb-4">
                    {TESTIMONIALS.map((item) => (
                        <div key={item.id} className="min-w-[260px] bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <img src={item.avatar} className="h-8 w-8 rounded-full" alt={item.name} />
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                    <div className="flex">
                                        {[...Array(item.rating)].map((_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">"{item.text}"</p>
                            <span className="text-[10px] text-gray-300 font-bold">{item.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Host Banner */}
            <div className="px-5 md:px-0 pb-4">
                <div className="bg-gray-900 dark:bg-white rounded-2xl p-6 md:p-10 text-white dark:text-gray-900 shadow-xl relative overflow-hidden md:flex md:items-center md:justify-between">
                     <div className="relative z-10 md:max-w-lg">
                        <h2 className="text-xl md:text-3xl font-black mb-2">{t.becomeHost}</h2>
                        <p className="text-xs md:text-sm text-gray-400 dark:text-gray-600 mb-4 leading-relaxed max-w-[80%] md:max-w-full">{t.hostDesc}</p>
                        <button className="bg-tubo-orange text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors">
                            {t.startHosting}
                        </button>
                     </div>
                     <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-gray-800 to-transparent dark:from-gray-100 opacity-50 md:opacity-20"></div>
                </div>
            </div>
        </div>
    );
};

export const CarDetails = ({ car, currency, onClose, language }: { car: Car, currency: Currency, onClose: () => void, language: string }) => {
    const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS['English'];
    const rate = EXCHANGE_RATES[currency] || 1;
    const convertedPrice = Math.round(car.pricePerDayIdr * rate);
    const [highlights, setHighlights] = useState<string[]>([]);
    const [loadingAi, setLoadingAi] = useState(true);
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        const fetchHighlights = async () => {
            setLoadingAi(true);
            const results = await getCarHighlights(car);
            setHighlights(results);
            setLoadingAi(false);
        };
        fetchHighlights();
    }, [car]);

    return (
        // Wrapper: Mobile = Full Screen fixed, Desktop = Centered Modal with Overlay
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none">
            {/* Backdrop for Desktop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity opacity-0 animate-in fade-in pointer-events-auto" 
                onClick={onClose}
            ></div>

            {/* Card Container */}
            <div className="pointer-events-auto bg-white dark:bg-gray-900 w-full h-full md:h-[85vh] md:max-w-5xl md:rounded-2xl md:shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in slide-in-from-bottom-10 duration-300">
                
                {/* LEFT SIDE: IMAGE (Desktop) / TOP (Mobile) */}
                <div className="relative h-72 md:h-full md:w-1/2 shrink-0 bg-gray-100">
                    <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 md:via-transparent md:to-transparent"></div>
                    
                    {/* Navigation Controls */}
                    <div className="absolute top-0 left-0 w-full pt-safe-top md:pt-6 px-5 flex justify-between items-center mt-4 md:mt-0 z-10">
                        <button onClick={onClose} className="h-10 w-10 rounded-full bg-white/20 md:bg-white/90 backdrop-blur-md flex items-center justify-center text-white md:text-gray-900 hover:bg-white/30 md:hover:bg-white transition-all shadow-sm">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex gap-3">
                            <button className="h-10 w-10 rounded-full bg-white/20 md:bg-white/90 backdrop-blur-md flex items-center justify-center text-white md:text-gray-900 hover:bg-white/30 md:hover:bg-white transition-all shadow-sm">
                                <Share2 size={20} />
                            </button>
                            <button 
                                onClick={() => setIsFav(!isFav)}
                                className={`h-10 w-10 rounded-full bg-white/20 md:bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white/30 md:hover:bg-white transition-all shadow-sm ${isFav ? 'text-red-500 fill-red-500' : 'text-white md:text-gray-400'}`}
                            >
                                <Heart size={20} className={isFav ? "fill-current" : ""} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Title Overlay (Hidden on Desktop) */}
                    <div className="absolute bottom-5 left-5 text-white md:hidden">
                        {car.isSponsored && (
                            <span className="bg-tubo-orange text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Sponsored</span>
                        )}
                        <h1 className="text-3xl font-black tracking-tight leading-none mb-1">{car.make} {car.model}</h1>
                        <div className="flex items-center gap-3 text-sm font-medium opacity-90">
                            <div className="flex items-center gap-1">
                                <Star className="fill-yellow-400 text-yellow-400" size={14} />
                                <span>{car.rating}</span>
                            </div>
                            <span>•</span>
                            <span>{car.year}</span>
                            <span>•</span>
                            <span>{car.trips} trips</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: CONTENT (Desktop) / BOTTOM (Mobile) */}
                <div className="flex-1 overflow-y-auto relative flex flex-col bg-white dark:bg-gray-900">
                    <div className="px-5 py-6 md:p-8 space-y-6 pb-24 md:pb-28">
                        
                        {/* Desktop Title Section (Hidden on Mobile) */}
                        <div className="hidden md:block">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    {car.isSponsored && (
                                        <span className="bg-tubo-orange text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Sponsored</span>
                                    )}
                                    <h1 className="text-3xl font-black tracking-tight leading-none text-gray-900 dark:text-white">{car.make} {car.model}</h1>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1">
                                        <Star className="fill-yellow-400 text-yellow-400" size={16} />
                                        <span className="font-bold text-gray-900 dark:text-white">{car.rating}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{car.trips} trips</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin size={14} />
                                {car.location}
                            </div>
                        </div>

                        {/* AI Highlights Section */}
                        <div className="bg-gradient-to-br from-tubo-50 to-white dark:from-slate-800 dark:to-slate-900 border border-tubo-100 dark:border-slate-700 rounded-2xl p-5 relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="text-tubo-orange h-4 w-4 animate-pulse" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Gemini AI Insights</h3>
                            </div>
                            {loadingAi ? (
                                <div className="space-y-2 animate-pulse">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    {highlights.map((hl, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 font-medium">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                                            <span>{hl}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">About this car</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {car.description}
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Features</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {car.features?.map((feat, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <FeatureIcon name={feat} className="h-5 w-5 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Host Info */}
                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${car.hostId}`} alt="Host" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Hosted by Tubo Partner</h4>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <ShieldCheck size={12} className="text-green-500" />
                                        <span>Verified Host</span>
                                    </div>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                Contact
                            </button>
                        </div>
                    </div>

                    {/* Sticky Bottom Bar (Inside Right Column) */}
                    <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 p-5 md:p-6 pb-safe-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold">{t.perDay}</div>
                                <div className="text-xl md:text-2xl font-black text-tubo-orange">
                                    {currency === 'IDR' 
                                    ? `${(convertedPrice/1000000).toFixed(1)}jt` 
                                    : `${currency} ${convertedPrice.toLocaleString()}`
                                    }
                                </div>
                            </div>
                            <button className="flex-1 bg-gradient-to-r from-tubo-blue to-black text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 active:scale-[0.98] hover:scale-[1.02] transition-all">
                                {t.bookNow}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTS ---

const PopularCarCard = ({ car, currency, t, onSelect }: { car: Car, currency: Currency, t: any, onSelect: () => void }) => {
    const rate = EXCHANGE_RATES[currency] || 1;
    const convertedPrice = Math.round(car.pricePerDayIdr * rate);
    const [isFav, setIsFav] = useState(false);

    return (
        <div 
            onClick={onSelect}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-row md:flex-col h-36 md:h-auto group active:scale-[0.98] hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
            {/* Image Section: Horizontal on Mobile, Vertical on Desktop */}
            <div className="relative w-36 md:w-full md:h-48 flex-shrink-0">
                <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover" />
                
                {/* Top Left: Rating */}
                <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5 z-10 shadow-sm">
                    <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-bold text-gray-900 dark:text-white">{car.rating || 5.0}</span>
                </div>

                {/* Heart Icon - Positioned differently on mobile/desktop */}
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsFav(!isFav); }}
                    className="absolute right-2 top-2 md:top-2 z-30 p-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-100 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm hidden md:flex"
                >
                    <Heart size={16} className={isFav ? "fill-red-500 text-red-500" : "text-gray-400"} />
                </button>
            </div>
            
            {/* Extreme Top Right: Sponsored (Absolute to Card) */}
            {car.isSponsored && (
                <div className="absolute top-2 right-2 bg-tubo-orange text-white px-2 py-0.5 rounded-full shadow-sm z-20 md:left-2 md:right-auto md:top-8">
                    <span className="text-[9px] font-bold uppercase tracking-wider">Sponsored</span>
                </div>
            )}

            {/* Heart Icon (Mobile) - Center Right vertically */}
            <button 
                onClick={(e) => { e.stopPropagation(); setIsFav(!isFav); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-100 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm md:hidden"
            >
                <Heart size={16} className={isFav ? "fill-red-500 text-red-500" : "text-gray-400"} />
            </button>

            {/* Content Section */}
            <div className="p-3 flex flex-col flex-1 justify-between min-w-0 md:p-4">
                <div>
                    {/* Added pr-16 on mobile to prevent text overlap with heart icon */}
                    <h3 className="font-bold text-gray-900 dark:text-white text-base truncate leading-tight pr-16 md:pr-0">{car.make} {car.model}</h3>
                    <div className="flex items-center text-gray-500 text-xs mt-1">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{car.location}</span>
                    </div>

                    {/* Car Features */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 pr-8 md:pr-0">
                        {car.features?.slice(0, 3).map((feat, i) => (
                            <FeatureIcon key={i} name={feat} className="h-3 w-3 text-gray-400" />
                        ))}
                         {car.features && car.features.length > 3 && (
                             <span className="text-[9px] font-medium text-gray-400 self-center">+{car.features.length - 3}</span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-end justify-between gap-2 mt-1 md:mt-4">
                     <div className="flex flex-col">
                        <p className="text-[10px] text-gray-400 leading-none mb-0.5">{t.perDay}</p>
                        <p className="text-lg font-black text-tubo-orange leading-none">
                            {currency === 'IDR' 
                              ? `${(convertedPrice/1000000).toFixed(1)}jt` 
                              : `${currency} ${convertedPrice.toLocaleString()}`
                            }
                        </p>
                     </div>
                     {/* Book Button */}
                     <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-xs font-bold shrink-0 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors">
                        {t.book}
                     </button>
                </div>
            </div>
        </div>
    );
};

const SearchModule = ({ onSearch, t, initialQuery, isResultView }: { onSearch: (q: string) => void, t: any, initialQuery: string, isResultView: boolean }) => {
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
