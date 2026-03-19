"use client";

import React from "react";
import Link from "next/link";
import {
    ShieldCheck,
    Search,
    CalendarCheck,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Hammer,
    ArrowRight,
    Camera,
    Clock,
    DollarSign,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";

export default function HowItWorksPage() {
    const steps = [
        {
            icon: Search,
            num: "01",
            title: "FIND ASSET",
            description: "Query the neighborhood grid. Filter by Verified Owners and required Peace Fund tiers. Target proximity: 5 miles.",
        },
        {
            icon: CalendarCheck,
            num: "02",
            title: "RESERVE & AUTH",
            description: "Confirm scheduling constraints. Tier 3 assets require strict identity verification and security holds.",
        },
        {
            icon: ShieldCheck,
            num: "03",
            title: "THE SAFETY GATE",
            description: "Mandatory checklist: review the operational manual, confirm PPE inventory, and execute the liability waiver.",
        },
        {
            icon: Hammer,
            num: "04",
            title: "PRODUCTION",
            description: "Deploy the tool. Maintain operational integrity. Return the asset in factory condition.",
        },
    ];

    const peaceFundTiers = [
        {
            id: "PF-T1",
            tier: "TIER 01",
            label: "Low Risk",
            examples: "Hand tools, Drills, Manual Equipment",
            fee: "$1.50",
            deductible: "$25.00",
            coverage: "$300",
        },
        {
            id: "PF-T2",
            tier: "TIER 02",
            label: "Medium Risk",
            examples: "Power Saws, Mowers, Welders",
            fee: "$4.00",
            deductible: "$75.00",
            coverage: "$1,000",
        },
        {
            id: "PF-T3",
            tier: "TIER 03",
            label: "High Risk",
            examples: "Heavy machinery, Trailers",
            fee: "$9.00",
            deductible: "$250.00",
            coverage: "$3,000",
        },
    ];

    const faqs = [
        {
            question: "What if I accidentally break a tool?",
            answer:
                "Don't panic—this is why the Peace Fund exists. Report the damage immediately via the dashboard. You will pay the deductible for that tool's tier (e.g., $25 for a drill, $250 for an excavator), and the Peace Fund covers the repair costs up to the coverage limit. You are only liable for amounts exceeding the coverage limit.",
        },
        {
            question: "Is the Peace Fund insurance?",
            answer:
                "No. The Peace Fund is a community-led protection program and damage waiver, not an insurance policy. It is designed to cover physical damage to the tool itself. It does NOT cover personal injury or liability (like hitting a car with a rented trailer).",
        },
        {
            question: "What happens if I return a tool late?",
            answer:
                "We have a strict tiered late fee policy to keep the community moving. 0-30 mins is a grace period ($0). 30 mins to 1 hour costs 50% of the daily rate. 1 to 4 hours costs a full day's rate. Anything beyond 4 hours is charged at DOUBLE the daily rate for the entire delay period.",
        },
        {
            question: "When do I get my security deposit back?",
            answer:
                "Security deposits are currently only required for High Risk (Tier 3) items. The hold is released automatically after the Owner confirms the tool was returned in good condition (usually within 24 hours of return).",
        },
        {
            question: "Do I need to clean the tool?",
            answer:
                "Yes. BlockHyre operates on neighborly trust. Please return tools free of mud, dust, and debris. If a tool is returned dirty, owners can charge a cleaning fee which is deducted from your deposit or charged to your card.",
        },
    ];

    const trustFeatures = [
        {
            icon: CheckCircle2,
            title: "Verified Neighbors Only",
            description: "Every user is verified. Tiers 1 & 2 require residency proof within 5 miles. Tier 3 (Heavy Machinery) requires strict Government ID verification.",
        },
        {
            icon: FileText,
            title: "Liability Protection",
            description: "Our 'Safety Gate' ensures renters review manuals and sign liability waivers before unlocking high-risk tools.",
        },
        {
            icon: AlertTriangle,
            title: "Fair Dispute Resolution",
            description: "Pre- and post-rental photos are mandatory. If there's a claim, admins review the side-by-side evidence to make a fair ruling.",
        },
    ];

    return (
        <main className="min-h-screen bg-signal-white text-charcoal grain-overlay overflow-x-hidden">
            <Navbar />

            {/* Hero Section: Command Center (Charcoal Background) */}
            <section className="relative bg-charcoal text-signal-white pt-28 pb-24 md:pt-32 md:pb-32 px-6 border-b-2 border-safety-orange -mt-20">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-workshop-gray via-charcoal to-charcoal pointer-events-none" />

                <div className="relative max-w-5xl mx-auto flex flex-col items-center">
                    {/* Telemetry style label */}
                    <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest text-concrete border border-workshop-gray px-4 py-2 bg-charcoal-light mb-8">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-operational shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span>System Operational</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-display uppercase tracking-tight mb-6 text-center leading-none">
                        The Neighborhood <br />
                        <span className="text-safety-orange">Factory.</span>
                    </h1>

                    <p className="text-xl md:text-2xl font-sans font-light text-concrete text-center max-w-3xl mb-12">
                        Your street is your workshop. Commercial-grade production capability, distributed across the grid. Protected by the Peace Fund.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 items-center w-full">
                        <Link href="/listings" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-safety-orange hover:bg-safety-orange-hover text-signal-white font-bold px-10 py-7 text-lg rounded-none magnetic-btn group shadow-[0_4px_20px_rgba(255,107,0,0.3)] border border-safety-orange hover:text-white transition-all flex items-center justify-center">
                                <Search className="w-5 h-5 mr-3" />
                                Browse Tools
                            </Button>
                        </Link>
                        <Link href="/add-tool" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto bg-charcoal text-signal-white border-workshop-gray hover:bg-workshop-gray hover:text-white px-10 py-7 text-lg rounded-none magnetic-btn font-mono uppercase tracking-wider text-sm transition-colors flex items-center justify-center"
                            >
                                List Tool
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Telemetry */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto w-full border-t border-workshop-gray pt-8">
                        <div className="flex flex-col items-center">
                            <div className="text-4xl md:text-5xl font-mono text-safety-orange mb-2">5 MI</div>
                            <div className="font-mono text-xs text-concrete uppercase tracking-widest">Local Radius</div>
                        </div>
                        <div className="flex flex-col items-center md:border-x border-workshop-gray">
                            <div className="text-4xl md:text-5xl font-mono text-signal-white mb-2">$3K</div>
                            <div className="font-mono text-xs text-concrete uppercase tracking-widest">Max Coverage</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl md:text-5xl font-mono text-signal-white mb-2">100%</div>
                            <div className="font-mono text-xs text-concrete uppercase tracking-widest">Verification Node</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Steps: The Production Line */}
            <section className="py-24 px-6 bg-signal-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 animate-float-up">
                        <h2 className="text-5xl md:text-6xl font-display uppercase tracking-tight text-charcoal mb-4">
                            Operational Flow
                        </h2>
                        <p className="font-sans text-xl text-workshop-gray">
                            Four stages to output. Precision and safety guaranteed.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative group rounded-[40px] bg-white border border-concrete p-8 shadow-sm hover:shadow-xl hover:border-safety-orange transition-all duration-300 overflow-hidden spec-card">
                                {/* Scanner Sweep overlay */}
                                <div className="absolute top-0 bottom-0 w-[2px] bg-safety-orange opacity-0 group-hover:opacity-100 group-hover:animate-scanner mix-blend-overlay pointer-events-none" />

                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-16 h-16 rounded-xl bg-charcoal flex items-center justify-center text-safety-orange border border-workshop-gray shadow-md group-hover:scale-105 group-hover:border-safety-orange transition-all duration-300 relative">
                                        <div className="absolute inset-0 bg-safety-orange/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <step.icon className="w-8 h-8 relative z-10" strokeWidth={1.5} />
                                    </div>
                                    <div className="font-mono text-6xl font-bold text-concrete-dark tracking-tighter opacity-30 select-none hidden sm:block">
                                        {step.num}
                                    </div>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-charcoal mb-4 uppercase">
                                    {step.title}
                                </h3>
                                <p className="font-sans text-workshop-gray leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Peace Fund Section: Contrast Break */}
            <section className="py-24 px-6 bg-charcoal text-signal-white relative border-y border-workshop-gray">
                <div className="relative max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest bg-charcoal-light border border-workshop-gray px-4 py-2 text-concrete mb-6">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>Risk Mitigation Protocol</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-display uppercase tracking-tight mb-6">
                            The Peace Fund
                        </h2>
                        <p className="font-sans font-light text-xl text-concrete max-w-2xl mx-auto">
                            The community ledger for physical liabilities. We cover the repair costs; you cover the deductible. A machine isn't operational without proper safety measures.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {peaceFundTiers.map((tier, index) => (
                            <div
                                key={index}
                                className="bg-charcoal-light border border-workshop-gray p-8 spec-card relative rounded-none flex flex-col group"
                            >
                                {/* Top accent bar */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-workshop-gray group-hover:bg-safety-orange transition-colors" />

                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <div className="font-mono text-xs text-safety-orange uppercase tracking-widest mb-1">{tier.id}</div>
                                        <h3 className="font-display text-4xl tracking-tight uppercase text-signal-white">{tier.tier}</h3>
                                        <div className="font-sans text-sm text-concrete">{tier.label}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-operational shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        <span className="font-mono text-xs text-concrete uppercase tracking-widest">Active</span>
                                    </div>
                                </div>

                                <div className="mb-8 pb-8 border-b border-workshop-gray">
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-mono text-4xl md:text-5xl font-bold text-signal-white">{tier.fee}</span>
                                        <span className="font-mono text-sm text-concrete">/DAY</span>
                                    </div>
                                    <div className="font-mono text-xs text-concrete uppercase mt-2 opacity-70">Surcharge</div>
                                </div>

                                <div className="space-y-4 font-mono text-sm mb-8 flex-grow">
                                    <div className="flex justify-between items-center text-concrete border-b border-workshop-gray/50 pb-2">
                                        <span className="uppercase tracking-wider">Deductible</span>
                                        <span className="text-signal-white font-bold">{tier.deductible}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-400">
                                        <span className="uppercase tracking-wider">Max Coverage</span>
                                        <span className="font-bold">{tier.coverage}</span>
                                    </div>
                                </div>

                                <div className="bg-charcoal p-4 border border-workshop-gray mt-auto">
                                    <div className="font-mono text-xs uppercase text-workshop-gray tracking-widest mb-2 font-bold">Classifications</div>
                                    <div className="font-sans text-sm text-concrete leading-snug">{tier.examples}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Safety Spec Sheet */}
            <section className="py-24 px-6 bg-concrete relative">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
                    <div className="lg:w-1/2">
                        <div className="font-mono text-sm uppercase tracking-widest text-safety-orange mb-4">System Integrity</div>
                        <h2 className="text-5xl md:text-6xl font-display uppercase tracking-tight text-charcoal mb-8">
                            Trust Architecture
                        </h2>
                        <p className="font-sans text-xl text-workshop-gray mb-12 border-l-4 border-safety-orange pl-4">
                            A production environment is only as safe as its weakest point. Our platform integrates multi-layered validation logic bridging the gap between hardware utility and verified responsibility.
                        </p>

                        <div className="space-y-6">
                            {trustFeatures.map((feature, index) => (
                                <div key={index} className="bg-white border border-concrete-dark rounded-none p-6 flex gap-6 hover:border-safety-orange transition-colors duration-300 shadow-sm">
                                    <div className="flex-shrink-0 mt-1">
                                        <feature.icon className="w-8 h-8 text-charcoal" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-charcoal mb-2">{feature.title}</h3>
                                        <p className="font-sans text-workshop-gray">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/2">
                        {/* Technical diagram replica */}
                        <div className="bg-signal-white border-2 border-charcoal p-8 rounded-none shadow-[8px_8px_0_#1A1A1A] h-full flex flex-col justify-center relative overflow-hidden">
                            <div className="font-mono text-xs font-bold uppercase tracking-widest text-charcoal mb-6 border-b-2 border-charcoal pb-2 flex justify-between">
                                <span>Verification Sequence</span>
                                <span>v2.4.1</span>
                            </div>

                            <div className="space-y-8 relative">
                                <div className="absolute left-[1.4rem] top-6 bottom-6 w-[2px] bg-workshop-gray" />

                                <div className="flex items-start gap-6 relative z-10 group">
                                    <div className="w-12 h-12 shrink-0 bg-charcoal text-signal-white flex items-center justify-center font-mono font-bold border-2 border-signal-white group-hover:bg-safety-orange transition-colors">1</div>
                                    <div className="bg-concrete-dark/20 p-4 border border-workshop-gray w-full spec-card">
                                        <div className="font-mono font-bold text-charcoal uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Camera className="w-4 h-4" /> Pre-Op Inspect
                                        </div>
                                        <div className="font-sans text-sm text-workshop-gray">Mandatory 4-point visual capture to log initial base state. Required before machine unlock.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6 relative z-10 group">
                                    <div className="w-12 h-12 shrink-0 bg-charcoal text-signal-white flex items-center justify-center font-mono font-bold border-2 border-signal-white group-hover:bg-safety-orange transition-colors">2</div>
                                    <div className="bg-concrete-dark/20 p-4 border border-workshop-gray w-full spec-card">
                                        <div className="font-mono font-bold text-charcoal uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> ID Validation
                                        </div>
                                        <div className="font-sans text-sm text-workshop-gray">Tier 3 assets compel strict identity matrix verification against government schema.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6 relative z-10 group">
                                    <div className="w-12 h-12 shrink-0 bg-charcoal text-signal-white flex items-center justify-center font-mono font-bold border-2 border-signal-white group-hover:bg-safety-orange transition-colors">3</div>
                                    <div className="bg-concrete-dark/20 p-4 border border-workshop-gray w-full spec-card">
                                        <div className="font-mono font-bold text-charcoal uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Return Logic
                                        </div>
                                        <div className="font-sans text-sm text-workshop-gray">Zero-tolerance late framework with 30-min buffer. Automated compounding penalty fees.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6 bg-signal-white text-charcoal">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-16">
                        <div className="font-mono text-sm uppercase tracking-widest text-safety-orange mb-4">Knowledge Base</div>
                        <h2 className="text-5xl font-display uppercase tracking-tight text-charcoal">
                            Directives & FAQ
                        </h2>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="bg-white border border-concrete px-2 rounded-none hover:border-charcoal transition-colors group"
                            >
                                <AccordionTrigger className="text-left font-serif font-bold text-lg text-charcoal px-4 py-6 hover:no-underline hover:text-safety-orange">
                                    <div className="flex items-center">
                                        <span className="nav-bracket mr-2">
                                            <span className="nav-bracket-left">[</span>
                                        </span>
                                        {faq.question}
                                        <span className="nav-bracket ml-2">
                                            <span className="nav-bracket-right">]</span>
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="font-sans text-workshop-gray leading-relaxed px-4 pb-6 pt-2 text-base">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-6 bg-safety-orange text-charcoal relative overflow-hidden text-center">
                {/* Diagonal industrial stripes bg */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1A1A1A 0, #1A1A1A 4px, transparent 4px, transparent 16px)' }} />

                <div className="relative max-w-4xl mx-auto z-10 flex flex-col items-center">
                    <h2 className="text-6xl md:text-8xl font-display uppercase tracking-tight mb-8 text-charcoal">
                        Ready To <br /> <span className="text-signal-white">Produce?</span>
                    </h2>
                    <p className="font-sans text-xl text-charcoal font-medium mb-12 max-w-2xl">
                        Connect into the neighborhood manufacturing grid. High-end capacity without the capital expenditure.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-xl">
                        <Link href="/listings" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-charcoal text-signal-white hover:bg-black font-bold px-10 py-8 text-lg rounded-none magnetic-btn shadow-[8px_8px_0_rgba(255,255,255,0.4)] border-2 border-charcoal">
                                ACCESS TOOLS
                            </Button>
                        </Link>
                        <Link href="/signup" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border-2 border-charcoal text-charcoal bg-transparent hover:bg-charcoal hover:text-safety-orange font-bold uppercase tracking-widest px-10 py-8 text-lg rounded-none magnetic-btn"
                            >
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}