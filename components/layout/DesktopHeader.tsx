import React from 'react';
import { UserRole } from '../../types';
import { Bell } from 'lucide-react';
import { NavButton } from '../common/NavButton';

interface DesktopHeaderProps { 
  role: UserRole;
  activeTab: string;
  setActiveTab: (t: string) => void;
  t: any;
  userImage: string;
}

export const DesktopHeader = ({ 
  role, 
  activeTab, 
  setActiveTab, 
  t,
  userImage
}: DesktopHeaderProps) => {
  return (
    <header className="hidden md:flex bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 px-6 py-4 items-center justify-between">
       <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab(role === 'HOST' ? 'dashboard' : 'home')}>
          <div className="h-10 w-10 bg-gradient-to-br from-tubo-blue to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10">
              <span className="text-white font-black text-xl">T</span>
          </div>
          <span className="font-black text-2xl tracking-tighter text-tubo-blue dark:text-white">
            TU<span className="text-tubo-orange">BO</span>
          </span>
       </div>

       <div className="flex items-center gap-8">
          {role === 'GUEST' ? (
            <>
              <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} label={t.home} />
              <NavButton active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} label={t.favorites} />
              <NavButton active={activeTab === 'trips'} onClick={() => setActiveTab('trips')} label={t.trips} />
            </>
          ) : (
            <>
              <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label={t.dashboard} />
              <NavButton active={activeTab === 'listings'} onClick={() => setActiveTab('listings')} label={t.listings} />
              <NavButton active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} label={t.inbox} />
            </>
          )}
       </div>

       <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
             <Bell size={20} />
          </button>
          <div 
            className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActiveTab(role === 'HOST' ? 'menu' : 'profile')}
          >
              <div className="text-right hidden lg:block">
                 <p className="text-sm font-bold text-gray-900 dark:text-white">{role === 'HOST' ? 'Host Mode' : 'Guest User'}</p>
                 <p className="text-xs text-gray-500">{role === 'HOST' ? t.hostDashboard : t.verifiedMember}</p>
              </div>
              <img src={userImage} alt="Profile" className="h-10 w-10 rounded-full border-2 border-gray-100 dark:border-gray-700" />
          </div>
       </div>
    </header>
  );
}