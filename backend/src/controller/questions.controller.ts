import { Anthropic } from '@anthropic-ai/sdk';
import { Request, Response, NextFunction } from 'express';
import { ANTHROPIC_API } from '../config';

const client = new Anthropic({
    apiKey: ANTHROPIC_API,
});

const genQuestion = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    const { subject, questionCount = 10, syllabus, difficulty = 'medium' } = req.body;

    // Enhanced input validation
    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
        res.status(400).json({
            success: false,
            message: 'Subject is required and must be a non-empty string',
            error: 'INVALID_SUBJECT'
        });
        return;
    }

    if (questionCount < 1 || questionCount > 50) {
        res.status(400).json({
            success: false,
            message: 'Question count must be between 1 and 50',
            error: 'INVALID_QUESTION_COUNT'
        });
        return;
    }

    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
        res.status(400).json({
            success: false,
            message: 'Difficulty must be one of: easy, medium, hard',
            error: 'INVALID_DIFFICULTY'
        });
        return;
    }

    try {
        // Improved system prompt for better JSON formatting
        let systemPrompt = `You are an expert exam creator. Your task is to generate multiple choice questions in a specific JSON format. Each question must have exactly 4 options.

Format your response as a valid JSON array of question objects. Each object must have:
- "question": string (the question text)
- "options": array of exactly 4 strings (the possible answers)
- "correctAnswer": number (0-3, indicating the index of the correct answer)

Example format:
[
  {
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1
  }
]

Do not include any text before or after the JSON array. Ensure all JSON is properly formatted with no unterminated strings.`;
        
        let userPrompt = `Generate ${questionCount} ${difficulty} difficulty multiple choice questions about ${subject.trim()}.`;
        
        if (syllabus) {
            userPrompt += ` Focus on these specific topics: ${syllabus}.`;
        }
        
        userPrompt += ` Make sure questions are well-structured, clear, and appropriate for ${difficulty} level. Return ONLY a valid JSON array of question objects with no additional text.`;

        const response = await client.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 4000,
            temperature: 0.7,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
        });
        
        let contentText = '';
        if (response?.content?.[0]?.type === 'text') {
            contentText = response.content[0].text.trim();
        }

        // Ensure the response starts with [ and ends with ]
        if (!contentText.startsWith('[') || !contentText.endsWith(']')) {
            throw new Error('Response is not a valid JSON array');
        }

        let questions;
        try {
            questions = JSON.parse(contentText);
            
            // Validate the questions array
            if (!Array.isArray(questions)) {
                throw new Error('Parsed content is not an array');
            }

            // Validate each question object
            questions.forEach((q, index) => {
                if (!q.question || !Array.isArray(q.options) || 
                    q.options.length !== 4 || typeof q.correctAnswer !== 'number' ||
                    q.correctAnswer < 0 || q.correctAnswer > 3) {
                    throw new Error(`Invalid question format at index ${index}`);
                }
            });

        } catch (error) {
            console.error('JSON Parse Error:', error);
            console.error('Raw Content:', contentText);
            res.status(500).json({
                msg: 'Failed to parse response from Claude',
                error: error instanceof Error ? error.message : 'Invalid response format',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: `Successfully generated ${questions.length} questions`,
            data: {
                questions,
                metadata: {
                    subject: subject.trim(),
                    questionCount: questions.length,
                    difficulty,
                    syllabus: syllabus || null,
                    generatedAt: new Date().toISOString()
                }
            }
        });
    } catch (error) {
        console.error('Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while generating questions',
            error: error instanceof Error ? error.message : 'Unknown server error',
            timestamp: new Date().toISOString()
        });
    }
};

export { genQuestion };