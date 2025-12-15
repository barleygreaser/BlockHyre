import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { MapPin } from "lucide-react";

export function Hero() {
    return (
        <section className="relative h-[70vh] min-h-[600px] w-full overflow-hidden flex items-center">
            {/* Background Images */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://uttbptpkekijlfzvauzu.supabase.co/storage/v1/object/public/assets/hero_landscape.png"
                    alt="BlockHyre Community Tools - Neighbors exchanging tools"
                    fill
                    className="hidden md:block object-cover object-right"
                    priority
                />
                <Image
                    src="https://uttbptpkekijlfzvauzu.supabase.co/storage/v1/object/public/assets/hero_portrait.png"
                    alt="BlockHyre Community Tools - Neighbors exchanging tools"
                    fill
                    className="md:hidden object-cover object-center"
                    priority
                />

                {/* Gradient Overlay for Readability (Darker on left behind text) */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                <div className="max-w-2xl space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-white leading-tight tracking-tight">
                            Turn Your Neighborhood <br /> into a Factory.
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light">
                            Rent freeze dryers, table saws, and heavy machinery from neighbors within 2 miles. Build more, buy less.
                        </p>

                        {/* Trust Signal */}
                        <p className="text-lg md:text-xl font-medium text-slate-300 flex items-center gap-2">
                            Trusted by 2,000+ homes in [Neighborhood Name]
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        {/* Primary CTA */}
                        <Link href="/listings" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-[#FF6700] hover:bg-[#E55C00] text-white border-none shadow-lg transition-transform hover:scale-105">
                                <MapPin className="mr-2 h-5 w-5" />
                                Find Tools Near Me
                            </Button>
                        </Link>

                        {/* Secondary CTA */}
                        <Link href="/add-tool" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-white text-[#FF6700] border-2 border-[#FF6700] hover:bg-orange-50 transition-colors">
                                List My Tools
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
