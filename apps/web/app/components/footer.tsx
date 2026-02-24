import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-charcoal text-concrete/60 pt-20 pb-8 border-t border-white/5 relative">
            {/* Grain overlay */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E")`,
                }}
            />

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-xl bg-safety-orange flex items-center justify-center">
                                <span className="font-serif font-bold text-white text-lg">B</span>
                            </div>
                            <span className="text-2xl font-bold font-serif tracking-tight text-white">
                                BlockHyre
                            </span>
                        </div>
                        <p className="text-sm text-concrete/40 leading-relaxed max-w-xs">
                            Turn your neighborhood into a factory. Rent high-value tools from
                            verified neighbors. Every rental insured by The Peace Fund.
                        </p>
                        <div className="flex gap-3">
                            <Link
                                href="#"
                                className="text-concrete/30 hover:text-safety-orange transition-colors p-2 hover:bg-white/5 rounded-xl"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-concrete/30 hover:text-safety-orange transition-colors p-2 hover:bg-white/5 rounded-xl"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-concrete/30 hover:text-safety-orange transition-colors p-2 hover:bg-white/5 rounded-xl"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-concrete/30 mb-6">Platform</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/listings" className="text-concrete/50 hover:text-safety-orange transition-colors">
                                    Browse Tools
                                </Link>
                            </li>
                            <li>
                                <Link href="/add-tool" className="text-concrete/50 hover:text-safety-orange transition-colors">
                                    List Your Tools
                                </Link>
                            </li>
                            <li>
                                <Link href="/how-it-works" className="text-concrete/50 hover:text-safety-orange transition-colors">
                                    How it Works
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-concrete/30 mb-6">Community</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/about" className="text-concrete/50 hover:text-safety-orange transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/community-guidelines" className="text-concrete/50 hover:text-safety-orange transition-colors">
                                    Guidelines
                                </Link>
                            </li>
                            <li>
                                <Link href="/peace-fund" className="text-concrete/50 hover:text-safety-orange transition-colors">
                                    Peace Fund
                                </Link>
                            </li>
                            <li>
                                <Link href="/disputes" className="text-concrete/50 hover:text-safety-orange transition-colors">
                                    Dispute Tribunal
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="flex flex-col gap-5">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-concrete/30">Stay Operational</h3>
                        <p className="text-sm text-concrete/40">
                            Get weekly updates on new tools in your neighborhood.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                className="bg-white/5 border-white/10 text-white placeholder:text-concrete/30 focus-visible:ring-safety-orange/30 focus-visible:border-safety-orange/40 rounded-xl h-10 text-sm"
                                aria-label="Email for newsletter"
                            />
                            <Button
                                className="bg-safety-orange hover:bg-safety-orange-hover text-white font-bold rounded-xl px-5 h-10 text-xs uppercase tracking-wider shrink-0 transition-all hover:shadow-lg hover:shadow-safety-orange/20"
                            >
                                Join
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-safety-orange animate-pulse-operational" />
                        <p className="text-[10px] text-concrete/30 font-mono uppercase tracking-wider">
                            &copy; {new Date().getFullYear()} BlockHyre Inc. All systems operational.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-xs text-concrete/30">
                        <Link href="/terms" className="hover:text-safety-orange transition-colors">
                            Terms
                        </Link>
                        <Link href="/liability" className="hover:text-safety-orange transition-colors">
                            Liability
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
