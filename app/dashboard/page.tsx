"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from '../components/NotificationPanel';
import {
    getFamilyData,
    getFamilyMembers,
    getFamilyChores,
    getFamilyEvents,
    getFamilyGroceryLists,
    getFamilyMemoirs,
    updateChoreStatus,
    createGroceryList,
    addGroceryItem,
    createMemoir,
    addChore,
    addEvent,
    UserProfile,
    Family,
    Chore,
    AppEvent,
    GroceryList,
    AppMemoir
} from '../lib/firestore';
import { generateGroceryList } from '@/app/actions/gemini';

const Avatar = ({ label, color = "bg-purple-200", name }: { label: string, color?: string, name?: string }) => (
    <div className="relative group cursor-pointer">
        <div className={`w-12 h-12 rounded-full ${color} border-2 border-white flex items-center justify-center text-sm font-bold text-primary shadow-sm hover:scale-105 transition-transform`}>
            {label}
        </div>
        {name && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#3E2312] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 font-medium">
                {name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#3E2312]"></div>
            </div>
        )}
    </div>
);

const FamilyMemoir = ({ memoirs, onAddMemoir, onMemoirClick }: { memoirs: AppMemoir[]; onAddMemoir: () => void; onMemoirClick: (memoir: AppMemoir) => void }) => (
    <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-primary">All family memoir</h2>
                <p className="text-sm text-secondary mt-1">Preserve the stories that define your legacy.</p>
            </div>
            <button
                onClick={onAddMemoir}
                className="bg-[#3E2312] text-white px-5 py-2.5 rounded-[12px] text-sm font-bold shadow-sm hover:bg-[#2A180C] transition-colors"
            >
                Add memoir
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memoirs.length > 0 ? memoirs.map((item, i) => (
                <div
                    key={item.id}
                    onClick={() => onMemoirClick(item)}
                    className="bg-white rounded-[18px] border border-[#260E01]/10 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                    style={{ padding: '6px 6px 12px 6px' }}
                >
                    <div className="aspect-video bg-[#F9F6F0] rounded-[12px] overflow-hidden mb-3 relative">
                        <img
                            src="/memoir-placeholder.png"
                            alt={item.title}
                            className="w-full h-full object-cover mix-blend-multiply"
                        />
                    </div>
                    <div className="px-2">
                        <h3 className="text-sm font-bold text-primary">{item.title}</h3>
                        <p className="text-[10px] text-secondary mt-1 font-medium opacity-60">
                            {item.createdAt?.seconds ? `Created on ${new Date(item.createdAt.seconds * 1000).toLocaleDateString()}` : 'Date N/A'}
                        </p>
                    </div>
                </div>
            )) : (
                <div className="col-span-full p-12 text-center text-secondary bg-neutral-50 rounded-2xl border border-dashed border-[#E5E0D5]">
                    <p className="italic mb-4">No memoirs created yet.</p>
                    <button onClick={onAddMemoir} className="text-[#5C3419] font-bold text-sm hover:underline">Start your family legacy</button>
                </div>
            )}
        </div>
    </div>
);

const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-xl font-bold text-primary mb-4">{title}</h2>
);

const QuickActionItem = ({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) => (
    <button className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#F2EEE6] hover:shadow-sm transition-all text-left group">
        <div className="w-10 h-10 bg-[#F9F6F0] rounded-lg flex items-center justify-center text-primary group-hover:bg-[#EFEDE6] transition-colors">
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-bold text-primary">{title}</h3>
            <p className="text-[10px] text-secondary">{subtitle}</p>
        </div>
    </button>
);

interface Task {
    id: string;
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    completed: boolean;
}

const initialTasks: Task[] = [
    { id: '1', title: "Make breakfast & tiffins", priority: 'Medium', completed: false },
    { id: '2', title: "School drop-off", priority: 'High', completed: false },
    { id: '3', title: "Order birthday gift for Penny", priority: 'Low', completed: false },
    { id: '4', title: "Homework check - Max", priority: 'High', completed: false },
    { id: '5', title: "15-min tidy-up", priority: 'Low', completed: false },
    { id: '6', title: "Pay society maintenance", priority: 'High', completed: false },
];

const PriorityBadge = ({ priority }: { priority: Task['priority'] }) => {
    switch (priority) {
        case 'High':
            return <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full">High</span>;
        case 'Medium':
            return <span className="bg-[#7C3AED] text-white text-[10px] font-bold px-2 py-1 rounded-full">Medium</span>;
        case 'Low':
            return <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full">Low</span>;
        default:
            return null;
    }
};

const TaskRow = ({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`flex items-center justify-between p-4 bg-white border-b border-[#F2EEE6] last:border-b-0 hover:bg-neutral-50 transition-colors cursor-pointer group ${task.completed ? 'opacity-50' : ''}`}
        onClick={() => onToggle(task.id)}
    >
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-primary border-primary' : 'border-secondary/30 group-hover:border-primary'}`}>
                {task.completed && (
                    <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                )}
            </div>
            <span className={`text-sm font-medium text-primary transition-all ${task.completed ? 'line-through text-secondary' : ''}`}>
                {task.title}
            </span>
        </div>
        <PriorityBadge priority={task.priority} />
    </motion.div>
);

interface ChoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isEditing: boolean;
    members: UserProfile[];
}

