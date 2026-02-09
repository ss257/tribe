"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthTabs } from '../components/ui/AuthTabs';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function UserAuthPage() {
    const router = useRouter();
    const { signInWithLink } = useAuth();
    const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async () => {
        setError('');
        if (!email) {
            setError('Please enter your email');
            return;
        }

        try {
            await signInWithLink(email);
            setEmailSent(true);
            if (activeTab === 'signup' && name) {
                // Store name locally to retrieve after verification if needed, 
                // or we can handle profile creation in the verify step/onboarding
                window.localStorage.setItem('tempJoinName', name);
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            setError('Failed to send login link. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 bg-[#F9F6F0]">
            <div className="w-full max-w-[400px] flex flex-col items-center pt-16 md:pt-24">

                {/* Logo */}
                <div className="mb-8">
                    <Image
                        src="/logo.png"
                        alt="Tribe Logo"
                        width={60}
                        height={60}
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Auth Container */}
                <div className="w-full bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-[#260E01]/5">

                    <h1 className="text-2xl font-bold text-[#260E01] mb-2 text-center">
                        {activeTab === 'signup' ? 'Create your account' : 'Welcome back'}
                    </h1>
                    <p className="text-[#260E01]/50 text-center mb-8 text-sm">
                        {activeTab === 'signup'
                            ? 'Join Tribe and start organizing your family life.'
                            : 'Enter your details to access your account.'}
                    </p>

                    <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    {emailSent ? (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-bold text-[#260E01] mb-2">Check your inbox</h3>
                            <p className="text-[#260E01]/70 mb-6">
                                We sent a magic link to <strong>{email}</strong>.<br />
                                Click the link to {activeTab === 'signup' ? 'create your account' : 'log in'}.
                            </p>
                            <Button className="bg-transparent border border-[#260E01]/20 text-[#260E01] hover:bg-[#260E01]/5" onClick={() => setEmailSent(false)}>
                                Try different email
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {activeTab === 'signup' && (
                                <Input
                                    label="FULL NAME"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}

                            <Input
                                label="EMAIL ADDRESS"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            {/* Optional: Password field if needed, or stick to magic link/email only as per previous context */}
                            {/* For now, assuming email link or simple password for structure */}

                            <div className="mt-2">
                                <Button fullWidth onClick={handleAuth}>
                                    {activeTab === 'signup' ? 'Create Account' : 'Log In'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'login' && (
                        <div className="mt-4 text-center">
                            <button className="text-sm text-[#260E01]/50 hover:text-[#772D08] transition-colors font-medium">
                                Forgot password?
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-center text-xs text-[#260E01]/30">
                    <p>By continuing, you agree to Tribe's</p>
                    <div className="flex justify-center gap-1 mt-1">
                        <span className="hover:text-[#260E01]/50 cursor-pointer">Terms of Service</span>
                        <span>&bull;</span>
                        <span className="hover:text-[#260E01]/50 cursor-pointer">Privacy Policy</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
