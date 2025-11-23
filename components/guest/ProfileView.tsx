
import React, { useRef, useState } from 'react';
import { Banknote, Globe, Settings, CreditCard, MessageSquare, LogOut, User, Camera, Loader2 } from 'lucide-react';
import { Currency, UserProfile } from '../../types';
import { MenuButton } from '../common/MenuButton';
import { SettingsSelector } from '../common/SettingsSelector';
import { authService } from '../../services/authService';

interface ProfileViewProps {
    user: UserProfile | null;
    t: any;
    currency: Currency;
    setCurrency: (c: Currency) => void;
    language: string;
    setLanguage: (l: string) => void;
    isHostRegistered: boolean;
    handleRoleSwitch: (role: any) => void;
    handleBecomeHost: () => void;
    onLogin: () => void;
    onLogout: () => void;
    onUpdateUser?: (user: UserProfile) => void;
}

export const ProfileView = ({ 
    user,
    t, 
    currency, 
    setCurrency, 
    language, 
    setLanguage, 
    isHostRegistered, 
    handleRoleSwitch, 
    handleBecomeHost,
    onLogin,
    onLogout,
    onUpdateUser
}: ProfileViewProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploading(true);
        
        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64String = reader.result as string;
                // Call API
                const updatedUser = await authService.updateProfile({ photoURL: base64String });
                // Update Parent State
                if (onUpdateUser) onUpdateUser(updatedUser);
            } catch (err) {
                console.error("Upload failed", err);
                alert("Failed to upload image");
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    if (!user) {
        return (
            <div className="px-5 pb-10 flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
                <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <User className="h-10 w-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-black text-tubo-blue dark:text-white mb-2">Log in to Tubo</h2>
                <p className="text-sm text-gray-500 mb-8">Create an account or log in to view your profile, manage bookings, and list your car.</p>
                
                <button 
                    onClick={onLogin}
                    className="w-full bg-tubo-blue text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all active:scale-[0.98]"
                >
                    Log in or Sign up
                </button>

                 <div className="w-full mt-12 text-left">
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
            </div>
        );
    }

    return (
        <div className="px-5 pb-10 md:max-w-2xl md:mx-auto md:mt-10">
            <div className="flex items-center gap-4 mb-8 mt-2">
                <div className="relative group cursor-pointer" onClick={handleImageClick}>
                    {uploading ? (
                         <div className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-gray-200 flex items-center justify-center">
                            <Loader2 className="animate-spin text-gray-500" />
                         </div>
                    ) : (
                        <>
                            <img 
                                src={user.photoURL || "https://i.pravatar.cc/150?u=default"} 
                                className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover group-hover:opacity-80 transition-opacity" 
                                alt="Profile" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white h-6 w-6" />
                            </div>
                        </>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                
                <div>
                    <h2 className="text-2xl font-black text-tubo-blue dark:text-white">{user.displayName}</h2>
                    <p className="text-sm text-gray-500 font-medium">Joined {user.joinDate || 'recently'}</p>
                    <div className="mt-1 inline-block bg-blue-50 dark:bg-blue-900/30 text-tubo-blue dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                        {t.verifiedMember}
                    </div>
                </div>
            </div>

            {/* Host Switching / Joining Section */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-tubo-blue to-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow" onClick={() => isHostRegistered ? handleRoleSwitch('HOST') : handleBecomeHost()}>
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 bg-white opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
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
                            className="bg-white text-tubo-blue px-4 py-2.5 rounded-xl text-xs font-bold group-hover:bg-gray-100 transition-colors shadow-sm"
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
                    <div onClick={onLogout}>
                        <MenuButton icon={LogOut} label={t.logOut} isDestructive />
                    </div>
                </div>
            </div>
        </div>
    );
};
