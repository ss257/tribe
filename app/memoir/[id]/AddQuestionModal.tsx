import React, { useState, useRef } from 'react';
import { Input } from '@/app/components/ui/Input';
import { Select } from '@/app/components/ui/Select';
import { Button } from '@/app/components/ui/Button';

export type QuestionType = 'image' | 'prompt';

interface AddQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (question: { type: QuestionType; image?: string; question: string; assignedTo: string }) => void;
    familyMembers: { label: string; value: string }[];
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ isOpen, onClose, onAdd, familyMembers }) => {
    const [type, setType] = useState<QuestionType>('image');
    const [question, setQuestion] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!assignedTo) return; // Basic validation
        if (type === 'image' && !imagePreview) return;

        onAdd({
            type,
            question,
            assignedTo,
            image: imagePreview || undefined,
        });

        // Reset and close
        setQuestion('');
        setAssignedTo('');
        setImagePreview(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-[#F9F6F0] rounded-[24px] p-8 w-full max-w-[580px] shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[#3E2312] text-3xl font-bold tracking-tight">Add new question</h2>
                    <button onClick={onClose} className="text-[#3E2312]/50 hover:text-[#3E2312] transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Step 1: Select Question Type */}
                <div className="mb-8">
                    <p className="text-[#8D7F73] text-sm font-medium mb-3 ml-1">Select question type</p>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Image Type Card */}
                        <div
                            onClick={() => setType('image')}
                            className={`
                                cursor-pointer rounded-[20px] p-[6px] border-2 transition-all duration-200 relative overflow-hidden group
                                ${type === 'image' ? 'border-[#15803d]/0 ring-2 ring-[#047857]' : 'border-transparent bg-white hover:bg-neutral-50'}
                                bg-white flex flex-col gap-[6px]
                            `}
                        >
                            <div className="w-full aspect-[16/9] relative rounded-lg overflow-hidden flex items-center justify-center">
                                <img
                                    src="/assets/question_type_photo.png"
                                    alt="Upload image type"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex items-center gap-2 z-10 px-1">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${type === 'image' ? 'bg-[#047857] border-[#047857]' : 'border-neutral-300'}`}>
                                    {type === 'image' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                                <span className={`font-bold text-sm transition-colors ${type === 'image' ? 'text-[#3E2312]' : 'text-[#3E2312]'}`}>Upload image</span>
                            </div>
                        </div>

                        {/* Prompt Type Card */}
                        <div
                            onClick={() => setType('prompt')}
                            className={`
                                cursor-pointer rounded-[20px] p-[6px] border-2 transition-all duration-200 relative overflow-hidden group
                                ${type === 'prompt' ? 'border-[#15803d]/0 ring-2 ring-[#047857]' : 'border-transparent bg-white hover:bg-neutral-50'}
                                bg-white flex flex-col gap-[6px]
                            `}
                        >
                            <div className="w-full aspect-[16/9] relative rounded-lg overflow-hidden flex items-center justify-center">
                                <img
                                    src="/assets/question_type_prompt.png"
                                    alt="Use prompt type"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="flex items-center gap-2 z-10 px-1">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${type === 'prompt' ? 'bg-[#047857] border-[#047857]' : 'border-neutral-300'}`}>
                                    {type === 'prompt' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                                <span className={`font-bold text-sm transition-colors ${type === 'prompt' ? 'text-[#3E2312]' : 'text-[#3E2312]'}`}>Use prompt</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2: Input Fields */}
                <div className="space-y-6">
                    {/* Image Upload Area */}
                    {type === 'image' && (
                        <div>
                            <p className="text-[#8D7F73] text-sm font-medium mb-2 ml-1">Upload image</p>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white rounded-[20px] h-[200px] flex flex-col items-center justify-center border border-dashed border-[#8D7F73]/30 cursor-pointer hover:bg-neutral-50 transition-colors overflow-hidden relative"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center border-2 border-[#3E2312]">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3E2312" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                        </div>
                                        <h3 className="text-[#3E2312] font-bold text-lg mb-1">Upload image</h3>
                                        <p className="text-[#8D7F73] text-xs">Open your camera or upload from photo library</p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* Question Input */}
                    <Input
                        id="question"
                        label="Question"
                        placeholder="Your memories of our Christmas 2007"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />

                    {/* Assigned To Dropdown */}
                    <Select
                        id="assignedTo"
                        label="Assigned to"
                        options={familyMembers}
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                    />

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-[#7D3412] hover:bg-[#5E270E] text-white font-bold py-4 rounded-[16px] mt-4"
                        disabled={!assignedTo}
                    >
                        Add question
                    </Button>
                </div>
            </div>
        </div>
    );
};
