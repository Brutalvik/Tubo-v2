import React from 'react';
import { CheckCircle, Home, Calendar, ArrowRight, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Car, Currency } from '../../types';
import { EXCHANGE_RATES } from '../../constants';

interface BookingConfirmationViewProps {
    car: Car;
    bookingData: {
        startDate: string;
        endDate: string;
        startTime: string;
        endTime: string;
    };
    totalPrice: number;
    currency: Currency;
    onHome: () => void;
    onTrips: () => void;
}

export const BookingConfirmationView = ({ car, bookingData, totalPrice, currency, onHome, onTrips }: BookingConfirmationViewProps) => {
    const rate = EXCHANGE_RATES[currency] || 1;
    
    const formatPrice = (price: number) => {
        if (currency === 'IDR') return `Rp ${price.toLocaleString('en-US')}`;
        return `${currency} ${price.toLocaleString('en-US')}`;
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Generate random reference code
    const bookingRef = `TB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 overflow-y-auto flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-300">
                
                {/* Success Header */}
                <div className="bg-green-500 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 opacity-30 pattern-dots"></div>
                    <div className="relative z-10">
                        <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <CheckCircle className="h-10 w-10 text-green-500" strokeWidth={3} />
                        </div>
                        <h1 className="text-2xl font-black text-white mb-1">Booking Confirmed!</h1>
                        <p className="text-green-100 font-medium text-sm">Your trip is ready to go.</p>
                    </div>
                </div>

                <div className="p-6">
                    {/* Booking Ref */}
                    <div className="text-center mb-6">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Booking Reference</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-wider font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">{bookingRef}</span>
                    </div>

                    {/* Car Card */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex gap-4 mb-6 border border-gray-100 dark:border-gray-600">
                        <img src={car.imageUrl} alt={car.model} className="w-20 h-20 object-cover rounded-lg shadow-sm" />
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white">{car.make} {car.model}</h3>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <MapPin size={12} /> {car.location}
                            </div>
                            <div className="mt-2 text-sm font-bold text-tubo-orange">
                                {formatPrice(totalPrice)} <span className="text-gray-400 text-[10px] font-normal">total paid</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Summary */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-tubo-blue dark:text-blue-300 shrink-0">
                                 <CalendarIcon size={20} />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-gray-400 uppercase">Trip Dates</p>
                                 <p className="text-sm font-bold text-gray-900 dark:text-white">
                                     {formatDate(bookingData.startDate)} - {formatDate(bookingData.endDate)}
                                 </p>
                             </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button 
                            onClick={onTrips}
                            className="w-full bg-tubo-blue text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                            <Calendar size={18} />
                            Go to My Trips
                        </button>
                        <button 
                            onClick={onHome}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white py-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Home size={18} />
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};