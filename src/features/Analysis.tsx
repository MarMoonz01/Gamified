import { useDragonStore } from '../logic/dragonStore';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Activity, Calendar } from 'lucide-react';

const Analysis: React.FC = () => {
    const { ielts, health, dailyHistory, userProfile } = useDragonStore();

    // Helper for IELTS Colors
    const getScoreColor = (score: number) => {
        if (score >= 8.0) return 'text-emerald-600 bg-emerald-100 border-emerald-300';
        if (score >= 6.5) return 'text-blue-600 bg-blue-100 border-blue-300';
        if (score >= 5.0) return 'text-amber-600 bg-amber-100 border-amber-300';
        return 'text-red-600 bg-red-100 border-red-300';
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-serif text-slate-800">Keeper Analysis</h1>
                <p className="text-slate-500">Performance Review & Health Status</p>
            </div>

            {/* IELTS Section */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <BookOpen size={120} />
                </div>

                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <BookOpen className="text-blue-500" /> IELTS Proficiency
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    {/* Overall Badge */}
                    <div className="col-span-2 flex justify-center mb-4">
                        <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${getScoreColor(ielts.overall)}`}>
                            <span className="text-2xl font-bold">{ielts.overall}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest">Overall</span>
                        </div>
                    </div>

                    {[
                        { label: 'Listening', value: ielts.listening },
                        { label: 'Reading', value: ielts.reading },
                        { label: 'Writing', value: ielts.writing },
                        { label: 'Speaking', value: ielts.speaking },
                    ].map((skill) => (
                        <div key={skill.label} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-medium text-slate-600">{skill.label}</span>
                                <span className="font-bold text-slate-800">{skill.value}</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(skill.value / 9) * 100}%` }}
                                    className="h-full bg-blue-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Health Condition */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Activity className="text-emerald-500" /> Condition
                </h2>

                <div className="space-y-6">
                    {/* Physical */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                <Activity size={16} /> Physical Energy
                            </span>
                            <span className="font-bold text-slate-800">{health.physical}/{health.maxPhysical}</span>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${(health.physical / health.maxPhysical) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Mental */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                <Brain size={16} /> Mental Focus
                            </span>
                            <span className="font-bold text-slate-800">{health.mental}/{health.maxMental}</span>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${(health.mental / health.maxMental) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Biometrics (Simplified) */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-4">
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Activity size={16} className="text-emerald-500" /> Physical Status
                        </h3>

                        {(() => {
                            const weight = userProfile?.weight || 60;
                            const height = userProfile?.height || 170;
                            const activity = userProfile?.activityLevel || 'Moderately Active';

                            // BMI Simplified
                            const heightM = height / 100;
                            const bmi = weight / (heightM * heightM);
                            let bmiCategory = 'Healthy';
                            let bmiColor = 'text-emerald-600';

                            if (bmi < 18.5) { bmiCategory = 'Lean'; bmiColor = 'text-blue-500'; }
                            else if (bmi >= 25 && bmi < 30) { bmiCategory = 'Heavy'; bmiColor = 'text-amber-500'; }
                            else if (bmi >= 30) { bmiCategory = 'Robust'; bmiColor = 'text-red-500'; }

                            // Game Impact (Derived from Activity)
                            const energyBonus = activity === 'Super Active' ? '+50' :
                                activity === 'Very Active' ? '+40' :
                                    activity === 'Moderately Active' ? '+30' :
                                        activity === 'Lightly Active' ? '+20' : '+10';

                            return (
                                <div className="flex items-center justify-between gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex-1 text-center">
                                        <div className="text-xs text-slate-500 font-bold uppercase">Condition</div>
                                        <div className={`text-lg font-bold ${bmiColor}`}>{bmiCategory}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex-1 text-center">
                                        <div className="text-xs text-slate-500 font-bold uppercase">Lifestyle</div>
                                        <div className="text-lg font-bold text-slate-700">{activity.split(' ')[0]}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex-1 text-center">
                                        <div className="text-xs text-slate-500 font-bold uppercase">Max Energy</div>
                                        <div className="text-lg font-bold text-emerald-600">{energyBonus}</div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </section>

            {/* Daily History */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Calendar className="text-amber-500" /> History Log
                </h2>

                <div className="space-y-4">
                    {dailyHistory.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 italic">
                            No records yet. Complete a day to see analysis.
                        </div>
                    ) : (
                        dailyHistory.slice().reverse().map((day, idx) => (
                            <div key={idx} className="border-l-4 border-amber-200 pl-4 py-1 relative">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-bold text-slate-700">{day.date}</span>
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase tracking-wider">{day.mood}</span>
                                </div>
                                <div className="text-xs text-slate-400 mb-2">
                                    {day.completed_tasks} / {day.total_tasks} Tasks • {day.heat_earned} Heat
                                </div>
                                {day.ai_analysis && (
                                    <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        "{day.ai_analysis}"
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default Analysis;
