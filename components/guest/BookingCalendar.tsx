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
        days.push(<div key={`empty-${i}`} className="h-10 w-full"></div>);
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
        const status = getDayStatus(d);
        
        let buttonClass = "h-9 w-9 flex items-center justify-center text-xs font-bold rounded-full transition-all relative z-10 ";
        
        if (status === 'unavailable') {
            buttonClass += "text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 line-through decoration-gray-300 decoration-2 cursor-not-allowed";
        } else if (status === 'start' || status === 'end') {
            buttonClass += "bg-tubo-blue text-white shadow-md scale-105";
        } else if (status === 'in-range') {
            buttonClass += "text-tubo-blue dark:text-blue-300 hover:bg-blue-50";
        } else {
            buttonClass += "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105";
        }

        // Visual Connectors Logic
        const isRangeStart = status === 'start' && endDate;
        const isRangeEnd = status === 'end' && startDate;
        const isInRange = status === 'in-range';
        
        days.push(
            <div key={d} className="relative p-0.5 w-full aspect-square flex items-center justify-center">
                {/* Connector Bar - Visual only */}
                {(isInRange || isRangeStart || isRangeEnd) && (
                    <div className={`absolute top-1/2 -translate-y-1/2 h-8 bg-blue-50 dark:bg-blue-900/30 z-0
                        ${isRangeStart ? 'left-1/2 right-0 rounded-l-full' : ''}
                        ${isRangeEnd ? 'left-0 right-1/2 rounded-r-full' : ''}
                        ${isInRange ? 'left-0 right-0' : ''}
                    `}></div>
                )}
                
                <button 
                    onClick={() => handleDateClick(d)}
                    disabled={status === 'unavailable'}
                    className={buttonClass}
                >
                    {d}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full select-none p-2">
            <div className="flex items-center justify-between mb-6 px-2">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
                <span className="font-black text-gray-900 dark:text-white tracking-tight text-sm">
                    {monthNames[month]} {year}
                </span>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
            </div>
            
            <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="h-8 flex items-center justify-center text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
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