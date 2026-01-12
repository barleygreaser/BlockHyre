"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { Compass, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center">
                {/* Verbatim implementation start (with relative positioning fix) */}
                <div className="flex w-full items-center justify-center">
                    <div className="flex h-screen items-center border-x border-border">
                        <div className="relative"> {/* Added relative here to contain the absolute lines */}
                            <div className="absolute inset-x-0 top-0 h-px bg-border" />
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle className="font-black font-mono text-8xl">
                                        404
                                    </EmptyTitle>
                                    <EmptyDescription className="text-nowrap">
                                        The page you're looking for might have been <br />
                                        moved or doesn't exist.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href="/">
                                                <Home className="mr-2 h-4 w-4" /> Go Home
                                            </Link>
                                        </Button>

                                        <Button asChild variant="outline">
                                            <Link href="/tools">
                                                <Compass className="mr-2 h-4 w-4" /> Explore
                                            </Link>
                                        </Button>
                                    </div>
                                </EmptyContent>
                            </Empty>
                            <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
                        </div>
                    </div>
                </div>
                {/* Verbatim implementation end */}
            </main>

            <Footer />
        </div>
    );
}
