import React from 'react';
import { Banknote, Globe, Settings, CreditCard, MessageSquare, LogOut } from 'lucide-react';
import { Currency } from '../../types';
import { MenuButton } from '../common/MenuButton';
import { SettingsSelector } from '../common/SettingsSelector';

interface ProfileViewProps {
    t: any;
    currency: Currency;
    setCurrency: (c: Currency) => void;
    language: string;
    setLanguage: (l: string) => void;
    isHostRegistered: boolean;
    handleRoleSwitch: (role: any) => void;
    handleBecomeHost: () => void;
}

export const ProfileView = ({ t, currency, setCurrency, language, setLanguage, isHostRegistered, handleRoleSwitch, handleBecomeHost }: ProfileViewProps) => {
    return (
        <div className="px-5 pb-10 md:max-w-2xl md:mx-auto md:mt-10">
            <div className="flex items-center gap-4 mb-8 mt-2">
                <img src="https://i.pravatar.cc/150?u=main" className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg" alt="Profile" />
                <div>
                    <h2 className="text-2xl font-black text-tubo-blue dark:text-white">Guest User</h2>
                    <p className="text-sm text-gray-500 font-medium">{t.verifiedMember}</p>
                </div>
            </div>

            {/* Host Switching / Joining Section */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-tubo-blue to-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 bg-white opacity-5 rounded-full blur-2xl"></div>
                        <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg mb-1">{isHostRegistered ? t.switchHost : t.joinHost}</h3>
                            <p className="text-xs text-gray-300 opacity-80 max-w-[180px] leading-relaxed">
                                {isHostRegistered 
                                    ? t.hostBenefits 
                                    : t.joinBenefits}
                            </p>
                        </div>
                        <button 
                            onClick={() => isHostRegistered ? handleRoleSwitch('HOST') : handleBecomeHost()}
                            className="bg-white text-tubo-blue px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            {isHostRegistered ? t.switch : t.join}
                        </button>
                        </div>
                </div>
            </div>

            {/* Preferences Section */}
            <div className="mb-6">
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.preferences}</h3>
                <div className="space-y-2">
                    <SettingsSelector 
                        icon={Banknote} 
                        label={t.currency}
                        value={currency} 
                        options={['IDR', 'MYR', 'SGD', 'CAD', 'USD']} 
                        onChange={(v) => setCurrency(v as Currency)}
                        changeText={t.change} 
                    />
                    <SettingsSelector 
                        icon={Globe} 
                        label={t.language} 
                        value={language} 
                        options={['English', 'Bahasa Indonesia', 'Bahasa Melayu']} 
                        onChange={(v) => setLanguage(v)} 
                        changeText={t.change}
                    />
                </div>
            </div>

            {/* Account Section */}
            <div>
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.account}</h3>
                <div className="space-y-2">
                    <MenuButton icon={Settings} label={t.accountSettings} />
                    <MenuButton icon={CreditCard} label={t.paymentMethods} />
                    <MenuButton icon={MessageSquare} label={t.supportInbox} />
                    <MenuButton icon={LogOut} label={t.logOut} isDestructive />
                </div>
            </div>
        </div>
    );
};