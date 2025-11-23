import React from 'react';
import { X, Star } from 'lucide-react';
import { Car, Currency } from '../../types';
import { FEATURES, CATEGORIES, TESTIMONIALS, TRANSLATIONS } from '../../constants';
import { SearchModule } from './SearchModule';
import { PopularCarCard } from './PopularCarCard';
import { IconRenderer } from '../common/IconRenderer';

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