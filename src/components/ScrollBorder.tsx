import React from 'react';

const ScrollBorder: React.FC<{ children: React.ReactNode, title?: string, className?: string }> = ({ children, title, className = "" }) => {
    return (
        <div className={`relative p-8 pt-12 bg-[#FDF6E3] border-x-2 border-[#5D4037] shadow-xl rounded-sm ${className}`}>
            {/* Top Roll */}
            <div className="absolute top-0 left-[-10px] right-[-10px] h-6 bg-gradient-to-b from-[#8B4513] to-[#5D4037] rounded-full shadow-lg z-20 flex items-center justify-center border-b border-black/20">
                <div className="w-[98%] h-[2px] bg-[#D4AF37]/50" />
            </div>

            {/* Bottom Roll */}
            <div className="absolute bottom-0 left-[-10px] right-[-10px] h-8 bg-gradient-to-b from-[#5D4037] to-[#2C1810] rounded-full shadow-lg z-20 flex items-center justify-center border-t border-white/10">
                <div className="w-[98%] h-[2px] bg-[#D4AF37]/50" />
            </div>

            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

            {/* Title */}
            {title && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
                    <h2 className="font-medieval text-2xl text-[#2C1810] uppercase tracking-widest border-b-2 border-[#D4AF37] pb-1 shadow-sm px-6">
                        {title}
                    </h2>
                </div>
            )}

            {/* Content */}
            <div className="relative z-0 h-full overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default ScrollBorder;
