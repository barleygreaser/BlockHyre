"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Wrench } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-2xl w-full text-center space-y-8">

                    {/* Icon Graphic */}
                    <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32">
                        <div className="absolute inset-0 bg-slate-200 rounded-full animate-pulse opacity-50" />
                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center border-4 border-slate-100 shadow-sm">
                            <Wrench className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 rotate-45" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -rotate-45" />
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="space-y-4">
                        <h1 className="text-6xl sm:text-8xl font-bold font-serif text-slate-900 tracking-tighter">
                            404
                        </h1>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                            The Tool You Need Is Missing.
                        </h2>
                        <p className="text-slate-600 max-w-lg mx-auto text-lg leading-relaxed">
                            Looks like this page link broke, or maybe we just don't list a time machine yet. Don't worry, let's fix this and get you back to building.
                            <br />
                            <span className="text-sm font-medium text-slate-500 mt-2 block">
                                (Your data and active rentals are safe!)
                            </span>
                        </p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/listings" className="w-full sm:w-auto">
                            <Button className="w-full h-12 px-8 text-base bg-safety-orange hover:bg-safety-orange/90 text-white font-bold shadow-md transition-transform hover:-translate-y-0.5">
                                Find Tools Near Me
                            </Button>
                        </Link>
                        <Link href="/add-tool" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full h-12 px-8 text-base border-2 border-safety-orange text-safety-orange hover:bg-orange-50 font-bold transition-transform hover:-translate-y-0.5">
                                List My Tools
                            </Button>
                        </Link>
                    </div>



                </div>
            </div>

            <Footer />
        </main>
    );
}
