import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <Card className="max-w-md w-full shadow-lg border-slate-200">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <CardTitle className="text-3xl font-extrabold text-slate-900 font-serif">
                            Authentication Error
                        </CardTitle>
                        <CardDescription className="text-slate-600 mt-2 text-base">
                            We encountered an error while trying to sign you in. The link may have expired or is invalid.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 p-10 pt-0 text-center">
                        <p className="text-sm text-slate-500 mb-6">
                            Please try signing in again, or request a new login link.
                        </p>
                        
                        <div>
                            <Button
                                asChild
                                className="w-full bg-safety-orange hover:bg-orange-600 text-white font-medium focus-visible:ring-safety-orange"
                            >
                                <Link href="/auth">Return to Sign In</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </main>
    );
}
