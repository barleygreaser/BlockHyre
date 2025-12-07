"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { ArrowLeft, Shield, AlertTriangle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddToolPage() {
    const [riskLevel, setRiskLevel] = useState<"standard" | "heavy">("standard");
    const [price, setPrice] = useState("");

    const deposit = riskLevel === "standard" ? 50 : 250;

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-serif text-slate-900">List Your Tool</h1>
                    <p className="text-slate-600 mt-2">Turn your idle equipment into income. Safe, insured, and simple.</p>
                </div>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-safety-orange" />
                            Asset Protection Setup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Tool Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. DeWalt Table Saw"
                                        className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-safety-orange/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Brand</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. DeWalt"
                                        className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-safety-orange/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Category</label>
                                    <select className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-safety-orange/50 bg-white">
                                        <option value="">Select a category...</option>
                                        <option value="harvest">Harvest & Garden</option>
                                        <option value="build">Build & Repair</option>
                                        <option value="maintain">Maintain & Clean</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Daily Price ($)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-safety-orange/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Risk Toggle */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="text-sm font-bold text-slate-900 block">Risk Level & Deposit</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <label className={cn(
                                    "relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    riskLevel === "standard"
                                        ? "border-safety-orange bg-orange-50/50"
                                        : "border-slate-200 hover:border-slate-300"
                                )}>
                                    <input
                                        type="radio"
                                        name="risk"
                                        className="absolute top-4 right-4 text-safety-orange focus:ring-safety-orange"
                                        checked={riskLevel === "standard"}
                                        onChange={() => setRiskLevel("standard")}
                                    />
                                    <span className="font-bold text-slate-900">Standard Tool</span>
                                    <span className="text-xs text-slate-500 mt-1">Drills, Saws, Sanders</span>
                                    <div className="mt-3 pt-3 border-t border-slate-200/50">
                                        <span className="text-xs font-bold text-slate-600 uppercase">Renter Deposit</span>
                                        <div className="text-xl font-bold text-slate-900">$50.00</div>
                                    </div>
                                </label>

                                <label className={cn(
                                    "relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    riskLevel === "heavy"
                                        ? "border-safety-orange bg-orange-50/50"
                                        : "border-slate-200 hover:border-slate-300"
                                )}>
                                    <input
                                        type="radio"
                                        name="risk"
                                        className="absolute top-4 right-4 text-safety-orange focus:ring-safety-orange"
                                        checked={riskLevel === "heavy"}
                                        onChange={() => setRiskLevel("heavy")}
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">Heavy Machinery</span>
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    </div>
                                    <span className="text-xs text-slate-500 mt-1">Tractors, Excavators, Splitters</span>
                                    <div className="mt-3 pt-3 border-t border-slate-200/50">
                                        <span className="text-xs font-bold text-slate-600 uppercase">Renter Deposit</span>
                                        <div className="text-xl font-bold text-safety-orange">$250.00</div>
                                    </div>
                                </label>

                            </div>
                        </div>

                        {/* Manual Link */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-slate-900">Manufacturer Manual URL</label>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    Required for Safety
                                </span>
                            </div>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-safety-orange/50"
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                We provide this to every renter to ensure they know how to operate the tool safely.
                            </p>
                        </div>

                        <div className="pt-6">
                            <Button className="w-full h-12 text-base bg-safety-orange hover:bg-safety-orange/90">
                                List Tool for Rent
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
            <Footer />
        </main>
    );
}
