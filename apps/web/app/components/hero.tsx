"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { MapPin, ChevronDown, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { useDebounce } from "@/app/hooks/use-debounce";

export function Hero() {
    const { user } = useAuth();
    const headlineRef = useRef<HTMLDivElement>(null);
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<{ tool_name?: string; category_path?: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchSuggestions = async () => {
            if (debouncedQuery.length < 2) {
                if (isMounted) setSuggestions([]);
                return;
            }
            if (isMounted) setIsSearching(true);
            try {
                const res = await fetch(`/api/fetch-suggestions?query=${encodeURIComponent(debouncedQuery)}&type=tool`);
                const data = await res.json();
                if (isMounted && data.suggestions) {
                    setSuggestions(data.suggestions);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                if (isMounted) setIsSearching(false);
            }
        };

        fetchSuggestions();
        return () => { isMounted = false; };
    }, [debouncedQuery]);

    const handleSelectSuggestion = (itemName: string) => {
        setSearchQuery(itemName);
        setShowSuggestions(false);
        window.location.href = `/listings?search=${encodeURIComponent(itemName)}`;
    };

    useEffect(() => {
        let tl: any = null;
        let ctx: any = null;

        const loadGsap = async () => {
            try {
                const gsapModule = await import("gsap");
                const scrollTriggerModule = await import("gsap/ScrollTrigger");
                const gsap = gsapModule.default;
                const ScrollTrigger = scrollTriggerModule.default;
                gsap.registerPlugin(ScrollTrigger);

                if (!headlineRef.current) return;

                // Create a GSAP context scoped to the hero — auto-cleans everything on revert
                ctx = gsap.context(() => {
                    // Check if the user has already seen the animation in this session
                    const hasSeenAnimation = sessionStorage.getItem("heroAnimationSeen");

                    if (hasSeenAnimation) {
                        // Animation was already seen, leave elements in their default visible state
                        // We forcefully set them just in case
                        gsap.set([".hero-line-1", ".hero-line-2", ".hero-subtitle", ".hero-cta"], {
                            y: 0,
                            opacity: 1,
                            skewY: 0
                        });
                        return;
                    }

                    // Reset all animated elements to hidden state first
                    // This ensures clean re-entry for the animation
                    gsap.set(".hero-line-1", { y: 60, opacity: 0 });
                    gsap.set(".hero-line-2", { y: 80, opacity: 0, skewY: 2 });
                    gsap.set(".hero-subtitle", { y: 30, opacity: 0 });
                    gsap.set(".hero-cta", { y: 20, opacity: 0 });

                    // Remove FOUC style if it exists safely AFTER GSAP applies inline styles
                    const foucStyle = document.getElementById("hero-fouc-fix");
                    if (foucStyle) foucStyle.remove();

                    // Build the entrance timeline
                    tl = gsap.timeline({
                        defaults: { ease: "power3.out" },
                        onComplete: () => {
                            // Mark animation as seen once it finishes
                            sessionStorage.setItem("heroAnimationSeen", "true");
                        }
                    });

                    tl.to(".hero-line-1", {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        delay: 0.2,
                    });
                    tl.to(".hero-line-2", {
                        y: 0,
                        opacity: 1,
                        skewY: 0,
                        duration: 1.2,
                    }, "-=0.6");
                    tl.to(".hero-subtitle", {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                    }, "-=0.6");
                    tl.to(".hero-cta", {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.15,
                    }, "-=0.4");
                }, headlineRef);
            } catch {
                // GSAP not critical — animations degrade gracefully
                // On failure, make sure elements are visible
                const foucStyle = document.getElementById("hero-fouc-fix");
                if (foucStyle) foucStyle.remove();

                if (headlineRef.current) {
                    headlineRef.current.querySelectorAll(".hero-line-1, .hero-line-2, .hero-subtitle, .hero-cta")
                        .forEach((el) => {
                            (el as HTMLElement).style.opacity = "1";
                            (el as HTMLElement).style.transform = "none";
                        });
                }
            }
        };

        // Small RAF delay ensures DOM is fully painted before animation starts
        requestAnimationFrame(() => {
            loadGsap();
        });

        return () => {
            // Clean up: kill timeline and revert GSAP context on unmount
            if (tl) tl.kill();
            if (ctx) ctx.revert();
        };
    }, []);

    return (
        <section
            className="relative h-[100vh] min-h-[700px] w-full flex items-center"
            id="hero"
        >
            {/* FOUC Prevention Script */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        try {
                            if (!sessionStorage.getItem('heroAnimationSeen')) {
                                var style = document.createElement('style');
                                style.id = 'hero-fouc-fix';
                                style.innerHTML = '#hero .hero-line-1 { opacity: 0; transform: translateY(60px); } #hero .hero-line-2 { opacity: 0; transform: translateY(80px) skewY(2deg); } #hero .hero-subtitle { opacity: 0; transform: translateY(30px); } #hero .hero-cta { opacity: 0; transform: translateY(20px); }';
                                document.head.appendChild(style);
                            }
                        } catch (e) {}
                    `
                }}
            />
            {/* Background Video — BlockHyre Hero */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/hero-poster.jpg"
                    className="absolute inset-0 w-full h-full object-cover"
                    aria-hidden="true"
                >
                    <source src="/final_homepage_hero.webm" type="video/webm" />
                </video>

                {/* Gradient overlays for readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-signal-white/85 via-signal-white/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-signal-white/70 via-transparent to-transparent" />

                {/* Subtle noise overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Content */}
            <div className="container relative z-40 mx-auto px-4 md:px-8 mt-12 md:mt-24" ref={headlineRef}>
                <div className="max-w-3xl space-y-6 md:space-y-8">
                    {/* Headline */}
                    <div>
                        <h1 className="flex flex-col gap-2 md:gap-3">
                            <span className="hero-line-1 block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-eerie-black leading-[1.1] tracking-[-0.02em]">
                                Rent what you need.
                            </span>
                            <span className="hero-line-2 block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-electric-indigo leading-[1.1] tracking-[-0.02em]">
                                From people on your block.
                            </span>
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <p className="hero-subtitle text-base md:text-lg text-eerie-black/70 leading-relaxed max-w-xl font-sans font-normal">
                        High-quality gear from neighbors you trust. Nearby and ready when you are.
                    </p>

                    {/* Search Bar */}
                    <div ref={searchWrapperRef} className="hero-cta relative w-full max-w-2xl z-50">
                        <div className="w-full bg-signal-white/80 backdrop-blur-md p-2 rounded-2xl border border-opal/50 shadow-xl flex gap-2 items-center group focus-within:bg-white focus-within:border-electric-indigo transition-all">
                            <div className="hidden sm:flex items-center justify-center p-2.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-eerie-black/40 group-focus-within:text-electric-indigo transition-colors"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (!showSuggestions) setShowSuggestions(true);
                                }}
                                onFocus={() => {
                                    if (suggestions.length > 0) setShowSuggestions(true);
                                }}
                                placeholder="Search for what you want to rent"
                                className="bg-transparent border-none text-eerie-black placeholder:text-eerie-black/50 flex-1 px-3 py-3 sm:py-3.5 text-base sm:text-lg focus:outline-none focus:ring-0 w-full"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        window.location.href = `/listings?search=${encodeURIComponent(searchQuery)}`;
                                    }
                                }}
                            />
                            {isSearching && (
                                <Loader2 className="h-5 w-5 animate-spin text-eerie-black/40 mr-2" />
                            )}
                            <Button
                                className="bg-electric-indigo hover:bg-midnight-navy text-white font-bold py-6 px-6 sm:px-8 rounded-xl transition-all shadow-lg text-base uppercase tracking-wider"
                                onClick={() => {
                                    if (searchQuery) {
                                        window.location.href = `/listings?search=${encodeURIComponent(searchQuery)}`;
                                    } else {
                                        window.location.href = '/listings';
                                    }
                                }}
                            >
                                Search
                            </Button>
                        </div>

                        {/* Autocomplete Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 border border-slate-100 text-left">
                                <div className="px-5 py-3 bg-slate-50 text-sm font-semibold text-slate-800 tracking-wide border-b border-slate-200">
                                    Tool suggestions
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {suggestions.map((item, idx) => (
                                        <button
                                            key={idx}
                                            className="w-full text-left px-5 py-3 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-0 flex flex-col items-start focus:bg-slate-100 focus:outline-none"
                                            onClick={() => handleSelectSuggestion(item.tool_name || '')}
                                        >
                                            <span className="font-semibold text-slate-900 text-base">{item.tool_name}</span>
                                            {item.category_path && (
                                                <span className="text-sm text-slate-500 mt-0.5">{item.category_path}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Popular Categories */}
                    <div className="hero-cta flex flex-wrap items-center gap-3 pt-4">
                        <span className="text-sm font-medium text-eerie-black/70">Popular:</span>
                        {['Power Tools', 'Lawn & Garden', 'Painting', 'Plumbing'].map((category) => (
                            <Link
                                key={category}
                                href={`/listings?category=${encodeURIComponent(category)}`}
                                className="px-4 py-1.5 rounded-full bg-opal/20 hover:bg-opal/40 border border-opal/30 text-eerie-black/90 text-sm font-medium transition-colors backdrop-blur-sm"
                            >
                                {category}
                            </Link>
                        ))}
                    </div>

                    {/* Trust Signal */}
                    <div className="hero-cta flex items-center gap-3 pt-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="h-8 w-8 rounded-full bg-muted-gold/20 backdrop-blur-sm border-2 border-white flex items-center justify-center text-[10px] font-bold text-muted-gold"
                                >
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-eerie-black/60 font-medium">
                            Trusted by <span className="text-eerie-black font-bold">2,000+</span> homes in your block
                        </p>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <button
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce cursor-pointer group focus:outline-none"
                aria-label="Scroll down"
            >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-eerie-black/60 group-hover:text-electric-indigo transition-colors">Scroll</span>
                <ChevronDown className="h-4 w-4 text-electric-indigo" />
            </button>
        </section>
    );
}
