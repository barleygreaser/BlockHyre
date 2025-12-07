import Link from "next/link";
import { Button } from "./ui/button";
import { MapPin } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-slate-50 py-20 md:py-32">
            <div className="container mx-auto px-4 text-center">
                <div className="mx-auto max-w-3xl space-y-6">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl font-serif">
                        Turn Your Neighborhood into a Factory.
                    </h1>
                    <p className="text-lg text-slate-600 md:text-xl">
                        Rent freeze dryers, table saws, and heavy machinery from neighbors within 2 miles.
                        Build more, buy less.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/inventory">
                            <Button size="lg" className="w-full sm:w-auto text-base">
                                <MapPin className="mr-2 h-5 w-5" />
                                Find Tools Near Me
                            </Button>
                        </Link>
                        <Link href="/add-tool">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                                List My Tools
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-slate-500 pt-4">
                        Trusted by 2,000+ homes in [Neighborhood Name]
                    </p>
                </div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 -z-10 h-full w-full opacity-30">
                <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-orange-100 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute left-0 bottom-0 h-[500px] w-[500px] bg-slate-200 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />
            </div>
        </section>
    );
}
