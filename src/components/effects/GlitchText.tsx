import React from 'react';
import clsx from 'clsx';
import '../../index.css';

interface GlitchTextProps {
    text: string;
    as?: React.ElementType;
    className?: string;
    colors?: [string, string]; // [Main, Glitch]
}

const GlitchText: React.FC<GlitchTextProps> = ({
    text,
    as: Component = 'span',
    className,
    colors = ['text-white', 'text-blue-500']
}) => {
    return (
        <Component className={clsx("relative inline-block group", className)}>
            <span className="relative z-10">{text}</span>
            <span className={clsx("absolute top-0 left-0 -z-10 opacity-0 group-hover:opacity-70 group-hover:animate-pulse translate-x-[2px]", colors[1])}>
                {text}
            </span>
            <span className={clsx("absolute top-0 left-0 -z-10 opacity-0 group-hover:opacity-70 group-hover:animate-pulse -translate-x-[2px]", colors[1])}>
                {text}
            </span>
        </Component>
    );
};

export default GlitchText;
