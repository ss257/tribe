"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FAQAccordion from './components/FAQAccordion';
import { motion, Variants } from 'framer-motion';

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#260E01] font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 w-full backdrop-blur-md bg-[#F9F6F0]/80">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Tribe Logo"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <Link
            href="/user-auth"
            className="text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Log in
          </Link>
          <Link
            href="/user-auth"
            className="bg-[#772D08] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-[12px] text-sm font-medium hover:bg-[#772D08]/90 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-start w-full">

        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-start pt-24 md:pt-32 px-4 w-full max-w-[100vw] overflow-x-hidden">
          {/* Trust Row */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex items-center gap-3 mb-8"
          >
            <div className="flex -space-x-4">
              {/* Single image representing the trusted families avatar group */}
              <div className="relative">
                <Image
                  src="/user-avatar-tribe.png"
                  alt="Trusted families"
                  width={140}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
            <span className="text-sm font-medium opacity-80">Trusted by 500+ families</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-center max-w-4xl leading-[1.1] mb-6 tracking-tight px-2"
          >
            The Smart Home Hub for <br className="hidden md:block" /> Modern Families
          </motion.h1>

          {/* Sub-text */}
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.15 }}
            className="text-base md:text-lg lg:text-xl text-center max-w-2xl opacity-70 mb-8 md:mb-10 leading-relaxed px-2"
          >
            A shared family hub to assign chores with points, plan events, manage groceries, and build lasting memoirs designed for parents, grandparents, and kids together.
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
            className="mb-12 md:mb-20"
          >
            <Link
              href="/user-auth"
              className="bg-[#772D08] text-white px-8 py-4 rounded-[12px] text-lg font-medium hover:bg-[#772D08]/90 transition-all shadow-lg shadow-[#772D08]/10 inline-block"
            >
              <motion.span whileHover={{ y: -2 }} className="inline-block">
                Get started
              </motion.span>
            </Link>
          </motion.div>

          {/* Hero Image - Single Image with Hard Crop */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            transition={{ delay: 0.4 }}
            className="relative w-full max-w-6xl mt-8 md:mt-12 px-2 md:px-4"
          >
            {/* Container with overflow-hidden for the HARD CROP effect */}
            <div className="relative w-full h-[280px] sm:h-[350px] md:h-[500px] overflow-hidden rounded-t-[24px] sm:rounded-t-[32px] md:rounded-t-[60px]">
              <Image
                src="/Group 6.png"
                alt="Family gathering"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </motion.div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="flex flex-col items-center justify-start py-16 md:py-24 px-4 bg-white w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="w-full max-w-6xl flex flex-col items-center"
          >

            {/* Section Label */}
            <motion.span variants={fadeInUp} className="text-sm font-bold tracking-widest text-[#260E01]/50 mb-4 uppercase">
              How it works
            </motion.span>

            {/* Main Heading */}
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#260E01] mb-6 text-center leading-tight px-2">
              Get Your Family System <br className="hidden md:block" /> Running in Minutes
            </motion.h2>

            {/* Sub-text */}
            <motion.p variants={fadeInUp} className="text-base md:text-lg text-[#260E01]/50 text-center max-w-2xl mb-10 md:mb-16 leading-relaxed px-2">
              Set up your family space, invite members, and start organizing chores, events, groceries, and memories together all in one calm place.
            </motion.p>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 w-full">

              {/* Card 1 */}
              <motion.div variants={fadeInUp} whileHover={{ y: -5 }} className="bg-[#772D08] rounded-[24px] md:rounded-[32px] p-6 md:p-10 text-white flex flex-col items-start min-h-[280px] md:min-h-[320px] shadow-lg">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold mb-8">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-4">Create Your Family Account</h3>
                <p className="text-white/80 leading-relaxed">
                  Sign up and set up your family name to create your private family space inside Tribe.
                </p>
              </motion.div>

              {/* Card 2 */}
              <motion.div variants={fadeInUp} whileHover={{ y: -5 }} className="bg-[#772D08] rounded-[24px] md:rounded-[32px] p-6 md:p-10 text-white flex flex-col items-start min-h-[280px] md:min-h-[320px] shadow-lg">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold mb-8">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-4">Invite Your Family Members</h3>
                <p className="text-white/80 leading-relaxed">
                  Invite family members, assign their roles, and bring everyone into the same shared system.
                </p>
              </motion.div>

              {/* Card 3 */}
              <motion.div variants={fadeInUp} whileHover={{ y: -5 }} className="bg-[#772D08] rounded-[24px] md:rounded-[32px] p-6 md:p-10 text-white flex flex-col items-start min-h-[280px] md:min-h-[320px] shadow-lg">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold mb-8">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-4">Manage Daily Life Together</h3>
                <p className="text-white/80 leading-relaxed">
                  Create chores with points, plan events, manage groceries, and build lasting family memoirs in one place.
                </p>
              </motion.div>

            </div>
          </motion.div>
        </section>

        {/* FEATURES SECTION */}
        <section className="flex flex-col items-center justify-start py-16 md:py-24 px-4 bg-white w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="w-full max-w-6xl flex flex-col items-center"
          >

            {/* Section Label */}
            <motion.span variants={fadeInUp} className="text-sm font-bold tracking-widest text-[#772D08] mb-4 uppercase">
              Features
            </motion.span>

            {/* Main Heading */}
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#260E01] mb-6 text-center leading-tight px-2">
              Everything Your Family Needs, In One Place
            </motion.h2>

            {/* Sub-text */}
            <motion.p variants={fadeInUp} className="text-base md:text-lg text-[#260E01]/50 text-center max-w-3xl mb-10 md:mb-16 leading-relaxed px-2">
              Tribe brings together chores, events, groceries, memories, and AI help into a single shared system designed for parents, grandparents, and kids.
            </motion.p>

            {/* Bento Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

              {/* Top Row - Two Cards */}
              {/* Card 1 - Chore Tracker */}
              <div className="bg-white flex flex-col overflow-hidden">
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image
                    src="/feature-1.png"
                    alt="Chores Tracker"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="px-4 pt-3 pb-5 md:pb-6">
                  <h3 className="text-xl md:text-2xl font-medium text-[#260E01] mb-2">Chores With Points, Not Arguments</h3>
                  <p className="text-[#260E01]/60 leading-relaxed">
                    Assign tasks, set points, and let kids earn rewards while parents track progress without constant reminders.
                  </p>
                </div>
              </div>

              {/* Card 2 - Events Tracker */}
              <div className="bg-white flex flex-col overflow-hidden">
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image
                    src="/feature-2.png"
                    alt="Events Tracker"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="px-4 pt-3 pb-5 md:pb-6">
                  <h3 className="text-xl md:text-2xl font-medium text-[#260E01] mb-2">Never Miss What Matters</h3>
                  <p className="text-[#260E01]/60 leading-relaxed">
                    Plan family events, school activities, and important dates where everyone can see and stay aligned.
                  </p>
                </div>
              </div>

              {/* Middle Row - Wide AI Card (full width) */}
              <div className="bg-white flex flex-col md:col-span-2 overflow-hidden">
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image
                    src="/feature-3.png"
                    alt="AI Assistant"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="px-4 pt-3 pb-5 md:pb-6">
                  <h3 className="text-xl md:text-2xl font-medium text-[#260E01] mb-2">Your Family&apos;s Built-in AI Assistant</h3>
                  <p className="text-[#260E01]/60 leading-relaxed max-w-2xl">
                    Ask questions, get help, summarize information, and support daily decisions with AI that&apos;s part of your family system.
                  </p>
                </div>
              </div>

              {/* Bottom Row - Two Cards */}
              {/* Card 3 - Memoir */}
              <div className="bg-white flex flex-col overflow-hidden">
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image
                    src="/image-image.png"
                    alt="Family Memoir"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="px-4 pt-3 pb-5 md:pb-6">
                  <h3 className="text-xl md:text-2xl font-medium text-[#260E01] mb-2">Preserve Stories Before They&apos;re Forgotten</h3>
                  <p className="text-[#260E01]/60 leading-relaxed">
                    Turn photos and prompts into meaningful questions that family members answer and keep as memories forever.
                  </p>
                </div>
              </div>

              {/* Card 4 - Grocery Lists */}
              <div className="bg-white flex flex-col overflow-hidden">
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image
                    src="/feature-5.png"
                    alt="Grocery Lists"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="px-4 pt-3 pb-5 md:pb-6">
                  <h3 className="text-xl md:text-2xl font-medium text-[#260E01] mb-2">Shared Grocery Lists That Actually Work</h3>
                  <p className="text-[#260E01]/60 leading-relaxed">
                    Create and manage grocery lists together so anyone passing by the store knows exactly what to pick up.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* TESTIMONIAL SECTION */}
        <section className="flex flex-col items-center justify-center py-24 md:py-32 px-4 bg-[#F9F6F0] w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="w-full max-w-3xl flex flex-col items-center text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6 md:mb-8 opacity-80">
              <span className="text-4xl md:text-5xl lg:text-6xl text-[#772D08]">“</span>
            </motion.div>

            <motion.h3 variants={fadeInUp} className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#260E01] mb-8 md:mb-10 leading-relaxed px-4 md:px-0">
              We used to have sticky notes everywhere. Now everything is in Tribe, and for the first time, my parents feel included in the daily loop.
            </motion.h3>

            <motion.div variants={fadeInUp} className="flex flex-col items-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden mb-3 border-2 border-[#772D08]/10">
                <Image
                  src="/Avatar.png"
                  alt="Sarah J."
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <p className="text-base font-bold text-[#260E01]">Sarah J.</p>
              <p className="text-sm text-[#260E01]/50">Mom of two, Chicago</p>
            </motion.div>
          </motion.div>
        </section>

        {/* FAQ SECTION */}
        <section className="flex flex-col items-center justify-start py-16 md:py-24 px-4 bg-white w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="w-full max-w-3xl flex flex-col items-center"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-[#260E01] mb-3 text-center px-2">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-[#260E01]/50 mb-10 md:mb-12 text-center px-2">
              Everything you need to know about the Tribe Family System.
            </motion.p>

            <motion.div variants={fadeInUp} className="w-full">
              <FAQAccordion />
            </motion.div>
          </motion.div>
        </section>

        {/* CTA BOTTOM SECTION */}
        <section className="relative flex flex-col items-center justify-center py-40 px-4 bg-[#F9F6F0] w-full overflow-hidden min-h-[600px]">

          {/* Avatar - Granny (arc position: upper left) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, rotate: -5, transition: { duration: 0.3 } }}
            viewport={{ once: true }}
            transition={{ delay: 0, duration: 0.5 }}
            className="hidden md:block absolute top-[20%] left-[12%] md:left-[18%] lg:left-[22%] animate-float cursor-pointer"
            style={{ animationDelay: '0s' }}
          >
            <Image
              src="/granny.png"
              alt="Grandmother"
              width={200}
              height={200}
              className="drop-shadow-md hover:drop-shadow-xl transition-all duration-300"
            />
          </motion.div>

          {/* Avatar - Dad (arc position: top center) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5, transition: { duration: 0.3 } }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="hidden md:block absolute top-[5%] left-1/2 -translate-x-1/2 animate-float cursor-pointer"
            style={{ animationDelay: '0.5s' }}
          >
            <Image
              src="/dad.png"
              alt="Father"
              width={220}
              height={220}
              className="drop-shadow-md hover:drop-shadow-xl transition-all duration-300"
            />
          </motion.div>

          {/* Avatar - Grandpa (arc position: far left) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, rotate: -5, transition: { duration: 0.3 } }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden md:block absolute top-[65%] left-[3%] md:left-[8%] lg:left-[12%] -translate-y-1/2 animate-float cursor-pointer"
            style={{ animationDelay: '1s' }}
          >
            <Image
              src="/grandpa.png"
              alt="Grandfather"
              width={200}
              height={200}
              className="drop-shadow-md hover:drop-shadow-xl transition-all duration-300"
            />
          </motion.div>

          {/* Avatar - Mom (arc position: upper right) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5, transition: { duration: 0.3 } }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden md:block absolute top-[20%] right-[12%] md:right-[18%] lg:right-[22%] animate-float cursor-pointer"
            style={{ animationDelay: '1.5s' }}
          >
            <Image
              src="/mom.png"
              alt="Mother"
              width={200}
              height={200}
              className="drop-shadow-md hover:drop-shadow-xl transition-all duration-300"
            />
          </motion.div>

          {/* Avatar - Child (arc position: far right) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, rotate: -5, transition: { duration: 0.3 } }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="hidden md:block absolute top-[65%] right-[3%] md:right-[8%] lg:right-[12%] -translate-y-1/2 animate-float cursor-pointer"
            style={{ animationDelay: '2s' }}
          >
            <Image
              src="/child.png"
              alt="Child"
              width={200}
              height={200}
              className="drop-shadow-md hover:drop-shadow-xl transition-all duration-300"
            />
          </motion.div>

          {/* Center Content */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mt-24">

            {/* Main Heading */}
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#260E01] mb-10 leading-tight"
            >
              One Place for Everything<br />Your Family Runs On
            </motion.h2>

            {/* CTA Button */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <Link
                href="/user-auth"
                className="bg-[#772D08] text-white text-lg font-semibold px-10 py-4 rounded-[12px] hover:bg-[#5a2206] transition-all duration-300 shadow-md hover:shadow-lg inline-block"
              >
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  Get started
                </motion.span>
              </Link>
            </motion.div>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="bg-[#772D08] text-white py-16 px-4 w-full">
          <div className="max-w-6xl mx-auto">

            {/* Top Section */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-12 mb-12">

              {/* Logo & Tagline */}
              <div className="flex flex-col items-center md:items-start">
                <Image
                  src="/tribe-logo-white.png"
                  alt="Tribe"
                  width={120}
                  height={40}
                  className="mb-4"
                />
                <p className="text-white/70 text-sm max-w-xs text-center md:text-left">
                  One place for everything your family runs on.
                </p>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-wrap justify-center md:justify-end gap-8 md:gap-12">
                <div className="flex flex-col gap-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wider mb-2">Product</h4>
                  <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Features</a>
                  <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Pricing</a>
                  <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">FAQ</a>
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wider mb-2">Company</h4>
                  <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">About</a>
                  <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Blog</a>
                  <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Contact</a>
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wider mb-2">Legal</h4>
                  <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Privacy</a>
                  <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Terms</a>
                </div>
              </div>

            </div>

            {/* Divider */}
            <div className="border-t border-white/20 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-white/50 text-sm">
                  © 2026 Tribe. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                  <a href="#" className="text-white/50 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-white/50 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-white/50 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </footer>
      </main>
    </div>
  );
}


