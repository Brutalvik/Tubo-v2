import React from 'react';
import { Heart } from 'lucide-react';

export const FavoritesView = ({ t }: { t: any }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 px-6 text-center">
      <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Heart className="h-10 w-10 text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.favorites}</h3>
      <p className="text-sm">{t.favoritesDesc}</p>
    </div>
);