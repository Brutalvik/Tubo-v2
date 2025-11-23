import React, { useState } from 'react';
import { UserRole, Currency, Car } from './types';
import { INITIAL_CARS, TRANSLATIONS } from './constants';

// Layout
import { DesktopHeader } from './components/layout/DesktopHeader';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Common
import { SplashScreen } from './components/common/SplashScreen';

// Guest Components
import { GuestHome } from './components/guest/GuestHome';
import { CarDetails } from './components/guest/CarDetails';
import { ProfileView } from './components/guest/ProfileView';
import { FavoritesView } from './components/guest/FavoritesView';
import { TripsView } from './components/guest/TripsView';
import { CheckoutView } from './components/guest/CheckoutView';
import { BookingConfirmationView } from './components/guest/BookingConfirmationView';

// Host Components
import { HostDashboard } from './components/host/HostDashboard';
import { ListingsView } from './components/host/ListingsView';
import { InboxView } from './components/host/InboxView';
import { MenuView } from './components/host/MenuView';


export default function App() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('GUEST');
  const [activeTab, setActiveTab] = useState('home');
  const [currency, setCurrency] = useState<Currency>('USD'); 
  const [language, setLanguage] = useState('English');
  const [isHostRegistered, setIsHostRegistered] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  
  // Booking State
  const [bookingData, setBookingData] = useState<{
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
  } | null>(null);
  
  // Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState<{
    price: number;
  } | null>(null);
  
  // Data State
  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS['English'];

  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'HOST') {
      setActiveTab('dashboard');
      setSelectedCar(null);
      setBookingData(null);
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
  
  const handleProceedCheckout = (data: { startDate: string, endDate: string, startTime: string, endTime: string }) => {
      setBookingData(data);
  };
  
  const handleBackFromCheckout = () => {
      setBookingData(null);
  };

  const handleConfirmBooking = (finalPrice: number) => {
      // Set confirmation data to show the success screen
      // We do NOT clear selectedCar or bookingData yet, so we can display them in the confirmation view
      setConfirmedBooking({ price: finalPrice });
  };
  
  const handleFinishBookingFlow = (destination: 'home' | 'trips') => {
      // Reset all booking states
      setBookingData(null);
      setSelectedCar(null);
      setConfirmedBooking(null);
      
      // Navigate
      setActiveTab(destination);
  };

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} language={language} />;
  }
  
  // Booking Confirmation View (Highest Priority)
  if (confirmedBooking && selectedCar && bookingData) {
      return (
          <BookingConfirmationView 
             car={selectedCar}
             bookingData={bookingData}
             totalPrice={confirmedBooking.price}
             currency={currency}
             onHome={() => handleFinishBookingFlow('home')}
             onTrips={() => handleFinishBookingFlow('trips')}
          />
      );
  }

  // Checkout View Logic (Takes over full screen)
  if (bookingData && selectedCar) {
      return (
          <CheckoutView 
              car={selectedCar}
              startDate={bookingData.startDate}
              endDate={bookingData.endDate}
              startTime={bookingData.startTime}
              endTime={bookingData.endTime}
              currency={currency}
              onBack={handleBackFromCheckout}
              onBook={handleConfirmBooking}
          />
      );
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
      {/* Increased padding-bottom (pb-32) on mobile to ensure the last card clears the fixed bottom nav */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 md:pb-0 bg-gray-50 dark:bg-gray-900">
        
        {/* Mobile Header - Scrollable with content, hidden on desktop */}
        {!selectedCar && <MobileHeader />}

        <div className="w-full md:max-w-7xl md:mx-auto md:px-6 h-full">
          
          {role === 'GUEST' ? (
            <>
              {selectedCar ? (
                <CarDetails 
                    car={selectedCar} 
                    currency={currency} 
                    onClose={() => setSelectedCar(null)} 
                    language={language} 
                    onCheckout={handleProceedCheckout}
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

                  {activeTab === 'favorites' && <FavoritesView t={t} />}

                  {activeTab === 'trips' && <TripsView t={t} />}
                  
                  {activeTab === 'profile' && (
                     <ProfileView 
                        t={t}
                        currency={currency}
                        setCurrency={setCurrency}
                        language={language}
                        setLanguage={setLanguage}
                        isHostRegistered={isHostRegistered}
                        handleRoleSwitch={handleRoleSwitch}
                        handleBecomeHost={handleBecomeHost}
                     />
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
              {activeTab === 'listings' && <ListingsView t={t} />}
              {activeTab === 'inbox' && <InboxView t={t} />}
              {activeTab === 'menu' && <MenuView t={t} handleRoleSwitch={handleRoleSwitch} />}
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar - Hidden on desktop */}
      {!selectedCar && (
        <MobileBottomNav 
            role={role} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            t={t} 
        />
      )}
    </div>
  );
}