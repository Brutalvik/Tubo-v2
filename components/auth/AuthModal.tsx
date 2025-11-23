
import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { UserProfile } from '../../types';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let user;
            if (mode === 'login') {
                user = await authService.login(email, password);
            } else {
                if (!firstName || !lastName) {
                    throw new Error("Name is required");
                }
                user = await authService.register(firstName, lastName, email, password);
            }
            onLoginSuccess(user);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        setError('');
        setLoading(true);
        try {
            const user = await authService.socialLogin(provider);
            onLoginSuccess(user);
            onClose();
        } catch (err) {
            setError('Social login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
            
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10">
                    <X size={20} className="text-gray-500" />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="h-12 w-12 bg-gradient-to-br from-tubo-blue to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 mx-auto mb-4">
                            <span className="text-white font-black text-2xl">T</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                            {mode === 'login' ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            {mode === 'login' ? 'Enter your details to continue' : 'Start your journey with Tubo today'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left-2 fade-in">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="First name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-tubo-blue rounded-xl py-3 pl-11 pr-4 outline-none font-bold text-sm transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Last name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-tubo-blue rounded-xl py-3 pl-11 pr-4 outline-none font-bold text-sm transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-tubo-blue rounded-xl py-3 pl-11 pr-4 outline-none font-bold text-sm transition-all"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-tubo-blue rounded-xl py-3 pl-11 pr-4 outline-none font-bold text-sm transition-all"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-tubo-blue text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    {mode === 'login' ? 'Log in' : 'Sign up'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-700"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-900 px-2 text-gray-400 font-bold tracking-wider">Or continue with</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Google
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('apple')}
                            className="flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                        >
                            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.64 3.4 1.63-3.12 1.88-2.61 5.79.48 7.14-.6 1.82-1.46 3.39-2.53 4.24zm-2.45-15.6c.66-1.07 1.6-1.52 2.53-1.42.16 1.25-.33 2.7-1.15 3.59-.82.87-2.06 1.29-2.73 1.14-.23-1.15.22-2.28 1.35-3.31z"/></svg>
                            Apple
                        </button>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-xs text-gray-500 font-medium">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button 
                                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                                className="text-tubo-blue font-bold hover:underline"
                            >
                                {mode === 'login' ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
