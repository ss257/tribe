"use client";

import React from 'react';

interface AuthTabsProps {
    activeTab: 'signup' | 'login';
    onTabChange: (tab: 'signup' | 'login') => void;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex w-full bg-white p-1 rounded-[12px] mb-8">
            <button
                onClick={() => onTabChange('signup')}
                className={`
          flex-1 py-2 text-[15px] font-semibold rounded-[12px] transition-all
          ${activeTab === 'signup'
                        ? 'bg-[#F9F6F0] text-primary shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }
        `}
            >
                Sign up
            </button>
            <button
                onClick={() => onTabChange('login')}
                className={`
          flex-1 py-2 text-[15px] font-semibold rounded-[12px] transition-all
          ${activeTab === 'login'
                        ? 'bg-[#F9F6F0] text-primary shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }
        `}
            >
                Log in
            </button>
        </div>
    );
};
