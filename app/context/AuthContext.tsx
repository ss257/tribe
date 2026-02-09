"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    getAuth,
    onAuthStateChanged,
    User,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signOut as firebaseSignOut
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile, UserProfile } from "../lib/firestore";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithLink: (email: string) => Promise<void>;
    finishSignIn: (email: string, link: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                // Fetch profile
                try {
                    const profile = await getUserProfile(user.uid);
                    setUserProfile(profile);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // ... [signInWithLink and finishSignIn remain same, but maybe reload profile on finishSignIn?]

    const signInWithLink = async (email: string) => {
        const actionCodeSettings = {
            url: `${window.location.origin}/verify`,
            handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
    };

    const finishSignIn = async (email: string, link: string) => {
        if (isSignInWithEmailLink(auth, link)) {
            // If already signed in with the same email, we're good
            if (auth.currentUser?.email === email) {
                window.localStorage.removeItem('emailForSignIn');
                return;
            }

            // If signed in with a different email, sign out first to prevent linking
            if (auth.currentUser) {
                await firebaseSignOut(auth);
            }

            await signInWithEmailLink(auth, email, link);
            window.localStorage.removeItem('emailForSignIn');

            // Force reload profile? The auth state change listener should handle it.
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUserProfile(null);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, signInWithLink, finishSignIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
