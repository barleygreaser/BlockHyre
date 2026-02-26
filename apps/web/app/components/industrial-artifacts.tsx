"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Shield, Layers, Activity } from "lucide-react";

/* ── Card 1: The Availability Heatmap ── */
function AvailabilityHeatmap() {
    const [isHovered, setIsHovered] = useState(false);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const slots = [
        [true, false, true, true, false, true, true],
        [false, true, true, false, true, true, false],
        [true, true, false, true, true, false, true],
    ];

    return (
        <div
            className="group h-full flex flex-col relative bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 overflow-hidden cursor-pointer transition-all duration-500 hover:border-safety-orange/40 hover:shadow-xl shadow-sm"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="article"
            aria-label="Tool Availability Heatmap"
            tabIndex={0}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
        >
            {/* Scanner Line */}
            {isHovered && (
                <div
                    className="absolute top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-safety-orange to-transparent z-20 animate-scanner"
                    style={{ boxShadow: "0 0 20px 4px rgba(255, 107, 0, 0.2)" }}
                />
            )}

            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-safety-orange/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-safety-orange" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Availability Heatmap</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">7-Day Overview</p>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {days.map((day) => (
                        <span key={day} className="text-[10px] text-slate-400 text-center font-mono uppercase">
                            {day}
                        </span>
                    ))}
                </div>
                {slots.map((row, rowIdx) => (
                    <div key={rowIdx} className="grid grid-cols-7 gap-1">
                        {row.map((available, colIdx) => (
                            <div
                                key={colIdx}
                                className={`h-8 rounded-lg transition-all duration-300 ${available
                                    ? "bg-safety-orange/10 border border-safety-orange/20 group-hover:bg-safety-orange/25 group-hover:border-safety-orange/40"
                                    : "bg-slate-50 border border-slate-100"
                                    }`}
                                style={{
                                    transitionDelay: `${(rowIdx * 7 + colIdx) * 30}ms`,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 mt-auto pt-5 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-safety-orange/20 border border-safety-orange/30" />
                    Available
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-slate-50 border border-slate-200" />
                    Booked
                </div>
            </div>
        </div>
    );
}

/* ── Card 2: Listing Shuffler (Tool Stack) ── */
function ListingShuffler() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const tools = [
        { name: "DeWalt 12\" Compound Miter Saw", category: "Woodworking", price: "$35/day", tier: "T2" },
        { name: "Honda GX200 Plate Compactor", category: "Power Tools", price: "$85/day", tier: "T3" },
        { name: "Stihl MS 271 Chainsaw", category: "Gardening", price: "$45/day", tier: "T2" },
        { name: "Makita 18V LXT Drill Kit", category: "Power Tools", price: "$25/day", tier: "T1" },
    ];

    const startCycle = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % tools.length);
        }, 3000);
    }, [tools.length]);

    useEffect(() => {
        startCycle();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startCycle]);

    return (
        <div
            className="relative h-full flex flex-col bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 overflow-hidden transition-all duration-500 hover:border-safety-orange/40 hover:shadow-xl shadow-sm"
            role="article"
            aria-label="Tool Listing Shuffler"
            tabIndex={0}
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-safety-orange/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-safety-orange" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Listing Shuffler</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Live Inventory</p>
                </div>
            </div>

            {/* Card Stack */}
            <div className="relative h-[180px]">
                {tools.map((tool, idx) => {
                    const isActive = idx === currentIndex;
                    const offset = ((idx - currentIndex + tools.length) % tools.length);

                    return (
                        <div
                            key={idx}
                            className={`absolute inset-x-0 transition-all duration-700 ease-out ${isActive ? "opacity-100" : offset === 1 ? "opacity-50" : offset === 2 ? "opacity-20" : "opacity-0"
                                }`}
                            style={{
                                transform: `translateY(${offset * 16}px) scale(${1 - offset * 0.04})`,
                                zIndex: tools.length - offset,
                            }}
                        >
                            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 leading-tight">{tool.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-mono">{tool.category}</p>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-safety-orange bg-safety-orange/10 px-2.5 py-1 rounded-full border border-safety-orange/20">
                                        {tool.tier}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-safety-orange font-mono">{tool.price}</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] text-emerald-600 font-mono uppercase">Available</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress Dots */}
            <div className="flex items-center gap-2 mt-auto pt-4 justify-center">
                {tools.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setCurrentIndex(idx);
                            startCycle();
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-safety-orange" : "w-1.5 bg-slate-200 hover:bg-slate-300"
                            }`}
                        aria-label={`View tool ${idx + 1}`}
                        tabIndex={0}
                    />
                ))}
            </div>
        </div>
    );
}

/* ── Card 3: Peace Fund Telemetry ── */
function PeaceFundTelemetry() {
    const [logs, setLogs] = useState<Array<{ text: string; time: string; type: string }>>([]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    const logTemplates = [
        { text: "COVERAGE_ACTIVE — Verified Insured ✓", type: "success" },
        { text: "PEACE_FUND — Neighbor #1847 claim resolved", type: "info" },
        { text: "VERIFIED — ID Check passed, 2mi radius confirmed", type: "success" },
        { text: "INSURED — $1M liability active for rental #2291", type: "success" },
        { text: "COVERAGE_ACTIVE — Tool return confirmed, deposit released", type: "info" },
        { text: "PEACE_FUND — Community reserve: $24,891 pooled", type: "info" },
        { text: "VERIFIED — Background check cleared for owner #903", type: "success" },
        { text: "INSURED — Equipment damage claim #412 approved", type: "info" },
    ];

    useEffect(() => {
        const initialLogs = logTemplates.slice(0, 4).map((log, idx) => ({
            ...log,
            time: new Date(Date.now() - (4 - idx) * 15000).toLocaleTimeString("en-US", { hour12: false }),
        }));
        setLogs(initialLogs);

        const interval = setInterval(() => {
            const randomLog = logTemplates[Math.floor(Math.random() * logTemplates.length)];
            const newLog = {
                ...randomLog,
                time: new Date().toLocaleTimeString("en-US", { hour12: false }),
            };
            setLogs((prev) => [...prev.slice(-6), newLog]);
        }, 4000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div
            className="relative h-full flex flex-col bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 overflow-hidden transition-all duration-500 hover:border-safety-orange/40 hover:shadow-xl shadow-sm"
            role="article"
            aria-label="Peace Fund Telemetry Feed"
            tabIndex={0}
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-safety-orange/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-safety-orange" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Peace Fund Telemetry</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Live Trust Feed</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-600 font-mono uppercase tracking-wider">Live</span>
                </div>
            </div>

            {/* Telemetry Feed */}
            <div ref={logContainerRef} className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-none">
                {logs.map((log, idx) => (
                    <div
                        key={`${log.time}-${idx}`}
                        className="flex items-start gap-2 text-[11px] font-mono animate-float-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <span className="text-slate-300 shrink-0 tabular-nums">{log.time}</span>
                        <span className={`leading-relaxed ${log.type === "success" ? "text-emerald-600" : "text-slate-500"
                            }`}>
                            {log.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* Gradient fade at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-[2.5rem]" />
        </div>
    );
}

/* ── Main Export ── */
export function IndustrialArtifacts() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        let ctx: any = null;

        const loadGsap = async () => {
            try {
                const gsapModule = await import("gsap");
                const scrollTriggerModule = await import("gsap/ScrollTrigger");
                const gsap = gsapModule.default;
                const ScrollTrigger = scrollTriggerModule.default;
                gsap.registerPlugin(ScrollTrigger);

                if (!sectionRef.current) return;

                ctx = gsap.context(() => {
                    const cards = sectionRef.current!.querySelectorAll(".artifact-card");

                    cards.forEach((card, idx) => {
                        gsap.set(card, { x: idx % 2 === 0 ? -80 : 80, opacity: 0 });

                        gsap.to(card, {
                            x: 0,
                            opacity: 1,
                            duration: 0.9,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: card,
                                start: "top 85%",
                                toggleActions: "play none none none",
                            },
                        });
                    });
                }, sectionRef);
            } catch {
                // Graceful degradation
            }
        };
        loadGsap();

        return () => {
            if (ctx) ctx.revert();
        };
    }, []);

    return (
        <section ref={sectionRef} className="py-20 md:py-32 bg-signal-white relative" id="features">
            {/* Section Header */}
            <div className="container mx-auto px-4 md:px-8 mb-14">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 max-w-[60px] bg-safety-orange/40" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-safety-orange">
                        Industrial Artifacts
                    </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 font-serif tracking-tight max-w-lg">
                    Every tool, tracked. Every rental, insured.
                </h2>
            </div>

            {/* Cards Grid */}
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="artifact-card h-full">
                        <AvailabilityHeatmap />
                    </div>
                    <div className="artifact-card h-full">
                        <ListingShuffler />
                    </div>
                    <div className="artifact-card h-full">
                        <PeaceFundTelemetry />
                    </div>
                </div>
            </div>
        </section>
    );
}
