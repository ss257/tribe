"use client";

import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { createFamily, createInvite, createUserProfile, addFamilyMember } from '../lib/firestore';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface Member {
    id: string;
    name: string;
    email: string;
    role: 'Parent' | 'Child' | 'Grandparent';
}

export default function OnboardingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [familyName, setFamilyName] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Parent' });
    const [loading, setLoading] = useState(false);

    const handleAddMember = () => {
        if (newMember.name && newMember.email) {
            setMembers([...members, {
                id: Date.now().toString(),
                name: newMember.name,
                email: newMember.email,
                role: newMember.role as 'Parent' | 'Child' | 'Grandparent'
            }]);
            setNewMember({ ...newMember, name: '', email: '' });
        }
    };

    const handleNext = async () => {
        if (!user || !familyName) return;
        setLoading(true);

        try {
            // 1. Create User Profile
            const userRole = 'Parent';
            await createUserProfile(user, { displayName: user.displayName || 'Family Creator', role: userRole });

            // 2. Create Family
            const familyId = await createFamily(user.uid, familyName);

            // 3. Create Invites & Send Magic Links
            for (const member of members) {
                // Add to Firestore subcollection
                await addFamilyMember(familyId, member.email, member.role, user.uid, member.name);

                // Construct Action Code Settings
                const actionCodeSettings = {
                    url: `${window.location.origin}/verify?familyId=${familyId}&role=${member.role}&email=${encodeURIComponent(member.email)}`,
                    handleCodeInApp: true,
                };

                // Send Email
                await sendSignInLinkToEmail(auth, member.email, actionCodeSettings);
                // Note: In a real app we'd probably save the email to local storage here 
                // if we expect them to verify on the same device, but for invites it's different.
            }

            // 4. Redirect
            router.push('/dashboard');
        } catch (error) {
            console.error("Onboarding failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 bg-[#F9F6F0] py-16">
            <div className="w-full max-w-[500px] flex flex-col gap-8">

                {/* Header - Left Aligned */}
                <div className="flex flex-col items-start w-full">
                    <div className="mb-6">
                        <Image src="/logo.png" alt="Tribe Logo" width={48} height={48} priority />
                    </div>

                    <h1 className="text-3xl font-medium text-primary mb-4 tracking-tight">
                        Tell us about your family . . .
                    </h1>
                </div>

                {/* Family Name */}
                <div className="w-full">
                    <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 ml-1">Family name</h2>
                    <input
                        value={familyName}
                        placeholder="The Johnsons"
                        onChange={(e) => setFamilyName(e.target.value)}
                        className="w-full h-[50px] text-[15px] font-semibold bg-white px-4 py-3 rounded-[12px] border border-[#260E01]/10 outline-none text-primary placeholder:text-secondary/30 placeholder:text-[15px] placeholder:font-semibold"
                    />
                </div>

                {/* Add Family Members */}
                <div>
                    <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 ml-1">Add family members</h2>
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                placeholder="John Doe"
                                value={newMember.name}
                                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                className="bg-white rounded-[12px] h-[50px] px-4 py-3 text-[15px] font-semibold border border-[#260E01]/10 outline-none placeholder:text-secondary/40 placeholder:text-[15px] placeholder:font-semibold text-primary"
                            />
                            <input
                                placeholder="johndoe@gmail.com"
                                value={newMember.email}
                                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                className="bg-white rounded-[12px] h-[50px] px-4 py-3 text-[15px] font-semibold border border-[#260E01]/10 outline-none placeholder:text-secondary/40 placeholder:text-[15px] placeholder:font-semibold text-primary"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <select
                                    value={newMember.role}
                                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                    className="w-full h-[50px] bg-white rounded-[12px] px-4 py-3 text-[15px] font-semibold border border-[#260E01]/10 appearance-none outline-none text-secondary"
                                >
                                    <option value="Parent">Parent</option>
                                    <option value="Child">Child</option>
                                    <option value="Grandparent">Grandparent</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-primary">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </div>
                            </div>
                            <button
                                onClick={handleAddMember}
                                className="bg-[#260E01] text-white px-6 py-3 rounded-[12px] h-[50px] flex items-center justify-center text-[15px] font-semibold whitespace-nowrap hover:bg-opacity-90 transition-all"
                            >
                                Invite
                            </button>
                        </div>
                    </div>
                </div>

                {/* Members List */}
                <div>
                    <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 ml-1">My members</h2>
                    {members.length === 0 ? (
                        <div className="bg-white p-6 rounded-xl border border-dashed border-[#260E01]/10 flex justify-center text-sm text-secondary">
                            No members added yet
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {members.map((member) => (
                                <div key={member.id} className="bg-white p-3 rounded-xl flex items-center gap-3 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                                        <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-secondary">
                                            {member.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">{member.name}</p>
                                        <p className="text-xs text-secondary">{member.email} • {member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <Button fullWidth onClick={handleNext} disabled={loading}>
                        {loading ? 'Setting up...' : 'Complete Setup'}
                    </Button>
                </div>

            </div>
        </div>
    );
}
