import React, { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Question } from './QuestionCard';

interface AnswerModalProps {
    isOpen: boolean;
    onClose: () => void;
    question: Question | null;
    onAnswer: (questionId: string, answer: string) => void;
}

export const AnswerModal: React.FC<AnswerModalProps> = ({ isOpen, onClose, question, onAnswer }) => {
    const [answer, setAnswer] = useState('');

    if (!isOpen || !question) return null;

    const handleSubmit = () => {
        if (!answer.trim()) return;
        onAnswer(question.id, answer);
        setAnswer('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-[#F9F6F0] rounded-[24px] p-8 w-full max-w-[580px] shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-[#3E2312] text-2xl font-bold tracking-tight leading-tight flex-1 mr-4">
                        {question.question}
                    </h2>
                    <button onClick={onClose} className="text-[#3E2312]/50 hover:text-[#3E2312] transition-colors mt-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Question Context */}
                <div className="mb-8">
                    {question.type === 'image' && question.image && (
                        <div className="rounded-[16px] overflow-hidden border border-[#E6E0D4]">
                            <img src={question.image} alt="Question context" className="w-full max-h-[300px] object-cover" />
                        </div>
                    )}
                    {question.type === 'prompt' && (
                        <div className="p-6 bg-white rounded-[16px] border border-[#E6E0D4] text-center italic text-[#8D7F73]">
                            Responding to prompt
                        </div>
                    )}
                </div>

                {/* Answer Input */}
                <div className="space-y-4">
                    <p className="text-[#8D7F73] text-sm font-medium ml-1">
                        Answer as <span className="text-[#3E2312] font-bold">{question.assignedTo}</span>
                    </p>
                    <textarea
                        className="w-full h-[150px] bg-white border border-[#260E01]/10 p-4 rounded-[16px] text-[#3E2312] text-[15px] font-medium resize-none focus:outline-none focus:ring-1 focus:ring-[#3E2312]/20 placeholder:text-[#8D7F73]/50"
                        placeholder="Write your answer here..."
                        value={answer || question.answer || ''} // Show existing answer if any
                        onChange={(e) => setAnswer(e.target.value)}
                        readOnly={!!question.answer && !answer} // If already answered and not editing (simplified logic)
                    />

                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-[#7D3412] hover:bg-[#5E270E] text-white font-bold py-4 rounded-[16px]"
                        disabled={!answer.trim()}
                    >
                        Submit answer
                    </Button>
                </div>
            </div>
        </div>
    );
};
