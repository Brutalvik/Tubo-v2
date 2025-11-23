import React, { useState } from 'react';
import { 
    ArrowLeft, ShieldCheck, CreditCard, Info, 
    CheckCircle, ChevronDown, Plus, Car as CarIcon,
    Calendar as CalendarIcon, MapPin, Loader2, Lock, AlertCircle
} from 'lucide-react';
import { Car, Currency } from '../../types';
import { EXCHANGE_RATES } from '../../constants';

interface CheckoutViewProps {
    car: Car;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    currency: Currency;
    onBack: () => void;
    onBook: (finalPrice: number) => void;
}

export const CheckoutView = ({ 
    car, startDate, endDate, startTime, endTime, currency, onBack, onBook 
}: CheckoutViewProps) => {
    
    const [rateOption, setRateOption] = useState<'non-refundable' | 'refundable'>('non-refundable');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'gpay'>('card');
    const [isProcessing, setIsProcessing] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        countryCode: 'ID +62',
        mobile: '',
        email: '',
        firstName: '',
        lastName: '',
        age: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
        cardCountry: 'Indonesia'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Price Calculations
    const rate = EXCHANGE_RATES[currency] || 1;
    const dailyPrice = Math.round(car.pricePerDayIdr * rate);
    
    // Calculate duration in days (rough estimate)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    const subtotal = dailyPrice * diffDays;
    const taxes = Math.round(subtotal * 0.11); // Mock 11% tax
    const protectionFee = rateOption === 'refundable' ? Math.round(subtotal * 0.08) : 0;
    
    const total = subtotal + taxes + protectionFee;
    const discount = rateOption === 'non-refundable' ? Math.round(total * 0.05) : 0;
    const finalTotal = total - discount;

    const formatPrice = (price: number) => {
        if (currency === 'IDR') return `Rp ${price.toLocaleString('en-US')}`;
        return `${currency} ${price.toLocaleString('en-US')}`;
    };

    // Date Formatting
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9+\-\s()]*$/;

        if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
        else if (!phoneRegex.test(formData.mobile)) newErrors.mobile = "Invalid mobile format";

        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email address";

        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.age || formData.age === "Select your age") newErrors.age = "Age is required";

        if (paymentMethod === 'card') {
            const cleanCard = formData.cardNumber.replace(/\D/g, '');
            if (!cleanCard) newErrors.cardNumber = "Card number is required";
            else if (cleanCard.length < 13 || cleanCard.length > 19) newErrors.cardNumber = "Invalid card length";

            if (!formData.expiry.trim()) newErrors.expiry = "Expiration is required";
            // Simple MM/YY check could be added here
            
            if (!formData.cvc.trim()) newErrors.cvc = "CVC is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBookClick = () => {
        if (validate()) {
            setIsProcessing(true);
            // Simulate payment processing delay
            setTimeout(() => {
                setIsProcessing(false);
                onBook(finalTotal);
            }, 3000);
        } else {
            // Scroll to top or first error could be implemented here
            const firstError = document.querySelector('.border-red-500');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const InputError = ({ field }: { field: string }) => {
        if (!errors[field]) return null;
        return (
            <div className="flex items-center gap-1 mt-1.5 text-red-500 text-xs font-bold animate-in slide-in-from-top-1">
                <AlertCircle size={12} />
                <span>{errors[field]}</span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
            {/* Payment Processing Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 z-[60] bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center border border-gray-100 dark:border-gray-700">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-tubo-blue/20 rounded-full animate-ping"></div>
                            <div className="relative bg-tubo-blue text-white p-4 rounded-full">
                                <Lock size={32} />
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Processing Payment</h3>
                        <p className="text-sm text-gray-500 mb-6">Please wait while we securely process your transaction...</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <Loader2 className="animate-spin" size={14} />
                            Verifying
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-40 px-4 md:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} disabled={isProcessing} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white hidden md:block">Checkout</h1>
                </div>
                <button onClick={onBack} disabled={isProcessing} className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">
                    Back to listing
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Left Column - Forms */}
                <div className="lg:col-span-2 space-y-10 pb-24">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white md:hidden">Checkout</h1>

                    {/* Primary Driver Section */}
                    <section>
                        <div className="flex justify-between items-baseline mb-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Primary driver</h2>
                            <button className="text-sm font-bold border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800">
                                Log in
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Country</label>
                                    <div className="relative">
                                        <select 
                                            name="countryCode"
                                            value={formData.countryCode}
                                            onChange={handleChange}
                                            className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none focus:border-tubo-orange focus:ring-1 focus:ring-tubo-orange transition-all"
                                        >
                                            <option>ID +62</option>
                                            <option>US +1</option>
                                            <option>MY +60</option>
                                            <option>SG +65</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Mobile number</label>
                                    <input 
                                        type="tel" 
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="Mobile number"
                                        className={`w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 ${errors.mobile ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-tubo-orange focus:ring-1 focus:ring-tubo-orange'}`}
                                    />
                                    <InputError field="mobile" />
                                </div>
                            </div>
                            
                            <p className="text-xs text-gray-500 leading-relaxed">
                                By providing a phone number, you consent to receive automated text messages with trip or account updates.
                            </p>

                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className={`w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-tubo-orange focus:ring-1 focus:ring-tubo-orange'}`}
                                />
                                <InputError field="email" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">First name</label>
                                    <input 
                                        type="text" 
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Driver's license first name"
                                        className={`w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-tubo-orange focus:ring-1 focus:ring-tubo-orange'}`}
                                    />
                                    <InputError field="firstName" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Last name</label>
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Driver's license last name"
                                        className={`w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-tubo-orange focus:ring-1 focus:ring-tubo-orange'}`}
                                    />
                                    <InputError field="lastName" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Age</label>
                                <div className="relative">
                                    <select 
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className={`w-full appearance-none bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none transition-all ${errors.age ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-tubo-orange focus:ring-1 focus:ring-tubo-orange text-gray-400'}`}
                                    >
                                        <option>Select your age</option>
                                        <option>18-20</option>
                                        <option>21-24</option>
                                        <option>25+</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                                <InputError field="age" />
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3">
                                <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
                                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                    After booking, you'll need to submit more information to avoid cancellation and fees.
                                </p>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                You can add additional drivers to your trip for free after booking.
                            </p>
                        </div>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Protection Section */}
                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Protection</h2>
                        <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 flex justify-between items-center hover:border-gray-400 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="text-gray-900 dark:text-white h-8 w-8" strokeWidth={1.5} />
                                <div>
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Protection options</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Choose from : Plans, Enhanced roadside, Supplemental liability</p>
                                </div>
                            </div>
                            <button className="text-tubo-blue dark:text-blue-400 font-bold text-sm">Add</button>
                        </div>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Booking Rate Section */}
                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Booking rate</h2>
                        
                        <div className="space-y-3">
                            {/* Non-Refundable Option */}
                            <div 
                                className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border transition-all cursor-pointer ${rateOption === 'non-refundable' ? 'border-tubo-blue dark:border-white ring-1 ring-tubo-blue dark:ring-white' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                onClick={() => setRateOption('non-refundable')}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${rateOption === 'non-refundable' ? 'border-tubo-blue dark:border-white' : 'border-gray-400'}`}>
                                        {rateOption === 'non-refundable' && <div className="h-2.5 w-2.5 bg-tubo-blue dark:bg-white rounded-full" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="font-medium text-gray-900 dark:text-white">Non-refundable</h3>
                                            <span className="font-black text-gray-900 dark:text-white">{formatPrice(finalTotal)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Cancel for free for 24 hours. After that, the trip is non-refundable.</p>
                                        <div className="mt-2 flex items-center justify-between">
                                             <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Save {formatPrice(discount)}, limited-time offer
                                             </span>
                                             <button className="text-xs underline text-gray-500">Learn more</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Refundable Option */}
                            <div 
                                className={`bg-transparent rounded-xl p-4 border transition-all cursor-pointer ${rateOption === 'refundable' ? 'border-tubo-blue dark:border-white ring-1 ring-tubo-blue dark:ring-white' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                onClick={() => setRateOption('refundable')}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${rateOption === 'refundable' ? 'border-tubo-blue dark:border-white' : 'border-gray-400'}`}>
                                        {rateOption === 'refundable' && <div className="h-2.5 w-2.5 bg-tubo-blue dark:bg-white rounded-full" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="font-medium text-gray-900 dark:text-white">Refundable</h3>
                                            <span className="font-black text-gray-900 dark:text-white">{formatPrice(total)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Cancel for free before Dec 5. Flexible payment options available, with $0 due now.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Pay Time Section */}
                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Choose when to pay</h2>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-5 rounded-full border-2 border-tubo-blue dark:border-white flex items-center justify-center">
                                    <div className="h-2.5 w-2.5 bg-tubo-blue dark:bg-white rounded-full" />
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white text-sm">Pay now</span>
                            </div>
                            <hr className="border-gray-200 dark:border-gray-600" />
                            <div className="flex items-center gap-3 opacity-50">
                                <div className="h-5 w-5 rounded-full border-2 border-gray-400"></div>
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-white text-sm block">Pay over time</span>
                                    <span className="text-xs text-gray-500">You'll choose a payment provider before you book your trip.</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Payment Method Section */}
                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Payment method</h2>
                        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                            <div className="h-3 w-3 bg-gray-200 rounded-full"></div> {/* Lock icon placeholder */}
                            Your information will be stored securely.
                        </div>

                        <div className="flex gap-3 mb-4">
                            <button 
                                onClick={() => setPaymentMethod('card')}
                                className={`flex-1 py-3 rounded-lg border font-bold text-sm flex flex-col items-start px-4 relative ${paymentMethod === 'card' ? 'border-tubo-blue text-tubo-blue bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 text-gray-500'}`}
                            >
                                <CreditCard size={16} className="mb-1" />
                                Card
                                {paymentMethod === 'card' && <div className="absolute top-0 left-0 w-1 h-full bg-tubo-blue rounded-l-lg"></div>}
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('gpay')}
                                className={`flex-1 py-3 rounded-lg border font-bold text-sm flex flex-col items-start px-4 ${paymentMethod === 'gpay' ? 'border-tubo-blue text-tubo-blue' : 'border-gray-200 text-gray-500'}`}
                            >
                                <div className="mb-1 bg-gray-200 h-4 w-8 rounded"></div> {/* GPay logo placeholder */}
                                Google Pay
                            </button>
                        </div>

                        {paymentMethod === 'card' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Card number</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleChange}
                                            placeholder="1234 1234 1234 1234"
                                            className={`w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none transition-all ${errors.cardNumber ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-tubo-orange focus:ring-1 focus:ring-tubo-orange'}`}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                                            <div className="w-8 h-5 bg-blue-900 rounded"></div>
                                            <div className="w-8 h-5 bg-red-500 rounded"></div>
                                            <div className="w-8 h-5 bg-orange-500 rounded"></div>
                                        </div>
                                    </div>
                                    <InputError field="cardNumber" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1.5 block">Expiration date</label>
                                        <input 
                                            type="text" 
                                            name="expiry"
                                            value={formData.expiry}
                                            onChange={handleChange}
                                            placeholder="MM / YY"
                                            className={`w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none transition-all ${errors.expiry ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-tubo-orange focus:ring-1 focus:ring-tubo-orange'}`}
                                        />
                                        <InputError field="expiry" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1.5 block">Security code</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                name="cvc"
                                                value={formData.cvc}
                                                onChange={handleChange}
                                                placeholder="CVC"
                                                className={`w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none transition-all ${errors.cvc ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-tubo-orange focus:ring-1 focus:ring-tubo-orange'}`}
                                            />
                                            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        </div>
                                        <InputError field="cvc" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Country</label>
                                    <div className="relative">
                                        <select 
                                            name="cardCountry"
                                            value={formData.cardCountry}
                                            onChange={handleChange}
                                            className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none focus:border-tubo-orange transition-all"
                                        >
                                            <option>Indonesia</option>
                                            <option>United States</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="promo" className="w-5 h-5 rounded border-gray-300 text-tubo-blue focus:ring-tubo-orange" />
                            <label htmlFor="promo" className="text-xs font-medium text-gray-900 dark:text-white">Send me promotions and announcements via email</label>
                        </div>
                        <div className="flex items-start gap-3">
                            <input type="checkbox" id="terms" className="w-5 h-5 rounded border-gray-300 text-tubo-blue focus:ring-tubo-orange mt-0.5" />
                            <label htmlFor="terms" className="text-xs font-medium text-gray-900 dark:text-white leading-relaxed">
                                I agree to pay the total shown and to the <span className="text-tubo-blue font-bold">Tubo terms of service</span>, <span className="text-tubo-blue font-bold">cancellation policy</span> and I acknowledge the <span className="text-tubo-blue font-bold">privacy policy</span>
                            </label>
                        </div>
                    </div>

                    <button 
                        onClick={handleBookClick}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Book trip'}
                    </button>
                </div>

                {/* Right Column - Sticky Summary */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-black text-xl text-gray-900 dark:text-white">{car.make} {car.model} {car.year}</h3>
                                <div className="flex items-center gap-1 text-sm font-bold mt-1">
                                    <span>{car.rating}</span>
                                    <span className="text-tubo-orange">★</span>
                                    <span className="text-gray-500 font-normal">({car.trips} trips)</span>
                                </div>
                            </div>
                            <img src={car.imageUrl} alt="Car" className="w-24 h-16 object-cover rounded-lg" />
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <CalendarIcon size={16} className="text-gray-500 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(startDate)} at {startTime}</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(endDate)} at {endTime}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-gray-500 mt-0.5" />
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{car.location}</p>
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-700 mb-4" />

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex justify-between">
                                <span className="underline decoration-gray-300 decoration-dashed underline-offset-4">Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="underline decoration-gray-300 decoration-dashed underline-offset-4">Taxes & permit fees</span>
                                <span>{formatPrice(taxes)}</span>
                            </div>
                            {protectionFee > 0 && (
                                <div className="flex justify-between">
                                    <span className="underline decoration-gray-300 decoration-dashed underline-offset-4">Protection fee</span>
                                    <span>{formatPrice(protectionFee)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-green-600 font-bold">
                                <span className="underline decoration-green-200 decoration-dashed underline-offset-4">Total miles</span>
                                <span>FREE</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600 font-bold">
                                    <span>Discount</span>
                                    <span>-{formatPrice(discount)}</span>
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-100 dark:border-gray-700 my-4" />

                        <div className="flex justify-between items-center mb-4">
                            <span className="font-black text-gray-900 dark:text-white">Trip total</span>
                            <span className="font-black text-xl text-gray-900 dark:text-white">{formatPrice(finalTotal)}</span>
                        </div>

                        <button className="text-sm font-bold underline decoration-2 decoration-gray-300 hover:text-tubo-blue transition-colors">
                            Promo code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};