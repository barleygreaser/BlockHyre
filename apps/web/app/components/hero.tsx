"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { MapPin, ChevronDown } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";

export function Hero() {
    const { user } = useAuth();
    const headlineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadGsap = async () => {
            try {
                const gsapModule = await import("gsap");
                const scrollTriggerModule = await import("gsap/ScrollTrigger");
                const gsap = gsapModule.default;
                const ScrollTrigger = scrollTriggerModule.default;
                gsap.registerPlugin(ScrollTrigger);

                if (!headlineRef.current) return;

                const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

                tl.from(headlineRef.current.querySelectorAll(".hero-line-1"), {
                    y: 60,
                    opacity: 0,
                    duration: 1,
                    delay: 0.2,
                });
                tl.from(headlineRef.current.querySelectorAll(".hero-line-2"), {
                    y: 80,
                    opacity: 0,
                    duration: 1.2,
                    skewY: 2,
                }, "-=0.6");
                tl.from(headlineRef.current.querySelectorAll(".hero-subtitle"), {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                }, "-=0.6");
                tl.from(headlineRef.current.querySelectorAll(".hero-cta"), {
                    y: 20,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.15,
                }, "-=0.4");
            } catch {
                // GSAP not critical — animations degrade gracefully
            }
        };
        loadGsap();
    }, []);

    return (
        <section
            className="relative h-[100vh] min-h-[700px] w-full overflow-hidden flex items-center"
            id="hero"
        >
            {/* Background Images — Original BlockHyre Community Photos */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://uttbptpkekijlfzvauzu.supabase.co/storage/v1/object/public/assets/hero_landscape_opt.jpg"
                    alt="BlockHyre Community Tools - Neighbors exchanging tools"
                    fill
                    sizes="(max-width: 767px) 1px, 100vw"
                    className="hidden md:block object-cover object-right"
                    priority
                />
                <Image
                    src="https://uttbptpkekijlfzvauzu.supabase.co/storage/v1/object/public/assets/hero_portrait_opt.jpg"
                    alt="BlockHyre Community Tools - Neighbors exchanging tools"
                    fill
                    sizes="(max-width: 767px) 100vw, 1px"
                    className="md:hidden object-cover object-center"
                    priority
                />

                {/* Gradient overlays for readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-signal-white via-transparent to-transparent" />

                {/* Subtle noise overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Content */}
            <div className="container relative z-10 mx-auto px-4 md:px-8" ref={headlineRef}>
                <div className="max-w-3xl space-y-8">
                    {/* Headline */}
                    <div className="space-y-2">
                        <h1>
                            <span className="hero-line-1 block text-2xl sm:text-3xl md:text-4xl font-bold font-sans text-white/90 leading-tight tracking-tight">
                                Turn your neighborhood into a
                            </span>
                            <span className="hero-line-2 block text-[4.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] font-display text-safety-orange leading-[0.85] tracking-tight uppercase"
                                style={{ fontStyle: "italic" }}
                            >
                                FACTORY.
                            </span>
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <p className="hero-subtitle text-lg md:text-xl text-white/80 leading-relaxed max-w-xl font-light">
                        Rent woodworking tools, power tools, and gardening equipment from
                        verified neighbors within 2 miles. Every rental insured by{" "}
                        <span className="text-safety-orange font-medium">The Peace Fund</span>.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Link href="/listings" className="hero-cta w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="magnetic-btn w-full sm:w-auto h-14 px-10 text-lg font-bold bg-safety-orange hover:bg-safety-orange-hover text-white border-none rounded-full uppercase tracking-wider"
                                id="hero-cta-find-tools"
                            >
                                <MapPin className="mr-2 h-5 w-5" />
                                Find Tools Near You
                            </Button>
                        </Link>

                        <Link
                            href={user ? "/add-tool" : "/signup?intent=list-tool"}
                            className="hero-cta w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                className="w-full sm:w-auto h-14 px-10 text-lg font-bold bg-transparent text-white border-2 border-white/30 hover:border-safety-orange hover:text-safety-orange rounded-full uppercase tracking-wider transition-all"
                                id="hero-cta-list-tools"
                            >
                                List My Tools
                            </Button>
                        </Link>
                    </div>

                    {/* Trust Signal */}
                    <div className="hero-cta flex items-center gap-3 pt-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-[10px] font-bold text-white"
                                >
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-white/60 font-medium">
                            Trusted by <span className="text-white font-bold">2,000+</span> homes in your neighborhood
                        </p>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Scroll</span>
                <ChevronDown className="h-4 w-4 text-white/40" />
            </div>
        </section>
    );
}
