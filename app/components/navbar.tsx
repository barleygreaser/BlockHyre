import Link from "next/link";
import { Button } from "./ui/button";
import { Shield } from "lucide-react";

export function Navbar() {
    return (
        <nav className="border-b border-slate-200 bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-white">
                        <span className="font-serif font-bold">B</span>
                    </div>
                    <span className="text-xl font-bold font-serif tracking-tight text-slate-900">BlockShare</span>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <Link href="#" className="hover:text-slate-900 transition-colors">Inventory</Link>
                    <Link href="#" className="hover:text-slate-900 transition-colors">How it Works</Link>
                    <Link href="#" className="hover:text-slate-900 transition-colors">Safety</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                        <Shield className="h-4 w-4" />
                        Verify ID
                    </Button>
                    <Button size="sm">Login</Button>
                </div>
            </div>
        </nav>
    );
}
