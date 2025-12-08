"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { ImageUpload } from "@/app/components/ui/image-upload";
import { Button } from "@/app/components/ui/button";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Card, CardContent } from "@/app/components/ui/card";

export default function ProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user]);

    async function getProfile() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('full_name, profile_photo_url')
                .eq('id', user!.id)
                .single();

            if (data) {
                setFullName(data.full_name || "");
                setAvatarUrl(data.profile_photo_url || "");
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: fullName,
                    profile_photo_url: avatarUrl,
                })
                .eq('id', user.id);

            if (error) throw error;
            alert("Profile updated successfully!");
        } catch (error: any) {
            alert(`Error updating profile: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="container mx-auto px-4 py-8 text-center">
                    <p>Please log in to view your profile.</p>
                </div>
                <Footer />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="container mx-auto px-4 py-12 max-w-xl">
                <h1 className="text-3xl font-bold font-serif text-slate-900 mb-8 text-center">Your Profile</h1>

                <Card className="bg-white shadow border border-slate-200">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="mb-6 w-full max-w-xs mx-auto">
                                <label className="block text-sm font-medium text-slate-700 mb-2 text-center">Profile Photo</label>
                                <div className="flex justify-center">
                                    <ImageUpload
                                        bucket="avatars"
                                        initialValue={avatarUrl}
                                        onUpload={(url) => setAvatarUrl(url)}
                                        className="mx-auto"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-safety-orange"
                                placeholder="Your Name"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={updateProfile}
                                disabled={loading}
                                className="w-full h-12 text-base bg-safety-orange hover:bg-safety-orange/90"
                            >
                                {loading ? 'Saving Changes...' : 'Save Profile'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </main>
    );
}
