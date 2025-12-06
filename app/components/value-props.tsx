import { Shield, HeartHandshake, Hammer } from "lucide-react";

export function ValueProps() {
    return (
        <section className="py-16 bg-white border-y border-slate-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

                    {/* Trust */}
                    <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 font-serif">Verified & Insured</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Every renter is ID-verified. Every tool is covered by our $1M liability policy, so you can share with confidence.
                        </p>
                    </div>

                    {/* Safety */}
                    <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-safety-orange">
                            <HeartHandshake className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 font-serif">The Peace Fund</h3>
                        <p className="text-slate-600 leading-relaxed">
                            A community-led safety net that covers minor accidents and repairs, keeping neighbors friendly and tools working.
                        </p>
                    </div>

                    {/* Production */}
                    <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Hammer className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 font-serif">Production Focused</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Don't just rent tools. Share the harvest. Trade labor, produce, or finished goods for rental time.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
