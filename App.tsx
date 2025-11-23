
import React, { useState, useEffect } from 'react';
import { GuestHome, CarDetails } from './components/SearchViews';
import { HostDashboard } from './components/HostViews';
import { UserRole, Currency, Car } from './types';
import { INITIAL_CARS, TRANSLATIONS } from './constants';
import { Car as CarIcon, Home, Calendar, MessageSquare, Menu, Heart, LogOut, Settings, CreditCard, ChevronRight, User, Globe, Banknote, Bell } from 'lucide-react';

const SplashScreen = ({ onFinish, language }: { onFinish: () => void, language: string }) => {
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

const DesktopHeader = ({ 
  role, 
  activeTab, 
  setActiveTab, 
  t,
  userImage
}: { 
  role: UserRole, 
  activeTab: string, 
  setActiveTab: (t: string) => void, 
  t: any,
  userImage: string
}) => {
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

const NavButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`text-sm font-bold transition-colors ${active ? 'text-tubo-orange' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
  >
    {label}
  </button>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('GUEST');
  const [activeTab, setActiveTab] = useState('home');
  const [currency, setCurrency] = useState<Currency>('USD'); 
  const [language, setLanguage] = useState('English');
  const [isHostRegistered, setIsHostRegistered] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  
  // Data State
  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS['English'];

  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'HOST') {
      setActiveTab('dashboard');
      setSelectedCar(null);
    } else {
      setActiveTab('home');
    }
  };

  const handleBecomeHost = () => {
      setLoading(true);
      setTimeout(() => {
          setIsHostRegistered(true);
          handleRoleSwitch('HOST');
          setLoading(false);
      }, 1500); // Fake processing delay
  };

  const handleAddListing = (newCar: Car) => {
    setCars([...cars, newCar]);
  };

  // Filter cars based on search location
  const displayedCars = cars.filter(car => {
      if (!searchLocation) return true;
      return car.location.toLowerCase().includes(searchLocation.toLowerCase());
  });

  const handleSearch = (location: string) => {
      setSearchLocation(location);
      setSelectedCar(null);
  };

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} language={language} />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      
      {/* Desktop Header - Only visible on md+ */}
      <DesktopHeader 
        role={role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        t={t} 
        userImage="https://i.pravatar.cc/150?u=main"
      />

      {/* Main Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-0 bg-gray-50 dark:bg-gray-900">
        
        {/* Mobile Header - Scrollable with content, hidden on desktop */}
        {!selectedCar && (
          <header className="md:hidden pt-safe-top px-5 pb-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-gradient-to-br from-tubo-blue to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10">
                          <span className="text-white font-black text-xl">T</span>
                      </div>
                      <span className="font-black text-2xl tracking-tighter text-tubo-blue dark:text-white">
                      TU<span className="text-tubo-orange">BO</span>
                      </span>
                  </div>
              </div>
          </header>
        )}

        <div className="w-full md:max-w-7xl md:mx-auto md:px-6 h-full">
          
          {role === 'GUEST' ? (
            <>
              {selectedCar ? (
                <CarDetails 
                    car={selectedCar} 
                    currency={currency} 
                    onClose={() => setSelectedCar(null)} 
                    language={language} 
                />
              ) : (
                <>
                  {activeTab === 'home' && (
                    <GuestHome 
                        cars={displayedCars} 
                        currency={currency} 
                        onCurrencyChange={setCurrency}
                        language={language}
                        onSearch={handleSearch}
                        searchLocation={searchLocation}
                        onCarSelect={setSelectedCar}
                    />
                  )}

                  {activeTab === 'favorites' && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 px-6 text-center">
                      <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <Heart className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.favorites}</h3>
                      <p className="text-sm">{t.favoritesDesc}</p>
                    </div>
                  )}

                  {activeTab === 'trips' && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 px-6 text-center">
                      <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <Calendar className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.noTrips}</h3>
                      <p className="text-sm">{t.noTripsDesc}</p>
                    </div>
                  )}
                  
                  {activeTab === 'profile' && (
                     <div className="px-5 pb-10 md:max-w-2xl md:mx-auto md:mt-10">
                        <div className="flex items-center gap-4 mb-8 mt-2">
                            <img src="https://i.pravatar.cc/150?u=main" className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg" />
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
                  )}
                </>
              )}
            </>
          ) : (
            // HOST MODE
            <>
              {activeTab === 'dashboard' && (
                <div className="p-4 md:p-6">
                     <HostDashboard onAddListing={() => {}} language={language} />
                </div>
              )}
              {activeTab === 'listings' && (
                 <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                    <CarIcon className="h-12 w-12 mb-4 opacity-20" />
                    <p>{t.yourListings}</p>
                 </div>
              )}
               {activeTab === 'inbox' && (
                 <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                    <p>{t.hostInbox}</p>
                 </div>
              )}
               {activeTab === 'menu' && (
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
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar - Hidden on desktop */}
      {!selectedCar && (
        <nav className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 fixed bottom-0 w-full pb-safe-bottom z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center px-6 pt-3 pb-1 max-w-md mx-auto">
            {role === 'GUEST' ? (
                <>
                <NavTab icon={<Home />} label={t.home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <NavTab icon={<Heart />} label={t.favorites} active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
                <NavTab icon={<Calendar />} label={t.trips} active={activeTab === 'trips'} onClick={() => setActiveTab('trips')} />
                <NavTab 
                    icon={<img src="https://i.pravatar.cc/150?u=main" className="w-full h-full object-cover" />} 
                    label={t.profile} 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')} 
                    isAvatar={true}
                />
                </>
            ) : (
                <>
                <NavTab icon={<Home />} label={t.dashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <NavTab icon={<CarIcon />} label={t.listings} active={activeTab === 'listings'} onClick={() => setActiveTab('listings')} />
                <NavTab icon={<MessageSquare />} label={t.inbox} active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
                <NavTab icon={<Menu />} label={t.menu} active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
                </>
            )}
            </div>
        </nav>
      )}
    </div>
  );
}

const NavTab = ({ icon, label, active, onClick, isAvatar = false }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isAvatar?: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 w-14 transition-all duration-300 group`}
  >
    <div className={`relative p-1 rounded-xl transition-all duration-300 ${active ? 'text-tubo-orange -translate-y-1' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
        {isAvatar ? (
            <div className={`h-6 w-6 rounded-full overflow-hidden ring-2 transition-all ${active ? 'ring-tubo-orange' : 'ring-transparent'}`}>
                {icon}
            </div>
        ) : (
            React.cloneElement(icon as React.ReactElement<any>, { 
                size: 24, 
                strokeWidth: active ? 2.5 : 2,
                fill: active ? "currentColor" : "none",
                className: active ? "opacity-100" : "opacity-80"
            })
        )}
        {active && !isAvatar && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-tubo-orange rounded-full"></span>}
    </div>
    <span className={`text-[10px] font-bold transition-colors truncate w-full text-center ${active ? 'text-tubo-blue dark:text-white' : 'text-gray-400'}`}>{label}</span>
  </button>
);

const MenuButton = ({ icon: Icon, label, isDestructive = false }: { icon: any, label: string, isDestructive?: boolean }) => (
    <button className={`w-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between group active:scale-[0.98] transition-all ${isDestructive ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
        <div className="flex items-center gap-3">
            <Icon size={20} className={isDestructive ? 'text-red-500' : 'text-gray-400'} />
            <span className="font-bold text-sm">{label}</span>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
    </button>
);

const SettingsSelector = ({ icon: Icon, label, value, options, onChange, changeText }: { icon: any, label: string, value: string, options: string[], onChange: (val: string) => void, changeText: string }) => (
    <div className="relative w-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all active:scale-[0.99]">
        <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <Icon size={16} />
             </div>
            <div className="flex flex-col items-start">
                <span className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{label}</span>
                <span className="text-[10px] font-medium text-tubo-orange">{value}</span>
            </div>
        </div>
        <div className="flex items-center gap-2">
             <span className="text-xs text-gray-400">{changeText}</span>
             <ChevronRight size={14} className="text-gray-300" />
        </div>
        
        <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);
