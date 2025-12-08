"use client";

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Users, Wrench, Shield, TrendingUp } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-repeat bg-center" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
                        Empowering Neighborhoods to <span className="text-safety-orange">Build Together</span>.
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        We believe that the tools to build the future shouldn't gather dust in a garage.
                        BlockShare turns every street into a workshop and every neighbor into a partner.
                    </p>
                    <Link href="/inventory">
                        <Button className="bg-safety-orange hover:bg-orange-600 text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                            Join the Movement
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-serif font-bold text-slate-900">Our Mission</h2>
                            <div className="w-20 h-1 bg-safety-orange"></div>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                BlockShare was founded on a simple premise: **Access over Ownership**.
                                In a world of finite resources and infinite creativity, it makes no sense for every household
                                to own a drill that is used for only 12 minutes in its entire lifetime.
                            </p>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                By connecting tool owners with local creators, DIYers, and professionals, we are
                                unlocking the latent potential of our communities. We are building a decentralized
                                factory where anyone can build anything, right from their neighborhood.
                            </p>
                        </div>
                        <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl bg-slate-100 group">
                            {/* Placeholder for a nice image */}
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
                                <Wrench className="h-24 w-24 opacity-20" />
                            </div>
                            {/* Actual Image would go here */}
                            {/* <Image src="/about-mission.jpg" fill className="object-cover" alt="Neighbors sharing tools" /> */}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats / Impact */}
            <section className="py-16 bg-slate-50 border-y border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-slate-900 mb-2">5,000+</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-slate-900 mb-2">$2M+</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tool Value Unlocked</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-slate-900 mb-2">12k</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Projects Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-slate-900 mb-2">99.8%</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Safety Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Core Values</h2>
                        <p className="text-slate-600">The principles that guide every decision we make.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-safety-orange">
                                    <Users className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Community First</h3>
                                <p className="text-slate-600">
                                    Trust is our currency. We prioritize features that build reputation, accountability, and real human connection.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                                    <Shield className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Radical Safety</h3>
                                <p className="text-slate-600">
                                    We don't cut corners. From insurance protection to our bespoke Dispute Tribunal, we keep our users safe.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                    <TrendingUp className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Sustainable Growth</h3>
                                <p className="text-slate-600">
                                    By reusing high-quality tools, we reduce waste and manufacturing demand. We build for the long haul.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-900 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-serif font-bold mb-6">Ready to start building?</h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup">
                            <Button className="bg-safety-orange hover:bg-orange-600 text-white font-bold h-12 px-8">
                                Create Account
                            </Button>
                        </Link>
                        <Link href="/inventory">
                            <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:border-white h-12 px-8">
                                Browse Tools
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
