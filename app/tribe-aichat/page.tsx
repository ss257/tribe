"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithGemini } from '@/app/actions/gemini';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    content: string;
}

const LoadingBubble = () => (
    <div className="self-start max-w-[80%] md:max-w-[800px] w-full">
        <div className="bg-white p-6 rounded-[24px] border border-[#260E01]/10 w-fit flex items-center gap-3 shadow-sm">
            <div className="flex space-x-1">
                <motion.div
                    className="w-2 h-2 bg-[#260E01]/40 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                    className="w-2 h-2 bg-[#260E01]/40 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                    className="w-2 h-2 bg-[#260E01]/40 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                />
            </div>
            <motion.span
                className="text-[#260E01]/60 text-[15px] font-medium"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                Tribe AI is thinking...
            </motion.span>
        </div>
    </div>
);

function ChatContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('initialQuery');
    const hasInitialized = useRef(false);

    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'user',
            content: "I've been feeling tired for the past few weeks. I get headaches almost every day, feel thirsty all the time, and I've been urinating more frequently than usual. Sometimes I also feel dizzy, especially in the afternoon."
        },
        {
            role: 'model',
            content: `**Summary of Your Symptoms**\n\nBased on what you shared, these symptoms stand out:\n\n*   Ongoing fatigue for several weeks\n*   Frequent headaches\n*   Increased thirst\n*   Increased urination\n*   Occasional dizziness, mainly in the afternoon\n\n**Possible Causes to Consider**\n\nThese symptoms may be associated with a few common conditions. This is not a diagnosis, but an initial assessment.\n\n1.  **Elevated Blood Sugar Levels**\n    *   Excessive thirst\n    *   Frequent urination\n    *   Fatigue\n    *   Headaches\n\n2.  **Dehydration or Electrolyte Imbalance**, possible if fluid intake is low or if fluids are being lost more than usual.\n    *   Dizziness\n    *   Headaches\n    *   Fatigue\n\n3.  **Blood Pressure Changes**, fluctuations in blood pressure can lead to:\n    *   Dizziness\n    *   Headaches\n    *   Tiredness\n\nIf you want, you can upload lab reports or prescriptions for a more detailed review.`
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Handle initial query from dashboard
    useEffect(() => {
        if (initialQuery && !hasInitialized.current) {
            hasInitialized.current = true;

            const startChat = async () => {
                const userMsg: Message = { role: 'user', content: initialQuery };
                setMessages([userMsg]); // Clear demo and set user message
                setIsLoading(true);

                try {
                    const responseText = await chatWithGemini([userMsg]);
                    setMessages(prev => [...prev, { role: 'model', content: responseText }]);
                } catch (error) {
                    console.error("Failed to get initial response:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            startChat();
        }
    }, [initialQuery]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const newUserMessage: Message = { role: 'user', content: inputValue.trim() };
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Pass the updated history including the new message
            const responseText = await chatWithGemini([...messages, newUserMessage]);

            const newAIMessage: Message = { role: 'model', content: responseText };
            setMessages(prev => [...prev, newAIMessage]);
        } catch (error) {
            console.error("Failed to get response:", error);
            // Optionally add error message to chat
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Custom Markdown Components for Consistent Styling
    const MarkdownComponents: any = {
        h1: ({ ...props }) => <h1 className="text-2xl font-bold text-[#260E01] mb-4 mt-6 first:mt-0" {...props} />,
        h2: ({ ...props }) => <h2 className="text-xl font-bold text-[#260E01] mb-3 mt-5 first:mt-0" {...props} />,
        h3: ({ ...props }) => <h3 className="text-lg font-bold text-[#260E01] mb-2 mt-4 first:mt-0" {...props} />,
        strong: ({ ...props }) => <strong className="font-bold text-[#260E01]" {...props} />,
        p: ({ ...props }) => <p className="text-[#260E01] text-[15px] leading-relaxed mb-4 last:mb-0" {...props} />,
        ul: ({ ...props }) => <ul className="list-disc pl-5 space-y-1 mb-4 text-[#260E01] text-[15px]" {...props} />,
        ol: ({ ...props }) => <ol className="list-decimal pl-5 space-y-1 mb-4 text-[#260E01] text-[15px]" {...props} />,
        li: ({ ...props }) => <li className="leading-relaxed pl-1" {...props} />,
        code: ({ ...props }) => <code className="bg-[#260E01]/5 px-1.5 py-0.5 rounded text-sm font-mono text-[#260E01]" {...props} />,
        pre: ({ ...props }) => <pre className="bg-[#260E01]/5 p-4 rounded-lg overflow-x-auto text-sm my-4" {...props} />,
        blockquote: ({ ...props }) => <blockquote className="border-l-4 border-[#260E01]/20 pl-4 italic text-[#260E01]/80 my-4" {...props} />,
    };

    return (
        <div className="min-h-screen bg-[#F9F6F0] flex flex-col font-sans text-[#260E01]">

            {/* Header / Navigation */}
            <div className="fixed top-0 left-0 p-6 z-50">
                <Link href="/dashboard" className="text-[#260E01]/50 hover:text-[#260E01] transition-colors flex items-center gap-2 font-medium">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto px-8 pt-[70px] pb-40 flex flex-col gap-8 w-full max-w-[800px] mx-auto scroll-smooth">
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${msg.role === 'user' ? 'self-end max-w-[80%] md:max-w-[600px]' : 'self-start max-w-[80%] md:max-w-[800px] w-full'}`}
                        >
                            {msg.role === 'user' ? (
                                <div className="bg-white rounded-[24px] border border-[#260E01]/10 text-[#260E01] text-[15px] leading-relaxed shadow-sm p-5 px-6">
                                    {msg.content}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <ReactMarkdown components={MarkdownComponents}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {isLoading && <LoadingBubble key="loading" />}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Fixed Input Area */}
            <div className="fixed bottom-0 left-0 w-full p-6 pb-6 pt-24 bg-gradient-to-t from-[#F9F6F0] via-[#F9F6F0]/80 to-transparent backdrop-blur-xl [mask-image:linear-gradient(to_bottom,transparent,black_25%)]">
                <div className="max-w-[900px] mx-auto bg-white rounded-[24px] border border-[#260E01]/10 p-2 flex items-end shadow-[0_8px_30px_rgba(38,14,1,0.05)] focus-within:shadow-[0_8px_30px_rgba(38,14,1,0.08)] transition-shadow">
                    {/* Attachment Button */}
                    <button className="w-12 h-12 flex items-center justify-center rounded-[16px] text-[#260E01]/50 hover:bg-[#F9F6F0] hover:text-[#260E01] transition-colors shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </button>

                    {/* Input Field */}
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Tribe AI anything you want..."
                        className="flex-1 bg-transparent border-none text-[#260E01] placeholder:text-[#260E01]/30 p-3.5 focus:outline-none focus:ring-0 resize-none h-[56px] py-4 text-[16px]"
                    />

                    {/* Send Button */}
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="w-12 h-12 flex items-center justify-center rounded-[16px] bg-[#260E01] text-white hover:bg-[#3E2312] transition-colors shrink-0 mb-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-45 ml-[-2px] mt-[2px]">
                            <path d="M22 2L11 13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </div>

        </div>
    );
}

export default function TribeAIChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center">
                <div className="text-[#260E01]/60">Loading chat...</div>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
