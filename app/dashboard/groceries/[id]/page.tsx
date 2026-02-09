"use client";

import React, { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getNutritionInfo } from '../../../actions/gemini';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
    getGroceryItems,
    addGroceryItem,
    toggleGroceryItem,
    GroceryItem
} from '../../../lib/firestore';

export default function GroceryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { userProfile } = useAuth();
    const [newItem, setNewItem] = useState('');
    const [title, setTitle] = useState('Grocery List');
    const [items, setItems] = useState<GroceryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch List Details and Items
    useEffect(() => {
        const fetchData = async () => {
            if (!userProfile?.familyId || !id) return;

            try {
                // 1. Fetch List Metadata
                const listRef = doc(db, "families", userProfile.familyId, "groceryLists", id);
                const listSnap = await getDoc(listRef);
                if (listSnap.exists()) {
                    setTitle(listSnap.data().title || 'Grocery List');
                } else {
                    console.error("List not found");
                    // router.push('/dashboard'); // Optional: redirect if not found
                    return;
                }

                // 2. Fetch Items
                const fetchedItems = await getGroceryItems(userProfile.familyId, id);
                // Sort: Unchecked first
                const sortedItems = fetchedItems.sort((a, b) => Number(a.checked) - Number(b.checked));
                setItems(sortedItems);

            } catch (error) {
                console.error("Error fetching grocery details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, userProfile?.familyId]);

    const handleAddItem = async () => {
        if (!newItem.trim() || !userProfile?.familyId) return;

        const tempId = Date.now().toString();
        const itemName = newItem;
        setNewItem('');

        // Optimistic Item
        const optimisticItem: GroceryItem & { isAnalyzing?: boolean } = {
            id: tempId,
            listId: id,
            name: itemName,
            checked: false,
            calories: undefined,
            protein: undefined,
            isAnalyzing: true
        };

        setItems(prev => [optimisticItem, ...prev]);

        try {
            // 1. Get Nutrition
            const nutrition = await getNutritionInfo(itemName);

            // 2. Add to Firestore
            const addedItemRef = await addGroceryItem(userProfile.familyId, id, {
                name: itemName,
                checked: false,
                calories: nutrition.calories ? Number(nutrition.calories.replace(/[^0-9.]/g, '')) : undefined,
                protein: nutrition.protein ? Number(nutrition.protein.replace(/[^0-9.]/g, '')) : undefined,
                quantity: ''
            });

            // 3. Update State with Real ID and Data
            setItems(prev => prev.map(item =>
                item.id === tempId ? {
                    ...item,
                    id: addedItemRef.id,
                    calories: nutrition.calories ? Number(nutrition.calories.replace(/[^0-9.]/g, '')) : undefined,
                    protein: nutrition.protein ? Number(nutrition.protein.replace(/[^0-9.]/g, '')) : undefined,
                    isAnalyzing: false
                } : item
            ));

        } catch (error) {
            console.error("Error adding item:", error);
            // Revert or show error
            setItems(prev => prev.filter(i => i.id !== tempId));
        }
    };

    const toggleItem = async (itemId: string, currentStatus: boolean) => {
        if (!userProfile?.familyId) return;

        // Optimistic Toggle
        setItems(prev => {
            const newItems = prev.map(item =>
                item.id === itemId ? { ...item, checked: !currentStatus } : item
            );
            return newItems.sort((a, b) => Number(a.checked) - Number(b.checked));
        });

        try {
            await toggleGroceryItem(userProfile.familyId, id, itemId, currentStatus);
        } catch (error) {
            console.error("Error toggling item:", error);
            // Revert logic could be complex due to sorting, but usually safe to ignore or refetch
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#3E2312] border-t-transparent rounded-full"></div>
        </div>;
    }

    return (
        <main className="min-h-screen bg-[#F9F6F0] p-6 lg:p-10 font-sans text-primary">
            {/* Top Section */}
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-neutral-50 transition-colors mb-6"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#260E01] mb-1">{title}</h1>
                    <p className="text-sm text-[#260E01]/50 font-medium">Manage your grocery items</p>
                </div>

                {/* Add Item Section */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-[#260E01]/50 mb-2 pl-1">Add groceries</label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            placeholder="1L Milk"
                            className="flex-1 h-12 bg-white rounded-xl border border-transparent px-4 text-[#260E01] placeholder-[#260E01]/30 focus:outline-none focus:ring-2 focus:ring-[#260E01]/5 transition-all shadow-sm"
                        />
                        <button
                            onClick={handleAddItem}
                            className="h-12 px-6 bg-[#260E01] text-white font-bold rounded-xl hover:bg-[#3E2312] transition-colors shadow-sm whitespace-nowrap"
                        >
                            Add grocery
                        </button>
                    </div>
                </div>

                {/* Grocery Items List */}
                <div className="bg-white rounded-xl border border-[#260E01]/10 overflow-hidden">
                    <AnimatePresence initial={false}>
                        {items.length > 0 ? (
                            items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`group flex items-center justify-between p-3 hover:bg-neutral-50 transition-colors ${index !== items.length - 1 ? 'border-b border-[#260E01]/10' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleItem(item.id, item.checked)}
                                            className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all shrink-0 ${item.checked
                                                ? 'bg-[#15803d] border-[#15803d]'
                                                : 'border-[#260E01]/30 hover:border-[#260E01]/50'
                                                }`}
                                        >
                                            {item.checked && (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            )}
                                        </button>
                                        <span className={`text-sm font-medium ${item.checked ? 'text-[#260E01]/40 line-through' : 'text-[#260E01]'}`}>
                                            {item.name}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Analyzing State */}
                                        {(item as any).isAnalyzing ? (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-[#F9F6F0] rounded-lg border border-[#260E01]/5">
                                                <div className="w-2 h-2 rounded-full bg-[#260E01] animate-pulse" />
                                                <span className="text-[10px] font-bold text-[#260E01]/60">Analyzing...</span>
                                            </div>
                                        ) : (
                                            <>
                                                {item.calories !== undefined && (
                                                    <div className="px-2.5 py-1 bg-[#F9F6F0] rounded-lg border border-[#260E01]/5 flex items-center gap-1">
                                                        <span className="text-[10px] font-bold text-[#260E01]/60">Calories:</span>
                                                        <span className="text-[10px] font-bold text-[#260E01]">{item.calories}</span>
                                                    </div>
                                                )}
                                                {item.protein !== undefined && (
                                                    <div className="px-2.5 py-1 bg-[#F9F6F0] rounded-lg border border-[#260E01]/5 flex items-center gap-1">
                                                        <span className="text-[10px] font-bold text-[#260E01]/60">Protein:</span>
                                                        <span className="text-[10px] font-bold text-[#260E01]">{item.protein}g</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-secondary text-sm italic">
                                No items in this list. Add some groceries!
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
