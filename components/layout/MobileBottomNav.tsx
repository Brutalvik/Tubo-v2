import React from 'react';
import { Home, Heart, Calendar, MessageSquare, Car, Menu } from 'lucide-react';
import { UserRole } from '../../types';
import { NavTab } from '../common/NavTab';

interface MobileBottomNavProps {
    role: UserRole;
    activeTab: string;
    setActiveTab: (t: string) => void;
    t: any;
}

export const MobileBottomNav = ({ role, activeTab, setActiveTab, t }: MobileBottomNavProps) => (
    <nav className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 fixed bottom-0 w-full pb-safe-bottom z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center px-6 pt-3 pb-1 max-w-md mx-auto">
        {role === 'GUEST' ? (
            <>
            <NavTab icon={<Home />} label={t.home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavTab icon={<Heart />} label={t.favorites} active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
            <NavTab icon={<Calendar />} label={t.trips} active={activeTab === 'trips'} onClick={() => setActiveTab('trips')} />
            <NavTab 
                icon={<img src="https://i.pravatar.cc/150?u=main" className="w-full h-full object-cover" alt="Profile" />} 
                label={t.profile} 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
                isAvatar={true}
            />
            </>
        ) : (
            <>
            <NavTab icon={<Home />} label={t.dashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavTab icon={<Car />} label={t.listings} active={activeTab === 'listings'} onClick={() => setActiveTab('listings')} />
            <NavTab icon={<MessageSquare />} label={t.inbox} active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
            <NavTab icon={<Menu />} label={t.menu} active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
            </>
        )}
        </div>
    </nav>
);