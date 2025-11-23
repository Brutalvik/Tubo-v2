import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Heart, Star, MapPin, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Car, Currency } from '../../types';
import { EXCHANGE_RATES, TRANSLATIONS } from '../../constants';
import { getCarHighlights } from '../../services/geminiService';
import { FeatureIcon } from '../common/FeatureIcon';

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