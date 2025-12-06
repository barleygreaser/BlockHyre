import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-slate-900">
                            <span className="font-serif font-bold">B</span>
                        </div>
                        <span className="text-xl font-bold font-serif tracking-tight text-white">BlockShare</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-white transition-colors">Liability Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Dispute Tribunal</Link>
                        <Link href="#" className="hover:text-white transition-colors">Community Guidelines</Link>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} BlockShare. Built for the 2,000 homes in [Neighborhood Name].</p>
                </div>
            </div>
        </footer>
    );
}
