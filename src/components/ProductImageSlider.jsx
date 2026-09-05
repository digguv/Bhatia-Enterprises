import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';

const ProductImageSlider = ({
    images = [],
    name = 'Product',
    autoSlide = true,
    interval = 3200,
    className = ''
}) => {
    // Normalize images: accept array of strings or single string
    const imageList = Array.isArray(images)
        ? images.filter(img => typeof img === 'string' && img.trim() !== '')
        : (images ? [images] : []);

    const safeImages = imageList.length > 0 ? imageList : ['https://placehold.co/400?text=Product'];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef(null);

    // Keep currentIndex in bounds if images change
    useEffect(() => {
        if (currentIndex >= safeImages.length) {
            setCurrentIndex(0);
        }
    }, [safeImages.length, currentIndex]);

    // Auto-slide effect
    useEffect(() => {
        if (!autoSlide || safeImages.length <= 1) return;

        timerRef.current = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % safeImages.length);
        }, interval);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [autoSlide, safeImages.length, interval, isHovered]);

    const handlePrev = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex(prev => (prev - 1 + safeImages.length) % safeImages.length);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex(prev => (prev + 1) % safeImages.length);
    };

    const handleDotClick = (e, idx) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex(idx);
    };

    return (
        <div
            className={`relative w-full h-full overflow-hidden select-none group/slider ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Sliding images */}
            {safeImages.map((src, index) => {
                const isActive = index === currentIndex;
                return (
                    <div
                        key={src + index}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                            isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                    >
                        <img
                            src={src}
                            alt={`${name} - view ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/400?text=Product';
                            }}
                        />
                    </div>
                );
            })}

            {/* Multiple images indicator & controls */}
            {safeImages.length > 1 && (
                <>
                    {/* Slides badge */}
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-md pointer-events-none">
                        <Images size={10} />
                        <span>{currentIndex + 1}/{safeImages.length}</span>
                    </div>

                    {/* Left / Right arrows on hover */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-all active:scale-95"
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-all active:scale-95"
                        aria-label="Next image"
                    >
                        <ChevronRight size={16} />
                    </button>

                    {/* Bottom Dots / Pill indicators */}
                    <div className="absolute bottom-2 inset-x-0 z-20 flex items-center justify-center gap-1.5 px-2 pointer-events-auto">
                        {safeImages.map((_, idx) => {
                            const isSelected = idx === currentIndex;
                            return (
                                <button
                                    key={idx}
                                    onClick={(e) => handleDotClick(e, idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                                        isSelected
                                            ? 'w-5 bg-white shadow-black/40'
                                            : 'w-1.5 bg-white/60 hover:bg-white'
                                    }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductImageSlider;
