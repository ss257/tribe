'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: "Is there a free trial available?",
        answer: "Yes. You can try Tribe free for 30 days. During this period, you can add family members, create chores, events, grocery lists, and memoirs to experience the full system."
    },
    {
        question: "Can I add grandparents and kids to the same family space?",
        answer: "Absolutely. Tribe is designed for parents, grandparents, and children to collaborate in one shared family hub with role-based access."
    },
    {
        question: "How do points work for chores?",
        answer: "Parents assign points to chores. When kids complete them, they earn points that appear on the family leaderboard, encouraging responsibility without constant reminders."
    },
    {
        question: "Can everyone update grocery lists?",
        answer: "Yes. Grocery lists are shared in real time. Anyone in the family can add items, and members can check them off while shopping."
    },
    {
        question: "What is the Family Memoir feature?",
        answer: "Memoir lets families preserve memories by turning photos or prompts into questions that members answer, creating lasting stories together."
    },
    {
        question: "What does Tribe AI help with?",
        answer: "Tribe AI helps answer questions, summarize information, and assist with daily family decisions directly inside your family dashboard."
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes. There are no long-term commitments. You can cancel your plan anytime from your account settings."
    }
];

export default function FAQAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full max-w-3xl">
            {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="border-b border-[#260E01]/10"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full flex items-center justify-between py-6 text-left focus:outline-none group hover:bg-[#260E01]/[0.02] transition-colors rounded-lg px-2 -mx-2"
                        >
                            <span className="text-lg font-medium text-[#260E01] pr-4">
                                {faq.question}
                            </span>
                            <motion.div
                                animate={{ rotate: isOpen ? 45 : 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="flex-shrink-0 w-8 h-8 rounded-full border border-[#260E01]/20 flex items-center justify-center group-hover:border-[#260E01]/40"
                            >
                                <svg
                                    className="w-4 h-4 text-[#260E01]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </motion.div>
                        </button>
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    key="content"
                                    initial="collapsed"
                                    animate="open"
                                    exit="collapsed"
                                    variants={{
                                        open: { opacity: 1, height: "auto", marginBottom: 24 },
                                        collapsed: { opacity: 0, height: 0, marginBottom: 0 }
                                    }}
                                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                    className="overflow-hidden px-2"
                                >
                                    <p className="text-[#260E01]/50 leading-relaxed pr-12">
                                        {faq.answer}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}
