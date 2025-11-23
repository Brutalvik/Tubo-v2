import React, { useState, useEffect, useRef } from 'react';
import { 
    ArrowLeft, Share2, Heart, Star, Sparkles, 
    ShieldCheck, Settings2,
    Wind, Bluetooth, Users, Zap, Fuel, Music,
    Cigarette, Sparkles as SparklesIcon, Droplets, AlertTriangle,
    X, CheckCircle, Info, ThumbsUp, Calendar as CalendarIcon, MapPin
} from 'lucide-react';
import { Car, Currency } from '../../types';
import { EXCHANGE_RATES, TRANSLATIONS } from '../../constants';
import { getCarHighlights, getNearbyDestinations } from '../../services/geminiService';
import { CarGallery } from './CarGallery';
import { BookingCalendar } from './BookingCalendar';
import ReactMarkdown from 'react-markdown'; // Assuming simple rendering or direct text

const MOCK_REVIEWS = [
    {
        id: 1,
        user: "Paul",
        date: "October 14, 2025",
        rating: 5,
        image: "https://i.pravatar.cc/150?u=Paul",
        text: "Amazing service! Very kind hosts! The car was clean and drove perfectly. Would definitely rent again."
    },
    {
        id: 2,
        user: "Julianne",
        date: "June 20, 2025",
        rating: 5,
        image: "https://i.pravatar.cc/150?u=Julianne",
        text: "This car is the perfect blend of style and functionality. It was a beautiful car to use while seeing the beauty of LA."
    },
    {
        id: 3,
        user: "Naseer",
        date: "June 10, 2025",
        rating: 5,
        image: "https://i.pravatar.cc/150?u=Naseer",
        text: "Thank you so much for this rental, it made moving around the city so easy!"
    },
    {
        id: 4,
        user: "Sarah",
        date: "May 15, 2025",
        rating: 4,
        image: "https://i.pravatar.cc/150?u=Sarah",
        text: "Great car, very economical. Pickup was a bit confusing but the host helped me out quickly."
    },
    {
        id: 5,
        user: "Mike",
        date: "April 02, 2025",
        rating: 5,
        image: "https://i.pravatar.cc/150?u=Mike",
        text: "Seamless experience. The car features were exactly as described. Loved the bluetooth audio system."
    }
];

const RATING_BREAKDOWN = [
    { label: "Cleanliness", score: 4.8 },
    { label: "Maintenance", score: 4.9 },
    { label: "Communication", score: 4.9 },
    { label: "Convenience", score: 5.0 },
    { label: "Accuracy", score: 4.9 },
];

interface CarDetailsProps {
    car: Car;
    currency: Currency;
    onClose: () => void;
    language: string;
    onCheckout: (data: { startDate: string, endDate: string, startTime: string, endTime: string }) => void;
}

