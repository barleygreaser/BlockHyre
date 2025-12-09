"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Search, Calendar, Check, MessageSquare, TriangleAlert } from "lucide-react";

export function RenterDashboardView() {
    const [activeDisputes, setActiveDisputes] = useState([]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-serif text-slate-900">My Rentals</h2>
                    <p className="text-slate-500">Track your active rentals and history.</p>
                </div>
                <Link href="/inventory">
                    <Button className="bg-safety-orange hover:bg-safety-orange/90">
                        <Search className="mr-2 h-4 w-4" />
                        Find Tools
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Active & Upcoming */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Rentals */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Active Rentals</h2>
                        {/* Example Active Rental */}
                        <Card className="border-l-4 border-l-red-500 border-y border-r border-red-200 shadow-sm bg-red-50/50">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="secondary" className="bg-red-600 text-white hover:bg-red-700 border-none shadow-sm">Return Today</Badge>
                                            <span className="text-xs text-red-700 font-medium">Due by 5:00 PM</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-lg">Makita Circular Saw</h4>
                                        <p className="text-sm text-slate-600">Owner: <span className="font-medium">John D.</span></p>
                                    </div>
                                    <Button variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900">
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Message John D.
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Upcoming Bookings</h2>
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Pressure Washer</h4>
                                        <p className="text-sm text-slate-500">Oct 20 - Oct 22 • 2 days</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: History & Disputes */}
                <div className="space-y-6">
                    {/* Rental History */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-serif">Rental History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-slate-900">Hammer Drill</p>
                                    <p className="text-xs text-slate-500">Returned Oct 10</p>
                                </div>
                                <Button variant="link" className="text-safety-orange p-0 h-auto text-xs font-bold">
                                    Leave Review
                                </Button>
                            </div>
                            <div className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-slate-900">Ladder (20ft)</p>
                                    <p className="text-xs text-slate-500">Returned Sept 28</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-green-600 font-bold mb-1">
                                        Completed
                                    </div>
                                    <Link href="#" className="text-xs text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-2">
                                        Rent Again
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Disputes */}
                    {/* Disputes */}
                    {activeDisputes.length > 0 ? (
                        <Card className="border-red-200 shadow-sm bg-red-50">
                            <CardHeader>
                                <CardTitle className="text-lg font-serif text-red-700 flex items-center gap-2">
                                    <TriangleAlert className="h-5 w-5" />
                                    Active Dispute
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-red-600 text-sm mb-4">
                                    Action is required on your rental for <strong>Makita Circular Saw</strong>.
                                </p>
                                <Button size="sm" className="w-full font-bold bg-red-600 hover:bg-red-700 text-white">
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-4 flex items-center justify-between">
                                <span className="font-serif text-slate-900 font-medium">Disputes</span>
                                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                    <Check className="h-4 w-4" />
                                    No active disputes
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
