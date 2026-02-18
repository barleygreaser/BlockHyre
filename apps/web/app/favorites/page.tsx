"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { FavoriteButton } from "@/app/components/favorite-button";
import { useFavorites, FavoriteListing } from "@/app/hooks/use-favorites";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { Heart, Loader2, ArrowRight } from "lucide-react";
import { generateSlug } from "@/lib/utils";

export default function FavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const { fetchFavoriteListings, favoriteCount } = useFavorites();
    const router = useRouter();

    const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setLoading(false);
            return;
        }

        const loadFavorites = async () => {
            const data = await fetchFavoriteListings();
            setFavorites(data);
            setLoading(false);
        };

        loadFavorites();
    }, [user, authLoading, fetchFavoriteListings]);

    // Re-fetch when favoriteCount changes (an item was toggled)
    useEffect(() => {
        if (!user || authLoading) return;

        const refreshFavorites = async () => {
            const data = await fetchFavoriteListings();
            setFavorites(data);
        };

        refreshFavorites();
    }, [favoriteCount, user, authLoading, fetchFavoriteListings]);

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 border border-red-100">
                            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900">
                            My Favorites
                        </h1>
                    </div>
                    <p className="text-slate-500 mt-1">
                        {loading
                            ? "Loading your saved tools..."
                            : favorites.length > 0
                                ? `${favorites.length} saved tool${favorites.length !== 1 ? "s" : ""}`
                                : "Tools you save will appear here"}
                    </p>
                </div>

                {/* Auth Gate */}
                {!authLoading && !user && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 mb-6">
                            <Heart className="h-10 w-10 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            Sign in to view your favorites
                        </h2>
                        <p className="text-slate-500 max-w-md mb-6">
                            Create an account or sign in to save tools you love and access them from any device.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => router.push("/auth")}
                                className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold h-12 px-8"
                            >
                                Sign In
                            </Button>
                            <Button
                                onClick={() => router.push("/signup")}
                                variant="outline"
                                className="border-slate-300 text-slate-700 font-bold h-12 px-8"
                            >
                                Create Account
                            </Button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && user && (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 animate-spin text-safety-orange" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && user && favorites.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 mb-6">
                            <Heart className="h-10 w-10 text-red-200" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            No favorites yet
                        </h2>
                        <p className="text-slate-500 max-w-md mb-6">
                            Browse the marketplace and tap the heart icon on tools you like. They&apos;ll show up here for easy access.
                        </p>
                        <Button
                            onClick={() => router.push("/listings")}
                            className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold h-12 px-8"
                        >
                            Browse Tools
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Favorites Grid */}
                {!loading && user && favorites.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((fav) => (
                            <div
                                key={fav.id}
                                className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                {/* Image */}
                                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                    <Image
                                        src={fav.image}
                                        alt={fav.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                    <FavoriteButton
                                        listingId={fav.id}
                                        variant="overlay"
                                        className="top-3 right-3"
                                    />
                                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-slate-900">
                                        {fav.category}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1" title={fav.title}>
                                        {fav.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                                        {fav.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-safety-orange">
                                                ${fav.dailyPrice}
                                            </span>
                                            <span className="text-sm text-slate-500">/day</span>
                                        </div>
                                        <Link href={`/listings/${fav.id}/${generateSlug(fav.title)}`}>
                                            <Button
                                                size="sm"
                                                className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
                                            >
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
