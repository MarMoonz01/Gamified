import React from 'react';
import clsx from 'clsx';

interface ParchmentProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'clean' | 'aged' | 'burned';
    title?: string;
}

const Parchment: React.FC<ParchmentProps> = ({ children, className, variant = 'aged', title }) => {
    return (
        <div className={clsx(
            "relative flex flex-col h-full overflow-hidden transition-all duration-300",
            // Base paper style
            "bg-fantasy-paper text-fantasy-ink shadow-lg rounded-sm",

            // Variants
            variant === 'aged' && "bg-fantasy-parchment border-4 border-fantasy-wood/30 shadow-[inset_0_0_40px_rgba(93,64,55,0.2)]",
            variant === 'clean' && "bg-fantasy-paper-light border border-fantasy-paper-dark shadow-sm",
            variant === 'burned' && "bg-[#d7ccc8] border-none shadow-xl", // Placeholder for burned edge effect

            className
        )}>
            {/* Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

            {/* Header / Title Area (Wax Seal Style) */}
            {title && (
                <div className="relative z-10 px-6 py-4 border-b-2 border-fantasy-ink/10 flex items-center justify-center bg-fantasy-wood/5">
                    <div className="absolute top-2 w-full h-[1px] bg-gradient-to-r from-transparent via-fantasy-gold/50 to-transparent"></div>
                    <h2 className="font-fantasy text-xl font-bold text-fantasy-wood-dark tracking-widest drop-shadow-sm uppercase">
                        {title}
                    </h2>
                    <div className="absolute bottom-2 w-full h-[1px] bg-gradient-to-r from-transparent via-fantasy-gold/50 to-transparent"></div>
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-fantasy-leather scrollbar-track-transparent">
                {children}
            </div>

            {/* Corner Decorations (optional, CSS based) */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-fantasy-wood/20 rounded-tl-lg pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-fantasy-wood/20 rounded-tr-lg pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-fantasy-wood/20 rounded-bl-lg pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-fantasy-wood/20 rounded-br-lg pointer-events-none"></div>
        </div>
    );
};

export default Parchment;
