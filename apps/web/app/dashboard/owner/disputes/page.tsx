"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TriangleAlert, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function OwnerDisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDisputes = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase.rpc('get_owner_disputes', {
                    p_owner_id: user.id
                });
                if (error) throw error;
                setDisputes(data || []);
            } catch (err) {
                console.error("Error fetching disputes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDisputes();
    }, []);

    return (
        <div className="max-w-4xl mx-auto py-4">
            <div className="mb-8">
                <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-safety-orange uppercase tracking-wider mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                        <TriangleAlert className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900">Your Action Items</h1>
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-1">Peace Fund Tribunal</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1].map(i => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 h-40" />
                        ))}
                    </div>
                ) : disputes.length > 0 ? (
                    disputes.map((dispute) => (
                        <div key={dispute.dispute_id} className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-red-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
                            
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                                            {dispute.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-slate-400 text-xs font-mono">
                                            {format(new Date(dispute.created_at), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold font-serif text-slate-900">
                                        {dispute.listing_title}
                                    </h3>
                                    
                                    <div className="text-sm font-mono text-slate-600 uppercase tracking-widest bg-slate-100 inline-block px-3 py-1 rounded">
                                        Type: {dispute.dispute_type.replace('_', ' ')}
                                    </div>
                                    
                                    <p className="text-slate-500 mt-4 leading-relaxed max-w-2xl">
                                        This dispute is currently under review by the independent Peace Fund Tribunal. The tribunal is analyzing the handover and return condition reports. You will receive an email protocol once an arbitration decision has been finalized.
                                    </p>
                                </div>
                                
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[200px]">
                                    <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider mb-2">Counterparty Info</h4>
                                    <p className="font-semibold text-slate-900">{dispute.renter_name}</p>
                                    <p className="text-xs text-slate-500 mt-1">Renter</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-12 rounded-[2rem] border border-slate-200 text-center flex flex-col items-center">
                        <Shield className="h-12 w-12 text-emerald-500 mb-4" />
                        <h3 className="text-xl font-bold font-serif text-slate-900 mb-2">All Clear!</h3>
                        <p className="text-slate-500 max-w-md">
                            You have no active action items or disputes requiring attention from the Peace Fund Tribunal.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
