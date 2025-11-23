import React from 'react';
import { CarFront, CarTaxiFront, Bus, Gem, Zap, Car as CarIcon, ShieldCheck, Headphones } from 'lucide-react';

export const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
    const icons: any = { CarFront, CarTaxiFront, Bus, Gem, Zap, Car: CarIcon, ShieldCheck, Clock: Headphones };
    const Icon = icons[name] || CarIcon;
    return <Icon className={className} />;
};