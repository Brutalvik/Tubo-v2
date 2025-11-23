import React, { useState } from 'react';
import { Heart, MapPin, Star } from 'lucide-react';
import { Car, Currency } from '../../types';
import { EXCHANGE_RATES } from '../../constants';
import { FeatureIcon } from '../common/FeatureIcon';

export const PopularCarCard = ({ car, currency, t, onSelect }: { car: Car, currency: Currency, t: any, onSelect: () => void }) => {
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