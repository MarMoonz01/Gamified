import React, { useState } from 'react';
import { useDragonStore } from '../../logic/dragonStore';
import { BookOpen, CheckCircle, Highlighter, Split } from 'lucide-react';
import Parchment from '../../components/ui/Parchment';

const ReadingDojo: React.FC = () => {
    const { gainXp } = useDragonStore();
    const [highlightMode, setHighlightMode] = useState(false);
    const [selectedText, setSelectedText] = useState<string[]>([]);

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
        if (!highlightMode) return;
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
            setSelectedText([...selectedText, selection.toString()]);
            // In a real app, complex text node manipulation is needed. 
            // Here we just store strings for "notes".
        }
    };

    return (
        <div className="w-full h-full p-4 flex gap-4 max-w-7xl mx-auto">
            {/* Left: Passage */}
            <div className="flex-1 h-full flex flex-col">
                <div className="bg-fantasy-paper-dark p-3 rounded-t-lg flex justify-between items-center">
                    <h2 className="font-medieval text-fantasy-wood-dark flex items-center gap-2">
                        <BookOpen size={20} /> The Scroll
                    </h2>
                    <button
                        onClick={() => setHighlightMode(!highlightMode)}
                        className={`p-2 rounded ${highlightMode ? 'bg-yellow-400 text-black shadow-lg' : 'bg-fantasy-wood/10 text-fantasy-wood-dark'}`}
                    >
                        <Highlighter size={16} /> {highlightMode ? 'HIGHLIGHTER ON' : 'HIGHLIGHT'}
                    </button>
                </div>
                <div
                    className="flex-1 bg-fantasy-paper p-8 overflow-y-auto font-serif text-lg leading-loose text-fantasy-wood-dark shadow-inner text-justify"
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
