import React from 'react';
import { ChevronRight } from 'lucide-react';

export const SettingsSelector = ({ icon: Icon, label, value, options, onChange, changeText }: { icon: any, label: string, value: string, options: string[], onChange: (val: string) => void, changeText: string }) => (
    <div className="relative w-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all active:scale-[0.99]">
        <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <Icon size={16} />
             </div>
            <div className="flex flex-col items-start">
                <span className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{label}</span>
                <span className="text-[10px] font-medium text-tubo-orange">{value}</span>
            </div>
        </div>
        <div className="flex items-center gap-2">
             <span className="text-xs text-gray-400">{changeText}</span>
             <ChevronRight size={14} className="text-gray-300" />
        </div>
        
        <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);