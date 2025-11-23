import React from 'react';
import { Car as CarIcon } from 'lucide-react';

export const ListingsView = ({ t }: { t: any }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <CarIcon className="h-12 w-12 mb-4 opacity-20" />
        <p>{t.yourListings}</p>
    </div>
);