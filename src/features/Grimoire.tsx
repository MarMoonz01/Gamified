import React, { useState } from 'react';
import { useDragonStore } from '../logic/dragonStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Plus, Search, Check, X, Feather, Clock } from 'lucide-react';
import Parchment from '../components/ui/Parchment';

const Grimoire: React.FC = () => {
    const { vocabList, addVocab, practiceVocab } = useDragonStore();
    const [view, setView] = useState<'LIST' | 'ADD' | 'SCRIBE'>('LIST');

    // Add Form State
    const [newWord, setNewWord] = useState('');
    const [newMeaning, setNewMeaning] = useState('');
    const [newType, setNewType] = useState<'n' | 'v' | 'adj' | 'adv' | 'phrase'>('n');

    // Scribe Mode State
    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
    const [scribeInput, setScribeInput] = useState('');
    const [feedback, setFeedback] = useState<'NONE' | 'CORRECT' | 'WRONG'>('NONE');

    // Filter
    const [filterText, setFilterText] = useState('');
    const [srsFilter, setSrsFilter] = useState<'ALL' | 'DUE'>('ALL');

    const dueWords = vocabList.filter(w => w.nextReviewDate <= Date.now());

    const filteredList = vocabList.filter(v => {
        const matchesText = v.word.toLowerCase().includes(filterText.toLowerCase()) || v.meaning.toLowerCase().includes(filterText.toLowerCase());
        const matchesSRS = srsFilter === 'ALL' || (srsFilter === 'DUE' && v.nextReviewDate <= Date.now());
        return matchesText && matchesSRS;
    });

    const handleAdd = () => {
        if (!newWord || !newMeaning) return;
        addVocab(newWord, newMeaning, newType);
        setNewWord('');
        setNewMeaning('');
        setView('LIST');
    };

    const handleScribeSubmit = () => {
        const targetWord = filteredList[currentDrillIndex];
        if (scribeInput.toLowerCase().trim() === targetWord.word.toLowerCase()) {
            setFeedback('CORRECT');
            practiceVocab(targetWord.id, true);
            setTimeout(() => {
                setFeedback('NONE');
                setScribeInput('');
                if (currentDrillIndex < filteredList.length - 1) {
                    setCurrentDrillIndex(prev => prev + 1);
                } else {
                    setView('LIST'); // End of drill
                }
            }, 1000);
        } else {
            setFeedback('WRONG');
            practiceVocab(targetWord.id, false);
            setTimeout(() => setFeedback('NONE'), 1000);
        }
    };

    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-medieval text-fantasy-gold drop-shadow-md">The Grimoire</h1>
                    <p className="text-fantasy-paper/60 italic font-serif">"Words have power. Inscribe them into your soul."</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setSrsFilter(srsFilter === 'ALL' ? 'DUE' : 'ALL')}
                        className={`px-4 py-2 rounded font-bold transition flex items-center gap-2 ${srsFilter === 'DUE' ? 'bg-red-800 text-white shadow-lg' : 'bg-fantasy-wood/10 text-fantasy-wood-dark hover:bg-fantasy-wood/20'}`}
                    >
                        <Clock size={16} />
                        {srsFilter === 'ALL' ? `REVIEW DUE (${dueWords.length})` : 'SHOW ALL'}
                    </button>

                    <button
                        onClick={() => setView('ADD')}
                        className="px-4 py-2 bg-fantasy-wood hover:bg-fantasy-wood-dark border border-fantasy-gold/30 rounded flex items-center gap-2 transition-colors text-fantasy-paper"
                    >
                        <Plus size={18} /> Inscribe Word
                    </button>
                    <button
                        onClick={() => {
                            if (vocabList.length === 0) {
                                alert("Your Grimoire is empty! Inscribe some words first.");
                                return;
                            }
                            setView('SCRIBE');
                            setCurrentDrillIndex(0);
                        }}
                        className={`px-4 py-2 bg-fantasy-gold hover:bg-yellow-500 text-fantasy-wood-dark font-bold rounded flex items-center gap-2 transition-colors shadow-lg ${vocabList.length === 0 ? 'opacity-50 grayscale' : ''}`}
                    >
                        <Feather size={18} /> Scribe Mode
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {view === 'LIST' && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex-1 flex flex-col gap-4 overflow-hidden"
                    >
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fantasy-wood/50" size={18} />
                            <input
                                type="text"
                                placeholder="Search your lexicon..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-black/30 border-2 border-fantasy-wood/30 rounded-lg text-fantasy-paper focus:border-fantasy-gold/50 outline-none font-serif placeholder:italic"
                            />
                        </div>

                        {/* Vocab Grid */}
                        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2 custom-scrollbar">
                            {filteredList.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center text-fantasy-wood/40 h-64 italic">
                                    <Book size={48} className="mb-4 opacity-50" />
                                    Your grimoire is empty. Inscribe new words to begin.
                                </div>
                            ) : (
                                filteredList.map(word => (
                                    <div key={word.id} className="relative group perspective">
                                        <div className={`bg-fantasy-paper border-2 p-4 rounded shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group-hover:border-fantasy-wood/50 ${word.nextReviewDate <= Date.now() ? 'border-red-400' : 'border-fantasy-wood/20'}`}>
                                            {word.nextReviewDate <= Date.now() && (
                                                <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow animate-pulse z-10">
                                                    DUE
                                                </div>
                                            )}
                                            {/* Mastery Indicator */}
                                            <div className="absolute top-2 right-2 flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-1.5 h-1.5 rounded-full ${i < word.mastery ? 'bg-fantasy-gold' : 'bg-fantasy-wood/20'}`}
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex items-baseline gap-2 mb-1">
                                                <h3 className="text-xl font-bold font-serif text-fantasy-wood-dark">{word.word}</h3>
                                                <span className="text-xs font-mono text-fantasy-wood/60 italic">({word.type}.)</span>
                                            </div>
                                            <p className="text-fantasy-wood/80 text-sm leading-relaxed border-t border-fantasy-wood/10 pt-2 mt-1">
                                                {word.meaning}
                                            </p>
                                            {word.example && (
                                                <p className="text-fantasy-wood/60 text-xs italic mt-2 bg-black/5 p-2 rounded">
                                                    "{word.example}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {view === 'ADD' && (
                    <motion.div
                        key="add"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex-1 flex items-center justify-center p-4"
                    >
                        <Parchment className="w-full max-w-2xl p-8 flex flex-col gap-6" variant="clean">
                            <div className="flex justify-between items-center border-b border-fantasy-wood/20 pb-4">
                                <h2 className="text-2xl font-medieval text-fantasy-wood-dark">Inscribe New Knowledge</h2>
                                <button onClick={() => setView('LIST')} className="text-fantasy-wood/50 hover:text-red-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-fantasy-wood/60 mb-1">Word / Phrase</label>
                                    <input
                                        autoFocus
                                        value={newWord}
                                        onChange={(e) => setNewWord(e.target.value)}
                                        className="w-full text-2xl font-serif bg-transparent border-b-2 border-fantasy-wood/30 py-2 focus:border-fantasy-wood outline-none text-fantasy-wood-dark placeholder:text-fantasy-wood/20"
                                        placeholder="e.g. Ephemeral"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-fantasy-wood/60 mb-1">Type</label>
                                    <select
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value as any)}
                                        className="w-full h-full bg-fantasy-paper-dark/50 border-2 border-fantasy-wood/20 rounded text-fantasy-wood-dark font-mono text-center focus:border-fantasy-wood outline-none"
                                    >
                                        <option value="n">noun (n)</option>
                                        <option value="v">verb (v)</option>
                                        <option value="adj">adjective (adj)</option>
                                        <option value="adv">adverb (adv)</option>
                                        <option value="phrase">phrase</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-fantasy-wood/60 mb-1">Meaning / Definition</label>
                                <textarea
                                    value={newMeaning}
                                    onChange={(e) => setNewMeaning(e.target.value)}
                                    rows={3}
                                    className="w-full bg-fantasy-paper-dark/20 border-2 border-fantasy-wood/20 rounded p-4 text-fantasy-wood-dark focus:border-fantasy-wood outline-none resize-none font-serif text-lg leading-relaxed placeholder:text-fantasy-wood/20"
                                    placeholder="Lasting for a very short time..."
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleAdd}
                                    disabled={!newWord || !newMeaning}
                                    className="px-8 py-3 bg-fantasy-wood text-fantasy-paper font-medieval text-xl rounded shadow-md hover:bg-fantasy-wood-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    INSCRIBE
                                </button>
                            </div>
                        </Parchment>
                    </motion.div>
                )}

                {view === 'SCRIBE' && filteredList.length > 0 && (
                    <motion.div
                        key="scribe"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex-1 flex flex-col items-center justify-center p-4"
                    >
                        <div className="w-full max-w-3xl flex flex-col gap-8 relative">
                            {/* Progress */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-fantasy-gold"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentDrillIndex) / filteredList.length) * 100}%` }}
                                />
                            </div>

                            <div className="text-center space-y-2 pt-8">
                                <span className="inline-block px-3 py-1 bg-black/40 rounded-full text-xs font-mono text-fantasy-gold/80 border border-fantasy-gold/20">
                                    WORD {currentDrillIndex + 1} OF {filteredList.length}
                                </span>
                                <h2 className="text-4xl font-medieval text-fantasy-paper drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                    What is this word?
                                </h2>
                            </div>

                            <Parchment className="p-10 flex flex-col items-center gap-6 min-h-[300px] justify-center relative shadow-2xl" variant="burned">
                                <div className="text-center">
                                    <span className="text-fantasy-wood/50 font-mono italic text-lg mb-2 block">
                                        ({filteredList[currentDrillIndex].type}.)
                                    </span>
                                    <p className="text-2xl font-serif text-fantasy-wood-dark leading-relaxed max-w-xl">
                                        "{filteredList[currentDrillIndex].meaning}"
                                    </p>
                                </div>

                                <div className="w-full max-w-md relative">
                                    <input
                                        autoFocus
                                        value={scribeInput}
                                        onChange={(e) => setScribeInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleScribeSubmit()}
                                        disabled={feedback !== 'NONE'}
                                        className={`w-full text-center bg-transparent border-b-4 py-4 text-3xl font-medieval tracking-widest outline-none transition-colors 
                                            ${feedback === 'NONE' ? 'border-fantasy-wood/30 text-fantasy-wood-dark focus:border-fantasy-wood' :
                                                feedback === 'CORRECT' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}
                                        placeholder="..."
                                    />
                                    <AnimatePresence>
                                        {feedback === 'CORRECT' && (
                                            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-0 top-1/2 -translate-y-1/2 text-green-600">
                                                <Check size={32} />
                                            </motion.div>
                                        )}
                                        {feedback === 'WRONG' && (
                                            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-0 top-1/2 -translate-y-1/2 text-red-600">
                                                <X size={32} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="text-xs text-fantasy-wood/40 uppercase tracking-widest mt-4">
                                    Type the answer and press Enter
                                </div>
                            </Parchment>

                            <button
                                onClick={() => setView('LIST')}
                                className="self-center text-fantasy-paper/50 hover:text-fantasy-paper transition-colors font-mono text-sm"
                            >
                                [ Abandon Drill ]
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Grimoire;
