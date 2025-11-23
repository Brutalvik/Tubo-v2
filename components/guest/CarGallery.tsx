
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { Car } from '../../types';

// Generic high-quality car images to simulate a gallery for each car
const EXTRA_IMAGES = [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80", // Interior Dashboard
    "https://images.unsplash.com/photo-1493238792015-164e8502561d?auto=format&fit=crop&w=1200&q=80", // Interior Seats/Detail
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80", // Exterior Detail
    "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=1200&q=80"  // Generic Exterior
];

export const CarGallery = ({ car }: { car: Car }) => {
    // Combine the specific car image with generic ones
    const images = [car.imageUrl, ...EXTRA_IMAGES];
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="max-w-7xl mx-auto md:px-6 lg:px-8 md:pt-6">
            {/* MOBILE CAROUSEL VIEW (< md) */}
            <div className="md:hidden relative h-64 group overflow-hidden">
                <img 
                    src={images[currentIndex]} 
                    alt={`${car.make} ${car.model} view ${currentIndex + 1}`} 
                    className="w-full h-full object-cover transition-all duration-500"
                />
                
                {/* Gradient overlay for text visibility if needed, mostly subtle */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

                {/* Slender Arrow Left */}
                <button 
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 backdrop-blur-sm text-white p-1 rounded-full transition-all active:scale-90 z-20"
                >
                    <ChevronLeft size={24} strokeWidth={1.5} />
                </button>

                {/* Slender Arrow Right */}
                <button 
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 backdrop-blur-sm text-white p-1 rounded-full transition-all active:scale-90 z-20"
                >
                    <ChevronRight size={24} strokeWidth={1.5} />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {images.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} 
                        />
                    ))}
                </div>

                {car.isSponsored && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm z-20">
                        Sponsored
                    </div>
                )}
            </div>

            {/* DESKTOP GRID VIEW (md+) */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-2 md:rounded-xl overflow-hidden md:h-[400px]">
                {/* Main Image */}
                <div className="md:col-span-2 h-full relative group cursor-pointer" onClick={() => alert("Full gallery view")}>
                    <img 
                        src={images[0]} 
                        alt={car.model} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    {car.isSponsored && (
                        <div className="absolute top-4 left-4 bg-white text-gray-900 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            Sponsored
                        </div>
                    )}
                </div>

                {/* Side Stack */}
                <div className="flex flex-col gap-2 h-full">
                    <div className="h-1/2 relative overflow-hidden cursor-pointer">
                        <img 
                            src={images[1]} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                            alt="Interior" 
                        />
                    </div>
                    <div className="h-1/2 relative overflow-hidden group cursor-pointer" onClick={() => alert("Full gallery view")}>
                        <img 
                            src={images[2]} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                            alt="Detail" 
                        />
                        <button className="absolute bottom-4 right-4 bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-2 hover:bg-gray-50 transition-colors">
                            <MessageSquare size={14} /> View {images.length} photos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
