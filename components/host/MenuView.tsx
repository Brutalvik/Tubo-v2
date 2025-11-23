import React from 'react';
import { User, Settings, CreditCard, LogOut } from 'lucide-react';
import { MenuButton } from '../common/MenuButton';

interface MenuViewProps {
    t: any;
    handleRoleSwitch: (role: any) => void;
}

export const MenuView = ({ t, handleRoleSwitch }: MenuViewProps) => (
    <div className="px-5 md:max-w-2xl md:mx-auto md:mt-10">
        <h2 className="text-3xl font-black text-tubo-blue dark:text-white mb-6 mt-2">{t.menu}</h2>
        
        {/* Switch back to Guest */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                    <User size={20} />
                    </div>
                    <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{t.guestMode}</h3>
                    <p className="text-xs text-gray-500">{t.switchToRenting}</p>
                    </div>
            </div>
            <button 
                onClick={() => handleRoleSwitch('GUEST')}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
            >
                {t.switch}
            </button>
        </div>

        <div className="space-y-2">
            <MenuButton icon={Settings} label={t.hostSettings} />
            <MenuButton icon={CreditCard} label={t.payoutMethods} />
            <MenuButton icon={LogOut} label={t.logOut} isDestructive />
        </div>
    </div>
);