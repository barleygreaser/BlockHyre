"use client";

interface SystemMessageProps {
    content: string;
}

export function SystemMessage({ content }: SystemMessageProps) {
    return (
        <div className="flex justify-center my-4">
            <div className="max-w-md w-full bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                <div className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                    📋 Listing Inquiry
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {content}
                </div>
            </div>
        </div>
    );
}
