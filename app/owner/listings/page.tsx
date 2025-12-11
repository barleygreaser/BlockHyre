"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/app/components/navbar";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input"; // Assuming standard input or will use HTML
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import {
    Search,
    Plus,
    MoreHorizontal,
    Edit,
    Archive,
    Eye,
    Filter,
    ArrowUpDown,
    Star
} from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";

// Since Input component might not exist based on file list, let's make a local styled one or use standard HTML
const SearchInput = (props: any) => (
    <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
            {...props}
            className="h-10 w-full pl-10 pr-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        />
    </div>
);

interface InventoryItem {
    listing_id: string;
    tool_title: string;
    daily_price: number;
    listing_status: string;
    avg_customer_rating: number;
    current_rental_end_date: string | null;
    current_renter_name: string | null;
}

export default function ManageListingsPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        document.title = 'Manage Listings - BlockHyre';
    }, []);

    useEffect(() => {
        const statusParam = searchParams.get('status');
        if (statusParam && ['active', 'draft', 'archived', 'all'].includes(statusParam.toLowerCase())) {
            setStatusFilter(statusParam.toLowerCase());
        }
    }, [searchParams]);

    useEffect(() => {
        if (!user) return;

        const fetchInventory = async () => {
            try {
                const { data, error } = await supabase.rpc('get_owner_inventory_details', {
                    p_owner_id: user.id
                });

                if (error) throw error;
                if (data) setInventory(data);
            } catch (error) {
                console.error("Error fetching inventory:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, [user]);

    // Filtering
    const filteredInventory = inventory.filter(item => {
        // Status Filter
        if (statusFilter !== "all" && item.listing_status.toLowerCase() !== statusFilter) {
            return false;
        }

        // Search Filter
        const searchLower = searchTerm.toLowerCase();
        return (
            item.tool_title.toLowerCase().includes(searchLower) ||
            (item.current_renter_name && item.current_renter_name.toLowerCase().includes(searchLower))
        );
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900">Manage Listings</h1>
                        <p className="text-slate-600">Track your inventory, pricing, and availability.</p>
                    </div>
                    <Link href="/add-tool">
                        <Button className="bg-safety-orange hover:bg-safety-orange/90">
                            <Plus className="mr-2 h-4 w-4" />
                            List New Tool
                        </Button>
                    </Link>
                </div>

                {/* Filters & Search */}
                <Card className="border-slate-200 shadow-sm mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">

                            {/* Tabs for Status */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                                {['all', 'active', 'draft', 'archived'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === status
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                        <span className="ml-2 opacity-60 text-xs">
                                            {status === 'all'
                                                ? inventory.length
                                                : inventory.filter(i => i.listing_status.toLowerCase() === status).length
                                            }
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="w-full md:w-72">
                                <SearchInput
                                    placeholder="Search listings..."
                                    value={searchTerm}
                                    onChange={(e: any) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Listing Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-12 md:col-span-5">Tool Details</div>
                        <div className="hidden md:block col-span-2">Status</div>
                        <div className="hidden md:block col-span-2">Performance</div>
                        <div className="hidden md:block col-span-2">Availability</div>
                        <div className="col-span-12 md:col-span-1 text-right">Actions</div>
                    </div>

                    {/* Table Body */}
                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                            <div
                                key={item.listing_id}
                                className="grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                            >
                                {/* Tool Details */}
                                <div className="col-span-12 md:col-span-5">
                                    <Link
                                        href={`/listings/${item.listing_id}/${item.tool_title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                        className="flex items-center gap-4 group"
                                    >
                                        <div className="h-12 w-12 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 font-bold text-slate-500 group-hover:bg-slate-300 transition-colors">
                                            {item.tool_title.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 group-hover:text-safety-orange transition-colors">{item.tool_title}</h3>
                                            <div className="text-sm text-slate-500 font-medium">{formatCurrency(item.daily_price)} / day</div>
                                        </div>
                                    </Link>
                                </div>

                                {/* Status */}
                                <div className="hidden md:flex col-span-2 items-center">
                                    <Badge
                                        variant="outline"
                                        className={`
                                            ${item.listing_status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                            ${item.listing_status === 'Draft' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                                        `}
                                    >
                                        {item.listing_status}
                                    </Badge>
                                </div>

                                {/* Performance (Rating) */}
                                <div className="hidden md:flex col-span-2 items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    <span className="font-bold text-slate-900">
                                        {item.avg_customer_rating > 0 ? item.avg_customer_rating.toFixed(1) : '-'}
                                    </span>
                                    <span className="text-xs text-slate-400">Rating</span>
                                </div>

                                {/* Availability / Booking */}
                                <div className="hidden md:block col-span-2">
                                    {item.current_renter_name ? (
                                        <div className="text-sm">
                                            <div className="text-safety-orange font-medium">Rented</div>
                                            <div className="text-xs text-slate-500">until {formatDate(item.current_rental_end_date!)}</div>
                                            <div className="text-xs text-slate-400">by {item.current_renter_name}</div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            Available
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="col-span-12 md:col-span-1 flex justify-end">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                    </Button>
                                    {/* Ideally this would be a DropdownMenu, but simplifying for now or implementing later */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <Filter className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>No listings found matching your filters.</p>
                            <Button
                                variant="link"
                                onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                                className="text-safety-orange"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
