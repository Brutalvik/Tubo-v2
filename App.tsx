import React, { useState, useEffect } from 'react';
import { UserRole, Currency, Car, UserProfile, Booking } from './types';
import { INITIAL_CARS, TRANSLATIONS } from './constants';
import { authService } from './services/authService';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Layout
import { DesktopHeader } from './components/layout/DesktopHeader';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Common
import { SplashScreen } from './components/common/SplashScreen';

// Auth
import { AuthModal } from './components/auth/AuthModal';

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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('GUEST');
  const [activeTab, setActiveTab] = useState('home');
  const [currency, setCurrency] = useState<Currency>('USD'); 
  const [language, setLanguage] = useState('English');
  const [isHostRegistered, setIsHostRegistered] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Booking State
  const [bookingData, setBookingData] = useState<{
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
  } | null>(null);
  
  // Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingReference: string;
    finalPrice: number;
  } | null>(null);

  // My Bookings History
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  
  // Data State
  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS['English'];

  // Initialize Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const profile = userDoc.data() as UserProfile;
                    setCurrentUser(profile);
                    setIsHostRegistered(profile.isHostRegistered);
                }
            } catch (e) {
                console.error("Error fetching user profile", e);
            }
        } else {
            setCurrentUser(null);
            setIsHostRegistered(false);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleSwitch = (newRole: UserRole) => {
    if (!currentUser) {
        setShowAuthModal(true);
        return;
    }
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
      if (!currentUser) {
          setShowAuthModal(true);
          return;
      }
      setLoading(true);
      
      // Update role in Firestore
      authService.updateProfile({ isHostRegistered: true }).then((updatedUser) => {
           setCurrentUser(updatedUser);
           setIsHostRegistered(true);
           handleRoleSwitch('HOST');
           setLoading(false);
      }).catch(err => {
          console.error(err);
          setLoading(false);
      });
  };

  const handleAddListing = (newCar: Car) => {
    setCars([...cars, newCar]);
  };

  const handleLoginSuccess = (user: UserProfile) => {
      setCurrentUser(user);
      setIsHostRegistered(user.isHostRegistered);
  };

  const handleLogout = async () => {
      setLoading(true);
      await authService.logout();
      setCurrentUser(null);
      setRole('GUEST');
      setActiveTab('home');
      setLoading(false);
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
      if (!currentUser) {
          setShowAuthModal(true);
          return;
      }
      setBookingData(data);
  };
  
  const handleBackFromCheckout = () => {
      setBookingData(null);
  };

  const handleConfirmBooking = (finalPrice: number) => {
      if (!bookingData || !selectedCar) return;

      const newRef = `TB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      const newBooking: Booking = {
          id: `bk_${Date.now()}`,
          referenceCode: newRef,
          car: selectedCar,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          totalPrice: finalPrice,
          currency: currency,
          status: 'upcoming',
          bookedAt: new Date().toISOString()
      };

      setMyBookings(prev => [newBooking, ...prev]);
      setConfirmedBooking({
          bookingReference: newRef,
          finalPrice: finalPrice
      });
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
  
  // Booking Confirmation View
  if (confirmedBooking && selectedCar && bookingData) {
      return (
          <BookingConfirmationView 
             car={selectedCar}
             bookingData={bookingData}
             totalPrice={confirmedBooking.finalPrice}
             currency={currency}
             bookingReference={confirmedBooking.bookingReference}
             onHome={() => handleFinishBookingFlow('home')}
             onTrips={() => handleFinishBookingFlow('trips')}
          />
      );
  }

  // Checkout View
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
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

      {/* Desktop Header */}
      <DesktopHeader 
        role={role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        t={t} 
        userImage={currentUser?.photoURL || "https://i.pravatar.cc/150?u=default"}
      />

      {/* Main Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 md:pb-0 bg-gray-50 dark:bg-gray-900">
        
        {/* Mobile Header */}
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

                  {activeTab === 'trips' && <TripsView t={t} bookings={myBookings} />}
                  
                  {activeTab === 'profile' && (
                     <ProfileView 
                        user={currentUser}
                        t={t}
                        currency={currency}
                        setCurrency={setCurrency}
                        language={language}
                        setLanguage={setLanguage}
                        isHostRegistered={isHostRegistered}
                        handleRoleSwitch={handleRoleSwitch}
                        handleBecomeHost={handleBecomeHost}
                        onLogin={() => setShowAuthModal(true)}
                        onLogout={handleLogout}
                        onUpdateUser={setCurrentUser}
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

      {/* Mobile Bottom Navigation Bar */}
      {!selectedCar && (
        <MobileBottomNav 
            role={role} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            t={t}
            userImage={currentUser?.photoURL}
        />
      )}
    </div>
  );
}