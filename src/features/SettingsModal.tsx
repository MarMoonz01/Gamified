import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Cloud, Download, Upload, Save, Brain, User } from 'lucide-react';
import { syncService } from '../logic/syncService';
import { geminiService } from '../logic/GeminiService';
import { useDragonStore } from '../logic/dragonStore';

const SettingsModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Cloud Sync State
    const [url, setUrl] = useState(localStorage.getItem('dragon-supabase-url') || import.meta.env.VITE_SUPABASE_URL || '');
    const [key, setKey] = useState(localStorage.getItem('dragon-supabase-key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');

    // AI State
    const [geminiKey, setGeminiKey] = useState(geminiService.getKey() || import.meta.env.VITE_GEMINI_API_KEY || '');

    const [status, setStatus] = useState<string>('');

    // Profile State
    const { userProfile, updateProfile } = useDragonStore();
    const [profileName, setProfileName] = useState(userProfile?.name || 'Keeper');
    const [profileAge, setProfileAge] = useState(userProfile?.age || 25);
    const [profileWeight, setProfileWeight] = useState(userProfile?.weight || 60);
    const [profileGender, setProfileGender] = useState(userProfile?.gender || 'Not Specified');

    const handleSaveProfile = () => {
        updateProfile({
            name: profileName,
            age: profileAge,
            weight: profileWeight,
            gender: profileGender
        });
        setStatus("Profile Updated!");
        setTimeout(() => setStatus(''), 2000);
    };

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
                            className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl h-[80vh] overflow-y-auto custom-scrollbar"
                        >
                            <h2 className="text-2xl font-medieval text-white mb-6 flex items-center gap-2">
                                <Cloud /> Cloud Sync
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

                            <div className="grid grid-cols-2 gap-4 mb-6">
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
                                <div className="mb-6 p-3 bg-black/30 rounded text-center text-sm text-yellow-400 font-mono">
                                    {status}
                                </div>
                            )}

                            <h2 className="text-2xl font-medieval text-white mb-6 flex items-center gap-2 border-t border-slate-700 pt-6">
                                <Brain /> AI Settings
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
                                </div>
                                <button
                                    onClick={handleSaveGemini}
                                    className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Save AI Key
                                </button>
                            </div>

                            <h2 className="text-xl font-bold text-[#354F52] mb-4 flex items-center gap-2 border-t border-[#E8EFE8] pt-6">
                                <User size={20} /> Keeper Profile
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#52796F] uppercase mb-1">Name</label>
                                        <input
                                            className="w-full bg-[#F7F9F6] border border-[#E8EFE8] rounded-xl p-2 text-[#354F52] text-sm focus:border-[#52796F] outline-none"
                                            value={profileName}
                                            onChange={e => setProfileName(e.target.value)}
                                            placeholder="Keeper Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#52796F] uppercase mb-1">Gender</label>
                                        <select
                                            className="w-full bg-[#F7F9F6] border border-[#E8EFE8] rounded-xl p-2 text-[#354F52] text-sm focus:border-[#52796F] outline-none"
                                            value={profileGender}
                                            onChange={e => setProfileGender(e.target.value)}
                                        >
                                            <option value="Not Specified">Select...</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Non-Binary">Non-Binary</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#52796F] uppercase mb-1">Age</label>
                                        <input
                                            className="w-full bg-[#F7F9F6] border border-[#E8EFE8] rounded-xl p-2 text-[#354F52] text-sm focus:border-[#52796F] outline-none"
                                            type="number"
                                            value={profileAge}
                                            onChange={e => setProfileAge(Number(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#52796F] uppercase mb-1">Weight (kg)</label>
                                        <input
                                            className="w-full bg-[#F7F9F6] border border-[#E8EFE8] rounded-xl p-2 text-[#354F52] text-sm focus:border-[#52796F] outline-none"
                                            type="number"
                                            value={profileWeight}
                                            onChange={e => setProfileWeight(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    className="w-full py-2 bg-[#52796F] hover:bg-[#354F52] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Save size={16} /> Save Profile
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
