import React, { useState } from 'react';
import { BookOpen, Highlighter, ArrowLeft, PlusCircle, Loader } from 'lucide-react';
import { useDragonStore } from '../../logic/dragonStore';
import { geminiService } from '../../logic/GeminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadingDojoProps {
    onBack: () => void;
}

const ReadingDojo: React.FC<ReadingDojoProps> = ({ onBack }) => {
    const { addVocab } = useDragonStore(state => ({ addVocab: state.addVocab }));
    const [highlightMode, setHighlightMode] = useState(false);
    const [selectionState, setSelectionState] = useState<{ text: string; top: number; left: number } | null>(null);
    const [loadingDef, setLoadingDef] = useState(false);

    // Mock Data
    const passage = `
    Urban farming is the practice of cultivating, processing, and distributing food in or around urban areas. 
    It is also known as urban agriculture, urban gardening, or urban horticulture. 
    
    Urban farming can reflect varying levels of economic and social development. 
    In the Global North, it often takes the form of social movement for sustainable communities, where organic growers, "foodies," and locavores form social networks founded on a shared ethos of nature and community holism. 
    These networks can evolve when receiving formal institutional support, becoming integrated into local town planning as a "transition town" movement for sustainable urban development. 
    In the developing South, food security, nutrition, and income generation are key motivations for the practice. 
    In either case, more direct access to fresh vegetables, fruits, and meat products through urban farming can improve food security and food safety.
    `;

    const questions = [
        { id: 1, text: "Urban farming is only practiced in the Global North.", options: ["TRUE", "FALSE", "NOT GIVEN"], answer: 1 },
        { id: 2, text: "Food security is a motivation in the developing South.", options: ["TRUE", "FALSE", "NOT GIVEN"], answer: 0 }
    ];

    const [answers, setAnswers] = useState<Record<number, number>>({});

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            const text = selection.toString().trim();
            if (text.length > 30) return; // Ignore long selections

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Adjust for container scroll/offset if needed, but fixed position is easier for popper
            setSelectionState({
                text,
                top: rect.top,
                left: rect.left + (rect.width / 2)
            });
        } else {
            setSelectionState(null);
        }
    };

    const addToGrimoire = async () => {
        if (!selectionState) return;
        setLoadingDef(true);
        try {
            const def = await geminiService.fetchDefinition(selectionState.text);
            if (def) {
                addVocab(selectionState.text, def.definition, def.type, def.example);
                // playSound('WRITE');
                alert(`Added "${selectionState.text}" to Grimoire!`); // Replace with toast later
                setSelectionState(null);
                window.getSelection()?.removeAllRanges();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDef(false);
        }
    };

    return (
        <div className="w-full h-full p-4 flex gap-4 max-w-7xl mx-auto relative" onClick={() => setSelectionState(null)}>
            {/* Popover */}
            <AnimatePresence>
                {selectionState && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: -50, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ top: selectionState.top, left: selectionState.left }}
                        className="fixed z-50 -translate-x-1/2 bg-slate-900 text-white p-2 rounded-lg shadow-xl border border-fantasy-gold flex items-center gap-2 pointer-events-auto cursor-pointer hover:bg-slate-800"
                        onClick={(e) => { e.stopPropagation(); addToGrimoire(); }}
                    >
                        {loadingDef ? <Loader className="animate-spin" size={16} /> : <PlusCircle size={16} className="text-fantasy-gold" />}
                        <span className="font-bold text-sm whitespace-nowrap">Add to Grimoire</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Left: Passage */}
            <div className="flex-1 h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <header className="flex justify-between items-center mb-8 border-b-2 border-[#D4AF37] pb-4">
                    <h1 className="text-4xl font-medieval text-[#2C1810] flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                            <ArrowLeft size={32} />
                        </button>
                        <BookOpen size={40} className="text-[#D4AF37]" />
                        The Grand Library
                    </h1>

                    <button
                        onClick={() => setHighlightMode(!highlightMode)}
                        className={`p-2 rounded flex items-center gap-2 transition-colors ${highlightMode ? 'bg-yellow-400 text-black shadow-lg' : 'bg-fantasy-wood/10 text-fantasy-wood-dark'}`}
                    >
                        <Highlighter size={16} /> {highlightMode ? 'HIGHLIGHTER ON' : 'HIGHLIGHT'}
                    </button>
                </header>

                <div
                    className="flex-1 bg-fantasy-paper p-8 overflow-y-auto font-serif text-lg leading-loose text-fantasy-wood-dark shadow-inner text-justify relative"
                    onMouseUp={handleTextSelection}
                >
                    {passage}
                </div>
            </div>

            {/* Right: Questions */}
            <div className="w-1/3 h-full flex flex-col bg-white/80 backdrop-blur rounded-lg border-l-4 border-fantasy-gold">
                <div className="p-6 border-b border-fantasy-wood/10">
                    <h2 className="font-bold uppercase tracking-widest text-fantasy-wood-dark">Questions</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {questions.map((q, i) => (
                        <div key={q.id}>
                            <p className="font-bold text-fantasy-wood-dark mb-3">{i + 1}. {q.text}</p>
                            <div className="space-y-2">
                                {q.options.map((opt, idx) => (
                                    <label key={idx} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-black/5 rounded">
                                        <input
                                            type="radio"
                                            name={`q-${q.id}`}
                                            checked={answers[q.id] === idx}
                                            onChange={() => setAnswers({ ...answers, [q.id]: idx })}
                                            className="accent-fantasy-gold w-4 h-4"
                                        />
                                        <span className="text-sm font-mono text-fantasy-wood-dark">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-fantasy-wood/10">
                    <button className="w-full py-3 bg-fantasy-wood text-fantasy-paper font-bold uppercase tracking-widest rounded shadow hover:bg-fantasy-wood-dark transition">
                        Submit Answers
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReadingDojo;
