"use client";

import { useEffect, useRef } from "react";

export function Manifesto() {
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
                    gsap.set(".manifesto-dim", { opacity: 0, y: 30 });
                    gsap.set(".manifesto-bold", { opacity: 0, y: 60, scale: 0.95 });

                    gsap.to(".manifesto-dim", {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top 70%",
                            toggleActions: "play none none none",
                        },
                    });

                    gsap.to(".manifesto-bold", {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1.2,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top 60%",
                            toggleActions: "play none none none",
                        },
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
        <section
            ref={sectionRef}
            className="relative py-32 md:py-48 overflow-hidden"
            style={{ backgroundColor: "#111111" }}
            id="manifesto"
        >
            {/* Grain/Noise Overlay */}
            <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Decorative Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-white/10" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent to-white/10" />

            <div className="container mx-auto px-4 md:px-8 text-center">
                {/* Dimmed Philosophy */}
                <p className="manifesto-dim text-lg md:text-2xl text-white/20 font-light mb-6 tracking-wide">
                    Most people focus on: <span className="font-medium">Ownership.</span>
                </p>

                {/* Bold Statement */}
                <div className="manifesto-bold">
                    <p className="text-xl md:text-3xl text-white/40 font-light mb-4 tracking-wide">
                        We focus on:
                    </p>
                    <h2 className="text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[12rem] font-display text-safety-orange leading-[0.85] tracking-tight uppercase">
                        PRODUCTION.
                    </h2>
                </div>

                {/* Subtitle */}
                <p className="mt-10 max-w-xl mx-auto text-sm md:text-base text-white/30 leading-relaxed font-light">
                    BlockHyre is not a marketplace. It&apos;s a production network.
                    Your neighborhood already owns everything you need — we just connect the dots.
                </p>
            </div>
        </section>
    );
}
