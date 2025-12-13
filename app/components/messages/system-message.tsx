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
    // Regex to parse the message content
    // Format: "📋 Inquiry for: {Title}\nPrice: {Price}\n{Description}"
    const match = content.match(/📋 Inquiry for: (.*)\nPrice: (.*)\n([\s\S]*)/);

    // If we can't parse it, return specific fallback or generic message
    if (!match) {
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

    const [, title, rate, description] = match;
    // Clean up rate if needed (e.g. remove leading $ if redundant, but SQL likely handles it)

    return (
        <div className="flex justify-center my-4 w-full">
            <Card className="max-w-md w-full">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            <Badge variant="secondary" className="uppercase">New Listing Inquiry</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="text-sm">
                            View Listing
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">

                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 text-lg font-semibold">
                            <HardHat className="h-5 w-5 text-primary" />
                            <span>{title}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm font-medium text-green-600">
                            <Tag className="h-4 w-4" />
                            <span>Rate: {rate.includes('$') ? rate : `$${rate}`}</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-1 text-sm text-gray-700">
                        <div className="flex items-center space-x-2 font-medium">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>Listing Description Preview:</span>
                        </div>
                        <blockquote className="border-l-2 pl-4 italic text-sm mt-1">
                            "{description}"
                        </blockquote>
                    </div>

                </CardContent>

                <CardFooter className="pt-0">
                    <p className="text-xs text-muted-foreground">
                        This automated message was sent when a renter initiated a conversation about your listing.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
