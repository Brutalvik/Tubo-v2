import React from 'react';
import { Settings2, Wind, Bluetooth, Users, Zap, Fuel, Music } from 'lucide-react';

interface FeatureIconProps {
    name: string;
    className?: string;
}

export const FeatureIcon: React.FC<FeatureIconProps> = ({ name, className }) => {
    const lower = name.toLowerCase();
    let Icon = Settings2; // Default

    if (lower.includes('ac') || lower.includes('climate')) Icon = Wind;
    else if (lower.includes('bluetooth') || lower.includes('carplay') || lower.includes('android')) Icon = Bluetooth;
    else if (lower.includes('seat') || lower.includes('family')) Icon = Users;
    else if (lower.includes('auto') || lower.includes('manual')) Icon = Settings2;
    else if (lower.includes('electric') || lower.includes('hybrid')) Icon = Zap;
    else if (lower.includes('diesel') || lower.includes('petrol')) Icon = Fuel;
    else if (lower.includes('audio') || lower.includes('sound')) Icon = Music;

    return (
        <div className="flex items-center gap-1">
            <Icon className={className} />
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{name}</span>
        </div>
    );
};