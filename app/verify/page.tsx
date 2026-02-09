"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { joinFamily } from "../lib/firestore";

export default function VerifyPage() {
    const router = useRouter();
    const { finishSignIn, user } = useAuth();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        const verify = async () => {
            const params = new URLSearchParams(window.location.search);
            const emailFromUrl = params.get('email');
            const familyId = params.get('familyId');
            const role = params.get('role');

            let email = window.localStorage.getItem('emailForSignIn');

            if (!email && emailFromUrl) {
                email = emailFromUrl;
            }

            if (!email) {
                // If no email in local storage or URL, ask user or error
                setStatus('error');
                return;
            }

            try {
                await finishSignIn(email, window.location.href);

                // Check if this is a family invite join
                if (familyId && role && user) {
                    await joinFamily(email, familyId, role as 'Parent' | 'Child' | 'Grandparent', user.uid);
                }

                setStatus('success');

                // clear temp name if exists
                const tempName = window.localStorage.getItem('tempJoinName');
                if (tempName) {
                    // TODO: update user profile with name
                    window.localStorage.removeItem('tempJoinName');
                }

                // Redirect after short delay
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } catch (error) {
                console.error("Verification failed", error);
                setStatus('error');
            }
        };

        verify();
    }, [finishSignIn, router, user]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#F9F6F0]">
            <div className="bg-white p-8 rounded-[24px] shadow-sm max-w-md w-full text-center">
                {status === 'verifying' && (
                    <>
                        <h2 className="text-xl font-bold mb-4">Verifying your login...</h2>
                        <div className="animate-spin h-8 w-8 border-4 border-[#260E01] border-t-transparent rounded-full mx-auto"></div>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <h2 className="text-xl font-bold mb-4 text-green-600">Success!</h2>
                        <p>You are now logged in. Redirecting...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <h2 className="text-xl font-bold mb-4 text-red-600">Verification Failed</h2>
                        <p className="mb-6">The link might be invalid or expired. Please try logging in again.</p>
                        <Button fullWidth onClick={() => router.push('/user-auth')}>
                            Back to Login
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
