import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
    private apiKey: string = '';

    // Priority order of models to try - Expanded list for 2026
    private readonly MODELS = [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ];
    private currentModelIndex = 0;

    constructor() {
        this.loadConfig();
    }

    public loadConfig() {
        const key = localStorage.getItem('dragon-gemini-key') || import.meta.env.VITE_GEMINI_API_KEY;
        if (key) {
            this.apiKey = key;
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.updateModel();
        }
    }

    private updateModel() {
        if (!this.genAI) return;
        const modelName = this.MODELS[this.currentModelIndex];
        console.log(`[Gemini] Using model: ${modelName}`);
        this.model = this.genAI.getGenerativeModel({ model: modelName });
    }

    public getKey(): string {
        return this.apiKey;
    }

    public setKey(key: string) {
        this.apiKey = key;
        localStorage.setItem('dragon-gemini-key', key);
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.currentModelIndex = 0; // Reset to preferred model
        this.updateModel();
    }

    private async executeWithFallback<T>(operation: (model: any) => Promise<T>): Promise<T> {
        if (!this.model) throw new Error("Gemini API Key not set. Please configure it in Settings.");

        // Try current model first
        try {
            return await operation(this.model);
        } catch (error: any) {
            // Check if error is 404 (Model not found) or 400 (Bad Request - sometimes implies model issue)
            const isModelError = error.message?.includes('404') || error.message?.includes('not found') || error.message?.includes('not supported');

            if (isModelError && this.currentModelIndex < this.MODELS.length - 1) {
                console.warn(`[Gemini] Model ${this.MODELS[this.currentModelIndex]} failed. Switching to fallback...`);
                this.currentModelIndex++;
                this.updateModel();
                // Retry recursively with new model
                return this.executeWithFallback(operation);
            }

            // If not a model error or no more fallbacks, throw original error
            throw error;
        }
    }

    public async generateContent(prompt: string): Promise<string> {
        try {
            return await this.executeWithFallback(async (model) => {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            });
        } catch (error: any) {
            console.error("Gemini Final Error:", error);
            if (error.message?.includes('404')) {
                return "Error: Model not found. Please ensure your Google Cloud Project has the 'Generative Language API' enabled.";
            }
            return `Error accessing Gemini: ${error.message}`;
        }
    }

    public async generateJSON<T>(prompt: string): Promise<T | null> {
        if (!this.genAI) return null;

        try {
            return await this.executeWithFallback(async (model) => {
                const result = await model.generateContent(prompt + " Response must be valid JSON only. Do not wrap in markdown blocks.");
                const response = await result.response;
                const text = response.text();
                // Clean markdown if present
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(jsonStr) as T;
            });
        } catch (error) {
            console.error("Gemini JSON Error:", error);
            return null;
        }
    }

    async generateOracleCard(): Promise<{ name: string; title: string; description: string; type: 'SUPPORT' | 'COMBAT' | 'RESOURCE'; rarity: 'COMMON' | 'RARE' | 'LEGENDARY'; effectDescription: string } | null> {
        const prompt = `Generate a unique, mystical Tarot-like card for a Dragon Keeper game. 
        It should have a localized fantasy theme.
        Return raw JSON only: { 
            "name": "Card Name (e.g. The Whispering Willow)", 
            "title": "Short Title (e.g. Spirit of Silence)", 
            "description": "2 sentence lore description.", 
            "type": "SUPPORT" or "COMBAT" or "RESOURCE", 
            "rarity": "COMMON" (70%) or "RARE" (25%) or "LEGENDARY" (5%),
            "effectDescription": "Flavor text describing a magical effect (cosmetic only)"
        }`;
        return this.generateJSON(prompt);
    }

    public async generateChat(history: { role: string, parts: string }[], message: string): Promise<string> {
        try {
            return await this.executeWithFallback(async (model) => {
                const chat = model.startChat({
                    history: history.map(h => ({
                        role: h.role,
                        parts: [{ text: h.parts }]
                    })),
                    generationConfig: {
                        maxOutputTokens: 1000,
                    },
                });

                const result = await chat.sendMessage(message);
                const response = await result.response;
                return response.text();
            });
        } catch (error: any) {
            console.error("Gemini Chat Error:", error);
            return `Error: ${error.message}`;
        }
    }
    async generateDailyAnalysis(profile: any, tasks: any[], habits: any[], totalHeat: number): Promise<{ analysis: string, mood: string } | null> {
        const prompt = `
        You are Elder Ignis, a wise dragon mentor. Analyze the Keeper's daily performance.
        
        Keeper Profile: ${JSON.stringify(profile)}
        Detailed Activity:
        - Completed Tasks: ${tasks.filter(t => t.completed).map((t: any) => t.title).join(', ')}
        - Pending Tasks: ${tasks.filter(t => !t.completed).map((t: any) => t.title).join(', ')}
        - Habit Streaks: ${habits.map((h: any) => `${h.title} (${h.streak})`).join(', ')}
        - Total Heat Generated Today: ${totalHeat}

        Provide a brief, encouraging, but honest summary of their day (max 3 sentences).
        Also assess their "mood" or "vibe" as a single word (e.g., Productive, Lazy, Balanced, burnout).

        Return JSON only:
        {
            "analysis": "Your analysis string here...",
            "mood": "OneWordMood"
        }
        `;
        return this.generateJSON(prompt);
    }

    public async generateRewardIdeas(userProfile: any, habits: any[]): Promise<{ id: string, name: string, description: string, cost: number, color: string, icon: string }[] | null> {
        if (!this.genAI) return null;

        const prompt = `
        Act as a Guild Merchant. Suggest 3 custom real-life rewards for this user based on their profile and habits to incentivize them.
        User Profile: ${JSON.stringify(userProfile)}
        Habits: ${JSON.stringify(habits)}

        Create 3 rewards:
        1. Small (Cost 30-50 Gold) - e.g., 15 min break, sweet treat.
        2. Medium (Cost 80-150 Gold) - e.g., Watch an episode, gaming session.
        3. Large (Cost 200-500 Gold) - e.g., Buy a book, day trip.

        Respond in JSON array: 
        [
            { "id": "ai_1", "name": "Title", "description": "Short desc", "cost": 50, "color": "blue/purple/amber/rose", "icon": "Coffee/Music/Zap/Gift" }
        ]
        Allowed Icons: Coffee, Music, Zap, Gift, Book, Gamepad, Star.
        `;

        try {
            const result = await this.generateJSON<any[]>(prompt);
            return result;
        } catch (e) {
            console.error("Failed to generate rewards", e);
            return null;
        }
    }
}

export const geminiService = new GeminiService();
