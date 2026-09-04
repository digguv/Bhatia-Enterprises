import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, PenTool, Palette, ShoppingBag } from 'lucide-react';

const SLIDES = [
    {
        icon: PenTool,
        tag: 'New Arrivals',
        title: 'Premium Writing Instruments',
        subtitle: 'Pens, notebooks & everyday essentials for your workspace.',
        gradient: 'from-slate-900 via-slate-800 to-indigo-900',
    },
    {
        icon: Palette,
        tag: 'Trending',
        title: 'Art & Craft Supplies',
        subtitle: 'Everything you need to create, back in stock.',
        gradient: 'from-indigo-950 via-slate-900 to-slate-800',
    },
    {
        icon: ShoppingBag,
        tag: 'Best Sellers',
        title: 'Back to School Essentials',
        subtitle: 'Stock up on bags, files & stationery in one place.',
        gradient: 'from-emerald-950 via-slate-900 to-slate-800',
    },
];

const Hero = ({ name }) => {
    const [index, setIndex] = useState(0);

    const goTo = useCallback((i) => {
        setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => goTo(index + 1), 4500);
        return () => clearInterval(timer);
    }, [index, goTo]);

    const slide = SLIDES[index];
    const Icon = slide.icon;

    return (
        <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${slide.gradient} text-white shadow-2xl transition-colors duration-700`}>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-black/20 rounded-full blur-3xl" />

            <div className="relative px-6 py-10 sm:px-10 md:px-14 md:py-16 min-h-[210px] sm:min-h-[240px] md:min-h-[300px] flex flex-col justify-center">
                <span key={`tag-${index}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-[10px] font-black uppercase tracking-widest mb-4 w-fit animate-fade-in-up">
                    <Icon size={12} /> {slide.tag}
                </span>
                <h1 key={`title-${index}`} className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2 max-w-xl animate-fade-in-up">
                    {slide.title}
                </h1>
                <p key={`sub-${index}`} className="text-slate-200 text-xs sm:text-sm md:text-base font-medium max-w-xl animate-fade-in-up">
                    {slide.subtitle}
                </p>
                {name && (
                    <p className="mt-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/60">
                        Welcome back, {name}
                    </p>
                )}
            </div>

            <button
                onClick={() => goTo(index - 1)}
                aria-label="Previous slide"
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur items-center justify-center transition-all"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={() => goTo(index + 1)}
                aria-label="Next slide"
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur items-center justify-center transition-all"
            >
                <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Hero;
