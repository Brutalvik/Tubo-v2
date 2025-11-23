import React from 'react';
import { ChevronRight } from 'lucide-react';

export const MenuButton = ({ icon: Icon, label, isDestructive = false }: { icon: any, label: string, isDestructive?: boolean }) => (
    <button className={`w-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between group active:scale-[0.98] transition-all ${isDestructive ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
        <div className="flex items-center gap-3">
            <Icon size={20} className={isDestructive ? 'text-red-500' : 'text-gray-400'} />
            <span className="font-bold text-sm">{label}</span>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
    </button>
);