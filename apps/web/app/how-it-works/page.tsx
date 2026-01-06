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
            title: "Find Your Tool",
            description:
                "Search for tools within 5 miles of your home. Filter by 'Verified Owners' or 'Protection Tier' to find exactly what you need for your project.",
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: CalendarCheck,
            title: "Book & Verify",
            description:
                "Select your dates. For high-value items (Tier 3), you'll verify your ID and place a temporary refundable security deposit.",
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: ShieldCheck,
            title: "The Safety Gate",
            description:
                "Before pickup, you must pass the 'Safety Gate': review the Owner's Manual, confirm you have the right PPE, and sign the Liability Waiver.",
            color: "from-emerald-500 to-teal-500",
        },
        {
            icon: Hammer,
            title: "Get to Work",
            description:
                "Pick up the tool, get your project done, and return it clean. Our community relies on treating neighbors' tools better than your own.",
            color: "from-orange-500 to-red-500",
        },
    ];

    const peaceFundTiers = [
        {
            tier: "Tier 1",
            label: "Low Risk",
            examples: "Hand tools, drills, ladders",
            fee: "$1.50",
            deductible: "$25.00",
            coverage: "$300",
            color: "border-slate-200 bg-slate-50",
            accentColor: "text-slate-700",
            iconBg: "bg-slate-100",
        },
        {
            tier: "Tier 2",
            label: "Medium Risk",
            examples: "Saws, mowers, welders",
            fee: "$4.00",
            deductible: "$75.00",
            coverage: "$1,000",
            color: "border-slate-200 bg-slate-50",
            accentColor: "text-slate-700",
            iconBg: "bg-slate-100",
        },
        {
            tier: "Tier 3",
            label: "High Risk",
            examples: "Heavy machinery, trailers",
            fee: "$9.00",
            deductible: "$250.00",
            coverage: "$3,000",
            color: "border-slate-200 bg-slate-50",
            accentColor: "text-slate-700",
            iconBg: "bg-slate-100",
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
            description:
                "Every user is verified. Tiers 1 & 2 require residency proof within 5 miles. Tier 3 (Heavy Machinery) requires strict Government ID verification.",
        },
        {
            icon: FileText,
            title: "Liability Protection",
            description:
                "Our 'Safety Gate' ensures renters review manuals and sign liability waivers before unlocking high-risk tools.",
        },
        {
            icon: AlertTriangle,
            title: "Fair Dispute Resolution",
            description:
                "Pre- and post-rental photos are mandatory. If there's a claim, admins review the side-by-side evidence to make a fair ruling.",
        },
    ];

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 md:py-32 px-6 overflow-hidden">
                {/* Decorative gradient orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-safety-orange/10 rounded-full blur-3xl opacity-20" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20" />

                <div className="relative max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium mb-8">
                        <ShieldCheck className="w-4 h-4 text-safety-orange" />
                        <span>Community-Powered Tool Sharing</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
                        Turn Your Neighborhood Into a{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-orange to-orange-400">
                            Distributed Factory
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Access professional-grade tools from verified neighbors. Protected by the Peace Fund, verified by ID, and built on trust.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
                        <Link href="/listings">
                            <Button size="lg" className="bg-safety-orange hover:bg-orange-600 text-white font-bold px-8 py-6 text-lg group">
                                Browse Tools
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/add-tool">
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-white border-white/30 hover:bg-white hover:text-slate-900 px-8 py-6 text-lg backdrop-blur-sm bg-white/10"
                            >
                                List a Tool
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-safety-orange mb-1">5mi</div>
                            <div className="text-sm text-slate-400">Local Radius</div>
                        </div>
                        <div className="text-center border-x border-slate-700">
                            <div className="text-3xl md:text-4xl font-bold text-safety-orange mb-1">$3K</div>
                            <div className="text-sm text-slate-400">Max Coverage</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-safety-orange mb-1">100%</div>
                            <div className="text-sm text-slate-400">Verified Users</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Steps */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-slate-600">
                            Safe, simple, and secure renting in 4 steps
                        </p>
                    </div>

                    {/* Desktop: Timeline view */}
                    <div className="hidden lg:block relative">
                        {/* Connection line */}
                        <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-emerald-500 to-orange-500 opacity-20" />

                        <div className="grid grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <div key={index} className="relative">
                                    {/* Numbered badge */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center font-bold text-lg shadow-lg`}>
                                            {index + 1}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl p-6 pt-12 shadow-sm border border-slate-100 hover:shadow-xl hover:border-safety-orange/30 transition-all duration-300 h-full group">
                                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} p-3 mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                                            <step.icon className="w-full h-full text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">
                                            {step.title}
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed text-center text-sm">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile: Card view */}
                    <div className="lg:hidden space-y-6">
                        {steps.map((step, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} p-3 flex-shrink-0`}>
                                        <step.icon className="w-full h-full text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-xs font-bold`}>
                                                {index + 1}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Peace Fund Section */}
            <section className="py-24 px-6 bg-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />

                <div className="relative max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full font-semibold text-sm mb-6 border border-emerald-200">
                            <ShieldCheck className="w-5 h-5" />
                            <span>Community Protection Program</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
                            The Peace Fund
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Accidents happen. The Peace Fund is a community reserve that covers repair costs so you don't have to worry about minor mishaps.
                        </p>
                        <p className="text-sm text-slate-400 italic mt-4">
                            *Not an insurance policy. Coverage subject to{" "}
                            <Link href="/terms" className="text-safety-orange hover:underline">
                                terms
                            </Link>
                            .
                        </p>
                    </div>

                    {/* Pricing Table */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {peaceFundTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl border-2 p-8 ${tier.color} relative transition-all duration-300 hover:shadow-xl hover:border-safety-orange/50 hover:-translate-y-1`}
                            >
                                <div className="text-center mb-6">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${tier.iconBg} mb-4`}>
                                        <ShieldCheck className={`w-8 h-8 ${tier.accentColor}`} />
                                    </div>
                                    <h3 className={`font-bold text-2xl ${tier.accentColor} mb-1`}>
                                        {tier.tier}
                                    </h3>
                                    <span className={`text-sm font-semibold uppercase tracking-wider ${tier.accentColor} opacity-80`}>
                                        {tier.label}
                                    </span>
                                </div>

                                <div className="text-center mb-6">
                                    <div className="text-4xl font-bold text-slate-900 mb-1">
                                        {tier.fee}
                                        <span className="text-lg text-slate-600 font-normal">/day</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mb-4">Peace Fund Fee</div>

                                    {/* Green Shield Coverage - NEW */}
                                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span className="font-semibold text-sm">Up to {tier.coverage} Coverage</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between py-3 border-t border-slate-200">
                                        <span className="text-sm text-slate-600 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            Your Deductible
                                        </span>
                                        <span className="font-bold text-slate-900">{tier.deductible}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-t border-slate-200">
                                        <span className="text-sm text-slate-600 flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4" />
                                            Max Coverage
                                        </span>
                                        <span className="font-bold text-slate-900">{tier.coverage}</span>
                                    </div>
                                </div>

                                <div className="bg-white/80 border border-slate-200 p-4 rounded-xl">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                        Examples
                                    </div>
                                    <div className="text-sm font-medium text-slate-700">{tier.examples}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link href="/peace-fund">
                            <Button variant="outline" className="border-slate-300 hover:border-safety-orange hover:text-safety-orange">
                                Learn More About Peace Fund
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trust & Safety Features */}
            <section className="py-24 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-safety-orange/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                                Trust is Our Currency
                            </h2>
                            <p className="text-xl text-slate-300 mb-12 leading-relaxed">
                                We've built multiple layers of verification and protection to ensure every transaction is safe, fair, and transparent.
                            </p>

                            <div className="space-y-8">
                                {trustFeatures.map((feature, index) => (
                                    <div key={index} className="flex gap-5 group">
                                        <div className="flex-shrink-0">
                                            <div className="w-14 h-14 rounded-xl bg-safety-orange/20 border border-safety-orange/30 p-3 group-hover:bg-safety-orange group-hover:scale-110 transition-all duration-300">
                                                <feature.icon className="w-full h-full text-safety-orange group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-2xl mb-3 text-white">
                                                {feature.title}
                                            </h3>
                                            <p className="text-slate-400 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12">
                                <Link href="/safety">
                                    <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white hover:text-slate-900">
                                        View Safety Guidelines
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Visual element */}
                        <div className="relative">
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 border border-slate-700/50 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-safety-orange/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative space-y-8">
                                    {/* Rental flow visualization */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-3">
                                            <Camera className="w-full h-full text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-slate-400 mb-1">Step 1</div>
                                            <div className="font-semibold text-white">Pre-rental Inspection</div>
                                            <div className="text-xs text-slate-500 mt-1">4 photos required</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-blue-500/20 border border-blue-500/30 p-3">
                                            <CheckCircle2 className="w-full h-full text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-slate-400 mb-1">Step 2</div>
                                            <div className="font-semibold text-white">ID Verification</div>
                                            <div className="text-xs text-slate-500 mt-1">Required for Tier 3</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-purple-500/20 border border-purple-500/30 p-3">
                                            <Clock className="w-full h-full text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-slate-400 mb-1">Step 3</div>
                                            <div className="font-semibold text-white">Return Window</div>
                                            <div className="text-xs text-slate-500 mt-1">30 min grace period</div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-700">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Protection Status</span>
                                            <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xl text-slate-600">
                            Everything you need to know about renting on BlockHyre
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="bg-white border-2 border-slate-100 rounded-xl px-6 hover:border-safety-orange/30 transition-colors"
                            >
                                <AccordionTrigger className="text-left font-semibold text-lg text-slate-900 hover:text-safety-orange py-6 hover:no-underline">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-600 leading-relaxed pb-6 pt-2">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <div className="mt-12 text-center">
                        <p className="text-slate-600 mb-6">Still have questions?</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/terms">
                                <Button variant="outline" className="border-slate-300">
                                    Read Terms of Service
                                </Button>
                            </Link>
                            <Link href="/liability">
                                <Button variant="outline" className="border-slate-300">
                                    View Liability Policy
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-6 bg-gradient-to-r from-safety-orange to-orange-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                        Ready to Start Your Project?
                    </h2>
                    <p className="text-xl mb-10 text-white/90">
                        Join your neighbors and access thousands of dollars worth of tools for a fraction of the cost.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/listings">
                            <Button size="lg" className="bg-white text-safety-orange hover:bg-slate-100 font-bold px-8 py-6 text-lg">
                                Browse Available Tools
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white text-white hover:bg-white hover:text-safety-orange px-8 py-6 text-lg"
                            >
                                Create Account
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}