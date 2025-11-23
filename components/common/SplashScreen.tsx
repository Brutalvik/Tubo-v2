import React, { useEffect } from 'react';
import { TRANSLATIONS } from '../../constants';

export const SplashScreen = ({ onFinish, language }: { onFinish: () => void, language: string }) => {
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS['English'];

  useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-tubo-blue to-gray-900 flex flex-col items-center justify-center z-50">
      <div className="bg-white p-4 rounded-2xl shadow-2xl animate-bounce-slow mb-6">
          <div className="bg-gradient-to-r from-tubo-blue to-tubo-orange bg-clip-text text-transparent font-black text-5xl tracking-tighter">
            T
          </div>
      </div>
      <h1 className="text-4xl font-black text-white tracking-tighter">TU<span className="text-tubo-orange">BO</span></h1>
      <p className="text-gray-400 mt-2 font-medium tracking-wide text-sm uppercase">{t.tagline}</p>
    </div>
  );
};