import React from 'react';

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
    if (!response) return null;
    const { summary, steps, examples, extra } = response;
    return (
        <div className="border-2 border-gray-200 rounded-lg p-6 bg-white max-w-xl mx-auto my-8 shadow-md">
            {summary && (
                <p className="text-lg font-medium mb-4 text-gray-900">{summary}</p>
            )}
            {steps && steps.length > 0 && (
                <ol className="list-decimal ml-6 mb-4 text-gray-800">
                    {steps.map((step, idx) => (
                        <li key={`step-${idx}`}>{step}</li>
                    ))}
                </ol>
            )}
            {examples && examples.length > 0 && (
                <ul className="list-disc ml-6 mb-4 text-gray-700">
                    {examples.map((ex, idx) => (
                        <li key={`example-${idx}`}>{ex}</li>
                    ))}
                </ul>
            )}
            {extra && (
                <div className="italic text-gray-500 mt-2">{extra}</div>
            )}
        </div>
    );
};

export default AIResponseRenderer;
