import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Cloud, Download, Upload, Save, Brain } from 'lucide-react';
import { syncService } from '../logic/syncService';
import { geminiService } from '../logic/GeminiService';

const SettingsModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Cloud Sync State
    const [url, setUrl] = useState(localStorage.getItem('dragon-supabase-url') || import.meta.env.VITE_SUPABASE_URL || '');
    const [key, setKey] = useState(localStorage.getItem('dragon-supabase-key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');

    // AI State
    const [geminiKey, setGeminiKey] = useState(geminiService.getKey() || import.meta.env.VITE_GEMINI_API_KEY || '');

    const [status, setStatus] = useState<string>('');

    const handleSaveConfig = () => {
        localStorage.setItem('dragon-supabase-url', url);
        localStorage.setItem('dragon-supabase-key', key);
        setStatus("Cloud Config Saved! Reloading...");
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleSaveGemini = () => {
        geminiService.setKey(geminiKey);
        setStatus("AI Key Saved & Connected!");
        setTimeout(() => setStatus(''), 2000);
    };

    const handleUpload = async () => {
        setStatus("Uploading...");
        const { error } = await syncService.uploadSave();
        if (error) setStatus("Upload Failed: " + (typeof error === 'string' ? error : error.message));
        else setStatus("Upload Success!");
    };

    const handleDownload = async () => {
        setStatus("Downloading...");
        const res = await syncService.downloadSave();
        if (res?.error) setStatus("Download Failed: " + (typeof res.error === 'string' ? res.error : res.error.message));
        else setStatus("Download Success! State loaded.");
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 p-3 bg-slate-800 text-slate-400 rounded-full hover:text-white hover:bg-slate-700 transition z-50"
            >
                <Settings size={20} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl"
                        >
                            <h2 className="text-2xl font-medieval text-white mb-6 flex items-center gap-2">
                                <Cloud /> Cloud Sync (Supabase)
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project URL</label>
                                    <input
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                        placeholder="https://xyz.supabase.co"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Anon Key</label>
                                    <input
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                                        value={key}
                                        onChange={e => setKey(e.target.value)}
                                        type="password"
                                        placeholder="eyJ..."
                                    />
                                </div>
                                <button
                                    onClick={handleSaveConfig}
                                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Save Configuration
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleUpload}
                                    className="py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded flex flex-col items-center gap-1"
                                >
                                    <Upload size={20} /> Upload Save
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded flex flex-col items-center gap-1"
                                >
                                    <Download size={20} /> Download Save
                                </button>
                            </div>

                            {status && (
                                <div className="mt-4 p-3 bg-black/30 rounded text-center text-sm text-yellow-400 font-mono">
                                    {status}
                                </div>
                            )}

                            <h2 className="text-2xl font-medieval text-white mb-6 flex items-center gap-2 border-t border-slate-700 pt-6 mt-6">
                                <Brain /> The Wisdom Engine (AI)
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-amber-500 uppercase mb-1">Gemini API Key</label>
                                    <input
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-amber-500 outline-none"
                                        value={geminiKey}
                                        onChange={e => setGeminiKey(e.target.value)}
                                        type="password"
                                        placeholder="AIzaSy..."
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-sky-400 hover:underline">Google AI Studio</a>.
                                    </p>
                                </div>
                                <button
                                    onClick={handleSaveGemini}
                                    className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Save AI Key
                                </button>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="mt-6 w-full py-2 text-slate-500 hover:text-white"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SettingsModal;
