"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
    getMemoirQuestions,
    addMemoirQuestion,
    answerMemoirQuestion,
    getFamilyMembers,
    UserProfile,
    MemoirQuestion,
    AppMemoir
} from '../../lib/firestore';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

import { AddQuestionModal, QuestionType } from './AddQuestionModal';
import { QuestionCard, Question } from './QuestionCard';
import { AnswerModal } from './AnswerModal';

export default function MemoirDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { userProfile } = useAuth();

    const [memoir, setMemoir] = useState<AppMemoir | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [members, setMembers] = useState<{ label: string; value: string }[]>([]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!userProfile?.familyId || !id) return;

            try {
                // 1. Fetch Memoir Details
                const memoirRef = doc(db, "families", userProfile.familyId, "memoirs", id);
                const memoirSnap = await getDoc(memoirRef);
                if (memoirSnap.exists()) {
                    setMemoir({ id: memoirSnap.id, ...memoirSnap.data() } as AppMemoir);
                } else {
                    console.error("Memoir not found");
                    return;
                }

                // 2. Fetch Questions
                const fetchedQuestions = await getMemoirQuestions(userProfile.familyId, id);

                // Map to UI Question Type
                const mappedQuestions: Question[] = fetchedQuestions.map(mq => ({
                    id: mq.id,
                    type: mq.questionType,
                    image: mq.imageUrl,
                    question: mq.questionText,
                    assignedTo: mq.assignedTo, // This is likely a UID or Name. Ideally Name.
                    status: mq.status === 'answered' ? 'Answered' : 'Pending',
                    answer: mq.answer?.answerText
                }));
                setQuestions(mappedQuestions);

                // 3. Fetch Family Members (for assignment)
                const famMembers = await getFamilyMembers(userProfile.familyId);
                setMembers(famMembers.map(m => ({
                    label: m.displayName || m.email || 'Member',
                    value: m.displayName || m.uid // Using Name for display in card for now
                })));

            } catch (error) {
                console.error("Error fetching memoir details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, userProfile?.familyId]);

    const handleAddQuestion = async (newQuestionData: { type: QuestionType; image?: string; question: string; assignedTo: string }) => {
        if (!userProfile?.familyId) return;

        try {
            // Optimistic Update
            const tempId = Math.random().toString(36).substr(2, 9);
            const optimisticQuestion: Question = {
                id: tempId,
                ...newQuestionData,
                status: 'Pending',
            };
            setQuestions(prev => [optimisticQuestion, ...prev]);

            // API Call
            await addMemoirQuestion(userProfile.familyId, id, {
                questionType: newQuestionData.type,
                imageUrl: newQuestionData.image, // Note: Handling base64 image as URL for now
                questionText: newQuestionData.question,
                assignedTo: newQuestionData.assignedTo,
            });

            // In a real app with subscriptions, we'd wait for the update.
            // For now, we assume success. Ideally we replace the ID.

        } catch (error) {
            console.error("Error adding question:", error);
            // Revert optimistic update
            setQuestions(prev => prev.filter(q => q.question !== newQuestionData.question));
        }
    };

    const handleAnswerQuestion = async (questionId: string, answer: string) => {
        if (!userProfile?.familyId) return;

        try {
            // Optimistic Update
            setQuestions(prev => prev.map(q =>
                q.id === questionId
                    ? { ...q, answer, status: 'Answered' }
                    : q
            ));
            setSelectedQuestion(null);

            // API Call
            await answerMemoirQuestion(userProfile.familyId, id, questionId, userProfile.uid, answer);

        } catch (error) {
            console.error("Error answering question:", error);
            // Revert
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#3E2312] border-t-transparent rounded-full"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#F9F6F0] p-6 font-sans">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-6 mb-12">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#260E01]/10 text-primary hover:bg-neutral-50 transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5" />
                            <path d="M12 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-bold text-[#3E2312] tracking-tight mb-2">{memoir?.title || 'Memoir'}</h1>
                            <p className="text-sm text-[#8D7F73] font-medium">
                                {memoir?.createdAt
                                    ? `Created on ${new Date(memoir.createdAt.seconds * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                    : 'Loading date...'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-white border border-[#260E01]/10 text-[#3E2312] px-5 py-2.5 rounded-[12px] text-sm font-bold hover:bg-neutral-50 transition-colors"
                            >
                                Add question
                            </button>
                            {/* <button className="bg-[#260E01] text-white px-5 py-2.5 rounded-[12px] text-sm font-bold shadow-sm hover:bg-[#3E2312] transition-colors">
                                Edit changes
                            </button> */}
                        </div>
                    </div>
                </div>

                {/* Content */}
                {questions.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <h3 className="text-xl font-bold text-[#3E2312] mb-2">No questions added yet</h3>
                        <p className="text-[#8D7F73] max-w-sm">Start building this memoir by adding your first question</p>
                    </div>
                ) : (
                    // Grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {questions.map((q) => (
                            <QuestionCard
                                key={q.id}
                                question={q}
                                onClick={() => setSelectedQuestion(q)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddQuestionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddQuestion}
                familyMembers={members}
            />

            <AnswerModal
                isOpen={!!selectedQuestion}
                question={selectedQuestion}
                onClose={() => setSelectedQuestion(null)}
                onAnswer={handleAnswerQuestion}
            />
        </div>
    );
}
