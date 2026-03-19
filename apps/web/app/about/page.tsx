"use client";

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { Anchor, ShieldAlert, Cpu } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-signal-white text-charcoal grain-overlay overflow-x-hidden">
            <Navbar />

            {/* Hero Section: Charcoal Background */}
            <section className="relative bg-charcoal text-signal-white pt-28 pb-24 md:pt-32 md:pb-32 px-6 border-b-2 border-safety-orange -mt-20">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-workshop-gray via-charcoal to-charcoal pointer-events-none" />

                <div className="relative max-w-5xl mx-auto flex flex-col items-center z-10 text-center">
                    <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest text-concrete border border-workshop-gray px-4 py-2 bg-charcoal-light mb-8">
                        <div className="w-2 h-2 bg-safety-orange rounded-full animate-pulse-operational shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
                        <span>System Architecture</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-display uppercase tracking-tight mb-6 text-center leading-none">
                        About <br />
                        <span className="text-safety-orange">BlockHyre.</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-sans font-light text-concrete text-center max-w-3xl mb-12">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                    </p>
                </div>
            </section>

            {/* Founder / Creator Section */}
            <section className="py-24 px-6 bg-signal-white border-b-2 border-concrete">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-16 items-stretch">

                        {/* Photo Placeholder Area */}
                        <div className="w-full md:w-1/2 relative min-h-[500px] spec-card bg-concrete-dark/10 border-2 border-charcoal flex items-center justify-center overflow-hidden group">
                            {/* Target Corners */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-safety-orange opacity-50 m-4" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-safety-orange opacity-50 m-4" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-safety-orange opacity-50 m-4" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-safety-orange opacity-50 m-4" />

                            {/* ADD CREATOR PHOTO HERE */}
                            {/* <Image src="/path/to/creator-photo.jpg" alt="Creator Name" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-500" /> */}

                            <div className="text-center z-10 p-8">
                                <div className="font-mono text-sm uppercase tracking-widest text-workshop-gray mb-4">Image Target Block</div>
                                <h3 className="font-display text-4xl text-charcoal uppercase tracking-tight opacity-50">Upload Photo Here</h3>
                                <p className="font-mono text-xs mt-4 text-workshop-gray border border-concrete p-2 bg-white inline-block">500px x 600px Recommended</p>
                            </div>
                        </div>

                        {/* Text Area */}
                        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-8">
                            <div>
                                <div className="font-mono text-sm uppercase tracking-widest text-safety-orange mb-4">About</div>
                                <h2 className="text-5xl md:text-6xl font-display uppercase tracking-tight text-charcoal mb-4">
                                    Christopher Robinson
                                </h2>
                            </div>

                            <div className="font-sans text-xl text-workshop-gray space-y-6 border-l-4 border-safety-orange pl-6">
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.
                                </p>
                                <p>
                                    Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Phasellus magna velit, pellentesque non bibendum vel, varius nec elit.
                                </p>
                            </div>

                            <div className="font-mono text-sm text-charcoal bg-concrete px-6 py-4 border border-workshop-gray mt-4 max-w-fit shadow-inner">
                                <span className="opacity-70">DESIGNATION:</span> <span className="font-bold ml-2">CEO / LEAD ENGINEER</span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Core Directives */}
            <section className="py-24 px-6 bg-charcoal text-signal-white border-b-2 border-workshop-gray">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="font-mono text-sm uppercase tracking-widest text-emerald-400 mb-4 inline-flex items-center gap-2">
                            <Cpu className="w-4 h-4" /> System Core
                        </div>
                        <h2 className="text-5xl md:text-6xl font-display uppercase tracking-tight mb-6">
                            Operating Directives
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {/* Directive 1 */}
                        <div className="bg-charcoal-light border border-workshop-gray p-8 spec-card hover:border-safety-orange transition-colors group">
                            <div className="w-12 h-12 bg-charcoal border border-safety-orange flex items-center justify-center text-safety-orange mb-6 shadow-[0_0_15px_rgba(255,107,0,0.1)]">
                                <Anchor className="w-6 h-6" />
                            </div>
                            <h3 className="font-display text-3xl uppercase tracking-tight text-signal-white mb-4">Base Reliability</h3>
                            <p className="font-sans text-concrete leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed aliquet justo eu magna volutpat, a pretium felis iaculis. Integer aliquet orci in.
                            </p>
                        </div>

                        {/* Directive 2 */}
                        <div className="bg-charcoal-light border border-workshop-gray p-8 spec-card hover:border-safety-orange transition-colors group">
                            <div className="w-12 h-12 bg-charcoal border border-safety-orange flex items-center justify-center text-safety-orange mb-6 shadow-[0_0_15px_rgba(255,107,0,0.1)]">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <h3 className="font-display text-3xl uppercase tracking-tight text-signal-white mb-4">Absolute Security</h3>
                            <p className="font-sans text-concrete leading-relaxed">
                                Curabitur in augue auctor, finibus nisi nec, pulvinar quam. Morbi egestas massa at enim lobortis accumsan. Nullam condimentum dui vitae justo luctus.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Terminal */}
            <section className="py-24 px-6 bg-safety-orange text-charcoal relative overflow-hidden text-center">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1A1A1A 0, #1A1A1A 4px, transparent 4px, transparent 16px)' }} />

                <div className="relative max-w-4xl mx-auto z-10 flex flex-col items-center">
                    <h2 className="text-6xl md:text-8xl font-display uppercase tracking-tight mb-8 text-charcoal">
                        Lend and Borrow  With <br /> <span className="text-signal-white">Purpose.</span>
                    </h2>
                    <div className="flex justify-center w-full">
                        <Link href="/listings" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-charcoal text-signal-white hover:bg-black font-bold uppercase tracking-widest px-10 py-8 text-lg rounded-none magnetic-btn shadow-[8px_8px_0_rgba(255,255,255,0.4)] border-2 border-charcoal">
                                Find Tools in Your Neighborhood
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
