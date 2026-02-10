import React from 'react';
import type { DragonDNA } from '../logic/DragonGenetics';

interface PixelDragonProps {
    dna: DragonDNA;
    size?: number; // Pixel size multiplier
}

// --- Pixel Art Binary Masks (16x16 Grid optimized) ---
// 1 = Primary, 2 = Secondary, 3 = Eye, 0 = Empty

const HEADS = {
    SAURIAN: [
        "......111.......",
        ".....11111......",
        "....1113111.....",
        "....1111111.....",
        ".....11111......"
    ],
    BEAST: [
        "......11........",
        ".....1111.......",
        "....111311......",
        "....1111111.....",
        ".....11111......"
    ],
    SERPENT: [
        ".......11.......",
        "......1111......",
        ".....11311......",
        ".....11111......",
        "......111......."
    ]
};

const BODIES = [
    "......11........",
    ".....1121.......",
    "....112211......",
    "...1122211......",
    "....11211......."
];

const WINGS = {
    BAT: [
        "..11.....11.....",
        ".111.....111....",
        "111.......111...",
        ".1.........1...."
    ],
    FEATHERED: [
        "..222...222.....",
        ".2222...2222....",
        "2222.....2222...",
        ".22.......22...."
    ],
    ENERGY: [
        "..33.....33.....",
        ".333.....333....",
        "3.3.......3.3...",
        "................"
    ],
    NONE: [
        "................",
        "................",
        "................",
        "................"
    ]
};

const TAILS = {
    SPIKED: [
        "....1...........",
        "...11...........",
        "..11............",
        ".11............."
    ],
    FINNED: [
        "....2...........",
        "...22...........",
        "..222...........",
        ".22............."
    ],
    WHIP: [
        "....1...........",
        "...1............",
        "..1.............",
        ".1.............."
    ]
};

const PixelDragon: React.FC<PixelDragonProps> = ({ dna, size = 10 }) => {
    // Canvas size 16x16
    const renderPixel = (x: number, y: number, colorCode: string) => {
        let fill = 'transparent';
        if (colorCode === '1') fill = dna.palette.primary;
        if (colorCode === '2') fill = dna.palette.secondary;
        if (colorCode === '3') fill = dna.palette.eye;

        if (fill === 'transparent') return null;

        return (
            <rect
                key={`${x}-${y}`}
                x={x * size}
                y={y * size}
                width={size}
                height={size}
                fill={fill}
            />
        );
    };

    const drawPart = (part: string[], startY: number) => {
        return part.flatMap((row, y) =>
            row.split('').map((col, x) => renderPixel(x, startY + y, col))
        );
    };

    return (
        <svg
            width={16 * size}
            height={16 * size}
            viewBox={`0 0 ${16 * size} ${16 * size}`}
            style={{ imageRendering: 'pixelated' }}
        >
            {/* Render Order: Wings -> Tail -> Body -> Head */}
            {drawPart(WINGS[dna.wingType], 4)}
            {drawPart(TAILS[dna.tailType], 10)}
            {drawPart(BODIES, 6)}
            {drawPart(HEADS[dna.headType], 2)}
        </svg>
    );
};

export default PixelDragon;