const ChoreModal = ({ isOpen, onClose, onSubmit, initialData, isEditing, members }: ChoreModalProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [points, setPoints] = useState("10");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(initialData?.title || "");
            setDescription(initialData?.description || "");
            setAssignedTo(initialData?.assignedTo || "");
            setPoints(initialData?.points?.toString() || "10");
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        if (!title.trim() || !assignedTo) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                title,
                description,
                assignedTo,
                points: parseInt(points) || 0
            });
            onClose();
        } catch (error) {
            console.error("Error submitting chore:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center backdrop-blur-[1px]"
            onClick={onClose}
        >
            <div
                className="bg-[#F9F6F0] rounded-[24px] p-8 w-full max-w-[480px] shadow-xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-[28px] font-medium text-[#3E2312] mb-6 tracking-tight">
                    {isEditing ? 'Update task' : 'Create new task'}
                </h2>

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[15px] font-medium text-[#8D7F73]">Task name</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Wash all bedsheets"
                            className="bg-white border border-[#EBE6DE] rounded-[12px] h-[50px] px-4 text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[15px] font-medium text-[#8D7F73]">Assign to (optional)</label>
                        <div className="relative">
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="bg-white border border-[#EBE6DE] rounded-[12px] h-[50px] px-4 w-full text-[#3E2312] focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base appearance-none cursor-pointer"
                            >
                                <option value="">No assignment</option>
                                {members.map(member => (
                                    <option key={member.uid} value={member.uid}>
                                        {member.displayName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#3E2312]/50">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[15px] font-medium text-[#8D7F73]">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-white border border-[#EBE6DE] rounded-[12px] h-[120px] p-4 text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base resize-none"
                        />
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-medium text-[#8D7F73]">End date</label>
                            <input
                                type="datetime-local"
                                // defaultValue={initialData ? "2026-02-02T14:00" : ""}
                                className="bg-white border border-[#EBE6DE] rounded-[12px] h-[50px] px-4 text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-medium text-[#8D7F73]">Points</label>
                            <input
                                type="number"
                                value={points}
                                onChange={(e) => setPoints(e.target.value)}
                                placeholder="0"
                                className="bg-white border border-[#EBE6DE] rounded-[12px] h-[50px] px-4 text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title}
                        className="bg-[#5C3419] text-white h-[56px] rounded-[16px] text-[17px] font-bold mt-4 hover:bg-[#4A2A14] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                            </>
                        ) : (
                            isEditing ? 'Update task' : 'Create task'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ChoreTracker = ({ chores, members, onAddChore, onEditChore }: { chores: Chore[]; members: UserProfile[]; onAddChore: () => void; onEditChore: (chore: Chore) => void }) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-primary">All chores</h2>
                    <p className="text-sm text-secondary mt-1">Keep your home running like clockwork.</p>
                </div>
                <button
                    onClick={onAddChore}
                    className="bg-[#3E2312] text-white px-5 py-2.5 rounded-[12px] text-sm font-bold shadow-sm hover:bg-[#2A180C] transition-colors"
                >
                    Add chore
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[24px] border border-[#F2EEE6] p-1 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[#F2EEE6]">
                            <th className="text-left text-xs font-medium text-secondary p-4 pl-6 w-[40%]">Task title</th>
                            <th className="text-left text-xs font-medium text-secondary p-4">Status</th>
                            <th className="text-left text-xs font-medium text-secondary p-4">Created</th>
                            <th className="text-left text-xs font-medium text-secondary p-4">Points</th>
                            <th className="p-4 w-20"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {chores.length > 0 ? chores.map((chore, i) => (
                            <tr
                                key={chore.id}
                                onClick={() => onEditChore(chore)}
                                className="border-b border-[#F2EEE6] last:border-b-0 hover:bg-neutral-50 transition-colors group cursor-pointer"
                            >
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-4">
                                        <div className="mt-1 w-5 h-5 rounded-[6px] border-2 border-[#E5E0D5] group-hover:border-[#D1CCC0] transition-colors cursor-pointer flex items-center justify-center shrink-0"></div>
                                        <div className="min-w-0 flex-1 pr-4">
                                            <div className="text-sm font-bold text-primary truncate">{chore.title}</div>
                                            <div className="text-[11px] text-secondary mt-0.5">
                                                Assigned to: {members.find(m => m.uid === chore.assignedTo)?.displayName || 'Unassigned'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E5E0D5] bg-white">
                                        <div className={`w-1.5 h-1.5 rounded-full ${chore.status === 'completed' ? 'bg-blue-500' : 'bg-[#16A34A]'}`}></div>
                                        <span className="text-[10px] font-bold text-primary capitalize">{chore.status}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs font-bold text-primary">
                                        {chore.createdAt?.seconds ? new Date(chore.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs font-bold text-[#7C3AED]">{chore.points} pts</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-secondary hover:text-red-500 transition-colors">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-secondary text-sm italic">
                                    No chores yet. Add one to get started!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {chores.length > 0 ? chores.map((chore, i) => (
                    <div
                        key={chore.id}
                        onClick={() => onEditChore(chore)}
                        className="bg-white p-4 rounded-[18px] border border-[#260E01]/10 flex flex-col gap-3"
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="text-sm font-bold text-primary leading-snug">{chore.title}</div>
                            <div className="shrink-0 flex gap-2">
                                <button className="p-1.5 rounded-lg bg-neutral-50 text-secondary">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </button>
                                <button className="p-1.5 rounded-lg bg-red-50 text-red-500">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-secondary font-medium">
                            <span className="bg-[#F9F6F0] px-2 py-1 rounded-md">
                                Assigned: {members.find(m => m.uid === chore.assignedTo)?.displayName || 'Unassigned'}
                            </span>
                            <span className="bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-1 rounded-md">{chore.points} pts</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#F2EEE6] mt-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E5E0D5] bg-white">
                                <div className={`w-1.5 h-1.5 rounded-full ${chore.status === 'completed' ? 'bg-blue-500' : 'bg-[#16A34A]'}`}></div>
                                <span className="text-[10px] font-bold text-primary capitalize">{chore.status}</span>
                            </div>
                            <span className="text-xs font-bold text-primary">
                                {chore.createdAt?.seconds ? new Date(chore.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center text-secondary text-sm italic">
                        No chores yet. Add one to get started!
                    </div>
                )}
            </div>
        </div>
    );
};

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isEditing: boolean;
    members: UserProfile[];
}

const EventModal = ({ isOpen, onClose, onSubmit, initialData, isEditing, members }: EventModalProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(initialData?.title || "");
            setDescription(initialData?.description || "");
            setAssignedTo(initialData?.assignedTo || "");
            if (initialData?.date?.seconds) {
                const d = new Date(initialData.date.seconds * 1000);
                setDate(d.toISOString().split('T')[0]);
                setTime(d.toTimeString().slice(0, 5));
            } else {
                setDate("");
                setTime("");
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        if (!title.trim() || !date) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                title,
                description,
                date: new Date(`${date}T${time || '00:00'}`),
                assignedTo
            });
            onClose();
        } catch (error) {
            console.error("Error submitting event:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center backdrop-blur-[1px]"
            onClick={onClose}
        >
            <div
                className="bg-[#F9F6F0] rounded-[24px] p-8 w-full max-w-[480px] shadow-xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-[28px] font-medium text-[#3E2312] mb-6 tracking-tight">
                    {isEditing ? 'Update event' : 'Create new event'}
                </h2>

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[15px] font-medium text-[#8D7F73]">Event title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Family Game Night"
                            className="bg-white border border-[#EBE6DE] rounded-[12px] h-[50px] px-4 text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[15px] font-medium text-[#8D7F73]">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-white border border-[#EBE6DE] rounded-[12px] h-[100px] p-4 text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-medium text-[#8D7F73]">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-white border border-[#EBE6DE] rounded-[12px] h-[50px] px-4 text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-medium text-[#8D7F73]">Time</label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="bg-white border border-[#EBE6DE] rounded-[12px] h-[50px] px-4 text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[15px] font-medium text-[#8D7F73]">Assign member</label>
                        <div className="relative">
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="bg-white border border-[#EBE6DE] rounded-[12px] h-[50px] px-4 w-full text-[#3E2312] focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Select member</option>
                                {members.map(member => (
                                    <option key={member.uid} value={member.uid}>
                                        {member.displayName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#3E2312]/50">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title || !date}
                        className="bg-[#5C3419] text-white h-[56px] rounded-[16px] text-[17px] font-bold mt-4 hover:bg-[#4A2A14] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                            </>
                        ) : (
                            isEditing ? 'Update event' : 'Create event'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const EventsTracker = ({ events, members, onAddEvent, onEditEvent }: { events: AppEvent[]; members: UserProfile[]; onAddEvent: () => void; onEditEvent: (event: AppEvent) => void }) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-primary">All events</h2>
                    <p className="text-sm text-secondary mt-1">Never miss a moment that matters.</p>
                </div>
                <button
                    onClick={onAddEvent}
                    className="bg-[#3E2312] text-white px-5 py-2.5 rounded-[12px] text-sm font-bold shadow-sm hover:bg-[#2A180C] transition-colors"
                >
                    Add events
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[24px] border border-[#F2EEE6] p-1 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[#F2EEE6]">
                            <th className="p-4 w-14">
                                <div className="w-5 h-5 rounded-[6px] border border-[#E5E0D5]"></div>
                            </th>
                            <th className="text-left text-xs font-medium text-secondary p-4 w-[40%]">Event title</th>
                            <th className="text-left text-xs font-medium text-secondary p-4">Status</th>
                            <th className="text-left text-xs font-medium text-secondary p-4">Date</th>
                            <th className="text-left text-xs font-medium text-secondary p-4">Created By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length > 0 ? events.map((event, i) => (
                            <tr
                                key={event.id}
                                onClick={() => onEditEvent(event)}
                                className="border-b border-[#F2EEE6] last:border-b-0 hover:bg-neutral-50 transition-colors group cursor-pointer"
                            >
                                <td className="p-4">
                                    <div className="w-5 h-5 rounded-[6px] border border-[#E5E0D5] cursor-pointer hover:border-[#D1CCC0]"></div>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <div className="text-sm font-bold text-primary">{event.title}</div>
                                        <div className="text-[11px] text-secondary mt-0.5">{event.description || 'No description'}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E5E0D5] bg-white">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></div>
                                        <span className="text-[10px] font-bold text-primary">Active</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs font-bold text-primary">
                                        {event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary bg-blue-100`}>
                                            {members.find(m => m.uid === event.createdBy)?.displayName?.[0] || '?'}
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-red-50 rounded-lg text-secondary hover:text-red-500 transition-colors">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                            <button className="p-2 hover:bg-neutral-100 rounded-lg text-secondary hover:text-primary transition-colors">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-secondary text-sm italic">
                                    No events found. Add one now!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {events.length > 0 ? events.map((event, i) => (
                    <div
                        key={event.id}
                        onClick={() => onEditEvent(event)}
                        className="bg-white p-4 rounded-[18px] border border-[#260E01]/10 flex flex-col gap-3"
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <div className="text-sm font-bold text-primary leading-snug">{event.title}</div>
                                <div className="text-[11px] text-secondary mt-1">{event.description || 'No description'}</div>
                            </div>
                            <div className="shrink-0 flex gap-2">
                                <button className="p-1.5 rounded-lg bg-neutral-50 text-secondary">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </button>
                                <button className="p-1.5 rounded-lg bg-red-50 text-red-500">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#F2EEE6] mt-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E5E0D5] bg-white">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></div>
                                <span className="text-[10px] font-bold text-primary">Active</span>
                            </div>
                            <span className="text-xs font-bold text-primary">
                                {event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>

                        <div className="flex justify-start -space-x-2 pt-1">
                            <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary bg-blue-100`}>
                                {members.find(m => m.uid === event.createdBy)?.displayName?.[0] || '?'}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center text-secondary text-sm italic">
                        No events found. Add one now!
                    </div>
                )}
            </div>
        </div>
    );
};

const GroceryModal = ({ isOpen, onClose, familyId, members }: { isOpen: boolean; onClose: () => void; familyId?: string; members: UserProfile[] }) => {
    const router = useRouter();
    const { userProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [assignedTo, setAssignedTo] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setAssignedTo("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async () => {
        if (!name.trim() || !familyId || !userProfile) return;

        setIsLoading(true);
        try {
            // 1. Create the list document
            const listRef = await createGroceryList(familyId, name, userProfile.uid, assignedTo);
            const listId = listRef.id;

            // 2. Generate and add items if applicable
            if (description || selectedImage) {
                try {
                    const generatedItems = await generateGroceryList(selectedImage, description);
                    if (generatedItems && Array.isArray(generatedItems)) {
                        await Promise.all(generatedItems.map(async (item: any) => {
                            // item likely has { name: string, quantity: string }
                            // map to GroceryItem structure
                            await addGroceryItem(familyId, listId, {
                                name: item.quantity ? `${item.quantity} ${item.name}` : item.name,
                                checked: false,
                                calories: undefined,
                                protein: undefined
                            });
                        }));
                    }
                } catch (geminiError) {
                    console.error("Gemini generation failed, but list created:", geminiError);
                    // Continue to redirect, user has empty list with title
                }
            }

            // 3. Redirect to the new list
            router.push(`/dashboard/groceries/${listId}`);
            onClose();
            // Reset form
            setName("");
            setDescription("");
            setSelectedImage(null);
            setAssignedTo("");

        } catch (error) {
            console.error("Failed to create list:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center backdrop-blur-[1px]"
            onClick={onClose}
        >
            <div
                className="bg-[#F9F6F0] rounded-[24px] p-8 w-full max-w-[480px] shadow-xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-[28px] font-medium text-[#3E2312] mb-6 tracking-tight">Create grocery list</h2>

                <div className="flex flex-col gap-5">
                    {/* Grocery list name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#8B735B]">
                            Grocery list name
                        </label>
                        <input
                            type="text"
                            placeholder="Taco Tuesday"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-[50px] w-full px-4 rounded-[12px] border border-[#E6E0D4] bg-white text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:ring-1 focus:ring-[#5C3419]/20"
                        />
                    </div>

                    {/* Member Assignment */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#8B735B]">
                            Assign to (optional)
                        </label>
                        <div className="relative">
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="h-[50px] w-full px-4 rounded-[12px] border border-[#E6E0D4] bg-white text-[#3E2312] focus:outline-none focus:ring-1 focus:ring-[#5C3419]/20 appearance-none cursor-pointer"
                            >
                                <option value="">No assignment</option>
                                {members.map((member) => (
                                    <option key={member.uid} value={member.uid}>
                                        {member.displayName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#3E2312]/50">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Upload refrigerator image */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#8B735B]">
                            Upload refrigerator image
                        </label>
                        <label className="bg-white rounded-[16px] border border-[#E6E0D4] h-[200px] flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors group relative overflow-hidden">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            {selectedImage ? (
                                <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-xl bg-[#F9F6F0] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5C3419" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </div>
                                    <p className="text-[#3E2312] font-bold text-sm">Upload image</p>
                                    <p className="text-[#8B735B] text-xs mt-1">Open your camera or upload from photo library</p>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#8B735B]">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="h-[100px] w-full p-4 rounded-[16px] border border-[#E6E0D4] bg-white text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:ring-1 focus:ring-[#5C3419]/20 resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleCreate}
                        disabled={isLoading}
                        className="bg-[#5C3419] text-white h-[56px] rounded-[16px] text-[17px] font-bold mt-4 hover:bg-[#4A2A14] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Creating...</span>
                            </>
                        ) : (
                            "Create grocery list"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


const AllGroceries = ({ groceries, onAddGrocery }: { groceries: GroceryList[]; onAddGrocery: () => void }) => {
    const router = useRouter();
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-primary">All groceries</h2>
                    <p className="text-sm text-secondary mt-1">Streamline your shopping from aisle to appetite.</p>
                </div>
                <button
                    onClick={onAddGrocery}
                    className="bg-[#3E2312] text-white px-5 py-2.5 rounded-[12px] text-sm font-bold shadow-sm hover:bg-[#2A180C] transition-colors"
                >
                    create grocery list
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groceries.length > 0 ? groceries.map((item, i) => (
                    <div
                        key={item.id}
                        onClick={() => router.push(`/dashboard/groceries/${item.id}`)}
                        className="bg-white rounded-[18px] border border-[#260E01]/10 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                        style={{ padding: '6px 6px 12px 6px' }}
                    >
                        <div className="aspect-video bg-[#F9F6F0] rounded-[12px] overflow-hidden mb-3 relative">
                            {/* Using a placeholder since we copied the image to public/grocery-item.png */}
                            <img
                                src="/grocery-item.png"
                                alt={item.title}
                                className="w-full h-full object-cover mix-blend-multiply"
                            />
                        </div>
                        <div className="px-2">
                            <h3 className="text-sm font-bold text-primary">{item.title}</h3>
                            <p className="text-[10px] text-secondary mt-1 font-medium opacity-60">
                                {item.createdAt?.seconds ? `Created on ${new Date(item.createdAt.seconds * 1000).toLocaleDateString()}` : 'Date N/A'}
                            </p>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full p-12 text-center text-secondary bg-neutral-50 rounded-2xl border border-dashed border-[#E5E0D5]">
                        <p className="italic mb-4">No grocery lists yet.</p>
                        <button onClick={onAddGrocery} className="text-[#5C3419] font-bold text-sm hover:underline">Create your first list</button>
                    </div>
                )}
            </div>
        </div>
    );
};



const FloatingChatInput = () => {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        if (!query.trim()) return;
        router.push(`/tribe-aichat?initialQuery=${encodeURIComponent(query)}`);
    };

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-[500px] px-6">
            <div className="bg-white/90 backdrop-blur-md rounded-full p-2 pl-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/50 flex items-center gap-2 transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:scale-[1.01] focus-within:scale-[1.01] focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFF0E5] to-[#F5E6D8] border border-white flex items-center justify-center shrink-0">
                    <Image src="/nova-avatar.png" width={40} height={40} alt="AI" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="flex-1 text-[#3E2312] text-[15px] font-medium px-2 opacity-100 flex items-center">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Ask Tribe AI..."
                        className="w-full bg-transparent border-none focus:outline-none placeholder:text-[#3E2312]/40 text-[#3E2312]"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="w-10 h-10 rounded-full bg-[#3E2312] text-white flex items-center justify-center hover:bg-[#2A180C] transition-colors shrink-0 shadow-sm"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    );
};


interface MemoirModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: () => void;
    familyId?: string;
    members: UserProfile[];
}

const MemoirModal = ({ isOpen, onClose, onCreate, familyId, members }: MemoirModalProps) => {
    const router = useRouter();
    const { userProfile } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setAssignedTo('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!title.trim() || !familyId || !userProfile) return;

        setIsSubmitting(true);
        try {
            // Note: Update createMemoir to match: (familyId, title, description, coverImageUrl, createdBy, assignedTo)
            // Or pass an object. I will update firestore.ts to handle this better.
            // For now assuming I will fix firestore.ts signature to:
            // createMemoir(familyId, { title, description, coverImageUrl, createdBy, assignedTo })
            const docRef = await createMemoir(familyId, {
                title,
                description,
                coverImageUrl: '/memoir-placeholder.png',
                createdBy: userProfile.uid,
                assignedTo
            });
            // Redirect to the new memoir
            router.push(`/memoir/${docRef.id}`);
            onCreate(); // Triggers parent refresh or navigation if needed
            onClose();
        } catch (error) {
            console.error("Error creating memoir:", error);
        } finally {
            setIsSubmitting(false);
            setTitle('');
            setDescription('');
            setAssignedTo('');
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center backdrop-blur-[1px]"
            onClick={onClose}
        >
            <div
                className="bg-[#F9F6F0] rounded-[24px] p-8 w-full max-w-[480px] shadow-xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-[28px] font-medium text-[#3E2312] mb-6 tracking-tight">Create memoir</h2>

                <div className="flex flex-col gap-5">
                    {/* Memoir name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#8B735B]">
                            Memoir name
                        </label>
                        <input
                            type="text"
                            placeholder="The Books of Us"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-white border border-[#EBE6DE] rounded-[12px] h-[50px] px-4 text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[15px] font-medium text-[#8D7F73]">Assign to (optional)</label>
                        <div className="relative">
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="bg-white border border-[#EBE6DE] rounded-[12px] h-[50px] px-4 w-full text-[#3E2312] focus:outline-none focus:border-[#3E2312]/20 transition-colors text-base appearance-none cursor-pointer"
                            >
                                <option value="">No assignment</option>
                                {members.map(member => (
                                    <option key={member.uid} value={member.uid}>
                                        {member.displayName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#3E2312]/50">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#8B735B]">
                            Description
                        </label>
                        <textarea
                            value={description} // Added value and onChange
                            onChange={(e) => setDescription(e.target.value)} // Added value and onChange
                            className="h-[100px] w-full p-4 rounded-[16px] border border-[#E6E0D4] bg-white text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:ring-1 focus:ring-[#5C3419]/20 resize-none"
                        />
                    </div>

                    {/* Memoir cover image */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#8B735B]">
                            Memoir cover image
                        </label>
                        <div className="bg-white rounded-[16px] border border-[#E6E0D4] h-[200px] flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-[#F9F6F0] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5C3419" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                            </div>
                            <p className="text-[#3E2312] font-bold text-sm">Upload image</p>
                            <p className="text-[#8B735B] text-xs mt-1">Open your camera or upload from photo library</p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit} // Changed to handleSubmit
                        disabled={isSubmitting || !title.trim()} // Added disabled state
                        className="bg-[#5C3419] text-white h-[56px] rounded-[16px] text-[17px] font-bold mt-4 hover:bg-[#4A2A14] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Creating...</span>
                            </>
                        ) : (
                            "Create memoir"
                        )}
                    </button>
                </div>
            </div>
        </div >
    );
};




const BulletinBoard = () => {
    const { userProfile } = useAuth();
    const [message, setMessage] = useState("");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Debounced save function
    const debouncedSave = React.useCallback(
        (newMessage: string, familyId: string, authorName: string) => {
            const save = async () => {
                setIsSaving(true);
                try {
                    await setDoc(doc(db, "families", familyId, "bulletinBoard", "stickyNote"), {
                        message: newMessage,
                        updatedAt: new Date(),
                        author: authorName
                    }, { merge: true });
                    setLastUpdated(new Date());
                } catch (error) {
                    console.error("Error saving bulletin board:", error);
                } finally {
                    setIsSaving(false);
                }
            };
            const handler = setTimeout(save, 1000); // 1-second debounce
            return () => clearTimeout(handler);
        },
        []
    );

    // Ref to hold the timeout cleanup function
    const saveTimeoutRef = React.useRef<(() => void) | null>(null);

    // Effect to subscribe to realtime updates
    React.useEffect(() => {
        if (!userProfile?.familyId) return;

        const unsubscribe = onSnapshot(doc(db, "families", userProfile.familyId, "bulletinBoard", "stickyNote"), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.message !== message && !isSaving) { // Avoid overwriting if saving
                    setMessage(data.message);
                    if (data.updatedAt) setLastUpdated(data.updatedAt.toDate());
                } else if (data.message && message === "") {
                    // Initial load
                    setMessage(data.message);
                    if (data.updatedAt) setLastUpdated(data.updatedAt.toDate());
                }
            }
        });
        return () => unsubscribe();
    }, [userProfile?.familyId]); // Add dependency on familyId

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!userProfile?.familyId) return;

        const newValue = e.target.value;
        setMessage(newValue);

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            saveTimeoutRef.current();
        }

        // Set new timeout
        saveTimeoutRef.current = debouncedSave(newValue, userProfile.familyId, userProfile.displayName || "Family Member");
    };

    if (!userProfile?.familyId) return null; // Or a loading skeleton

    return (
        <div>
            <SectionTitle title="Bulletin board" />
            <div className="bg-[#E9EDC9] p-6 rounded-2xl relative shadow-sm min-h-[200px] flex flex-col justify-between group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-transparent"></div>

                <div className="flex-1 flex flex-col relative z-10">
                    <textarea
                        value={message}
                        onChange={handleChange}
                        placeholder="No family notes yet. Write the first note for your family."
                        className="font-handwriting text-primary/90 text-2xl leading-relaxed mt-2 bg-transparent border-none resize-none focus:outline-none w-full h-full min-h-[120px]"
                        spellCheck={false}
                    />
                </div>

                <div className="flex justify-between items-end mt-4 relative z-10">
                    <span className="text-xs font-medium text-primary/60 uppercase tracking-wide flex items-center gap-2">
                        {lastUpdated ? lastUpdated.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {isSaving && <span className="animate-pulse text-primary/40 text-[10px] lowercase transition-opacity duration-300 ease-in-out">• saving...</span>}
                    </span>
                    <span className="text-sm font-bold text-primary">{userProfile.displayName || "Family Member"}</span>
                </div>
            </div>
        </div>
    );
};


export default function DashboardPage() {
    const router = useRouter();
    const { userProfile, signOut } = useAuth(); // Get logged-in user


    // Real Data State
    const [family, setFamily] = useState<Family | null>(null);
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [chores, setChores] = useState<Chore[]>([]);
    const [events, setEvents] = useState<AppEvent[]>([]);
    const [groceries, setGroceries] = useState<GroceryList[]>([]);
    const [memoirs, setMemoirs] = useState<AppMemoir[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // UI State
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isChoreModalOpen, setIsChoreModalOpen] = useState(false);
    const [editingChore, setEditingChore] = useState<any>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);
    const [isMemoirModalOpen, setIsMemoirModalOpen] = useState(false);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

    // Fetch Data Effect
    useEffect(() => {
        const fetchData = async () => {
            if (userProfile?.familyId) {
                try {
                    const [famData, famMembers, famChores, famEvents, famGroceries, famMemoirs] = await Promise.all([
                        getFamilyData(userProfile.familyId),
                        getFamilyMembers(userProfile.familyId),
                        getFamilyChores(userProfile.familyId),
                        getFamilyEvents(userProfile.familyId),
                        getFamilyGroceryLists(userProfile.familyId),
                        getFamilyMemoirs(userProfile.familyId)
                    ]);
                    // const famData = { id: 'test', name: 'Test Family', members: ['test-uid'], createdAt: { seconds: 0, nanoseconds: 0 }, createdBy: 'test-uid' };
                    // const famMembers: UserProfile[] = [];
                    // const famChores: Chore[] = [];
                    // const famEvents: AppEvent[] = [];
                    // const famGroceries: GroceryList[] = [];
                    // const famMemoirs: AppMemoir[] = [];

                    setFamily(famData);
                    // Update Member Fetch Logic
                    let allMembers = famMembers;
                    if (userProfile && !allMembers.find(m => m.uid === userProfile.uid)) {
                        // Ensure current user is in the list, with a fallback name if needed
                        const currentUser = {
                            ...userProfile,
                            displayName: userProfile.displayName || "Me"
                        };
                        allMembers = [currentUser, ...allMembers];
                    } else {
                        // Also update existing user entry if displayName is missing
                        allMembers = allMembers.map(m =>
                            m.uid === userProfile.uid && !m.displayName
                                ? { ...m, displayName: "Me" }
                                : m
                        );
                    }
                    setMembers(allMembers);
                    setChores(famChores);
                    setEvents(famEvents);
                    setGroceries(famGroceries);
                    setMemoirs(famMemoirs);
                } catch (error) {
                    console.error("Error fetching dashboard data:", error);
                } finally {
                    setIsLoadingData(false);
                }
            } else if (userProfile) {
                // User loaded but has no family
                setIsLoadingData(false);
            }
        };

        if (userProfile !== undefined) {
            fetchData();
        }
    }, [userProfile]);

    // Derived Data for Dashboard
    const todaysTasks = chores.filter(c => c.status === 'pending');

    const upcomingEvents = events.filter(e => {
        const eventDate = e.date ? new Date(e.date.seconds * 1000) : new Date();
        return eventDate >= new Date(new Date().setHours(0, 0, 0, 0));
    }).sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0)).slice(0, 3);


    const toggleTask = (id: string) => {
        const chore = chores.find(c => c.id === id);
        if (!chore) return;

        const newStatus = chore.status === 'pending' ? 'completed' : 'pending';

        // Optimistic update
        setChores(prev => prev.map(c =>
            c.id === id ? { ...c, status: newStatus } : c
        ));

        // Persist to Firestore
        if (chore.familyId) {
            updateChoreStatus(chore.familyId, id, newStatus).catch(err => {
                console.error("Failed to update chore status:", err);
                // Revert on error
                setChores(prev => prev.map(c =>
                    c.id === id ? { ...c, status: chore.status } : c
                ));
            });
        }
    };

    const openCreateChoreModal = () => {
        setEditingChore(null);
        setIsChoreModalOpen(true);
    };

    const openEditChoreModal = (chore: any) => {
        setEditingChore(chore);
        setIsChoreModalOpen(true);
    };

    const closeChoreModal = () => {
        setIsChoreModalOpen(false);
        setEditingChore(null);
    };

    const openCreateEventModal = () => {
        setEditingEvent(null);
        setIsEventModalOpen(true);
    };

    const openEditEventModal = (event: any) => {
        setEditingEvent(event);
        setIsEventModalOpen(true);
    };

    const closeEventModal = () => {
        setIsEventModalOpen(false);
        setEditingEvent(null);
    };

    const openCreateGroceryModal = () => {
        setIsGroceryModalOpen(true);
    };

    const closeGroceryModal = () => {
        setIsGroceryModalOpen(false);
    };

    const openCreateMemoirModal = () => {
        setIsMemoirModalOpen(true);
    };

    const closeMemoirModal = () => {
        setIsMemoirModalOpen(false);
    };

    const handleCreateMemoir = () => {
        // Logic to create memoir would go here
        closeMemoirModal();
        // The actual navigation to the new memoir page is now handled within MemoirModal's handleSubmit
    };

    const handleMemoirClick = (memoir: AppMemoir) => {
        router.push(`/memoir/${memoir.id}`);
    };

    const handleCreateChore = async (data: any) => {
        if (!userProfile?.familyId || !userProfile.uid) return;

        try {
            const newChore = await addChore({
                familyId: userProfile.familyId,
                title: data.title,
                description: data.description,
                assignedTo: data.assignedTo,
                points: data.points,
                createdBy: userProfile.uid,
            });

            // Update local state
            setChores(prev => [...prev, { id: newChore.id, ...data, familyId: userProfile.familyId, status: 'pending', createdBy: userProfile.uid, createdAt: { seconds: Date.now() / 1000 } }]);
        } catch (error) {
            console.error("Error creating chore:", error);
        }
    };

    const handleCreateEvent = async (data: any) => {
        if (!userProfile?.familyId || !userProfile.uid) return;

        try {
            const newEvent = await addEvent({
                familyId: userProfile.familyId,
                title: data.title,
                description: data.description,
                assignedTo: data.assignedTo,
                date: { seconds: data.date.getTime() / 1000 },
                createdBy: userProfile.uid,
            });

            // Update local state
            setEvents(prev => [...prev, {
                id: newEvent.id,
                ...data,
                familyId: userProfile.familyId,
                createdBy: userProfile.uid,
                createdAt: { seconds: Date.now() / 1000 },
                date: { seconds: data.date.getTime() / 1000 },
                assignedTo: data.assignedTo
            }]);
        } catch (error) {
            console.error("Error creating event:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F6F0] py-10 px-6 font-sans relative">
            <ChoreModal
                isOpen={isChoreModalOpen}
                onClose={closeChoreModal}
                onSubmit={handleCreateChore}
                initialData={editingChore}
                isEditing={!!editingChore}
                members={members}
            />

            <EventModal
                isOpen={isEventModalOpen}
                onClose={closeEventModal}
                onSubmit={handleCreateEvent}
                initialData={editingEvent}
                isEditing={!!editingEvent}
                members={members}
            />

            <GroceryModal
                isOpen={isGroceryModalOpen}
                onClose={closeGroceryModal}
                familyId={family?.id}
                members={members}
            />

            <MemoirModal
                isOpen={isMemoirModalOpen}
                onClose={closeMemoirModal}
                onCreate={handleCreateMemoir}
                familyId={family?.id}
                members={members}
            />

            {userProfile && (
                <NotificationPanel
                    isOpen={isNotificationPanelOpen}
                    onClose={() => setIsNotificationPanelOpen(false)}
                    userProfile={userProfile}
                    onQuestionAnswered={() => {
                        // Optionally refresh memoirs if needed
                        // fetchMemoirs(); 
                    }}
                />
            )}

            <div className="max-w-[980px] mx-auto pb-24">
                {/* Header / Top Bar */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Image src="/logo.png" alt="Tribe Logo" width={40} height={40} priority />
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsNotificationPanelOpen(true)}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary hover:bg-neutral-50 transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </button>
                        <div
                            onClick={signOut}
                            className="w-10 h-10 bg-purple-100 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-purple-200 transition-all flex items-center justify-center font-bold text-purple-700"
                        >
                            {userProfile?.displayName ? userProfile.displayName[0].toUpperCase() : 'U'}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {/* TOP SECTION: Greeting (Left) & Quick Actions (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Greeting Card: lg:col-span-7 */}
                        <div className="lg:col-span-7">
                            <div className="bg-[#5C3419] rounded-[48px] p-8 lg:p-10 text-white relative overflow-hidden min-h-[320px] flex flex-col justify-between h-full shadow-sm">
                                {/* Background decorative elements */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#7A4520] to-[#5C3419] -z-10"></div>

                                <div>
                                    <p className="text-sm font-medium opacity-80 mb-2">
                                        {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <h1 className="text-5xl font-medium tracking-tight">
                                        {family ? `The ${family.name}` : `Hi ${userProfile?.displayName ? userProfile.displayName.split(' ')[0] : 'there'}`}
                                    </h1>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="flex -space-x-4">
                                        {members.length > 0 ? (
                                            members.map((member, idx) => (
                                                <Avatar
                                                    key={member.uid}
                                                    label={member.displayName?.[0] || '?'}
                                                    color={['bg-blue-200', 'bg-pink-200', 'bg-green-200', 'bg-yellow-200'][idx % 4]}
                                                    name={member.displayName}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-sm opacity-70 italic">No family members added yet.</p>
                                        )}
                                    </div>

                                    {!userProfile?.familyId ? (
                                        <Link href="/onboarding" className="bg-white text-[#5C3419] px-6 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-100 transition-colors shadow-sm">
                                            Create Family
                                        </Link>
                                    ) : (
                                        <button className="bg-white text-[#5C3419] px-6 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-100 transition-colors shadow-sm">
                                            Invite family
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions: lg:col-span-5 */}
                        <div className="lg:col-span-5 flex flex-col">
                            <SectionTitle title="Quick actions" />
                            <div className="bg-white rounded-[20px] border border-[#F2EEE6] overflow-hidden shadow-sm flex flex-col justify-center h-full">
                                {[
                                    { title: "Create chore", subtitle: "Keep your home running like clockwork.", action: openCreateChoreModal },
                                    { title: "Create event", subtitle: "Never miss a moment that matters.", action: openCreateEventModal },
                                    { title: "Create grocery list", subtitle: "Streamline your shopping from aisle to appetite.", action: openCreateGroceryModal },
                                    { title: "Create memoir", subtitle: "Preserve the stories that define your legacy.", action: openCreateMemoirModal },
                                ].map((action, i, arr) => (
                                    <button
                                        key={i}
                                        onClick={action.action}
                                        className={`flex items-center gap-5 px-[12px] py-[8px] text-left hover:bg-neutral-50 transition-colors ${i !== arr.length - 1 ? 'border-b border-[#F2EEE6]' : ''} group`}
                                    >
                                        <div className="w-12 h-12 bg-[#F9F6F0] rounded-xl flex items-center justify-center text-primary group-hover:bg-[#EFEDE6] transition-colors shrink-0">
                                            <span className="text-2xl font-light">+</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-medium text-primary leading-tight">{action.title}</h3>
                                            <p className="text-xs text-secondary mt-1">{action.subtitle}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE SECTION: Navigation Tabs */}
                    <div className="bg-white p-1 rounded-2xl flex gap-1 overflow-x-auto shadow-sm scrollbar-hide w-fit">
                        {[
                            { label: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
                            { label: 'Chore Tracker', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> },
                            { label: 'Events Tracker', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
                            { label: 'All Groceries', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg> },
                            { label: 'Family Memoir', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> }
                        ].map((tab, i) => (
                            <button
                                key={tab.label}
                                onClick={() => setActiveTab(tab.label)}
                                className={`h-[45px] px-[12px] rounded-[12px] text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab.label ? 'bg-[#F9F6F0] text-primary' : 'text-secondary hover:bg-[#F9F6F0] hover:text-primary'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* BOTTOM SECTION: Content Grid or Other Views */}
                    <div className="min-h-[500px]">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {activeTab === 'Dashboard' ? (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Left Column Content */}
                                    <div className="lg:col-span-7 flex flex-col gap-8">
                                        {/* Bulletin Board */}
                                        <BulletinBoard />

                                        {/* Upcoming Events */}
                                        <div>
                                            <div className="flex justify-between items-baseline mb-4">
                                                <SectionTitle title="Upcoming events" />
                                                {upcomingEvents.length > 0 && <button className="text-xs font-bold text-secondary underline">View all</button>}
                                            </div>

                                            <div className="bg-white rounded-2xl p-1 shadow-sm">
                                                {upcomingEvents.length > 0 ? (
                                                    upcomingEvents.map((event, i) => (
                                                        <div key={i} className="flex gap-4 p-4 border-b border-[#F2EEE6] last:border-b-0 hover:bg-neutral-50 transition-colors rounded-xl">
                                                            <div className="bg-[#F9F6F0] rounded-lg w-12 h-12 flex flex-col items-center justify-center text-primary border border-secondary/10">
                                                                <span className="text-[9px] font-bold uppercase opacity-60">
                                                                    {event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString('default', { month: 'short' }) : 'N/A'}
                                                                </span>
                                                                <span className="text-sm font-bold">
                                                                    {event.date?.seconds ? new Date(event.date.seconds * 1000).getDate() : '?'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-bold text-primary">{event.title}</h4>
                                                                <p className="text-[10px] text-secondary mt-1">{event.description || "No description"}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center bg-neutral-50 rounded-xl">
                                                        <p className="text-secondary text-sm italic mb-2">No upcoming events.</p>
                                                        <button onClick={openCreateEventModal} className="text-[#5C3419] font-bold text-sm hover:underline">Add one to stay organized</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column Content */}
                                    <div className="lg:col-span-5 flex flex-col gap-8">
                                        {/* Today's tasks */}
                                        <div>
                                            <SectionTitle title="Today's tasks" />
                                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                                <AnimatePresence>
                                                    {todaysTasks.length > 0 ? (
                                                        todaysTasks.map((task, i) => (
                                                            // Mapping Chore to TaskRow
                                                            <TaskRow
                                                                key={task.id}
                                                                task={{
                                                                    id: task.id,
                                                                    title: task.title,
                                                                    priority: 'Medium', // Defaulting as Priority isn't in Chore yet
                                                                    completed: task.status === 'completed'
                                                                }}
                                                                onToggle={toggleTask}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center">
                                                            <p className="text-secondary text-sm italic mb-2">No tasks for today.</p>
                                                            <p className="text-secondary/60 text-xs">Enjoy your day!</p>
                                                            <button onClick={openCreateChoreModal} className="mt-4 text-[#5C3419] font-bold text-xs hover:underline">Add a task</button>
                                                        </div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        {/* Leaderboard */}
                                        <div>
                                            <SectionTitle title="Leaderboard" />
                                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-8 text-center">
                                                <p className="text-secondary text-sm italic">Points and leaderboard coming soon!</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'Chore Tracker' ? (
                                <ChoreTracker
                                    chores={chores}
                                    members={members}
                                    onAddChore={openCreateChoreModal}
                                    onEditChore={openEditChoreModal}
                                />
                            ) : activeTab === 'Events Tracker' ? (
                                <EventsTracker
                                    events={events}
                                    members={members}
                                    onAddEvent={openCreateEventModal}
                                    onEditEvent={openEditEventModal}
                                />
                            ) : activeTab === 'All Groceries' ? (
                                <AllGroceries groceries={groceries} onAddGrocery={openCreateGroceryModal} />
                            ) : activeTab === 'Family Memoir' ? (
                                <FamilyMemoir
                                    memoirs={memoirs}
                                    onAddMemoir={openCreateMemoirModal}
                                    onMemoirClick={handleMemoirClick}
                                />
                            ) : (
                                <div className="py-20 text-center text-secondary">
                                    Feature coming soon...
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div >
            <FloatingChatInput />
        </div >
    );
}
