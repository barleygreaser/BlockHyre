import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Camera, MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function RentalDashboardPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-midnight-navy">Rental #8392</h1>
                        <p className="text-slate-500">Harvest Right Freeze Dryer • 2 Days Remaining</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/20 px-3.5 py-1 text-2xs font-mono font-bold uppercase tracking-industrial rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                        ACTIVE
                    </Badge>
                </div>

                {/* Status Tracker */}
                <div className="bg-white p-6 md:p-8 rounded-card border border-slate-200/80 shadow-xs mb-8">
                    <div className="relative">
                        {/* Progress Bar Background */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                        {/* Progress Bar Fill */}
                        <div className="absolute top-1/2 left-0 w-1/2 h-1 bg-electric-indigo -translate-y-1/2 z-0 transition-all duration-1000"></div>

                        <div className="relative z-10 flex justify-between">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-electric-indigo text-white flex items-center justify-center font-bold text-sm">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <span className="text-2xs font-mono uppercase tracking-industrial font-bold text-midnight-navy">Pending Pickup</span>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-electric-indigo text-white flex items-center justify-center font-bold text-sm shadow-[0_0_0_4px_rgba(91,110,174,0.25)]">
                                    2
                                </div>
                                <span className="text-2xs font-mono uppercase tracking-industrial font-bold text-electric-indigo">ACTIVE</span>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center font-bold text-sm">
                                    3
                                </div>
                                <span className="text-2xs font-mono uppercase tracking-industrial font-medium text-slate-400">Inspection</span>
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center font-bold text-sm">
                                    4
                                </div>
                                <span className="text-2xs font-mono uppercase tracking-industrial font-medium text-slate-400">Complete</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Check-in Module */}
                        <Card className="border-slate-200/80 rounded-card shadow-xs overflow-hidden">
                            <CardHeader className="bg-midnight-navy p-5 text-white">
                                <CardTitle className="flex items-center gap-2 text-base font-serif">
                                    <Camera className="h-5 w-5" />
                                    Inspection Required
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Button className="flex-1 h-auto py-6 flex flex-col gap-2 bg-slate-50 hover:bg-slate-100 text-midnight-navy border border-slate-200 rounded-interactive active:translate-y-0.5 shadow-none">
                                            <Camera className="h-8 w-8 text-slate-400" />
                                            <span className="font-bold">Upload PRE-USE Photos</span>
                                            <span className="text-xs font-normal text-slate-500">Required to start insurance coverage</span>
                                        </Button>

                                        <Button disabled className="flex-1 h-auto py-6 flex flex-col gap-2 bg-slate-50/50 text-slate-300 border border-slate-100 rounded-interactive shadow-none cursor-not-allowed">
                                            <Clock className="h-8 w-8 text-slate-200" />
                                            <span className="font-bold">Upload RETURN Photos</span>
                                            <span className="text-xs font-normal text-slate-300">Available when rental expires</span>
                                        </Button>
                                    </div>

                                    <div className="bg-electric-indigo/5 text-midnight-navy text-xs font-mono p-4 rounded-interactive border border-electric-indigo/15 flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                        <p>
                                            <strong>Tip:</strong> Take photos of the serial number and any existing scratches.
                                            These photos protect your deposit.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Owner Info */}
                        <Card className="border-slate-200/80 rounded-card shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-lg font-serif">Owner Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                                        D
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-midnight-navy">Dave M.</h3>
                                        <p className="text-xs text-slate-500">Response time: &lt; 1 hr</p>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full gap-2 rounded-interactive active:translate-y-0.5 border-slate-300 text-midnight-navy hover:bg-slate-50">
                                    <MessageSquare className="h-4 w-4" />
                                    Chat with Dave
                                </Button>

                                <div className="pt-4 border-t border-slate-100">
                                    <button className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors">
                                        <AlertCircle className="h-3 w-3" />
                                        Initiate Dispute
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Time Remaining */}
                        <Card className="bg-midnight-navy text-white rounded-card shadow-md border-none">
                            <CardContent className="p-6 text-center">
                                <p className="text-signal-white/70 text-2xs font-mono uppercase tracking-industrial font-bold mb-1">Time Remaining</p>
                                <div className="text-4xl font-bold font-mono text-safety-orange">47:59:12</div>
                                <p className="text-xs text-slate-500 mt-2">Due back by Tuesday, 5:00 PM</p>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
