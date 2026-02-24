import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Twitter, Instagram, Linkedin, ShieldCheck } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-charcoal text-concrete/60 pt-20 pb-8 border-t border-workshop-gray relative overflow-hidden">
            {/* Workshop Grit Overlay */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E")`,
                }}
            />

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    {/* Brand & Systems Status */}
                    <div className="flex flex-col gap-8 lg:col-span-4">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2.5">
                                <div className="h-10 w-10 rounded-[10px] bg-safety-orange flex items-center justify-center border-b-[3px] border-orange-700">
                                    <span className="font-serif font-bold text-white text-lg">B</span>
                                </div>
                                <span className="text-2xl font-bold font-serif tracking-tight text-white">
                                    BlockHyre
                                </span>
                            </div>
                            <p className="text-sm font-sans tracking-wide text-concrete/60 leading-relaxed max-w-sm">
                                The Neighborhood Factory. Rent high-value tools from verified neighbors. Heavy machinery, precision tools, no compromises.
                            </p>
                        </div>

                        {/* The Peace Fund UI Element */}
                        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl group hover:border-emerald-500/30 transition-colors w-fit">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-mono text-concrete/50 uppercase tracking-widest">Protection Protocol</span>
                                <span className="text-sm font-sans font-medium text-emerald-400 flex items-center gap-1">
                                    <ShieldCheck size={14} /> The Peace Fund Operational
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <Link
                                    key={i}
                                    href="#"
                                    className="text-concrete/40 p-2.5 bg-workshop-gray/40 rounded-xl border border-white/5 hover:border-safety-orange/50 hover:text-safety-orange transition-all hover:-translate-y-[2px] active:translate-y-[1px]"
                                >
                                    <Icon className="h-4 w-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="grid grid-cols-2 gap-8 lg:col-span-4">
                        {/* Platform */}
                        <div>
                            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-concrete/40 mb-6">Platform</h3>
                            <ul className="space-y-4 text-sm font-sans">
                                {['Browse Tools', 'List Your Tools', 'How it Works'].map((text) => (
                                    <li key={text}>
                                        <Link href="#" className="group text-concrete/60 hover:text-white transition-colors relative flex items-center w-fit">
                                            <span className="text-safety-orange opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 mr-1 font-mono">[</span>
                                            {text}
                                            <span className="text-safety-orange opacity-0 translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 ml-1 font-mono">]</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Community */}
                        <div>
                            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-concrete/40 mb-6">Community</h3>
                            <ul className="space-y-4 text-sm font-sans">
                                {['About Us', 'Guidelines', 'Dispute Tribunal'].map((text) => (
                                    <li key={text}>
                                        <Link href="#" className="group text-concrete/60 hover:text-white transition-colors relative flex items-center w-fit">
                                            <span className="text-safety-orange opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 mr-1 font-mono">[</span>
                                            {text}
                                            <span className="text-safety-orange opacity-0 translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 ml-1 font-mono">]</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="flex flex-col gap-5 lg:col-span-4 bg-workshop-gray/20 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                        {/* Scanner Bar effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-safety-orange/50 h-full opacity-0 hover:animate-pulse hover:opacity-100 transition-opacity" />

                        <h3 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-white">BlockHyre Updates</h3>
                        <p className="text-sm font-sans text-concrete/50">
                            Get updates on what's happening in your neighborhood and with BlockHyre.
                        </p>
                        <form className="flex gap-2.5 mt-2" onSubmit={(e) => e.preventDefault()}>
                            <Input
                                type="email"
                                placeholder="neighbor@email.com"
                                className="bg-charcoal border-white/10 text-white font-mono placeholder:text-concrete/30 focus-visible:ring-1 focus-visible:ring-safety-orange focus-visible:border-safety-orange rounded-xl h-11 text-[13px] tracking-wide"
                                aria-label="Email for updates"
                            />
                            <Button
                                type="submit"
                                className="bg-safety-orange hover:bg-[#E56000] text-white font-bold rounded-xl px-5 h-11 text-[11px] font-mono uppercase tracking-[0.1em] shrink-0 transition-all border-b-[3px] border-orange-900 active:border-b-0 active:translate-y-[3px] hover:-translate-y-[1px] shadow-lg hover:shadow-safety-orange/20"
                            >
                                Init
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Telemetry Bottom Bar */}
                <div className="pt-6 border-t border-workshop-gray/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 bg-black/40 px-3 py-1.5 rounded-md border border-white/5">
                        <div className="h-2 w-2 rounded-sm bg-safety-orange animate-pulse" />
                        <p className="text-[10px] text-concrete/40 font-mono uppercase tracking-[0.15em]">
                            &copy; {new Date().getFullYear()} BLOCKHYRE LLC.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-[11px] font-mono text-concrete/40 tracking-widest uppercase">
                        <Link href="/terms" className="hover:text-white transition-colors hover:underline decoration-safety-orange underline-offset-4">
                            Terms //
                        </Link>
                        <Link href="/liability" className="hover:text-white transition-colors hover:underline decoration-safety-orange underline-offset-4">
                            Liability //
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
