"use client";

import ReactMarkdown from 'react-markdown';

interface SystemMessageProps {
    content: string;
}

export function SystemMessage({ content }: SystemMessageProps) {
    // System messages are now rendered via Liquid templates
    // Display them centered with clean styling and markdown support
    return (
        <div className="flex justify-center my-4 w-full">
            <div className="max-w-md w-full bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                <div className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                    📋 System Message
                </div>
                <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none
                    prose-p:my-1 prose-p:leading-relaxed
                    prose-strong:text-gray-900 prose-strong:font-bold
                    prose-headings:text-gray-900 prose-headings:font-bold
                    prose-ul:my-1 prose-li:my-0">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
