import React from 'react';
import { QuestionType } from './AddQuestionModal';

export interface Question {
    id: string;
    type: QuestionType;
    image?: string;
    question: string;
    assignedTo: string;
    status: 'Pending' | 'Answered';
    answer?: string;
}

interface QuestionCardProps {
    question: Question;
    onClick: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-[18px] p-[6px] border border-[#260E01]/10 hover:shadow-sm transition-all cursor-pointer flex flex-col gap-3 group"
        >
            {/* Context/Preview Area */}
            <div className="w-full aspect-[16/9] rounded-[12px] overflow-hidden bg-[#F9F6F0] relative flex items-center justify-center">
                {question.type === 'image' && question.image ? (
                    <img src={question.image} alt={question.question} className="w-full h-full object-cover" />
                ) : (
                    <img
                        src="/assets/question_type_prompt.png"
                        alt="Prompt"
                        className="w-full h-full object-contain"
                    />
                )}
            </div>

            {/* Meta Info */}
            <div className="px-2 pb-2 flex flex-col gap-3">
                <h3 className="font-bold text-[#3E2312] text-sm leading-snug line-clamp-2">
                    {question.question}
                </h3>

                <div className="flex items-center justify-between">
                    <p className="text-[10px] text-[#8D7F73]">
                        Assigned to: <span className="text-[#3E2312]">{question.assignedTo}</span>
                    </p>

                    <div className="border border-[#260E01]/10 px-2 py-[2px] rounded-[6px] flex items-center justify-center bg-transparent">
                        <span className="text-[10px] font-bold text-[#3E2312] leading-none">
                            {question.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
