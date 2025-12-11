"use client";

import { useEffect } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { ConversationList } from "./conversation-list";
import { MessageView } from "./message-view";
import { Navbar } from "@/app/components/navbar";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessagesCenter() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [chatId, setChatId] = useQueryState("id", parseAsString);

    useEffect(() => {
        document.title = chatId ? "Chat - BlockHyre" : "Messages - BlockHyre";
    }, [chatId]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safety-orange mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading messages...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold font-serif text-slate-900 flex items-center gap-2">
                        <MessageSquare className="h-8 w-8 text-safety-orange" />
                        Messages
                    </h1>
                    <p className="text-slate-600 mt-1">Communicate with tool owners and renters</p>
                </div>

                {/* Two-Pane Layout */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex h-[calc(100vh-16rem)]">
                        {/* Left Sidebar - Conversation List */}
                        <div
                            className={`
                                w-full md:w-80 lg:w-96 border-r border-slate-200 flex-shrink-0
                                ${chatId ? "hidden md:block" : "block"}
                            `}
                        >
                            <div className="p-4 border-b border-slate-200 bg-slate-50">
                                <h2 className="font-semibold text-slate-900">Conversations</h2>
                            </div>
                            <ConversationList
                                selectedChatId={chatId}
                                onSelectChat={(id) => setChatId(id)}
                            />
                        </div>

                        {/* Right Panel - Message View */}
                        <div className={`flex-1 ${chatId ? "block" : "hidden md:block"}`}>
                            {chatId ? (
                                <>
                                    {/* Mobile Back Button */}
                                    <div className="md:hidden p-4 border-b border-slate-200 bg-slate-50">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setChatId(null)}
                                            className="text-slate-600"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back to conversations
                                        </Button>
                                    </div>
                                    <MessageView chatId={chatId} />
                                </>
                            ) : (
                                <div className="hidden md:flex items-center justify-center h-full text-center p-8">
                                    <div>
                                        <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                        <h3 className="font-semibold text-slate-900 mb-2">
                                            Select a conversation
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Choose a conversation from the list to start messaging
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
