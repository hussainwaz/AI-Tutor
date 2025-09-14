import { NextRequest } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SYSTEM_PROMPT = `You are an AI tutor helping students learn. You MUST respond with valid JSON only.

CRITICAL: Your response must be valid JSON with these exact keys:
- "summary": A friendly, conversational summary (1-2 sentences)
- "steps": Array of clear action steps (2-6 items)
- "examples": Array of helpful examples (1-3 items, can be empty array)
- "confidence": Number from 0-100 indicating your confidence
- "extra": Additional helpful tip or encouragement (optional, can be empty string)

For greetings or welcomes, respond with:
{
  "summary": "Welcome to AI Tutor! I'm here to help you learn and succeed in your studies.",
  "steps": ["Tell me what subject you're studying", "Ask me any specific question", "I'll provide clear, step-by-step guidance"],
  "examples": ["How do I solve calculus problems?", "Help me understand photosynthesis"],
  "confidence": 95,
  "extra": "I'm designed to make learning easier and more engaging!"
}

RESPOND ONLY WITH VALID JSON. NO OTHER TEXT.`;

function buildUserPrompt(question: string, context?: string) {
    let user = `Question: "${question}"\n`;
    if (context && context.trim()) {
        user += `Context: "${context}"\n`;
    }
    user += '\nRespond with ONLY valid JSON using the format specified in the system prompt. No other text.';
    return user;
}

export async function POST(req: NextRequest) {
    try {
        const fetch = (global.fetch ? global.fetch : (await import('undici')).fetch);
        const body = await req.json();
        const { question, context } = body;
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'question is required' }), { status: 400 });
        }
        if (!OPENROUTER_API_KEY) {
            return new Response(JSON.stringify({ error: 'OpenRouter API key not set' }), { status: 500 });
        }
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(question, context) },
        ];
        const model = process.env.DEFAULT_MODEL || 'deepseek/deepseek-r1:free';
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.0,
                max_tokens: 700,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            return new Response(JSON.stringify({ error: errorText }), { status: response.status });
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content ?? '';

        // Clean the text first
        const cleanText = text.trim();
        let parsed = null;

        try {
            parsed = JSON.parse(cleanText);
        } catch (e) {
            // Try to extract JSON from the text
            const start = cleanText.indexOf('{');
            const end = cleanText.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                try {
                    parsed = JSON.parse(cleanText.slice(start, end + 1));
                } catch (err) {
                    // If all parsing fails, create a fallback response
                    parsed = {
                        summary: "I apologize, but I had trouble formatting my response properly.",
                        steps: ["Please try asking your question again", "I'll make sure to respond clearly"],
                        examples: [],
                        confidence: 50,
                        extra: "Technical issue - please retry"
                    };
                }
            } else {
                // Fallback for completely malformed responses
                parsed = {
                    summary: cleanText || "Welcome to AI Tutor! How can I help you today?",
                    steps: ["Ask me any academic question", "I'll provide step-by-step guidance"],
                    examples: ["How to solve math problems", "Study techniques"],
                    confidence: 80,
                    extra: "I'm here to make learning easier!"
                };
            }
        }
        return new Response(JSON.stringify({ raw: text, parsed }), { status: 200 });
    } catch (err: any) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message ?? String(err) }), { status: 500 });
    }
}
