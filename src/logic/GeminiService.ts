import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
    private apiKey: string = '';

    constructor() {
        this.loadConfig();
    }

    public loadConfig() {
        const key = localStorage.getItem('dragon-gemini-key') || import.meta.env.VITE_GEMINI_API_KEY;
        if (key) {
            this.apiKey = key;
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        }
    }

    public getKey(): string {
        return this.apiKey;
    }

    public setKey(key: string) {
        this.apiKey = key;
        localStorage.setItem('dragon-gemini-key', key);
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    public async generateContent(prompt: string): Promise<string> {
        if (!this.model) return "Error: Gemini API Key not set. Please configure it in Settings.";

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.error("Gemini Error:", error);
            return `Error accessing Gemini: ${error.message}`;
        }
    }

    public async generateJSON<T>(prompt: string): Promise<T | null> {
        if (!this.genAI) return null;

        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt + " Response must be valid JSON only. Do not wrap in markdown blocks.");
            const response = await result.response;
            const text = response.text();
            // Clean markdown if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr) as T;
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
        if (!this.model) return "Error: Gemini API Key not set.";

        try {
            const chat = this.model.startChat({
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
        } catch (error: any) {
            console.error("Gemini Chat Error:", error);
            return `Error: ${error.message}`;
        }
    }
}

export const geminiService = new GeminiService();
