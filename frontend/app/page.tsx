'use client'
import { useState } from 'react'
import AIResponseRenderer from './components/AIResponseRenderer'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  type AIResponse = {
    summary: string;
    steps: string[];
    examples: string[];
    confidence: number;
    extra: string;
  };
  type ResultType = {
    parsed?: AIResponse;
    error?: string;
  };
  const [result, setResult] = useState<ResultType | null>(null)

  // Show welcome message on initial load
  const welcomeMessage = {
    summary: "Welcome to AI Tutor! I'm here to help you learn and succeed in your studies.",
    steps: ["Tell me what subject you're studying", "Ask me any specific question", "I'll provide clear, step-by-step guidance"],
    examples: ["How do I solve calculus problems?", "Help me understand photosynthesis", "What are good study techniques?"],
    confidence: 95,
    extra: "I'm designed to make learning easier and more engaging!"
  };
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.0
    u.pitch = 1.0
    window.speechSynthesis.speak(u)
  }
  async function ask() {
    setLoading(true)
    setResult(null)
    try {
      const r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      })
      const data = await r.json()
      setResult(data)
      if (data.parsed) {
        // speak the summary and first step
        const speakText = `${data.parsed.summary}. Next: ${data.parsed.steps?.
        [0] ?? ''}`
        speak(speakText)
      }
    } catch (err) {
      console.error(err)
      setResult({ error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Tutor</h1>
          <p className="text-gray-300">Your intelligent study companion</p>
        </div>

        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                What would you like to learn about?
              </label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                rows={4}
                placeholder="Ask me anything about studying, university life, or any academic topic..."
                className="w-full p-4 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Additional context (optional)
              </label>
              <input
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder='e.g., "I have ADHD", "I study Computer Science"'
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={ask}
              disabled={loading || question.trim().length === 0}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI is thinking...</span>
                </div>
              ) : (
                'Ask AI Tutor'
              )}
            </button>
          </div>
        </div>

        {/* AI Response */}
        {result?.parsed ? (
          <AIResponseRenderer response={result.parsed} />
        ) : (
          <AIResponseRenderer response={welcomeMessage as AIResponse} />
        )}

        {result?.error && (
          <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            <p>{'❌ ' + result.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}