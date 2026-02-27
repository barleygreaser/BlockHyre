"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Shield, Users, AlertOctagon, CheckCircle2, Zap, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function PeaceFundPage() {
    return (
        <main className="min-h-screen bg-signal-white text-charcoal grain-overlay overflow-x-hidden">
            <Navbar />

            {/* Hero Section: Charcoal Background */}
            <section className="relative bg-charcoal text-signal-white pt-28 pb-24 md:pt-32 md:pb-32 px-6 border-b-2 border-safety-orange -mt-20">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-workshop-gray via-charcoal to-charcoal pointer-events-none" />

                <div className="relative max-w-5xl mx-auto flex flex-col items-center z-10">
                    <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest text-concrete border border-workshop-gray px-4 py-2 bg-charcoal-light mb-8">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-operational shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span>Risk Mitigation Active</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-display uppercase tracking-tight mb-6 text-center leading-none">
                        The Peace <br />
                        <span className="text-safety-orange">Fund.</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-sans font-light text-concrete text-center max-w-3xl mb-12">
                        A community-driven protection matrix designed to eliminate high security deposits. We pool micro-fees to cover macro risks.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 items-center w-full mt-4">
                        <Link href="/listings" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-safety-orange hover:bg-safety-orange-hover text-signal-white font-bold px-10 py-7 text-lg rounded-none magnetic-btn group shadow-[0_4px_20px_rgba(255,107,0,0.3)] border border-safety-orange hover:text-white transition-all flex items-center justify-center">
                                <Search className="w-5 h-5 mr-3" />
                                Browse Tools
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Operational Philosophy */}
            <section className="py-24 px-6 bg-signal-white border-b-2 border-concrete">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1 space-y-8 animate-float-up">
                            <div>
                                <div className="font-mono text-sm uppercase tracking-widest text-safety-orange mb-4">Core Philosophy</div>
                                <h2 className="text-5xl md:text-6xl font-display uppercase tracking-tight text-charcoal mb-4">
                                    The "Many Cover the Few" Protocol
                                </h2>
                            </div>

                            <div className="font-sans text-xl text-workshop-gray space-y-6 border-l-4 border-safety-orange pl-6">
                                <p>
                                    In a standard rental model, deploying a $2,000 piece of equipment demands a $1,000 deposit. This friction creates access barriers.
                                </p>
                                <p>
                                    The Peace Fund removes this blockade. Instead of locking up $1,000 from one operator, we collect $5 from 100 operations. This non-refundable pool acts as a collective damage waiver, settling equipment claims instantly.
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 w-full bg-concrete-dark/10 p-8 border border-concrete relative spec-card">
                            <div className="absolute top-0 right-0 p-4 font-mono text-xs font-bold text-workshop-gray uppercase tracking-widest">
                                Flow Diagram v.1.0
                            </div>

                            <div className="flex items-center justify-center gap-6 mb-10 pt-4">
                                <div className="p-4 bg-charcoal border border-workshop-gray">
                                    <Users className="w-8 h-8 text-signal-white" />
                                </div>
                                <div className="font-mono font-bold text-safety-orangetracking-widest flex items-center gap-2">
                                    <span className="w-full h-px bg-safety-orange absolute left-0 top-1/2 -z-10" />
                                    ====&gt;
                                </div>
                                <div className="p-4 bg-charcoal border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    <Shield className="w-8 h-8 text-emerald-400" />
                                </div>
                            </div>

                            <div className="space-y-6 font-mono text-sm text-charcoal">
                                <div className="flex items-center gap-4 border-b border-concrete pb-4">
                                    <div className="w-8 h-8 rounded-none bg-concrete border border-charcoal flex items-center justify-center font-bold text-charcoal">100</div>
                                    <span>Operators contribute micro-fee ($5)</span>
                                </div>
                                <div className="flex items-center gap-4 border-b border-concrete pb-4">
                                    <div className="w-8 h-8 rounded-none bg-emerald-100 border border-emerald-600 flex items-center justify-center font-bold text-emerald-700">$</div>
                                    <span>Pool aggregates to $500 capacity</span>
                                </div>
                                <div className="flex items-center gap-4 border-b border-concrete pb-4">
                                    <div className="w-8 h-8 rounded-none bg-red-100 border border-red-600 flex items-center justify-center font-bold text-red-700">!</div>
                                    <span>Single unit failure ($200 asset)</span>
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="w-8 h-8 rounded-none bg-safety-orange border border-safety-orange-hover flex items-center justify-center font-bold text-white">✔</div>
                                    <span className="font-bold text-safety-orange uppercase tracking-wider">Fund clears liability instantly</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fund Tiers */}
            <section className="py-24 px-6 bg-charcoal text-signal-white border-b-2 border-workshop-gray">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="font-mono text-sm uppercase tracking-widest text-emerald-400 mb-4 inline-flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Categorized Risk Profiles
                        </div>
                        <h2 className="text-5xl md:text-6xl font-display uppercase tracking-tight mb-6">
                            Tier Assignments
                        </h2>
                        <p className="font-sans font-light text-xl text-concrete">
                            Hardware carries varying levels of kinetic and financial risk. Protective tiers scale accordingly.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Tier 1 */}
                        <div className="bg-charcoal-light border border-workshop-gray p-8 spec-card focus-within:ring-2 relative rounded-none flex flex-col group">
                            <div className="font-mono text-xs text-workshop-gray uppercase tracking-widest mb-1 font-bold group-hover:text-safety-orange transition-colors">Tier 1</div>
                            <h3 className="font-display text-4xl tracking-tight uppercase text-signal-white mb-6">The Basics</h3>

                            <div className="mb-8 pb-8 border-b border-workshop-gray">
                                <div className="flex items-baseline gap-1">
                                    <span className="font-mono text-4xl md:text-5xl font-bold text-signal-white">$1</span>
                                    <span className="font-mono text-sm text-concrete">/DAY</span>
                                </div>
                            </div>

                            <div className="font-mono text-sm text-emerald-400 font-bold flex items-center gap-2 mb-8">
                                <Shield className="w-4 h-4" /> &lt;$100 Coverage Capacity
                            </div>

                            <div className="bg-charcoal p-4 border border-workshop-gray mt-auto">
                                <div className="font-mono text-xs uppercase text-workshop-gray tracking-widest mb-2 font-bold">Classifications</div>
                                <ul className="font-sans text-sm text-concrete space-y-2">
                                    <li>&gt; Hand Tools</li>
                                    <li>&gt; Ladders</li>
                                    <li>&gt; Extension Cords</li>
                                    <li>&gt; Static Equipment</li>
                                </ul>
                            </div>
                        </div>

                        {/* Tier 2 */}
                        <div className="bg-charcoal-light border-2 border-safety-orange p-8 spec-card relative rounded-none flex flex-col transform md:-translate-y-4 shadow-[0_10px_30px_rgba(255,107,0,0.15)] group">
                            <div className="absolute top-0 right-0 bg-safety-orange text-charcoal font-bold font-mono text-xs uppercase px-3 py-1 tracking-widest border-b border-l border-safety-orange">Target</div>
                            <div className="font-mono text-xs text-safety-orange uppercase tracking-widest mb-1 font-bold">Tier 2</div>
                            <h3 className="font-display text-4xl tracking-tight uppercase text-signal-white mb-6">Power Tools</h3>

                            <div className="mb-8 pb-8 border-b border-workshop-gray">
                                <div className="flex items-baseline gap-1">
                                    <span className="font-mono text-4xl md:text-5xl font-bold text-signal-white">$3</span>
                                    <span className="font-mono text-sm text-concrete">/DAY</span>
                                </div>
                            </div>

                            <div className="font-mono text-sm text-emerald-400 font-bold flex items-center gap-2 mb-8">
                                <Shield className="w-4 h-4" /> &lt;$500 Coverage Capacity
                            </div>

                            <div className="bg-charcoal p-4 border border-workshop-gray mt-auto">
                                <div className="font-mono text-xs uppercase text-workshop-gray tracking-widest mb-2 font-bold">Classifications</div>
                                <ul className="font-sans text-sm text-concrete space-y-2">
                                    <li>&gt; Cordless Drills</li>
                                    <li>&gt; Circular Saws</li>
                                    <li>&gt; Wet/Dry Vacuums</li>
                                    <li>&gt; Electromechanical</li>
                                </ul>
                            </div>
                        </div>

                        {/* Tier 3 */}
                        <div className="bg-charcoal-light border border-workshop-gray p-8 spec-card relative rounded-none flex flex-col group hover:border-white transition-colors">
                            <div className="font-mono text-xs text-workshop-gray uppercase tracking-widest mb-1 font-bold group-hover:text-white transition-colors">Tier 3</div>
                            <h3 className="font-display text-4xl tracking-tight uppercase text-signal-white mb-6">Heavy Equip</h3>

                            <div className="mb-8 pb-8 border-b border-workshop-gray">
                                <div className="flex items-baseline gap-1">
                                    <span className="font-mono text-4xl md:text-5xl font-bold text-signal-white">$10</span>
                                    <span className="font-mono text-sm text-concrete">/DAY</span>
                                </div>
                            </div>

                            <div className="font-mono text-sm text-emerald-400 font-bold flex items-center gap-2 mb-8">
                                <Shield className="w-4 h-4" /> &lt;$3,000 Coverage Capacity
                            </div>

                            <div className="bg-charcoal p-4 border border-workshop-gray mt-auto">
                                <div className="font-mono text-xs uppercase text-workshop-gray tracking-widest mb-2 font-bold">Classifications</div>
                                <ul className="font-sans text-sm text-concrete space-y-2">
                                    <li>&gt; Commercial Generators</li>
                                    <li>&gt; Earthmoving Mach.</li>
                                    <li>&gt; Transport Trailers</li>
                                    <li>&gt; Cement Mixers</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* The Free Borrow Enabler Component */}
                    <div className="bg-charcoal-light border border-workshop-gray rounded-none p-1px mt-16 flex flex-col md:flex-row items-stretch spec-card hover:border-safety-orange transition-colors">
                        <div className="flex-1 p-10 md:p-14 border-b md:border-b-0 md:border-r border-workshop-gray">
                            <h3 className="text-4xl font-display uppercase tracking-tight text-signal-white mb-6 flex items-center gap-4">
                                <Zap className="text-safety-orange w-8 h-8" strokeWidth={2.5} />
                                The Free Borrow Engine
                            </h3>
                            <p className="font-sans text-concrete text-lg leading-relaxed mb-8">
                                Operators can list hardware for standard communal use at a <strong>$0 base rate</strong> without exposing themselves to catastrophic loss. The deploying operator processes the micro-fee, eliminating owner liability while maintaining community access.
                            </p>
                            <div className="inline-block bg-charcoal px-6 py-4 border border-workshop-gray font-mono text-sm text-concrete shadow-inner">
                                <span className="opacity-70">RENT ENTRY: $0.00 | RISK MATRIX: $3.00</span>
                                <span className="mx-4 text-workshop-gray">=&gt;</span>
                                <span className="text-safety-orange font-bold uppercase tracking-wider">Deploy Check: $3.00</span>
                            </div>
                        </div>
                        <div className="w-full md:w-80 bg-charcoal p-8 flex border-l border-workshop-gray/50 flex-col justify-center relative shadow-inner overflow-hidden">
                            {/* Decorative scan line */}
                            <div className="absolute top-0 right-0 bottom-0 w-1 bg-workshop-gray opacity-30" />

                            <div className="font-mono text-xs uppercase text-workshop-gray tracking-widest mb-4">Live Telemetry Scenario</div>
                            <div className="font-serif font-bold text-xl text-signal-white mb-2">Neighborhood Borrow: Table Saw</div>
                            <div className="text-safety-orange font-mono font-bold text-3xl mb-8">FREE RENT</div>

                            <div className="font-mono text-sm space-y-4 text-concrete">
                                <div className="flex justify-between items-center border-b border-workshop-gray pb-2">
                                    <span className="opacity-60">Owner Exposure:</span>
                                    <span className="text-emerald-400 font-bold flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-operational" />
                                        $0.00
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-2">
                                    <span className="opacity-60">Operator Cost:</span>
                                    <span className="text-signal-white font-bold">$3.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coverage Specifications */}
            <section className="py-24 px-6 bg-signal-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-display uppercase tracking-tight text-charcoal">
                            Coverage Specifications
                        </h2>
                        <div className="font-mono text-sm text-workshop-gray mt-4">Referencing Liability Definitions</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Included Specifications */}
                        <div className="border border-concrete text-charcoal p-8 bg-white spec-card relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-500" />
                            <h3 className="font-display text-4xl mb-8 flex items-center gap-4 text-charcoal pl-2">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                Included Events
                            </h3>
                            <div className="space-y-6 font-sans">
                                <div className="p-4 bg-concrete-dark/10 border border-concrete group-hover:border-emerald-200 transition-colors">
                                    <span className="font-mono font-bold text-charcoal text-sm uppercase block mb-1">Accidental Damage</span>
                                    <p className="text-workshop-gray text-sm">Drops, impacts, or electrical shortings processed during standard intended operation vectors.</p>
                                </div>
                                <div className="p-4 bg-concrete-dark/10 border border-concrete group-hover:border-emerald-200 transition-colors">
                                    <span className="font-mono font-bold text-charcoal text-sm uppercase block mb-1">Unlawful Extraction</span>
                                    <p className="text-workshop-gray text-sm">Valid theft events occurring while deployed (Mandatory police report verification sequence required).</p>
                                </div>
                                <div className="p-4 bg-concrete-dark/10 border border-concrete group-hover:border-emerald-200 transition-colors">
                                    <span className="font-mono font-bold text-charcoal text-sm uppercase block mb-1">Aggressive Vandalism</span>
                                    <p className="text-workshop-gray text-sm">Destructive damage sourced from unauthorized third parties during active deployment windows.</p>
                                </div>
                            </div>
                        </div>

                        {/* Excluded Specifications */}
                        <div className="border border-concrete text-charcoal p-8 bg-white spec-card relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-500" />
                            <h3 className="font-display text-4xl mb-8 flex items-center gap-4 text-charcoal pl-2">
                                <AlertOctagon className="w-8 h-8 text-red-500" />
                                Excluded Events
                            </h3>
                            <div className="space-y-6 font-sans">
                                <div className="p-4 bg-concrete-dark/10 border border-concrete group-hover:border-red-200 transition-colors">
                                    <span className="font-mono font-bold text-charcoal text-sm uppercase block mb-1">Operational Attrition</span>
                                    <p className="text-workshop-gray text-sm">Dulling edges, degrading lithium ion arrays, cosmetic scratching. Standard cost of production falls to asset owner.</p>
                                </div>
                                <div className="p-4 bg-concrete-dark/10 border border-concrete group-hover:border-red-200 transition-colors">
                                    <span className="font-mono font-bold text-charcoal text-sm uppercase block mb-1">Willful Negligence</span>
                                    <p className="text-workshop-gray text-sm">Utilizing wood blades on masonry, or abandoning hardware in harsh bio-environments. Operator assumes 100% financial liability.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Terminal */}
            <section className="py-24 px-6 bg-safety-orange text-charcoal relative overflow-hidden text-center">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1A1A1A 0, #1A1A1A 4px, transparent 4px, transparent 16px)' }} />

                <div className="relative max-w-4xl mx-auto z-10 flex flex-col items-center">
                    <h2 className="text-6xl md:text-8xl font-display uppercase tracking-tight mb-8 text-charcoal">
                        Engage With <br /> <span className="text-signal-white">Confidence.</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-xl">
                        <Link href="/listings" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-charcoal text-signal-white hover:bg-black font-bold uppercase tracking-widest px-10 py-8 text-lg rounded-none magnetic-btn shadow-[8px_8px_0_rgba(255,255,255,0.4)] border-2 border-charcoal">
                                Access Protected Tools
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
