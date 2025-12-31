import { Shield, HeartHandshake, Hammer } from "lucide-react";

export function ValueProps() {
    return (
        <section className="py-10 bg-white border-y border-slate-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Trust */}
                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-slate-50">
                        <div className="mt-1 h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 font-serif">Verified & Insured</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                ID-verified renters and $1M liability coverage for every tool.
                            </p>
                        </div>
                    </div>

                    {/* Safety */}
                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-slate-50">
                        <div className="mt-1 h-10 w-10 flex-shrink-0 rounded-full bg-orange-100 flex items-center justify-center text-safety-orange">
                            <HeartHandshake className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 font-serif">The Peace Fund</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                A community-led safety net covering minor accidents and repairs.
                            </p>
                        </div>
                    </div>

                    {/* Production */}
                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-slate-50">
                        <div className="mt-1 h-10 w-10 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Hammer className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 font-serif">Production Focused</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Share the harvest. Trade labor or produce for tool rental time.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
