import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Booking } from '../../types';

export const TripsView = ({ t, bookings }: { t: any, bookings: Booking[] }) => {
    
    if (bookings && bookings.length > 0) {
        return (
            <div className="pb-24 pt-4 px-4 max-w-3xl mx-auto">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{t.trips}</h2>
                <div className="space-y-4">
                    {bookings.map((booking) => (
                         <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4">
                            <img src={booking.car.imageUrl} className="w-24 h-24 object-cover rounded-xl bg-gray-100" alt={booking.car.model} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{booking.car.make} {booking.car.model}</h3>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">{booking.referenceCode}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${booking.status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                
                                <div className="mt-3 space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar size={12} />
                                        <span>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                                    </div>
                                     <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <MapPin size={12} />
                                        <span className="truncate">{booking.car.location}</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 px-6 text-center">
            <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.noTrips}</h3>
            <p className="text-sm">{t.noTripsDesc}</p>
        </div>
    );
};