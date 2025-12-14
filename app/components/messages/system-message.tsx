"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { FileText, HardHat, Tag, BookOpen } from "lucide-react";

interface SystemMessageProps {
    content: string;
}

export function SystemMessage({ content }: SystemMessageProps) {
    // System messages are now rendered via Liquid templates
    // Display them centered with clean styling
    return (
        <div className="flex justify-center my-4 w-full">
            <div className="max-w-md w-full bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                <div className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                    📋 System Message
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {content}
                </div>
            </div>
        </div>
    );
}
