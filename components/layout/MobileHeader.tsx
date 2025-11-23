import React from 'react';

export const MobileHeader = () => (
    <header className="md:hidden pt-safe-top px-5 pb-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-gradient-to-br from-tubo-blue to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10">
                    <span className="text-white font-black text-xl">T</span>
                </div>
                <span className="font-black text-2xl tracking-tighter text-tubo-blue dark:text-white">
                TU<span className="text-tubo-orange">BO</span>
                </span>
            </div>
        </div>
    </header>
);