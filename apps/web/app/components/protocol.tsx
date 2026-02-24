"use client";

import { useEffect, useRef } from "react";
import { Radar, Lock, Settings } from "lucide-react";

const STEPS = [
    {
        number: "01",
        title: "Discover",
        description: "Scan your 2-mile radius for the exact tool you need. Our verification system ensures every listing is production-ready.",
        icon: Radar,
        color: "text-safety-orange",
        bgColor: "bg-safety-orange/10",
        borderColor: "border-safety-orange/20",
        ghostColor: "text-safety-orange/[0.06]",
        accentVia: "via-safety-orange/15",
    },
    {
        number: "02",
        title: "Secure",
        description: "Lock in your rental with The Peace Fund insurance. ID-verified neighbors, $1M liability coverage, refundable deposit.",
        icon: Lock,
        color: "text-emerald-500",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        ghostColor: "text-emerald-500/[0.06]",
        accentVia: "via-emerald-400/15",
    },
    {
        number: "03",
        title: "Build",
        description: "Pick up your tool and get to work. Return it when you're done. Your neighborhood is your factory floor.",
        icon: Settings,
        color: "text-sky-500",
        bgColor: "bg-sky-50",
        borderColor: "border-sky-200",
        ghostColor: "text-sky-500/[0.06]",
        accentVia: "via-sky-400/15",
    },
];

export function Protocol() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const loadGsap = async () => {
            try {
                const gsapModule = await import("gsap");
                const scrollTriggerModule = await import("gsap/ScrollTrigger");
                const gsap = gsapModule.default;
                const ScrollTrigger = scrollTriggerModule.default;
                gsap.registerPlugin(ScrollTrigger);

                if (!sectionRef.current) return;

                const cards = sectionRef.current.querySelectorAll(".protocol-card");

                cards.forEach((card, idx) => {
                    gsap.from(card, {
                        y: 100,
                        opacity: 0,
                        scale: 0.95,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: card,
                            start: "top 85%",
                            toggleActions: "play none none none",
                        },
                        delay: idx * 0.1,
                    });
                });

                /* Icon spin animation for the gear */
                const gearIcon = sectionRef.current.querySelector(".protocol-gear");
                if (gearIcon) {
                    gsap.to(gearIcon, {
                        rotation: 360,
                        duration: 8,
                        repeat: -1,
                        ease: "none",
                    });
                }
            } catch {
                // Graceful degradation
            }
        };
        loadGsap();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 md:py-32 bg-concrete/30 relative" id="protocol">
            {/* Section Header */}
            <div className="container mx-auto px-4 md:px-8 mb-16">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 max-w-[60px] bg-safety-orange/40" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-safety-orange">
                        The Protocol
                    </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 font-serif tracking-tight max-w-lg">
                    Three steps. Zero friction.
                </h2>
                <p className="mt-4 text-slate-500 max-w-md text-sm leading-relaxed">
                    From discovery to production in under 5 minutes. Every step backed by The Peace Fund.
                </p>
            </div>

            {/* Protocol Cards */}
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STEPS.map((step) => {
                        const IconComponent = step.icon;
                        const isGear = step.icon === Settings;

                        return (
                            <div
                                key={step.number}
                                className={`protocol-card group relative bg-white rounded-[2.5rem] p-8 md:p-10 border ${step.borderColor} overflow-hidden transition-all duration-500 hover:border-safety-orange/40 hover:shadow-xl shadow-sm`}
                            >
                                {/* Step Number */}
                                <span className={`absolute top-8 right-8 text-[5rem] font-display ${step.ghostColor} leading-none select-none`}>
                                    {step.number}
                                </span>

                                {/* Icon */}
                                <div className={`h-14 w-14 rounded-2xl ${step.bgColor} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110`}>
                                    <IconComponent
                                        className={`h-7 w-7 ${step.color} ${isGear ? "protocol-gear" : ""}`}
                                    />
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <div className="flex items-baseline gap-3 mb-3">
                                        <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                                            Step {step.number}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3 font-serif">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Bottom accent line */}
                                <div className={`absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent ${step.accentVia} to-transparent`} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
