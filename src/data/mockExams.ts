
export interface Question {
    id: number;
    text: string;
    options?: string[]; // Multiple choice
    correctAnswer?: string | number; // For automated grading (Reading/Listening)
}

export interface ExamSection {
    id: string;
    type: 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';
    title: string;
    content: string; // The passage, transcript, or prompt
    questions: Question[];
    durationMinutes: number;
}

export interface FullMockExam {
    id: string;
    title: string;
    sections: {
        listening: ExamSection;
        reading: ExamSection;
        writing: ExamSection;
        speaking: ExamSection;
    };
}

export const MOCK_EXAMS: FullMockExam[] = [
    {
        id: 'cambridge-18-test-1',
        title: 'Cambridge 18 - Test 1 (Simulation)',
        sections: {
            listening: {
                id: 'L1',
                type: 'LISTENING',
                title: 'Part 1: Accommodation Enquiry',
                content: "Audio Transcript Placeholder... (In real app, this would be an audio file reference)",
                durationMinutes: 30,
                questions: [
                    { id: 1, text: "Type of accommodation required:", correctAnswer: "flat" },
                    { id: 2, text: "Maximum rent:", correctAnswer: "400" }
                ]
            },
            reading: {
                id: 'R1',
                type: 'READING',
                title: 'Passage 1: Urban Farming',
                content: "Urban farming is the practice of cultivating, processing, and distributing food in or around urban areas...",
                durationMinutes: 60,
                questions: [
                    { id: 1, text: "Urban farming helps reduce food miles.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: 0 },
                    { id: 2, text: "Most urban farms are profitable.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: 2 }
                ]
            },
            writing: {
                id: 'W1',
                type: 'WRITING',
                title: 'Task 2: Government Funding',
                content: "Some people believe that the government should spend money on faster public transport. Others think that money should be spent on other priorities (e.g., cost environment). Discuss both views and give your opinion.",
                durationMinutes: 40,
                questions: [
                    { id: 1, text: "Write an essay of at least 250 words." }
                ]
            },
            speaking: {
                id: 'S1',
                type: 'SPEAKING',
                title: 'Part 2: Describe a helpful person',
                content: "Describe a person who has helped you recently. You should say: \n- Who this person is \n- How they helped you \n- Why they helped you \n- And explain how you felt.",
                durationMinutes: 15,
                questions: [
                    { id: 1, text: "Speack for 2 minutes." }
                ]
            }
        }
    }
];
