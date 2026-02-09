import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MemoirQuestion, getUserPendingQuestions, answerMemoirQuestion } from '../lib/firestore';
import { UserProfile } from '../lib/firestore';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    onQuestionAnswered: () => void; // Callback to refresh data
}

export default function NotificationPanel({ isOpen, onClose, userProfile, onQuestionAnswered }: NotificationPanelProps) {
    const [questions, setQuestions] = useState<(MemoirQuestion & { memoirId: string, memoirTitle: string })[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [answeringId, setAnsweringId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && userProfile.familyId) {
            fetchQuestions();
        }
    }, [isOpen, userProfile]);

    const fetchQuestions = async () => {
        if (!userProfile.familyId) return;
        setIsLoading(true);
        try {
            const data = await getUserPendingQuestions(userProfile.uid, userProfile.familyId);
            setQuestions(data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerSubmit = async (q: MemoirQuestion & { memoirId: string }) => {
        if (!answerText.trim() || !userProfile.familyId) return;

        setIsSubmitting(true);
        try {
            await answerMemoirQuestion(userProfile.familyId, q.memoirId, q.id, userProfile.uid, answerText);
            setAnswerText("");
            setAnsweringId(null);
            fetchQuestions(); // Refresh list
            onQuestionAnswered(); // Notify parent
        } catch (error) {
            console.error("Error submitting answer:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 z-[60] backdrop-blur-[1px]"
                    />

                    {/* Slide-in Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#F9F6F0] shadow-2xl z-[70] border-l border-[#EBE6DE] p-6 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-medium text-[#3E2312]">Memoir Requests</h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EBE6DE] transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3E2312" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#772D08]"></div>
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-60 text-center">
                                <div className="w-16 h-16 bg-[#EBE6DE] rounded-full flex items-center justify-center mb-4 text-2xl">
                                    ✨
                                </div>
                                <p className="text-[#3E2312] font-medium">All caught up!</p>
                                <p className="text-sm text-[#8D7F73] mt-1">No pending memoir questions.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {questions.map((q) => (
                                    <div key={q.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-[#EBE6DE]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold tracking-wider text-[#772D08] uppercase bg-[#772D08]/5 px-2 py-1 rounded-full">
                                                {q.memoirTitle}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-medium text-[#3E2312] mb-4">
                                            {q.questionText}
                                        </h3>

                                        {answeringId === q.id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={answerText}
                                                    onChange={(e) => setAnswerText(e.target.value)}
                                                    placeholder="Write your story..."
                                                    className="w-full h-32 bg-[#F9F6F0] rounded-xl p-3 text-[#3E2312] placeholder:text-[#3E2312]/30 focus:outline-none focus:ring-1 focus:ring-[#772D08]/20 resize-none text-base"
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setAnsweringId(null)}
                                                        className="px-4 py-2 text-sm font-medium text-[#8D7F73] hover:text-[#3E2312] transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleAnswerSubmit(q)}
                                                        disabled={!answerText.trim() || isSubmitting}
                                                        className="bg-[#772D08] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#772D08]/90 transition-colors disabled:opacity-50"
                                                    >
                                                        {isSubmitting ? 'Saving...' : 'Save Answer'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setAnsweringId(q.id);
                                                    setAnswerText("");
                                                }}
                                                className="w-full bg-[#772D08] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#772D08]/90 transition-colors shadow-sm shadow-[#772D08]/10"
                                            >
                                                Answer Question
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
