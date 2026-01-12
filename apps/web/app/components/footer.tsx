import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="1930 0 1781.89 1783.63"
                                    className="w-full h-full"
                                >
                                    <g id="Layer_4" data-name="Layer 4">
                                        <rect
                                            fill="#fff"
                                            strokeWidth="0"
                                            x="1930"
                                            y="0"
                                            width="1781.89"
                                            height="1783.63"
                                            rx="229.58"
                                            ry="229.58"
                                        />
                                    </g>
                                    <g id="Layer_3" data-name="Layer 3">
                                        <g>
                                            <path
                                                fill="#0d1526"
                                                strokeWidth="0"
                                                d="M3050.31,904.33c151.81,51.62,165.69,194.17,145.74,275.54-17.24,70.32-92.61,177.62-257.32,179.53h-454.68v-98.77l80.46-19.28v-630.78l-80.46-17.52v-100.13h432.67s199.63,0,249.73,173.07c19.87,68.64-4.55,191.28-116.14,238.35Z"
                                            />
                                            <g>
                                                <path
                                                    fill="#fff"
                                                    strokeWidth="0"
                                                    d="M2889.38,850.35l-155.61.09.76-230.76h154.85c54.65,0,110.06,35.68,110.06,115.38,0,69.08-38.71,112.34-110.06,115.29Z"
                                                />
                                                <path
                                                    fill="#fff"
                                                    strokeWidth="0"
                                                    d="M2887.87,1231.49h-154.09l.76-260.36h156.37c95.64,0,138.91,51.62,138.91,131.32,0,72.87-25.81,129.04-141.95,129.04Z"
                                                />
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <span className="text-2xl font-bold font-serif tracking-tight text-white">
                                BlockHyre
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                            Turn your neighborhood into a factory. Rent high-value tools from
                            neighbors securely and affordably.
                        </p>
                        <div className="flex gap-4">
                            <Link
                                href="#"
                                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
                            >
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link
                                href="#"
                                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
                            >
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link
                                href="#"
                                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
                            >
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link
                                href="#"
                                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
                            >
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-6">Platform</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/tools" className="hover:text-white transition-colors">
                                    Browse Tools
                                </Link>
                            </li>
                            <li>
                                <Link href="/add-tool" className="hover:text-white transition-colors">
                                    List Your Tools
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/how-it-works"
                                    className="hover:text-white transition-colors"
                                >
                                    How it Works
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-6">Community</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/about" className="hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/community-guidelines"
                                    className="hover:text-white transition-colors"
                                >
                                    Guidelines
                                </Link>
                            </li>
                            <li>
                                <Link href="/peace-fund" className="hover:text-white transition-colors">
                                    Peace Fund
                                </Link>
                            </li>
                            <li>
                                <Link href="/disputes" className="hover:text-white transition-colors">
                                    Dispute Tribunal
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h3 className="font-semibold text-white">Subscribe to our newsletter</h3>
                        <p className="text-sm text-slate-400">
                            The latest news, articles, and resources, sent to your inbox weekly.
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-slate-600"
                                />
                                <Button
                                    variant="default"
                                    className="bg-white text-slate-900 hover:bg-slate-200"
                                >
                                    Subscribe
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-xs text-slate-500 text-center md:text-left">
                        <p>
                            &copy; {new Date().getFullYear()} BlockHyre. Built for the 2,000 homes in
                            [Neighborhood Name].
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500">
                        <Link href="/terms" className="hover:text-white transition-colors">
                            Terms
                        </Link>
                        <Link href="/liability" className="hover:text-white transition-colors">
                            Liability
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
