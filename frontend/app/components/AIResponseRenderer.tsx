'use client';
import React, { useState, useEffect } from 'react';

type AIResponse = {
    summary: string;
    steps: string[];
    examples?: string[];
    extra?: string;
};

interface AIResponseRendererProps {
    response: AIResponse;
}

const AIResponseRenderer: React.FC<AIResponseRendererProps> = ({ response }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!response?.summary) return;

        setDisplayedText('');
        setCurrentIndex(0);

        const typeText = () => {
            const text = response.summary;
            let i = 0;
            const timer = setInterval(() => {
                if (i < text.length) {
                    setDisplayedText(text.slice(0, i + 1));
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, 30);

            return () => clearInterval(timer);
        };

        const cleanup = typeText();
        return cleanup;
    }, [response?.summary]);

    if (!response) return null;

    const { summary, steps, examples, extra } = response;

    return (
        <div className="max-w-2xl mx-auto mt-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            🤖
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="bg-white/5 rounded-lg p-4 border-l-4 border-purple-500">
                            <p className="text-lg font-medium text-white leading-relaxed">
                                {displayedText}
                                <span className="animate-pulse">|</span>
                            </p>
                        </div>

                        {steps && steps.length > 0 && (
                            <div className="bg-white/5 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
                                    📝 Here's how to do it:
                                </h3>
                                <ol className="space-y-2">
                                    {steps.map((step, idx) => (
                                        <li key={`step-${idx}`} className="flex items-start space-x-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <span className="text-gray-200 leading-relaxed">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {examples && examples.length > 0 && (
                            <div className="bg-white/5 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center">
                                    💡 Examples:
                                </h3>
                                <ul className="space-y-2">
                                    {examples.map((ex, idx) => (
                                        <li key={`example-${idx}`} className="flex items-start space-x-3">
                                            <span className="flex-shrink-0 text-indigo-400 mt-1">•</span>
                                            <span className="text-gray-200 leading-relaxed">{ex}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {extra && (
                            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg p-4 border border-purple-500/20">
                                <p className="text-sm text-purple-200 italic flex items-start space-x-2">
                                    <span className="flex-shrink-0 mt-0.5">💭</span>
                                    <span>{extra}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIResponseRenderer;