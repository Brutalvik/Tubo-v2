
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingCalendarProps {
    unavailableDates: string[];
    startDate: string;
    endDate: string;
    onRangeChange: (start: string, end: string) => void;
}

export const BookingCalendar = ({ unavailableDates, startDate, endDate, onRangeChange }: BookingCalendarProps) => {
    // Parse initial date to determine which month to show
    const initialDate = startDate ? new Date(startDate) : new Date();
    const [currentMonth, setCurrentMonth] = useState(initialDate);

    // Helper to get days in month
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Helper to get day of week for the 1st of the month (0=Sun, 1=Mon...)
    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    const isDateUnavailable = (dateStr: string) => {
        return unavailableDates.includes(dateStr);
    };

    const handleDateClick = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (isDateUnavailable(dateStr)) return;

        if (!startDate || (startDate && endDate)) {
            // Start new selection
            onRangeChange(dateStr, "");
        } else {
            // Complete selection
            // Ensure end date is after start date
            if (new Date(dateStr) < new Date(startDate)) {
                onRangeChange(dateStr, ""); // Restart if clicked before start
            } else {
                onRangeChange(startDate, dateStr);
            }
        }
    };

    const getDayStatus = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (isDateUnavailable(dateStr)) return 'unavailable';
        
        if (startDate === dateStr) return 'start';
        if (endDate === dateStr) return 'end';
        
        if (startDate && endDate) {
            const d = new Date(dateStr);
            const s = new Date(startDate);
            const e = new Date(endDate);
            if (d > s && d < e) return 'in-range';
        }
        
        return 'available';
    };

    // Generate calendar grid
    const days = [];
    // Empty cells for padding
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
        const status = getDayStatus(d);
        
        let className = "h-10 w-full flex items-center justify-center text-sm font-medium rounded-full transition-all relative ";
        
        if (status === 'unavailable') {
            className += "text-gray-300 line-through cursor-not-allowed decoration-gray-400 decoration-2";
        } else if (status === 'start' || status === 'end') {
            className += "bg-tubo-blue text-white font-bold z-10 shadow-md";
        } else if (status === 'in-range') {
            className += "bg-blue-50 text-tubo-blue rounded-none";
        } else {
            className += "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
        }

        // Connectors for range visual
        const isRangeStart = status === 'start' && endDate;
        const isRangeEnd = status === 'end' && startDate;
        
        days.push(
            <div key={d} className="relative p-0.5 w-full aspect-square flex items-center justify-center">
                {/* Background connector for range */}
                {(status === 'in-range' || isRangeStart || isRangeEnd) && (
                    <div className={`absolute inset-y-0.5 bg-blue-50 z-0 
                        ${isRangeStart ? 'left-1/2 right-0' : ''} 
                        ${isRangeEnd ? 'left-0 right-1/2' : ''}
                        ${status === 'in-range' ? 'left-0 right-0' : ''}
                    `}></div>
                )}
                
                <button 
                    onClick={() => handleDateClick(d)}
                    disabled={status === 'unavailable'}
                    className={className}
                >
                    {d}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full select-none">
            <div className="flex items-center justify-between mb-4 px-2">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <span className="font-bold text-gray-900 dark:text-white">
                    {monthNames[month]} {year}
                </span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronRight size={20} className="text-gray-600" />
                </button>
            </div>
            <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="h-8 flex items-center justify-center text-xs font-bold text-gray-400 uppercase">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
                {days}
            </div>
        </div>
    );
};