export const CarDetails = ({ car, currency, onClose, language, onCheckout }: CarDetailsProps) => {
    const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS['English'];
    const rate = EXCHANGE_RATES[currency] || 1;
    const convertedPrice = Math.round(car.pricePerDayIdr * rate);
    // Calculate a fake "original" price to show the deal (e.g. 15% higher)
    const originalPrice = Math.round(convertedPrice * 1.15);
    
    // State
    const [highlights, setHighlights] = useState<string[]>([]);
    const [loadingAi, setLoadingAi] = useState(true);
    const [isFav, setIsFav] = useState(false);
    
    // Grounding State
    const [nearbyPlaces, setNearbyPlaces] = useState<{text: string, chunks: any[]} | null>(null);
    const [loadingPlaces, setLoadingPlaces] = useState(true);
    
    // Interactive State
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showAllFeatures, setShowAllFeatures] = useState(false);
    const [visibleReviews, setVisibleReviews] = useState(3);
    const [showMobileBooking, setShowMobileBooking] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Date state for widget
    const [startDate, setStartDate] = useState("2025-11-24");
    const [endDate, setEndDate] = useState("2025-11-27");
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("10:00");
    
    // Desktop Calendar Popover State
    const [showDesktopCalendar, setShowDesktopCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Mock Unavailable Dates for testing (e.g. for the first car in the list or specific ID)
    const unavailableDates = (car.id === 'bali_1' || car.id === 'jkt_1') 
        ? ['2025-11-28', '2025-11-29'] 
        : [];

    // Check availability logic
    const checkRangeAvailability = (start: string, end: string) => {
        if (!start || !end) return true;
        const s = new Date(start);
        const e = new Date(end);
        
        // Iterate through days
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            if (unavailableDates.includes(dateString)) {
                return false;
            }
        }
        return true;
    };

    const isRangeAvailable = checkRangeAvailability(startDate, endDate);

    const formatPrice = (price: number) => {
        if (currency === 'IDR') return `Rp ${price.toLocaleString('en-US')}`;
        return `${currency} ${price.toLocaleString('en-US')}`;
    };

    // Format date range for display (e.g., "Nov 24, 10:00 - Nov 27, 10:00")
    const getDateRangeString = () => {
        const s = new Date(startDate);
        const e = new Date(endDate);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${s.toLocaleDateString('en-US', options)}, ${startTime} - ${e.toLocaleDateString('en-US', options)}, ${endTime}`;
    };

    useEffect(() => {
        const fetchHighlights = async () => {
            setLoadingAi(true);
            const results = await getCarHighlights(car);
            setHighlights(results);
            setLoadingAi(false);
        };
        fetchHighlights();
    }, [car]);

    useEffect(() => {
        const fetchNearby = async () => {
            setLoadingPlaces(true);
            const results = await getNearbyDestinations(car.location);
            setNearbyPlaces(results);
            setLoadingPlaces(false);
        }
        fetchNearby();
    }, [car.location]);

    // Scroll Spy for Tabs
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['overview', 'features', 'reviews', 'location'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= 300) {
                        setActiveTab(section);
                        break;
                    }
                }
            }
        };
        const container = document.getElementById('car-details-container');
        if (container) container.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    // Close desktop calendar when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowDesktopCalendar(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [calendarRef]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${car.make} ${car.model} on Tubo`,
                    text: `Check out this ${car.year} ${car.make} ${car.model} in ${car.location}!`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const handleProceed = () => {
        if (!isRangeAvailable) return;
        onCheckout({
            startDate,
            endDate,
            startTime,
            endTime
        });
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveTab(id);
        }
    };

    const handleRangeChange = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
    };

    const FeatureItem: React.FC<{ name: string }> = ({ name }) => {
        let Icon = Settings2;
        if (name.toLowerCase().includes('ac') || name.toLowerCase().includes('climate')) Icon = Wind;
        else if (name.toLowerCase().includes('bluetooth') || name.toLowerCase().includes('carplay')) Icon = Bluetooth;
        else if (name.toLowerCase().includes('seat') || name.toLowerCase().includes('family')) Icon = Users;
        else if (name.toLowerCase().includes('electric') || name.toLowerCase().includes('hybrid')) Icon = Zap;
        else if (name.toLowerCase().includes('audio')) Icon = Music;

        return (
            <div className="flex items-center gap-3 py-2">
                <Icon className="text-gray-600 dark:text-gray-300 h-5 w-5" />
                <span className="text-sm text-gray-700 dark:text-gray-200">{name}</span>
            </div>
        );
    };

    return (
        <div id="car-details-container" className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 scroll-smooth">
            
            {/* Sticky Header (Mobile/Desktop) */}
            <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-900 dark:text-white" />
                    </button>
                    
                    {/* Tabs - Desktop */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500 h-full">
                        {['overview', 'features', 'reviews', 'location'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => scrollToSection(tab)}
                                className={`h-full border-b-2 px-1 capitalize transition-colors ${activeTab === tab ? 'border-tubo-blue dark:border-white text-tubo-blue dark:text-white' : 'border-transparent hover:text-gray-900 dark:hover:text-gray-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleShare} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
                            <Share2 className="h-5 w-5" />
                        </button>
                        <button onClick={() => setIsFav(!isFav)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                            <Heart className={`h-5 w-5 ${isFav ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-300"}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modular Car Gallery */}
            <CarGallery car={car} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
                
                {/* Left Content Column */}
                <div className="lg:col-span-2 space-y-10 pb-32">
                    
                    {/* Header Info */}
                    <section id="overview" className="scroll-mt-24">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                            {car.make} {car.model} {car.year}
                        </h1>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 font-bold">
                                <Star className="h-4 w-4 fill-tubo-orange text-tubo-orange" />
                                {car.rating}
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="text-gray-500">({car.trips} trips)</div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1 text-purple-600 font-bold">
                                <ShieldCheck className="h-4 w-4" />
                                All-Star Host
                            </div>
                        </div>

                        {/* Features Badges */}
                        <div className="flex flex-wrap gap-2 mt-4">
                             <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md text-xs font-bold">
                                {car.features?.[0] || "Automatic"}
                             </span>
                             <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md text-xs font-bold">
                                {car.features?.[1] || "Gas (Premium)"}
                             </span>
                             <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md text-xs font-bold">
                                24 MPG
                             </span>
                        </div>
                    </section>

                    {/* Host Info */}
                    <section className="border-t border-gray-100 dark:border-gray-800 pt-8">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Hosted by</h3>
                        <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 -mx-2 rounded-xl transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={`https://i.pravatar.cc/150?u=${car.hostId}`} alt="Host" className="h-14 w-14 rounded-full object-cover" />
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-900 p-1 rounded-full">
                                        <ShieldCheck className="h-4 w-4 text-purple-600 fill-purple-100" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-base">erica</h4>
                                    <p className="text-sm text-gray-500">323 trips • Joined May 2021</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold">
                                    4.9 ★
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex items-start gap-4">
                            <ShieldCheck className="h-6 w-6 text-purple-600 shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">All-Star Host</h4>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                    All-Star Hosts like erica are the top-rated and most experienced hosts on Tubo.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Description & AI */}
                    <section className="border-t border-gray-100 dark:border-gray-800 pt-8">
                         {/* AI Insights */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-xl mb-6 border border-blue-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-tubo-orange animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-widest text-tubo-blue dark:text-white">Gemini Insights</span>
                            </div>
                            {loadingAi ? (
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                            ) : (
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 italic">
                                    "{highlights[0]}"
                                </div>
                            )}
                        </div>

                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Description</h3>
                        <div className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed overflow-hidden transition-all ${isDescriptionExpanded ? 'max-h-[1000px]' : 'max-h-24 relative'}`}>
                            <p>
                                {car.description} Experience the ultimate driving comfort with this {car.year} {car.make} {car.model}. 
                                Meticulously maintained and perfect for both city driving and long weekend getaways. 
                                Features premium interior, advanced safety systems, and great fuel economy. 
                                Book now to secure your ride for an unforgettable trip!
                            </p>
                            {!isDescriptionExpanded && (
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
                            )}
                        </div>
                        <button 
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="text-tubo-orange text-sm font-bold mt-2 hover:underline"
                        >
                            {isDescriptionExpanded ? 'Read less' : 'Read more'}
                        </button>
                    </section>

                    {/* Features */}
                    <section id="features" className="border-t border-gray-100 dark:border-gray-800 pt-8 scroll-mt-24">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Vehicle features</h3>
                        <div className="grid grid-cols-2 gap-y-2">
                            {car.features?.slice(0, showAllFeatures ? undefined : 4).map((feat, i) => (
                                <FeatureItem key={i} name={feat} />
                            ))}
                            <FeatureItem name="Backup camera" />
                            <FeatureItem name="Blind spot warning" />
                            {showAllFeatures && (
                                <>
                                    <FeatureItem name="USB Charger" />
                                    <FeatureItem name="Keyless Entry" />
                                    <FeatureItem name="Heated Seats" />
                                </>
                            )}
                        </div>
                        <button 
                            onClick={() => setShowAllFeatures(!showAllFeatures)}
                            className="mt-4 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            {showAllFeatures ? 'Show less' : 'See all features'}
                        </button>
                    </section>

                    {/* Reviews */}
                    <section id="reviews" className="border-t border-gray-100 dark:border-gray-800 pt-8 scroll-mt-24">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Ratings and reviews</h3>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{car.rating}</span>
                            <Star className="h-6 w-6 fill-tubo-orange text-tubo-orange" />
                            <span className="text-gray-400 text-sm">({car.trips} ratings)</span>
                        </div>

                        {/* Rating Bars */}
                        <div className="space-y-3 mb-8 max-w-md">
                            {RATING_BREAKDOWN.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                                    <div className="flex items-center gap-3 w-1/2">
                                        <div className="h-2 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-tubo-blue dark:bg-tubo-orange rounded-full" style={{width: `${(item.score / 5) * 100}%`}}></div>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white w-6 text-right">{item.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-8">
                            {MOCK_REVIEWS.slice(0, visibleReviews).map((review) => (
                                <div key={review.id} className="animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-3 mb-3">
                                        <img src={review.image} alt={review.user} className="h-10 w-10 rounded-full" />
                                        <div>
                                            <div className="flex text-tubo-orange mb-0.5">
                                                {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                <span className="font-bold text-gray-900 dark:text-white mr-1">{review.user}</span>
                                                • {review.date}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {review.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {visibleReviews < MOCK_REVIEWS.length && (
                            <button 
                                onClick={() => setVisibleReviews(prev => prev + 3)}
                                className="mt-6 border border-gray-200 dark:border-gray-700 px-6 py-2.5 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                See more
                            </button>
                        )}
                    </section>

                    {/* Rules */}
                    <section className="border-t border-gray-100 dark:border-gray-800 pt-8">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Rules of the road</h3>
                        <div className="space-y-5">
                            <div className="flex gap-4">
                                <Cigarette className="h-6 w-6 text-gray-400 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">No smoking allowed</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Smoking in any Tubo vehicle will result in a $150 fine</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <SparklesIcon className="h-6 w-6 text-gray-400 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Keep the vehicle tidy</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Unreasonably dirty vehicles may result in a $150 fine</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Fuel className="h-6 w-6 text-gray-400 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Refuel the vehicle</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Missing fuel may result in an additional fee</p>
                                </div>
                            </div>
                             <div className="flex gap-4">
                                <AlertTriangle className="h-6 w-6 text-gray-400 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">No off-roading</h4>
                                </div>
                            </div>
                        </div>
                    </section>

                     {/* Location & Nearby Places */}
                     <section id="location" className="border-t border-gray-100 dark:border-gray-800 pt-8 scroll-mt-24">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Location</h3>
                        <div 
                            className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 h-64 relative bg-gray-100 cursor-pointer group isolate"
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(car.location)}`, '_blank')}
                        >
                            {/* Map Iframe - plain view */}
                            <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                style={{border:0}}
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(car.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                className="absolute inset-0 w-full h-full pointer-events-none opacity-90 hover:opacity-100 transition-opacity"
                                title="Car Location"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors pointer-events-none"></div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                            <Info size={14} />
                            Vehicle may have a device that collects driving and location data.
                        </div>

                        {/* Maps Grounding Section */}
                        <div className="mt-8 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="text-tubo-orange h-5 w-5" />
                                <h4 className="font-black text-gray-900 dark:text-white text-base">Explore nearby with Gemini</h4>
                            </div>
                            
                            {loadingPlaces ? (
                                <div className="space-y-2 animate-pulse">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mt-3 w-full"></div>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                                        {nearbyPlaces?.text}
                                    </div>
                                    
                                    {nearbyPlaces?.chunks && nearbyPlaces.chunks.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {nearbyPlaces.chunks.map((chunk: any, idx: number) => {
                                                // Extract URL based on the actual structure provided by Google Maps tool
                                                const uri = chunk.web?.uri || chunk.maps?.uri;
                                                const title = chunk.web?.title || chunk.maps?.title || "View on Map";
                                                
                                                if (!uri) return null;
                                                
                                                return (
                                                    <a 
                                                        key={idx} 
                                                        href={uri} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-full text-xs font-bold text-tubo-blue dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm"
                                                    >
                                                        <MapPin size={12} className="text-red-500" />
                                                        {title}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                </div>

                {/* Right Sticky Sidebar (Desktop) */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 relative" ref={calendarRef}>
                             <>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-gray-400 line-through text-lg font-medium">{formatPrice(originalPrice)}</span>
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                                        {formatPrice(convertedPrice)}
                                    </span>
                                    <span className="text-sm text-gray-500">total</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Trip dates</label>
                                        <div 
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-bold bg-white dark:bg-gray-700 flex items-center justify-between cursor-pointer hover:border-tubo-orange transition-colors"
                                            onClick={() => setShowDesktopCalendar(!showDesktopCalendar)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon size={16} className="text-tubo-orange" />
                                                <span>{startDate && endDate ? `${startDate} - ${endDate}` : "Select dates"}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Desktop Calendar Popover */}
                                        {showDesktopCalendar && (
                                            <div className="absolute top-32 left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 animate-in zoom-in-95">
                                                <BookingCalendar 
                                                    unavailableDates={unavailableDates}
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    onRangeChange={handleRangeChange}
                                                />
                                                <div className="flex justify-end mt-2">
                                                    <button 
                                                        onClick={() => setShowDesktopCalendar(false)}
                                                        className="text-xs font-bold text-tubo-blue hover:underline"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="relative">
                                                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Pickup Time</label>
                                                <input 
                                                    type="time" 
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-bold bg-white dark:bg-gray-700 outline-none focus:border-tubo-orange"
                                                />
                                            </div>
                                            <div className="relative">
                                                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Dropoff Time</label>
                                                <input 
                                                    type="time" 
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-bold bg-white dark:bg-gray-700 outline-none focus:border-tubo-orange"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {!isRangeAvailable && (
                                        <div className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">
                                            Dates unavailable. Please select different dates.
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Pickup & return location</label>
                                        <div className="flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 cursor-pointer hover:border-tubo-orange transition-colors">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{car.location}</span>
                                            <Settings2 size={16} className="text-tubo-orange" />
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleProceed}
                                        disabled={!isRangeAvailable}
                                        className={`w-full font-bold py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center ${!isRangeAvailable ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-tubo-blue hover:bg-black text-white'}`}
                                    >
                                        Proceed
                                    </button>
                                    
                                    <div className="pt-4 space-y-3">
                                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                                            <ThumbsUp size={14} className="text-gray-400" />
                                            <div>
                                                <span className="font-bold block">Free cancellation</span>
                                                <span className="text-gray-400">Full refund before Nov 23, 10:00 AM</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                                            <Droplets size={14} className="text-gray-400" />
                                            <div>
                                                <span className="font-bold block">Distance included</span>
                                                <span className="text-gray-400">600 mi • $0.32/mi fee for additional miles</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                                            <ShieldCheck size={14} className="text-gray-400" />
                                            <div>
                                                <span className="font-bold block">Insurance via Travelers</span>
                                                <span className="text-gray-400">Liability insurance included</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <button 
                                            onClick={() => setIsFav(!isFav)}
                                            className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <Heart size={16} className={isFav ? "fill-red-500 text-red-500" : ""} /> 
                                            {isFav ? "Remove from favorites" : "Add to favorites"}
                                        </button>
                                    </div>

                                    <div className="flex justify-center gap-4 text-xs text-gray-400 pt-2">
                                        <button onClick={() => alert("Report feature unavailable in demo")} className="hover:underline">Report listing</button>
                                        <button onClick={() => alert("Full policy unavailable in demo")} className="hover:underline">Cancellation policy</button>
                                    </div>
                                </>
                        </div>
                    </div>
                </div>

            </div>

            {/* Mobile Sticky Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 pb-safe-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50">
                 <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="text-gray-400 line-through text-xs font-bold">{formatPrice(originalPrice)}</span>
                            <span className="text-lg font-black text-gray-900 dark:text-white">
                                {formatPrice(convertedPrice)}
                            </span>
                        </div>
                        <div className="flex items-center text-[10px] text-gray-500 font-medium gap-1">
                             <CalendarIcon size={10} className="text-tubo-orange" />
                             <span>{getDateRangeString()}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowMobileBooking(true)}
                        className="bg-tubo-blue text-white px-6 py-3 rounded-lg font-bold text-sm shadow-lg hover:bg-black transition-colors"
                    >
                        Check availability
                    </button>
                </div>
            </div>

            {/* Mobile Booking Bottom Sheet Modal */}
            {showMobileBooking && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowMobileBooking(false)}></div>
                    
                    {/* Sheet */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                         <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Select dates</h3>
                            <button onClick={() => setShowMobileBooking(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <X size={20} />
                            </button>
                         </div>

                        <div className="space-y-5">
                            <div>
                                <BookingCalendar 
                                    unavailableDates={unavailableDates}
                                    startDate={startDate}
                                    endDate={endDate}
                                    onRangeChange={handleRangeChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Pickup</label>
                                    <input 
                                        type="time" 
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-transparent rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-tubo-orange/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Dropoff</label>
                                    <input 
                                        type="time" 
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-transparent rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-tubo-orange/20"
                                    />
                                </div>
                            </div>

                            {!isRangeAvailable && (
                                <div className="text-sm text-red-500 font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    Dates unavailable.
                                </div>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex justify-between items-center">
                                    <span className="font-bold text-gray-900 dark:text-white">Total price</span>
                                    <span className="font-black text-xl text-tubo-blue dark:text-white">
                                    {formatPrice(convertedPrice)}
                                    </span>
                            </div>

                            <button 
                                onClick={handleProceed}
                                disabled={!isRangeAvailable}
                                className={`w-full font-bold py-4 rounded-xl text-lg shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all ${!isRangeAvailable ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' : 'bg-tubo-blue hover:bg-black text-white'}`}
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};